import {addPlanDays,upcomingFridays,workingLevel,levelSkills} from './planner.js';
import {recordAssessmentClearance} from './progression.js';

// Extra local example records for exercising mixed-batch recommendations.
// Append once; existing people, assignments, results and edits are never replaced.
export const GROUPING_DATA_REVISION=1;
const venues=['Indiranagar','Whitefield','JP Nagar'];
const names=[
 ['Riya Sethi','Neil Kapoor','Avni Desai','Dhruv Bhat','Maya Iyer','Yuvan Shetty','Anika Rao','Rohan Kulkarni','Sara Menon','Vivaan Bose','Kavya Shah','Advik Nair'],
 ['Aisha Thomas','Kabir Mehta','Ira Reddy','Arnav Pai','Naina Joseph','Shaurya Jain','Tanya Das','Krish Malhotra','Myra Sen','Rudra Patil','Sia Varma','Ishan Naidu'],
 ['Mehul Suri','Zara Fernandes','Ayaan Prakash','Reva Hegde','Aria Krishnan','Veer Banerjee','Disha Anand','Parth Joshi','Tara Mukherjee','Rehan Dutta','Aditi Pillai','Nikhil George']
];
const through=n=>Array.from({length:n},(_,i)=>i+1);
const profiles=[
 [1,2,3], [1,2,6], [1,2,4], [1,2,4],
 [1,2,3,4,5,7,8], [1,2,3,4,5,7,8], through(7),
 through(12).filter(id=>id!==10), through(12).filter(id=>id!==10),
 through(15), through(15), through(16)
];
const levels=['Spark','Scout','Star','Champ'];

function uniqueId(rows,preferred){let id=preferred,n=2;while(rows.some(row=>row.id===id))id=preferred+'-'+n++;return id;}
function uniqueName(rows,preferred){let name=preferred,n=2;while(rows.some(row=>row.name.toLowerCase()===name.toLowerCase()))name=preferred+' ('+(n++)+')';return name;}
const nextCoachId=state=>Math.max(0,...[...state.coaches.map(c=>c.id),...state.students.flatMap(s=>[s.coach,...(s.assistantCoaches||[])])].filter(Number.isInteger))+1;

function assessment(state,id,name,date,assignments){
 const badgeIds=[...new Set(assignments.flatMap(a=>a.badgeIds))];
 const moduleId='PSB_LOCAL_MIXED_TRAINING';
 const cycle={id:uniqueId(state.cycles,id),name:uniqueName(state.cycles,name),date,
  assessmentType:moduleId,includeFitness:false,badgeIds,
  moduleSnapshot:{moduleId,name:'Mixed coaching skill sets',version:1,source:'local-psb-mapping',badgeIds:[...badgeIds],badges:badgeIds.map(id=>{const k=state.skills.find(k=>k.id===id);return {id,name:k.name,level:k.level};})},
  assignments:assignments.map(a=>({student:a.student,skills:[...a.badgeIds],badgeIds:[...a.badgeIds]})),dataPack:'grouping-v1'};
 state.cycles.push(cycle);return cycle;
}

