import {workingLevel, levelSkills} from './planner.js';

const LEVELS=['Spark','Scout','Star','Champ'];
const VENUES=['Indiranagar','Whitefield','JP Nagar'];
export const defaultCoaches=[
 {id:1,name:'Vikram Rao',role:'Head Coach',venue:VENUES[0],venues:[VENUES[0]]},
 {id:2,name:'Meera Nair',role:'Head Coach',venue:VENUES[1],venues:[VENUES[1]]},
 {id:3,name:'Karthik Shah',role:'Head Coach',venue:VENUES[2],venues:[VENUES[2]]},
 {id:4,name:'Ananya Das',role:'Assistant Coach',venue:VENUES[0],venues:[VENUES[0]]},
 {id:5,name:'Rohan Menon',role:'Assistant Coach',venue:VENUES[1],venues:[VENUES[1]]}
];
const unique=values=>[...new Set(values)];
const validDate=d=>typeof d==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(d)&&!Number.isNaN(Date.parse(d))&&new Date(d).toISOString().slice(0,10)===d;
const text=(value,max=160)=>typeof value==='string'?value.trim().slice(0,max):'';
const validMedia=url=>!url||/^(https?:\/\/|assets\/)/i.test(url);
const customRecords=rows=>(Array.isArray(rows)?rows:[]).filter(row=>row&&typeof row==='object'&&!Array.isArray(row)&&typeof row.id==='string'&&row.id);
const uniqueRecords=rows=>rows.filter((row,i)=>rows.findIndex(other=>other.id===row.id)===i);

export function upgradeOperations(state){
 const legacy=state.operationsRevision!==1;
 if(!Array.isArray(state.coaches)||!state.coaches.length)state.coaches=structuredClone(defaultCoaches);
 state.coaches=state.coaches.filter(c=>Number.isInteger(c.id)&&c.name&&['Head Coach','Assistant Coach'].includes(c.role)).map(c=>{
  const venues=unique((Array.isArray(c.venues)?c.venues:[c.venue]).filter(v=>VENUES.includes(v)));
  return {...c,name:text(c.name,70),venues,venue:venues[0]||VENUES[0]};
 });
 if(!state.coaches.length)state.coaches=structuredClone(defaultCoaches);
 state.activeCoachIds={...state.activeCoachIds};
 for(const role of ['Head Coach','Assistant Coach'])if(!state.coaches.some(c=>c.id===state.activeCoachIds[role]&&c.role===role))state.activeCoachIds[role]=state.coaches.find(c=>c.role===role)?.id??null;
 for(const s of state.students){
  if(!Array.isArray(s.assistantCoaches))s.assistantCoaches=legacy?state.coaches.filter(c=>c.role==='Assistant Coach'&&c.venues.includes(s.venue)&&s.level==='Spark').map(c=>c.id):[];
  s.assistantCoaches=unique(s.assistantCoaches.filter(id=>state.coaches.some(c=>c.id===id&&c.role==='Assistant Coach'&&c.venues.includes(s.venue))));
 }
 state.library=customRecords(state.library).filter(k=>!k.id.startsWith('official-')&&text(k.name,80).length>=2&&LEVELS.includes(k.level)&&text(k.description,500)&&text(k.instructions,2000)).map(k=>{
  const videoUrl=text(k.videoUrl,1000);
  return {...k,name:text(k.name,80),description:text(k.description,500),drill:text(k.drill||k.name,100),instructions:text(k.instructions,2000),videoUrl:validMedia(videoUrl)?videoUrl:''};
 });
 state.library=uniqueRecords(state.library);
 const library=librarySkills(state);
 state.curricula=customRecords(state.curricula).filter(c=>text(c.name,80).length>=2&&LEVELS.includes(c.level)&&Array.isArray(c.libraryIds)).map(c=>({...c,name:text(c.name,80),libraryIds:unique(c.libraryIds.filter(id=>library.some(k=>k.id===id&&k.level===c.level)))})).filter(c=>c.libraryIds.length);
 state.curricula=uniqueRecords(state.curricula);
 const studentIds=new Set(state.students.map(s=>s.id));
 state.batches=customRecords(state.batches).filter(b=>text(b.name,80).length>=2&&Array.isArray(b.studentIds)&&state.curricula.some(c=>c.id===b.curriculumId)).map(b=>{
  const curriculum=state.curricula.find(c=>c.id===b.curriculumId);
  return {...b,name:text(b.name,80),studentIds:unique(b.studentIds.filter(id=>studentIds.has(id))),libraryIds:unique((Array.isArray(b.libraryIds)?b.libraryIds:curriculum.libraryIds).filter(id=>curriculum.libraryIds.includes(id)))};
 }).filter(b=>b.studentIds.length&&b.libraryIds.length);
 state.batches=uniqueRecords(state.batches);
 state.settings.appearance=['standard','contrast'].includes(state.settings.appearance)?state.settings.appearance:'standard';
 delete state.settings.theme;
 // Retired records are not consulted, validated or exposed by live workflows.
 delete state.attendance;
 delete state.sessionDrafts;
 state.activities=state.activities.filter(a=>a.type!=='attendance');
 state.operationsRevision=1;
 return state;
}

