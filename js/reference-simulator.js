import {assessmentReference} from './assessment-reference.js';
import {visibleStudents,activeCoach,createAssessment,manageableVenues} from './operations.js';
import {recordAssessmentClearance,LEVELS} from './progression.js';

export function initializeScoreSimulation(state){state.simulationRules={threshold:70,levelRule:'tier'};state.simulationAttempts=[];state.simulationDays={};state.simulationBaseline=Object.fromEntries(state.students.map(s=>[s.id,{badges:[...s.badges],level:s.level}]));return state;}
export function generatedScores(state,student,level,random=Math.random,date=state.demoDate){const weeks=Math.max(0,(Date.parse(date)-Date.parse(student.joined))/604800000),tier=LEVELS.indexOf(level),ability=student.simulatedAbility??student.ability??76;return Object.fromEntries(assessmentReference.filter(k=>k.level===level).flatMap(k=>k.videos.map(v=>[v.id,Math.max(18,Math.min(99,Math.round(ability-9*tier+Math.min(14,weeks*1.3)-((student.simulatedWeak||student.weak)===k.key?17:0)+(random()*22-11))))])));}
function assertSandbox(state){if(!Array.isArray(state.simulationEvents))throw Error('Start a simulation workspace first.');}
function replay(state){
 const draft=structuredClone(state),role=draft.role,oldIds=new Set(draft.clearanceResults.filter(r=>r.sourceResultId.startsWith('score-sim-')).map(r=>r.id));
 draft.clearanceResults=draft.clearanceResults.filter(r=>!oldIds.has(r.id));draft.assessments=draft.assessments.filter(r=>!oldIds.has(r.clearanceId));draft.levelEvents=draft.levelEvents.filter(r=>!oldIds.has(r.clearanceId));draft.cycles=draft.cycles.filter(c=>!c.scoreSimulation);
 for(const student of draft.students){const base=draft.simulationBaseline[student.id]||{badges:[],level:'Spark'},manual=draft.clearanceResults.filter(r=>r.student===student.id&&r.status==='CLEARED');student.badges=[...new Set([...base.badges,...manual.flatMap(r=>r.badgeIds)])];student.level=base.level;}
 const currentDate=draft.demoDate,best=new Map();draft.role='Management';
 for(const attempt of [...draft.simulationAttempts].sort((a,b)=>a.date.localeCompare(b.date))){
  const student=draft.students.find(s=>s.id===attempt.student);if(!student)continue;draft.demoDate=attempt.date;
  for(const skill of assessmentReference.filter(k=>k.level===attempt.level)){
   const key=student.id+'|'+skill.id,values=best.get(key)||{};for(const video of skill.videos)values[video.id]=Math.max(values[video.id]||0,attempt.scores[video.id]||0);best.set(key,values);
   const passed=skill.videos.every(v=>values[v.id]>=draft.simulationRules.threshold),cycle=createAssessment(draft,{name:'Simulated '+skill.name+' · '+attempt.id,date:attempt.date,level:attempt.level,badgeIds:[skill.id],studentIds:[student.id]});cycle.scoreSimulation=true;
   recordAssessmentClearance(draft,{assessmentId:cycle.id,student:student.id,date:attempt.date,status:passed?'CLEARED':'NOT_CLEARED',sourceResultId:'score-sim-'+attempt.id+'-'+skill.id,coach:student.coach,notes:'Simulated AI scores; no external evaluator called.'});
  }
  const baseline=draft.simulationBaseline[student.id],minimum=Math.max(0,LEVELS.indexOf(baseline?.level));let index=0;
  if(draft.simulationRules.levelRule==='count')index=Math.min(3,Math.floor(student.badges.length/4));
  else for(let n=1;n<4;n++){if(Array.from({length:n*4},(_,i)=>i+1).every(id=>student.badges.includes(id)))index=n;else break;}
  student.level=LEVELS[Math.max(minimum,index)];
 }
 for(const student of draft.students){let index=0;if(draft.simulationRules.levelRule==='count')index=Math.min(3,Math.floor(student.badges.length/4));else for(let n=1;n<4;n++){if(Array.from({length:n*4},(_,i)=>i+1).every(id=>student.badges.includes(id)))index=n;else break;}student.level=LEVELS[index];}
 draft.demoDate=currentDate;draft.role=role;Object.assign(state,draft);
}
export function submitScoreSimulation(state,input){
 assertSandbox(state);const student=visibleStudents(state).find(s=>s.id===input.student),tasks=assessmentReference.filter(k=>k.level===input.level);
 if(!student||!tasks.length)throw Error('Choose an assigned student and available assessment.');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(input.date)||Number.isNaN(Date.parse(input.date))||new Date(input.date).toISOString().slice(0,10)!==input.date||input.date<state.demoDate||input.date<student.joined)throw Error('Choose today or an upcoming assessment date, after enrolment.');
 if(tasks.some(k=>k.videos.some(v=>!Number.isFinite(input.scores?.[v.id])||input.scores[v.id]<0||input.scores[v.id]>100)))throw Error('Every video requires a score between 0 and 100.');
 const before={badges:[...student.badges],level:student.level},draft=structuredClone(state),id=crypto.randomUUID();draft.simulationAttempts.push({id,student:student.id,date:input.date,level:input.level,scores:structuredClone(input.scores)});draft.demoDate=input.date;replay(draft);Object.assign(state,draft);const updated=state.students.find(s=>s.id===student.id);
 return {id,student:student.id,date:input.date,level:input.level,scores:structuredClone(input.scores),newSkills:updated.badges.filter(id=>!before.badges.includes(id)),previousLevel:before.level,currentLevel:updated.level};
}
export function changeSimulationRules(state,input){assertSandbox(state);if(!Number.isInteger(input.threshold)||input.threshold<50||input.threshold>90||!['tier','count'].includes(input.levelRule))throw Error('Choose an available simulation rule.');const draft=structuredClone(state);draft.simulationRules={...input};replay(draft);Object.assign(state,draft);}
export function onboardSimulationStudent(state,input){
 assertSandbox(state);const name=String(input.name||'').trim(),age=Number(input.age),coach=state.coaches.find(c=>c.id===+input.coachId&&c.role==='Assistant Coach'),self=activeCoach(state),venues=state.role==='Assistant Coach'?self?.venues||[]:manageableVenues(state),venue=coach?.venues.find(v=>venues.includes(v)),head=state.coaches.find(c=>c.role==='Head Coach'&&c.venues.includes(venue));
 if(name.length<2||!Number.isInteger(age)||age<4||age>18||!coach||!venue||!head||(state.role==='Assistant Coach'&&coach.id!==self?.id)||![62,76,92].includes(+input.ability))throw Error('Choose a name, age and coach in your workspace.');
 const student={id:'VS'+String(Math.max(0,...state.students.map(s=>+s.id.slice(2)||0))+1).padStart(3,'0'),name,age,venue,coach:head.id,assistantCoaches:[coach.id],email:'',phone:'',track:'Beginner',level:'Spark',badges:[],baseline:[],joined:state.demoDate,simulatedAbility:+input.ability};state.students.push(student);state.simulationBaseline[student.id]={badges:[],level:'Spark'};return student;
}
