import test from 'node:test';
import assert from 'node:assert/strict';
import { seed } from '../js/data.js';
import { cycleOutcome, pendingModules, recordAssessment, needsPractice, saveSession, upgradeState, validDate } from '../js/domain.js';

const input = (overrides = {}) => ({ student: 'VS001', skill: 16, date: '2026-11-13',
  answers: [true,true,true,true,false], remarks: 'Illustrative QA observation', baseline: false, coach: 1, cycleId: null, ...overrides });

test('seed records are chronological and every award has passing evidence', () => {
  const s = seed();
  assert.equal(s.students.length,20);
  assert.equal(s.skills.length,16);
  for (const level of ['Spark','Scout','Star','Champ']) assert.equal(s.skills.filter(k=>k.level===level).length,4);
  for (const student of s.students) {
    assert.equal(new Set(student.badges).size,student.badges.length);
    for (const skill of student.badges) assert(s.assessments.some(a=>a.student===student.id&&a.skill===skill&&a.outcome==='Passed'));
  }
  for (const a of s.assessments) {
    assert(a.date>=s.students.find(x=>x.id===a.student).joined);
    assert(a.date<=s.demoDate);
    assert.equal(a.outcome,a.answers.filter(Boolean).length>=a.threshold?'Passed':'Needs Practice');
  }
});

test('higher individual awards never promote and cannot be duplicated', () => {
  const s=seed();recordAssessment(s,input());recordAssessment(s,input());
  assert.equal(s.students[0].level,'Spark');
  assert.equal(s.students[0].badges.filter(x=>x===16).length,1);
});

test('baseline evidence never awards a curriculum badge or completes a normal cycle', () => {
  const s=seed(),c={id:'qa-cycle',date:s.demoDate,assignments:[{student:'VS001',skills:[16]}]};s.cycles.push(c);
  recordAssessment(s,input({baseline:true}));
  assert(s.students[0].baseline.includes(16));assert(!s.students[0].badges.includes(16));
  assert(!cycleOutcome(s,c,'VS001',16));assert(pendingModules(s,s.students[0]).some(x=>x.cycle.id===c.id));
});

test('same-day cycles and standalone assessments do not complete each other', () => {
  const s=seed(),a={id:'qa-a',date:s.demoDate,assignments:[{student:'VS001',skills:[16]}]},b={...a,id:'qa-b'};
  s.cycles.push(a,b);recordAssessment(s,input());assert(!cycleOutcome(s,a,'VS001',16));
  recordAssessment(s,input({cycleId:a.id}));assert(cycleOutcome(s,a,'VS001',16));assert(!cycleOutcome(s,b,'VS001',16));
});

test('invalid dates, pre-enrolment dates and unassigned modules do not mutate records', () => {
  const s=seed(),count=s.assessments.length;
  for (const overrides of [{date:'2026-11-14'},{date:'2020-01-01'},{date:'2026-02-30'},{cycleId:'unknown'},{answers:[true]}]) {
    assert.throws(()=>recordAssessment(s,input(overrides)));
    assert.equal(s.assessments.length,count);
  }
});

test('threshold changes affect new outcomes, not historical snapshots', () => {
  const s=seed();const passed=recordAssessment(s,input());s.settings.threshold=5;
  const failed=recordAssessment(s,input());assert.equal(passed.outcome,'Passed');assert.equal(passed.threshold,4);
  assert.equal(failed.outcome,'Needs Practice');assert.equal(failed.threshold,5);assert(s.students[0].badges.includes(16));
});

test('later success clears current practice needs while retaining unsuccessful history', () => {
  const s=seed();assert.equal(needsPractice(s,{student:'VS001'}).filter(a=>a.skill===3).length,1);
  recordAssessment(s,input({skill:3}));assert(!needsPractice(s,{student:'VS001'}).some(a=>a.skill===3));
  assert.equal(s.assessments.filter(a=>a.student==='VS001'&&a.skill===3&&a.outcome==='Needs Practice').length,2);
});

test('editing curriculum cannot rewrite an assessment that was already recorded', () => {
  const s=seed(),a=recordAssessment(s,input());const original=a.criteria[0];s.skills[15].criteria[0]='New sample criterion';
  assert.equal(a.criteria[0],original);assert.notEqual(a.criteria[0],s.skills[15].criteria[0]);
});