export function activeCoach(state){return state.coaches.find(c=>c.id===state.activeCoachIds?.[state.role]&&c.role===state.role)||null;}
export function coachStudents(state,coach){
 if(!coach)return [];
 return state.students.filter(s=>coach.role==='Head Coach'?coach.venues.includes(s.venue):(s.assistantCoaches||[]).includes(coach.id));
}
export function visibleStudents(state){return state.role==='Management'?state.students:coachStudents(state,activeCoach(state));}
export function allowedSkills(state){
 if(state.role!=='Assistant Coach')return state.skills;
 const levels=new Set(visibleStudents(state).flatMap(s=>[s.level,workingLevel(state,s)]).filter(Boolean));
 return state.skills.filter(k=>levels.has(k.level));
}
export const canAccessSkill=(state,id)=>allowedSkills(state).some(k=>k.id===+id);
export function manageableVenues(state){return state.role==='Management'?[...VENUES]:state.role==='Head Coach'?[...(activeCoach(state)?.venues||[])]:[];}
function canManage(state){if(!['Management','Head Coach'].includes(state.role))throw Error('Only management and head coaches can change these records.');}
function uniqueName(list,name,id){if(list.some(x=>x.id!==id&&x.name.toLowerCase()===name.toLowerCase()))throw Error('That name is already in use. Choose a different name.');}

export function addCoach(state,input){
 canManage(state);
 const existing=input.id?state.coaches.find(c=>c.id===+input.id):null;
 if(input.id&&!existing)throw Error('Choose an existing coach.');
 if(existing&&existing.venues.some(v=>!manageableVenues(state).includes(v)))throw Error('This coach has venues outside your current assignment.');
 const name=text(input.name,70),venues=unique((input.venues||[]).filter(v=>VENUES.includes(v)));
 if(name.length<2||!['Head Coach','Assistant Coach'].includes(input.role)||!venues.length)throw Error('Enter a coach name, role and at least one venue.');
 if(venues.some(v=>!manageableVenues(state).includes(v)))throw Error('Choose venues managed by your current role.');
 uniqueName(state.coaches,name,existing?.id);
 if(existing&&existing.role!==input.role)throw Error('Keep the coach’s existing role when editing.');
 if(existing&&state.students.some(s=>(existing.role==='Head Coach'?s.coach===existing.id:s.assistantCoaches.includes(existing.id))&&!venues.includes(s.venue)))throw Error('Reassign this coach’s students before removing their venue.');
 const c={id:existing?.id||Math.max(0,...state.coaches.map(c=>c.id))+1,name,role:input.role,venues,venue:venues[0]};
 if(existing)Object.assign(existing,c);else state.coaches.push(c);return c;
}
export const saveCoach=addCoach;
export function assignStudent(state,id,input){
 canManage(state);const student=visibleStudents(state).find(s=>s.id===id);if(!student)throw Error('Choose a student assigned to your venues.');
 const venue=input.venue||student.venue,coachId=+(input.coachId??student.coach),assistantIds=unique(input.assistantIds??student.assistantCoaches??[]);
 if(!manageableVenues(state).includes(venue))throw Error('The destination venue is outside your assignment.');
 if(!state.coaches.some(c=>c.id===coachId&&c.role==='Head Coach'&&c.venues.includes(venue)))throw Error('Choose a head coach who oversees the student’s venue.');
 if(assistantIds.some(id=>!state.coaches.some(c=>c.id===id&&c.role==='Assistant Coach'&&c.venues.includes(venue))))throw Error('Choose assistant coaches assigned to the student’s venue.');
 Object.assign(student,{venue,coach:coachId,assistantCoaches:assistantIds});return student;
}

