// Assessment clearance is supplied by the assessment system, separately from its media/report state.
import {visibleStudents} from './operations.js';
export const LEVELS=['Spark','Scout','Star','Champ'];
export const CLEARANCE_STATUSES=['CLEARED','NOT_CLEARED'];
const validDate=d=>typeof d==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(d)&&!Number.isNaN(Date.parse(d))&&new Date(d).toISOString().slice(0,10)===d;
const unique=values=>[...new Set(values)];
export function linkedBadges(cycle,assignment){return [...(Array.isArray(assignment.badgeIds)?assignment.badgeIds:assignment.skills||[])];}
export function latestClearance(state,cycleId,student){return (state.clearanceResults||[]).filter(r=>r.assessmentId===cycleId&&r.student===student).at(-1)||null;}
export function levelProgress(student){
 const earned=new Set(student.badges),hasThrough=n=>Array.from({length:n},(_,i)=>i+1).every(id=>earned.has(id));
 let earnedIndex=0;for(let i=1;i<4;i++)if(hasThrough(i*4))earnedIndex=i;else break;
 const index=Math.max(LEVELS.indexOf(student.level),earnedIndex,0),next=LEVELS[index+1]||null;
 const required=Array.from({length:next?(index+1)*4:16},(_,i)=>i+1),missing=required.filter(id=>!earned.has(id));
 return {level:LEVELS[index],next,missing,complete:hasThrough(16),unlocked:LEVELS.slice(0,index+1)};
}
export function upgradeProgression(state){
 state.badgeDefinitions=state.skills.map(k=>({id:k.id,name:k.name,level:k.level,description:k.description}));
 state.clearanceResults=Array.isArray(state.clearanceResults)?state.clearanceResults:[];
 state.levelEvents=Array.isArray(state.levelEvents)?state.levelEvents:[];
 for(const c of state.cycles){
  c.badgeIds??=unique(c.assignments.flatMap(a=>a.skills));
  c.assessmentType??='PSB_LOCAL_'+(c.level||c.id);
  c.moduleSnapshot??={moduleId:c.assessmentType,name:c.name,version:1,source:'local-psb-mapping',badgeIds:[...c.badgeIds],badges:c.badgeIds.map(id=>{const k=state.skills.find(k=>k.id===id);return {id,name:k.name,level:k.level};})};
  for(const a of c.assignments)a.badgeIds??=[...a.skills];
 }
 return state;
}
// This adapter is the single award entry point for an explicit participant assessment result.
// It does not call an external API or infer clearance from reports, uploads, or workflow completion.
export function recordAssessmentClearance(state,input){
 const cycle=state.cycles.find(c=>c.id===input.assessmentId),student=visibleStudents(state).find(s=>s.id===input.student),assignment=cycle?.assignments.find(a=>a.student===input.student);
 if(!cycle||!student||!assignment||cycle.rescheduled?.[student.id]||(cycle.plannerKey&&state.planner.rosters[cycle.plannerKey]?.deferred[student.id]))throw Error('Choose a participant in an assigned assessment that has not been rescheduled.');
 if(!CLEARANCE_STATUSES.includes(input.status))throw Error('Use the assessment result: Cleared or Not cleared. Recording and report statuses are not clearance results.');
 if(!validDate(input.date)||input.date!==cycle.date||input.date>state.demoDate||input.date<student.joined)throw Error('Use the scheduled assessment date, after enrolment and on or before the workspace date.');
 const ids=linkedBadges(cycle,assignment),allowed=Array.isArray(cycle.badgeIds)?cycle.badgeIds:unique(cycle.assignments.flatMap(a=>a.skills));
 if(new Set(ids).size!==ids.length||ids.some(id=>!state.skills.some(k=>k.id===id)||!allowed.includes(id)))throw Error('This assessment contains an unknown or unavailable linked badge.');
 if(input.badgeIds&&JSON.stringify(unique(input.badgeIds).sort((a,b)=>a-b))!==JSON.stringify([...ids].sort((a,b)=>a-b)))throw Error('The assessment’s linked badges determine the award; the result cannot add badges.');
 const reference=String(input.sourceResultId||'').trim();
 if(reference.length>200)throw Error('The result reference must be 200 characters or fewer.');
 const replay=reference&&(state.clearanceResults||[]).find(r=>r.sourceResultId===reference);
 if(replay){if(replay.assessmentId!==cycle.id||replay.student!==student.id||replay.status!==input.status||replay.date!==input.date)throw Error('This result reference is already associated with a different result.');return {...replay,replayed:true};}
 const resultId=crypto.randomUUID(),badgeSnapshots=ids.map(id=>{const k=cycle.moduleSnapshot?.badges?.find(k=>k.id===id)||state.skills.find(k=>k.id===id);return {id,name:k.name,level:k.level};}),newBadges=input.status==='CLEARED'?ids.filter(id=>!student.badges.includes(id)):[],priorLevel=student.level;
 const result={id:resultId,assessmentId:cycle.id,student:student.id,status:input.status,date:input.date,sourceResultId:reference||resultId,source:'assessment-result',reportReference:String(input.reportReference||'').trim().slice(0,1000),notes:String(input.notes||'').trim().slice(0,1000),badgeIds:[...ids],badgeSnapshots,newBadgeIds:[...newBadges],moduleSnapshot:structuredClone(cycle.moduleSnapshot||{moduleId:cycle.assessmentType||cycle.id,name:cycle.name,version:1,source:'local-psb-mapping'}),coach:input.coach||student.coach};
 const evidence=(ids.length?ids:[null]).map(id=>({id:crypto.randomUUID(),type:'clearance',clearanceId:resultId,sourceResultId:result.sourceResultId,student:student.id,skill:id,skillName:id?badgeSnapshots.find(k=>k.id===id).name:cycle.name,cycleId:cycle.id,date:input.date,status:input.status,outcome:input.status==='CLEARED'?'Passed':'Needs Practice',badgeAward:id!==null&&input.status==='CLEARED',remarks:result.notes,coach:result.coach,baseline:false}));
 // All validation precedes mutation. The result, evidence, awards and level update are one local transaction.
 state.clearanceResults??=[];state.levelEvents??=[];state.clearanceResults.push(result);state.assessments.push(...evidence);
 student.badges=unique([...student.badges,...newBadges]);
 if(input.status==='CLEARED')student.level=levelProgress(student).level;
 result.previousLevel=priorLevel;result.level=student.level;
 if(student.level!==priorLevel)state.levelEvents.push({id:crypto.randomUUID(),student:student.id,from:priorLevel,to:student.level,date:input.date,clearanceId:resultId});
 return result;
}
