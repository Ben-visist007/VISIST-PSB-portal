import {initializeScoreSimulation} from './reference-simulator.js';
import {visibleStudents,allowedSkills,createAssessment,activeCoach} from './operations.js';
import {recordAssessmentClearance} from './progression.js';

// Simulated events use the same clearance adapter on a detached workspace.
export function createSimulation(source,scenario='academy'){
 if(!['academy','dry'].includes(scenario))throw Error('Choose an available scenario.');
 const copy=structuredClone(source);
 copy.simulationEvents=[];
 if(scenario==='dry'){
  const ids=new Set(visibleStudents(source).slice(0,4).map(s=>s.id));
  copy.students=copy.students.filter(s=>ids.has(s.id)).map(s=>({...s,level:'Spark',badges:[],baseline:[],joined:copy.demoDate}));
  copy.assessments=[];copy.clearanceResults=[];copy.levelEvents=[];copy.cycles=[];copy.fitness=[];copy.activities=[];
  copy.batches=copy.batches.map(b=>({...b,studentIds:b.studentIds.filter(id=>ids.has(id))})).filter(b=>b.studentIds.length);
  copy.planner={...copy.planner,rosters:{}};
 }
 return initializeScoreSimulation(copy);
}

export function simulateClearance(workspace,input){
 if(!Array.isArray(workspace.simulationEvents))throw Error('Start a simulation workspace first.');
 const student=visibleStudents(workspace).find(s=>s.id===input.student);
 if(!student)throw Error('Choose a student assigned to this workspace.');
 if(!['CLEARED','NOT_CLEARED'].includes(input.status))throw Error('Choose Cleared or Not cleared.');
 const skills=allowedSkills(workspace).filter(k=>k.level===input.level),ids=input.badgeIds||skills.map(k=>k.id);
 if(!ids.length||new Set(ids).size!==ids.length||ids.some(id=>!skills.some(k=>k.id===id)))throw Error('Choose badges from an available collection.');
 const date=input.date||workspace.demoDate;
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date))||new Date(date).toISOString().slice(0,10)!==date||date<workspace.demoDate||date<student.joined)throw Error('Use today or a later date, after student enrolment.');
 // Validate in a second detached copy so failed events cannot leave partial state.
 const draft=structuredClone(workspace);
 const cycle=createAssessment(draft,{name:'Simulation · '+input.level+' · '+crypto.randomUUID().slice(0,8),date,level:input.level,badgeIds:ids,studentIds:[student.id]});
 draft.demoDate=date;
 const result=recordAssessmentClearance(draft,{assessmentId:cycle.id,student:student.id,date,status:input.status,sourceResultId:'simulation-'+crypto.randomUUID(),coach:activeCoach(draft)?.id||student.coach,notes:'Event simulator'});
 Object.assign(workspace,draft);
 return result;
}