export function librarySkills(state){return [...state.skills.map(k=>({...k,id:'official-'+k.id,skillId:k.id,videoUrl:k.videoUrl||''})),...state.library];}
export function visibleLibrary(state){const allowed=new Set(allowedSkills(state).map(k=>k.level));return librarySkills(state).filter(k=>state.role!=='Assistant Coach'||allowed.has(k.level));}
export function saveLibrarySkill(state,input){
 canManage(state);const existing=input.id?state.library.find(k=>k.id===input.id):null;if(input.id&&!existing)throw Error('Choose a custom library skill to edit.');
 const name=text(input.name,80),level=input.level,description=text(input.description,500),drill=text(input.drill||input.name,100),instructions=text(input.instructions,2000),videoUrl=text(input.videoUrl,1000);
 if(name.length<2||!LEVELS.includes(level)||!description||!instructions||!validMedia(videoUrl))throw Error('Enter a skill name, level, target and instructions. Use an HTTP(S) or local assets video URL.');
 uniqueName(librarySkills(state),name,input.id);
 const k={id:existing?.id||'library-'+crypto.randomUUID(),name,level,description,drill,instructions,videoUrl};
 if(existing)Object.assign(existing,k);else state.library.push(k);return k;
}
export function saveCurriculum(state,input){
 canManage(state);const existing=input.id?state.curricula.find(c=>c.id===input.id):null;if(input.id&&!existing)throw Error('Choose an existing curriculum.');
 const name=text(input.name,80),level=input.level,libraryIds=unique(input.libraryIds||[]),library=librarySkills(state);
 if(name.length<2||!LEVELS.includes(level)||!libraryIds.length||libraryIds.some(id=>!library.some(k=>k.id===id&&k.level===level)))throw Error('Choose a name, level and library skills from that level.');
 uniqueName(state.curricula,name,input.id);
 if(existing&&state.batches.some(b=>b.curriculumId===existing.id&&(level!==existing.level||b.libraryIds.some(id=>!libraryIds.includes(id)))))throw Error('Update the assigned batches before changing this curriculum’s level or removing skills they use.');
 const c={id:existing?.id||'curriculum-'+crypto.randomUUID(),name,level,libraryIds};if(existing)Object.assign(existing,c);else state.curricula.push(c);return c;
}
export function saveBatch(state,input){
 canManage(state);const existing=input.id?state.batches.find(b=>b.id===input.id):null;if(input.id&&!existing)throw Error('Choose an existing batch.');
 if(existing&&existing.studentIds.some(id=>!visibleStudents(state).some(s=>s.id===id)))throw Error('This batch includes students outside your venues.');
 const name=text(input.name,80),studentIds=unique(input.studentIds||[]),curriculum=state.curricula.find(c=>c.id===input.curriculumId),libraryIds=unique(input.libraryIds||curriculum?.libraryIds||[]),visible=new Set(visibleStudents(state).map(s=>s.id));
 if(name.length<2||!studentIds.length||studentIds.some(id=>!visible.has(id))||!curriculum||!libraryIds.length||libraryIds.some(id=>!curriculum.libraryIds.includes(id)))throw Error('Choose a batch name, curriculum and students within your venues.');
 uniqueName(state.batches,name,input.id);
 const b={id:existing?.id||'batch-'+crypto.randomUUID(),name,studentIds,curriculumId:curriculum.id,libraryIds};if(existing)Object.assign(existing,b);else state.batches.push(b);return b;
}

