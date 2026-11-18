import {upgradeProgression} from './progression.js';
import {defaultPlanner} from './planner.js';
import {defaultCoaches,upgradeOperations} from './operations.js';
import {referenceSkills} from './curriculum.js';
import {DEMO_DATE} from './domain.js';
export const levels = ['Spark','Scout','Star','Champ'];
export const venues = ['Indiranagar','Whitefield','JP Nagar'];
export const coaches = defaultCoaches;
export const fitnessCategories = [{name:'20-metre sprint',unit:'seconds'},{name:'Agility',unit:'seconds (agility course)'},{name:'Jumps per minute',unit:'jumps/min'},{name:'Endurance',unit:'minutes'},{name:'Strength',unit:'repetitions'},{name:'Hand speed',unit:'taps/30 sec'},{name:'Leg reactions',unit:'milliseconds'}];
export function seed(){
 const names=['Arjun Sharma','Diya Patel','Aarav Nair','Ananya Reddy','Vihaan Rao','Ishita Das','Aditya Menon','Saanvi Shah','Rohan Kumar','Meera Iyer','Kabir Singh','Tara Kapoor','Dev Malhotra','Nisha Verma','Reyansh Jain','Aditi Joshi','Aryan Gupta','Kiara Shetty','Ishaan Bose','Zoya Khan'];
 const skills=referenceSkills();
 const students=names.map((name,i)=>({id:`VS${String(i+1).padStart(3,'0')}`,name,age:8+i%8,venue:venues[i%3],coach:i%3+1,level:levels[Math.floor(i/5)],track:i>=17?'Intermediate':'Beginner',email:`parent${i+1}@example.com`,phone:`987650${String(i+1).padStart(4,'0')}`,joined:`2026-0${7+i%2}-${String(1+i%20).padStart(2,'0')}`,badges:Array.from({length:Math.min(15,Math.floor(i/5)*4+i%4)},(_,j)=>j+1),baseline:[]}));
 students[0].badges=[1,2,6];
 const assessments=[];
 students.forEach((student,i)=>{
  student.badges.forEach((skill,j)=>assessments.push({id:`A${assessments.length+1}`,student:student.id,skill,
   date:`2026-${j%3===0?'09':j%3===1?'10':'11'}-${String(1+(i+j)%12).padStart(2,'0')}`,
   outcome:'Passed',answers:[true,true,true,true,j%2===0],threshold:4,criteria:[...skills[skill-1].criteria],skillName:skills[skill-1].name,
   remarks:'Demonstrated the skill target in a coach-led assessment.',coach:student.coach,baseline:false,cycleId:null}));
 });
 [['VS001',3,'2026-11-05'],['VS001',3,'2026-11-12'],['VS005',1,'2026-11-10'],['VS009',8,'2026-11-11'],['VS013',9,'2026-11-12']].forEach(([student,skill,date])=>{
  const s=students.find(s=>s.id===student);
  // Reassess an unearned skill; a failed attempt never contradicts a seeded award.
  if(s.badges.includes(skill))skill=skills.find(k=>!s.badges.includes(k.id)).id;
  assessments.push({id:`A${assessments.length+1}`,student,skill,date,outcome:'Needs Practice',answers:[true,false,true,false,false],threshold:4,
   criteria:[...skills[skill-1].criteria],skillName:skills[skill-1].name,remarks:'Continue guided practice, then reassess the skill target.',coach:s.coach,baseline:false,cycleId:null});
 });
 return upgradeProgression(upgradeOperations({planner:defaultPlanner(),version:1,dataRevision:2,curriculumRevision:1,demoDate:DEMO_DATE,students,skills,assessments,cycles:[{id:'C1',name:'November skill check-in',date:'2026-11-18',assignments:students.slice(0,8).map((s,i)=>({student:s.id,skills:[skills.find(k=>!s.badges.includes(k.id))?.id||16]}))},{id:'C2',name:'December development review',date:'2026-12-09',assignments:students.slice(8,15).map((s,i)=>({student:s.id,skills:[skills.find(k=>!s.badges.includes(k.id))?.id||16]}))}],fitness:[{id:'F1',student:'VS018',date:'2026-10-14',values:[4.6,12.4,58,8,14,42,380]},{id:'F2',student:'VS018',date:'2026-11-11',values:[4.3,11.8,64,10,17,48,355]}],activities:[{text:'Arjun Sharma needs guided practice on Keep & Lift Scout',date:'2026-11-12',type:'practice',student:'VS001'},{text:'November skill check-in is ready for 8 students',date:'2026-11-12',type:'assessment',students:students.slice(0,8).map(s=>s.id)},{text:'Diya Patel has one recorded Spark badge',date:'2026-11-11',type:'badge',student:'VS002'}],settings:{threshold:4},role:'Management',notificationsRead:false}));
}