export function ensureGroupingData(current){
 if(current.groupingData?.revision>=GROUPING_DATA_REVISION)return current;
 const state=structuredClone(current),priorRole=state.role,studentIds=[],assessmentIds=[],batchIds=[];
 const newPlayersByVenue=[];
 state.role='Management';
 for(let v=0;v<venues.length;v++){
  const venue=venues[v];
  let head=state.coaches.find(c=>c.role==='Head Coach'&&c.venues.includes(venue));
  if(!head){head={id:nextCoachId(state),name:venue+' Training Lead',role:'Head Coach',venue,venues:[venue]};state.coaches.push(head);}
  let assistants=state.coaches.filter(c=>c.role==='Assistant Coach'&&c.venues.includes(venue));
  if(!assistants.length){const coach={id:nextCoachId(state),name:'Nandita Rao',role:'Assistant Coach',venue,venues:[venue]};coach.name=uniqueName(state.coaches,coach.name);state.coaches.push(coach);assistants=[coach];}
  const date=addPlanDays(state.demoDate,-12-v*3),joined=addPlanDays(date,-45),players=[];
  for(let i=0;i<profiles.length;i++){
   let number=v*12+i+1,id='PG'+String(number).padStart(3,'0');
   while(state.students.some(s=>s.id===id))id='PG'+String(++number).padStart(3,'0');
   const student={id,name:names[v][i],age:8+(i+v)%9,venue,coach:head.id,assistantCoaches:assistants.map(c=>c.id),level:'Spark',track:i>=9?'Intermediate':'Beginner',
    email:'guardian.'+id.toLowerCase()+'@example.invalid',phone:'000000'+String(v*12+i+1).padStart(4,'0'),joined,badges:[],baseline:[],dataPack:'grouping-v1'};
   state.students.push(student);players.push(student);studentIds.push(id);
  }
  const completed=assessment(state,'PG-FOUNDATIONS-'+v,venue+' skill development review',date,players.map((s,i)=>({student:s.id,badgeIds:profiles[i]})));
  assessmentIds.push(completed.id);
  for(let i=0;i<players.length;i++)recordAssessmentClearance(state,{assessmentId:completed.id,student:players[i].id,date,status:'CLEARED',sourceResultId:'grouping-v1:'+players[i].id+':completed',notes:'Prior assessment clearance for the collected badges.',coach:head.id});
  // Two recorded unsuccessful results make the support indicators observable.
  for(let attempt=1;attempt<=2;attempt++){
   const resultDate=addPlanDays(date,attempt*3),cycle=assessment(state,'PG-SUPPORT-'+v+'-'+attempt,venue+' skill feedback '+attempt,resultDate,[{student:players[0].id,badgeIds:[4]},{student:players[6].id,badgeIds:[8]}]);
   assessmentIds.push(cycle.id);
   for(const id of [players[0].id,players[6].id])recordAssessmentClearance(state,{assessmentId:cycle.id,student:id,date:resultDate,status:'NOT_CLEARED',sourceResultId:'grouping-v1:'+id+':practice-'+attempt,notes:'Continue the linked drill before the next regular assessment.',coach:head.id});
  }
  const next=assessment(state,'PG-UPCOMING-'+v,venue+' next skill assessment',upcomingFridays(addPlanDays(state.demoDate,1),3)[v],players.filter(s=>workingLevel(state,s)).map(s=>({student:s.id,badgeIds:levelSkills(state,workingLevel(state,s)).filter(k=>!s.badges.includes(k.id)).map(k=>k.id)})));
  assessmentIds.push(next.id);newPlayersByVenue.push(players);
 }
 const curriculumIds=levels.map((level,i)=>{
  const curriculum={id:uniqueId(state.curricula,'pg-curriculum-'+level.toLowerCase()),name:uniqueName(state.curricula,level+' coaching foundations'),level,libraryIds:through(4).map(n=>'official-'+(i*4+n)),dataPack:'grouping-v1'};
  state.curricula.push(curriculum);return curriculum.id;
 });
 const addBatch=(name,ids,curriculumId)=>{const b={id:uniqueId(state.batches,'pg-batch-'+batchIds.length),name:uniqueName(state.batches,name),studentIds:[...ids],curriculumId,libraryIds:[...state.curricula.find(c=>c.id===curriculumId).libraryIds],dataPack:'grouping-v1'};state.batches.push(b);batchIds.push(b.id);};
 for(let v=0;v<venues.length;v++)addBatch(venues[v]+' Mixed Coaching',newPlayersByVenue[v].map(s=>s.id),curriculumIds[0]);
 addBatch('Academy Mixed Coaching',studentIds,curriculumIds[0]);
 addBatch('Continued Practice',newPlayersByVenue.map(players=>players[11].id),curriculumIds[3]);
 state.groupingData={revision:GROUPING_DATA_REVISION,studentIds,assessmentIds,batchIds};
 for(const role of ['Head Coach','Assistant Coach'])if(!state.coaches.some(c=>c.id===state.activeCoachIds?.[role]&&c.role===role)){
  state.activeCoachIds??={};state.activeCoachIds[role]=state.coaches.find(c=>c.role===role)?.id??null;
 }
 state.activities.unshift({text:'Mixed coaching batches are ready for training.',date:state.demoDate,type:'students',students:[...studentIds]});
 state.role=priorRole;
 return state;
}