export function createAssessment(state,input){
 const name=text(input.name,80),studentIds=unique(input.studentIds||[]),visible=new Set(visibleStudents(state).map(s=>s.id)),skillIds=unique(input.badgeIds??input.skillIds??levelSkills(state,input.level).map(k=>k.id));
 if(name.length<2||!validDate(input.date)||input.date<state.demoDate||!studentIds.length||studentIds.some(id=>!visible.has(id)))throw Error('Choose a name, upcoming date and assigned students.');
 if(state.cycles.some(c=>c.date===input.date&&c.name.toLowerCase()===name.toLowerCase()))throw Error('An assessment with that name is already scheduled on this date.');
 if((!skillIds.length&&!input.includeFitness)||skillIds.some(id=>!canAccessSkill(state,id)))throw Error('Choose available skills or include the fitness step.');
 if(studentIds.some(id=>state.students.find(s=>s.id===id).joined>input.date))throw Error('Assessment dates must be on or after student enrolment.');
 const assessmentType=input.moduleId||'PSB_LOCAL_'+(LEVELS.includes(input.level)?input.level:'FITNESS');
 const cycle={id:crypto.randomUUID(),name,date:input.date,level:LEVELS.includes(input.level)?input.level:null,includeFitness:!!input.includeFitness,badgeIds:[...skillIds],assessmentType,moduleSnapshot:{moduleId:assessmentType,name:input.moduleName||name,version:1,source:'local-psb-mapping',badgeIds:[...skillIds],badges:skillIds.map(id=>{const k=state.skills.find(k=>k.id===id);return {id,name:k.name,level:k.level};})},assignments:studentIds.map(student=>({student,skills:[...skillIds],badgeIds:[...skillIds]}))};state.cycles.push(cycle);return cycle;
}
export function addToAssessment(state,cycleId,studentId,requestedSkills){
 const cycle=state.cycles.find(c=>c.id===cycleId),student=visibleStudents(state).find(s=>s.id===studentId);
 if(!cycle||!student||cycle.date<state.demoDate||cycle.date<student.joined)throw Error('Choose an upcoming assessment and an assigned, enrolled student.');
 if(cycle.rescheduled?.[studentId]||(cycle.plannerKey&&state.planner.rosters[cycle.plannerKey]?.deferred[studentId]))throw Error('This student has moved to a later assessment. Add them to the destination assessment instead.');
 // The group determines its shared skill set; a profile cannot invent a different assessment.
 const groupSkills=unique(cycle.assignments.flatMap(a=>a.skills)),skills=unique(requestedSkills||groupSkills);
 if(!skills.length&&!cycle.includeFitness)throw Error('This assessment has no active skills or fitness step. Choose another assessment.');
 if(skills.some(id=>!groupSkills.includes(id)||!canAccessSkill(state,id)))throw Error('Choose skills included in this assessment and available to your role.');
 let assignment=cycle.assignments.find(a=>a.student===studentId);
 if(assignment){assignment.skills=unique([...assignment.skills,...skills]);assignment.badgeIds=unique([...(assignment.badgeIds||[]),...skills]);}else{assignment={student:studentId,skills,badgeIds:[...skills]};cycle.assignments.push(assignment);}
 if(cycle.plannerKey){const roster=state.planner.rosters[cycle.plannerKey];if(roster){if(!roster.students.includes(studentId))roster.students.push(studentId);delete roster.deferred[studentId];}}
 return cycle;
}
export function recordFitness(state,input){
 const student=visibleStudents(state).find(s=>s.id===input.student),cycle=state.cycles.find(c=>c.id===input.cycleId);
 if(!student||!validDate(input.date)||input.date>state.demoDate||input.date<student.joined||!Array.isArray(input.values)||input.values.length!==7||input.values.some(v=>!Number.isFinite(v)||v<=0||v>100000))throw Error('Check the student, date and seven positive fitness measurements.');
 if(!cycle||!cycle.includeFitness||cycle.date!==input.date||cycle.rescheduled?.[student.id]||!cycle.assignments.some(a=>a.student===student.id))throw Error('Choose the fitness step in an assigned assessment.');
 const record={id:crypto.randomUUID(),student:student.id,date:input.date,values:[...input.values],cycleId:cycle.id,notes:text(input.notes,1000)};state.fitness.push(record);return record;
}

