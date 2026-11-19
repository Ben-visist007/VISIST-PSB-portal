import test from 'node:test';
import assert from 'node:assert/strict';
import {seed} from '../js/data.js';
import {ensureGroupingData} from '../js/grouping-data.js';
import {upgradeState} from '../js/domain.js';
import {teachingGroups} from '../js/planner.js';
import {visibleStudents} from '../js/operations.js';
import {uniqueBadgeAwards} from '../js/analytics.js';

test('the expanded workspace adds 36 learners and five usable batches without changing the base fixture',()=>{
 const original=seed(),before=structuredClone(original),s=ensureGroupingData(original);
 assert.deepEqual(original,before);assert.equal(s.students.length,56);assert.equal(s.groupingData.studentIds.length,36);
 assert.equal(s.groupingData.batchIds.length,5);assert.equal(s.clearanceResults.length,48);assert.equal(s.skills.length,16);
 assert.deepEqual(s.students.slice(0,20),original.students);assert.deepEqual(s.assessments.slice(0,original.assessments.length),original.assessments);
});

test('each venue batch exercises six shared teaching groups and one completed learner',()=>{
 const s=ensureGroupingData(seed());
 for(const venue of ['Indiranagar','Whitefield','JP Nagar']){
  const b=s.batches.find(b=>b.name===venue+' Mixed Coaching'),kids=s.students.filter(p=>b.studentIds.includes(p.id)),plan=teachingGroups(s,kids);
  assert.equal(plan.students.length,12);assert.equal(plan.groups.length,6);assert.equal(plan.complete.length,1);
  const ids=plan.groups.flatMap(g=>g.students.map(p=>p.id));assert.equal(ids.length,11);assert.equal(new Set(ids).size,11);
  assert(plan.groups.some(g=>g.students.length===3));assert.deepEqual(new Set(plan.groups.map(g=>g.level)),new Set(['Spark','Scout','Star','Champ']));
  assert(plan.groups.every(g=>g.venue===venue&&g.students.every(p=>!p.badges.includes(g.skill.id))));
  assert(plan.groups.some(g=>g.attention>0));
 }
});

test('the academy and continued-practice batches cover venue boundaries and completed cohorts',()=>{
 const s=ensureGroupingData(seed()),mixed=s.batches.find(b=>b.name==='Academy Mixed Coaching'),completed=s.batches.find(b=>b.name==='Continued Practice');
 const plan=teachingGroups(s,s.students.filter(p=>mixed.studentIds.includes(p.id)));
 assert.equal(plan.groups.length,18);assert.equal(plan.complete.length,3);assert(plan.groups.every(g=>new Set(g.students.map(p=>p.venue)).size===1));
 const finished=teachingGroups(s,s.students.filter(p=>completed.studentIds.includes(p.id)));assert.equal(finished.groups.length,0);assert.equal(finished.complete.length,3);
});

test('new badges have dated clearance evidence and failures never contradict their award stock',()=>{
 const s=ensureGroupingData(seed()),ids=new Set(s.groupingData.studentIds),awards=uniqueBadgeAwards(s.assessments).filter(a=>ids.has(a.student));
 assert.equal(awards.length,303);
 for(const p of s.students.filter(p=>ids.has(p.id))){
  assert(p.joined<=s.demoDate);assert.equal(p.level,p.badges.length<4?'Spark':p.badges.length<8?'Scout':p.badges.length<12?'Star':'Champ');
  for(const id of p.badges)assert(awards.some(a=>a.student===p.id&&a.skill===id&&a.date>=p.joined&&a.date<=s.demoDate));
 }
 for(const r of s.clearanceResults.filter(r=>ids.has(r.student)&&r.status==='NOT_CLEARED'))assert(r.badgeIds.every(id=>!s.students.find(p=>p.id===r.student).badges.includes(id)));
});

test('the additive migration preserves edits, actor scope and custom records and runs once',()=>{
 const base=seed();base.students[0].name='Preserve my edited player';base.role='Assistant Coach';
 base.cycles.push({id:'custom-cycle',name:'My saved assessment',date:base.demoDate,assignments:[{student:'VS001',skills:[3]}]});
 const original=structuredClone(base),s=ensureGroupingData(base);
 assert.equal(s.role,'Assistant Coach');assert.deepEqual(s.students.slice(0,20),original.students);assert.deepEqual(s.cycles.slice(0,original.cycles.length),original.cycles);
 assert.equal(s.students[0].name,'Preserve my edited player');assert.strictEqual(ensureGroupingData(s),s);
 s.students.find(p=>p.id===s.groupingData.studentIds[0]).name='Keep my later edit';
 const loaded=ensureGroupingData(upgradeState(JSON.parse(JSON.stringify(s))));assert.equal(loaded.students.length,56);assert(loaded.students.some(p=>p.name==='Keep my later edit'));assert.equal(loaded.clearanceResults.length,48);
});

test('reserved ID and display-name collisions do not replace existing user records',()=>{
 const base=seed(),p={...structuredClone(base.students[0]),id:'PG001',name:'Existing PG player'};base.students.push(p);
 base.batches.push({id:'pg-batch-0',name:'Indiranagar Mixed Coaching',studentIds:['VS001'],curriculumId:'my-plan',libraryIds:['official-1']});
 base.curricula.push({id:'pg-curriculum-spark',name:'Spark coaching foundations',level:'Spark',libraryIds:['official-1']});
 const s=ensureGroupingData(base);assert.equal(s.students.length,57);assert.deepEqual(s.students.find(p=>p.id==='PG001'),p);
 assert.equal(new Set(s.students.map(p=>p.id)).size,57);assert.equal(new Set(s.batches.map(b=>b.id)).size,s.batches.length);
 assert.equal(s.batches.find(b=>b.id==='pg-batch-0').curriculumId,'my-plan');
});

test('each existing assistant gets mixed learners only at assigned venues',()=>{
 const s=ensureGroupingData(seed());s.role='Assistant Coach';
 for(const coach of s.coaches.filter(c=>c.role==='Assistant Coach')){
  s.activeCoachIds['Assistant Coach']=coach.id;const kids=visibleStudents(s).filter(p=>p.dataPack==='grouping-v1');
  assert.equal(kids.length,12);assert(kids.every(p=>coach.venues.includes(p.venue)));assert.equal(new Set(kids.map(p=>p.level)).size,4);
 }
});

test('data dates follow the workspace date, including an earlier historical workspace',()=>{
 const s=seed();s.demoDate='2025-02-03';const next=ensureGroupingData(s);
 for(const r of next.clearanceResults)assert(r.date<=s.demoDate);
 for(const p of next.students.filter(p=>p.dataPack==='grouping-v1'))assert(p.joined<=s.demoDate);
 assert(next.cycles.filter(c=>c.dataPack==='grouping-v1'&&c.name.includes('next skill')).every(c=>c.date>s.demoDate));
});

test('missing coach roles are populated without resetting the selected role',()=>{
 const base=seed();base.coaches=[];base.activeCoachIds={};base.role='Head Coach';const s=ensureGroupingData(base);
 assert.equal(s.role,'Head Coach');assert(s.activeCoachIds['Head Coach']);assert(s.activeCoachIds['Assistant Coach']);assert.equal(visibleStudents(s).filter(p=>p.dataPack==='grouping-v1').length,12);
});
