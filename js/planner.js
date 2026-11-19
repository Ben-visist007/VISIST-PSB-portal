// Recurring assessment planning. Real clearance stays in progression.js; simulated scoring is separate.
export const PLANNER_LEVELS=['Spark','Scout','Star','Champ'];
export const WEEKDAYS=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const valid=d=>typeof d==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(d)&&!Number.isNaN(Date.parse(d))&&new Date(d).toISOString().slice(0,10)===d;
export const addPlanDays=(date,n)=>{const d=new Date(date+'T00:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10);};
export const planKey=(date,level)=>date+'|'+level;
export function defaultPlanner(){return {settings:{days:Object.fromEntries(PLANNER_LEVELS.map((l,i)=>[l,{week:i+1,dow:5}])),fifth:'makeup',notice:15,mode:'recommend'},rosters:{}};}
export function validatePlannerSettings(s,allowClashes=false){
 if(!s||!['makeup','off'].includes(s.fifth)||!['recommend','auto'].includes(s.mode)||!Number.isInteger(s.notice)||s.notice<1||s.notice>30)throw Error('Check the reminder window and roster mode.');
 const seen=new Set();for(const l of PLANNER_LEVELS){const d=s.days?.[l];if(!d||!Number.isInteger(d.week)||d.week<1||d.week>4||!Number.isInteger(d.dow)||d.dow<0||d.dow>6)throw Error('Choose an occurrence and weekday for every level.');const k=d.week+'|'+d.dow;if(seen.has(k)&&!allowClashes)throw Error('Two levels share a day. Choose a different occurrence or weekday.');seen.add(k);}return s;
}
export function upgradePlanner(state){
 const base=defaultPlanner();const old=state.planner;
 try{base.settings=validatePlannerSettings(old?.settings,true);}catch{}
 if(old?.rosters&&typeof old.rosters==='object'&&!Array.isArray(old.rosters))for(const [key,r]of Object.entries(old.rosters)){
  const [date,level]=key.split('|');if(!valid(date)||!PLANNER_LEVELS.includes(level)||!r||!Array.isArray(r.students))continue;
  base.rosters[key]={students:[...new Set(r.students.filter(id=>state.students.some(s=>s.id===id)))],deferred:Object.fromEntries(Object.entries(r.deferred||{}).filter(([id,d])=>state.students.some(s=>s.id===id)&&valid(d))),...(r.includeFitness?{includeFitness:true}:{}),initialized:[...new Set((Array.isArray(r.initialized)?r.initialized:r.students).filter(id=>state.students.some(s=>s.id===id)))],cycleId:state.cycles.some(c=>c.id===r.cycleId)?r.cycleId:null};
 }state.planner=base;return state;
}
export function scheduleLabel(settings,level){const d=settings.days[level];return ['First','Second','Third','Fourth'][d.week-1]+' '+WEEKDAYS[d.dow];}
export function scheduledDays(settings,from,count=8){const out=[];for(let date=from,i=0;i<450&&out.length<count;i++,date=addPlanDays(date,1)){
 const d=new Date(date+'T00:00:00Z'),week=Math.ceil(d.getUTCDate()/7),level=PLANNER_LEVELS.find(l=>settings.days[l].week===week&&settings.days[l].dow===d.getUTCDay());
 if(level)out.push({date,level,kind:'assessment'});
 else if(week===5&&d.getUTCDay()===5&&settings.fifth==='makeup')out.push({date,level:null,kind:'catchup'});
 }return out;}
export function nextLevelDay(settings,level,after){let d=addPlanDays(after,1);for(let i=0;i<400;i++,d=addPlanDays(d,1)){const t=new Date(d+'T00:00:00Z'),rule=settings.days[level];if(Math.ceil(t.getUTCDate()/7)===rule.week&&t.getUTCDay()===rule.dow)return d;}return null;}
export const levelSkills=(state,level)=>state.skills.filter(k=>k.level===level).sort((a,b)=>a.id-b.id);
export const workingLevel=(state,student)=>PLANNER_LEVELS.find(l=>levelSkills(state,l).some(k=>!student.badges.includes(k.id)))||null;
export function failureStreak(state,student,skill,through=state.demoDate){const rows=state.assessments.filter(a=>!a.baseline&&a.student===student&&a.skill===skill&&a.date<=through).map((a,i)=>({...a,i})).sort((a,b)=>b.date.localeCompare(a.date)||b.i-a.i);let n=0;for(const a of rows){if(a.outcome!=='Needs Practice')break;n++;}return n;}
export function recommendations(state,students,level,date){const rec=[],stretch=[];for(const s of students){if(s.joined>date)continue;const working=workingLevel(state,s),missing=levelSkills(state,level).filter(k=>!s.badges.includes(k.id));if(!working||!missing.length)continue;const row={student:s,working,missing,attention:missing.some(k=>failureStreak(state,s.id,k.id)>=2)};if(working===level)rec.push(row);else if(PLANNER_LEVELS.indexOf(working)<PLANNER_LEVELS.indexOf(level))stretch.push(row);}return {rec,stretch};}
export function ensureRoster(state,date,level,students){const key=planKey(date,level);const r=state.planner.rosters[key]??={students:[],deferred:{},initialized:[],cycleId:null};r.initialized??=[...r.students];if(state.planner.settings.mode==='auto'){for(const row of recommendations(state,students,level,date).rec){const id=row.student.id;if(!r.initialized.includes(id)){r.initialized.push(id);if(!r.students.includes(id))r.students.push(id);const c=state.cycles.find(c=>c.id===r.cycleId);if(c&&!r.deferred[id]&&!c.assignments.some(a=>a.student===id))c.assignments.push({student:id,skills:levelSkills(state,level).map(k=>k.id)});}}}return r;}
export function visibleRoster(state,roster,students){const ids=new Set(students.map(s=>s.id));return roster.students.filter(id=>ids.has(id)&&!roster.deferred[id]);}
export function setRosterStudent(state,date,level,students,id,include){if(!students.some(s=>s.id===id&&s.joined<=date))throw Error('This student is outside the current roster view.');const r=ensureRoster(state,date,level,students),c=state.cycles.find(c=>c.id===r.cycleId);if(r.deferred[id])throw Error('This student has been deferred to another assessment day.');const recorded=c&&state.assessments.some(a=>!a.baseline&&a.cycleId===c.id&&a.student===id);if(!include&&recorded)throw Error('This student has recorded results. Defer their unfinished assessments instead.');if(!r.initialized.includes(id))r.initialized.push(id);if(include){if(!r.students.includes(id))r.students.push(id);if(c&&!c.assignments.some(a=>a.student===id))c.assignments.push({student:id,skills:levelSkills(state,level).map(k=>k.id)});}else{r.students=r.students.filter(x=>x!==id);if(c)c.assignments=c.assignments.filter(a=>a.student!==id);}return r;}
export function createPlanCycle(state,date,level,students){const r=ensureRoster(state,date,level,students),ids=visibleRoster(state,r,students);if(!ids.length)throw Error('Add at least one student to the roster.');let c=state.cycles.find(c=>c.id===r.cycleId);if(!c){c={id:crypto.randomUUID(),name:level+' assessment · '+date,date,plannerKey:planKey(date,level),assignments:[]};state.cycles.push(c);r.cycleId=c.id;}
 for(const id of ids)if(!c.assignments.some(a=>a.student===id))c.assignments.push({student:id,skills:levelSkills(state,level).map(k=>k.id)});return c;}
export function deferStudent(state,date,level,students,id){const r=ensureRoster(state,date,level,students);if(!visibleRoster(state,r,students).includes(id))throw Error('Choose a student in the current roster.');const next=nextLevelDay(state.planner.settings,level,date);if(!next)throw Error('No next assessment date is available.');const c=state.cycles.find(c=>c.id===r.cycleId),a=c?.assignments.find(a=>a.student===id);const done=skill=>state.assessments.some(x=>!x.baseline&&x.cycleId===c?.id&&x.student===id&&x.skill===skill);if(a&&a.skills.every(done))throw Error('All assigned skills are already recorded.');if(a)a.skills=a.skills.filter(done);r.deferred[id]=next;const target=ensureRoster(state,next,level,students);if(!target.students.includes(id))target.students.push(id);delete target.deferred[id];if(target.cycleId){const tc=state.cycles.find(x=>x.id===target.cycleId);if(tc&&!tc.assignments.some(x=>x.student===id))tc.assignments.push({student:id,skills:levelSkills(state,level).map(k=>k.id)});}return next;}
// Practice is based on assigned students and skill gaps, without a daily register.
export function practiceGroups(state,students,date=state.demoDate){
 const enrolled=students.filter(s=>s.joined<=date);
 const groups=PLANNER_LEVELS.map(level=>{
  const kids=enrolled.filter(s=>workingLevel(state,s)===level);
  const focus=levelSkills(state,level).map(skill=>{
   const missing=kids.filter(s=>!s.badges.includes(skill.id));
   return {skill,students:missing,attention:missing.filter(s=>failureStreak(state,s.id,skill.id,date)>=2).length};
  }).filter(f=>f.students.length).sort((a,b)=>b.students.length-a.students.length||b.attention-a.attention||a.skill.id-b.skill.id);
  return {level,students:kids,focus};
 }).filter(g=>g.students.length);
 return {students:enrolled,groups,complete:enrolled.filter(s=>!workingLevel(state,s))};
}
export const dayPractice=practiceGroups;

// Assign each student once to a shared missing skill within their earliest
// incomplete collection. Venue boundaries keep groups usable for a real session.
export function teachingGroups(state,students,date=state.demoDate){
 const enrolled=[...new Map(students.filter(s=>s.joined<=date).map(s=>[s.id,s])).values()];
 const buckets=new Map(),groups=[],complete=[];
 for(const student of enrolled){
  const level=workingLevel(state,student);
  if(!level){complete.push(student);continue;}
  const key=level+'@'+encodeURIComponent(student.venue);
  if(!buckets.has(key))buckets.set(key,{venue:student.venue,level,students:[]});
  buckets.get(key).students.push(student);
 }
 const nameOrder=(a,b)=>a.name.localeCompare(b.name)||a.id.localeCompare(b.id);
 for(const bucket of buckets.values()){
  let remaining=[...bucket.students];
  while(remaining.length){
   const focus=levelSkills(state,bucket.level).map(skill=>{
    const missing=remaining.filter(s=>!s.badges.includes(skill.id));
    return {skill,students:missing,attention:missing.filter(s=>failureStreak(state,s.id,skill.id,date)>=2).length};
   }).filter(g=>g.students.length).sort((a,b)=>b.students.length-a.students.length||b.attention-a.attention||a.skill.id-b.skill.id)[0];
   groups.push({...focus,id:focus.skill.id+'@'+encodeURIComponent(bucket.venue),venue:bucket.venue,level:bucket.level,students:focus.students.sort(nameOrder)});
   const assigned=new Set(focus.students.map(s=>s.id));remaining=remaining.filter(s=>!assigned.has(s.id));
  }
 }
 const ordered=groups.sort((a,b)=>b.students.length-a.students.length||b.attention-a.attention||a.skill.id-b.skill.id||a.venue.localeCompare(b.venue));
 return {students:enrolled,groups:ordered,complete:complete.sort(nameOrder)};
}

export function teachingGroupPreview(groups,limit=4){
 const selected=[],levels=new Set();
 for(const group of groups){if(!levels.has(group.level)&&selected.length<limit){selected.push(group);levels.add(group.level);}}
 for(const group of groups){if(selected.length>=limit)break;if(!selected.includes(group))selected.push(group);}
 return selected.sort((a,b)=>groups.indexOf(a)-groups.indexOf(b));
}

export function upcomingFridays(from,count=8){
 if(!valid(from)||!Number.isInteger(count)||count<1||count>52)throw Error('Choose a valid start date and number of upcoming Fridays.');
 let date=from;while(new Date(date+'T00:00:00Z').getUTCDay()!==5)date=addPlanDays(date,1);
 return Array.from({length:count},(_,i)=>addPlanDays(date,i*7));
}