export function rescheduleStudent(state,cycleId,studentId,date){
 const source=state.cycles.find(c=>c.id===cycleId),student=visibleStudents(state).find(s=>s.id===studentId),assignment=source?.assignments.find(a=>a.student===studentId);
 if(!source||!student||!assignment||source.rescheduled?.[studentId]||!validDate(date)||date<=source.date||date<state.demoDate||date<student.joined)throw Error('Choose an assigned student and a later upcoming assessment date.');
 const recorded=skill=>state.assessments.some(a=>!a.baseline&&a.cycleId===source.id&&a.student===studentId&&a.skill===skill);
 const pending=assignment.skills.filter(skill=>!recorded(skill)),fitnessPending=source.includeFitness&&!state.fitness.some(f=>f.cycleId===source.id&&f.student===studentId);
 if(!pending.length&&!fitnessPending)throw Error('All assessment steps are already recorded for this student.');
 if(pending.some(id=>!canAccessSkill(state,id)))throw Error('Some assigned skills are outside your current curriculum access.');
 const level=source.level||state.skills.find(k=>pending.includes(k.id))?.level;
 let target=state.cycles.find(c=>c.id!==source.id&&c.date===date&&c.level===level&&!c.rescheduled?.[studentId]&&(!fitnessPending||c.includeFitness)&&pending.every(id=>c.assignments.some(a=>a.skills.includes(id))));
 if(!target){target={id:crypto.randomUUID(),name:source.name+' · '+date,date,level,includeFitness:!!fitnessPending,assignments:[]};state.cycles.push(target);}
 let to=target.assignments.find(a=>a.student===studentId);if(to)to.skills=unique([...to.skills,...pending]);else target.assignments.push({student:studentId,skills:[...pending]});
 assignment.skills=assignment.skills.filter(recorded);assignment.badgeIds=[...assignment.skills];
 if(to)to.badgeIds=[...to.skills];else target.assignments.at(-1).badgeIds=[...pending];
 target.badgeIds=unique(target.assignments.flatMap(a=>a.badgeIds||a.skills));
 target.assessmentType??=source.assessmentType||'PSB_LOCAL_'+(level||'FITNESS');
 target.moduleSnapshot??={moduleId:target.assessmentType,name:target.name,version:1,source:'local-psb-mapping',badgeIds:[...target.badgeIds],badges:target.badgeIds.map(id=>{const k=source.moduleSnapshot?.badges?.find(k=>k.id===id)||state.skills.find(k=>k.id===id);return {id,name:k.name,level:k.level};})};
 // A per-student marker keeps the original evidence accessible without another live queue.
 source.rescheduled={...source.rescheduled,[studentId]:{date,assessmentId:target.id}};
 if(source.plannerKey&&state.planner.rosters[source.plannerKey])state.planner.rosters[source.plannerKey].deferred[studentId]=date;
 if(target.plannerKey&&state.planner.rosters[target.plannerKey]){const r=state.planner.rosters[target.plannerKey];if(!r.students.includes(studentId))r.students.push(studentId);delete r.deferred[studentId];}
 return target;
}