test('attendance replacement supports corrections and clearing every mark', () => {
  const s=seed(),students=s.students.slice(0,2),session='QA session',date=s.demoDate;
  saveSession(s,{students,session,date,notes:'Session notes',statuses:{VS001:'Present',VS002:'Absent'}});
  assert.equal(s.attendance.filter(a=>a.date===date&&a.session===session).length,2);
  saveSession(s,{students,session,date,notes:'Corrected',statuses:{VS001:'Absent',VS002:'Unmarked'}});
  assert.equal(s.attendance.filter(a=>a.date===date&&a.session===session).length,1);
  assert.equal(s.attendance.find(a=>a.date===date&&a.session===session).status,'Absent');
  saveSession(s,{students,session,date,notes:'',statuses:{VS001:'Unmarked',VS002:'Unmarked'}});
  assert.equal(s.attendance.filter(a=>a.date===date&&a.session===session).length,0);
});

test('an invalid attendance operation leaves the previous register untouched', () => {
  const s=seed(),before=JSON.stringify(s.attendance);
  assert.throws(()=>saveSession(s,{students:s.students,date:'2026-12-01',session:'x',notes:'',statuses:{VS001:'Present'}}));
  assert.equal(JSON.stringify(s.attendance),before);
});

test('legacy state upgrades preserve custom records and do not guess ambiguous cycle membership', () => {
  const s=seed();delete s.demoDate;delete s.sessionDrafts;s.students[0].name='Edited student';
  s.cycles.push({id:'one',date:'2026-11-13',assignments:[{student:'VS001',skills:[16]}]},{id:'two',date:'2026-11-13',assignments:[{student:'VS001',skills:[16]}]});
  s.assessments.push({...input(),id:'custom',outcome:'Passed'});
  const loaded=upgradeState(s);assert.equal(loaded.students[0].name,'Edited student');assert.equal(loaded.assessments.at(-1).cycleId,null);
  assert.equal(loaded.demoDate,'2026-11-13');assert.deepEqual(loaded.sessionDrafts,{});
});

test('invalid saved state is detected before rendering', () => {
  assert.throws(()=>upgradeState({version:1}));const s=seed();s.skills=[];assert.throws(()=>upgradeState(s));
});

test('legacy fictional badge stock is reconciled once without losing custom work', () => {
  const s=seed();delete s.dataRevision;
  s.assessments=Array.from({length:44},(_,i)=>({...input({student:'VS001',skill:1,date:'2026-09-01'}),id:'A'+(i+1),outcome:'Passed'}));
  s.students[0].joined='2026-10-01';s.students[0].name='User-edited name';
  const loaded=upgradeState(s),count=loaded.assessments.length;
  assert.equal(loaded.students[0].name,'User-edited name');assert.equal(loaded.students[0].joined,'2026-09-01');
  assert(loaded.assessments.some(a=>a.importedSample&&a.student==='VS001'&&a.skill===6));
  assert.equal(upgradeState(loaded).assessments.length,count);
});

test('calendar date validation catches impossible input',()=>{
  assert(validDate('2026-11-13'));assert(!validDate('2026-02-30'));assert(!validDate('not a date'));
});

test('PSB placeholder upgrade preserves custom content and historical snapshots', () => {
 const s=seed();delete s.curriculumRevision;
 Object.assign(s.skills[0],{name:'Sample skill 01',drill:'Sample practice 01',criteria:Array.from({length:5},(_,i)=>`Sample criterion ${i+1}`)});
 s.skills[0].criteria[0]='Coach-authored criterion';s.skills[1].name='Custom academy skill';
 const before=JSON.stringify(s.assessments),students=JSON.stringify(s.students);
 const loaded=upgradeState(s);
 assert.equal(loaded.skills[0].name,'Grip Scout');
 assert.equal(loaded.skills[0].criteria[0],'Coach-authored criterion');
 assert.equal(loaded.skills[0].criteria[1],'Demonstrates the backhand grip');
 assert.equal(loaded.skills[1].name,'Custom academy skill');
 assert.equal(JSON.stringify(loaded.assessments),before);
 assert.equal(JSON.stringify(loaded.students),students);
 const once=JSON.stringify(loaded);assert.equal(JSON.stringify(upgradeState(loaded)),once);
});
