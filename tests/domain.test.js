import test from 'node:test';
import assert from 'node:assert/strict';
import { seed } from '../js/data.js';
import { cycleOutcome, pendingModules, recordAssessment, needsPractice, upgradeState, validDate } from '../js/domain.js';

const input = (overrides = {}) => ({ student: 'VS001', skill: 16, date: '2026-11-13',
  answers: [true,true,true,true,false], remarks: 'Illustrative QA observation', baseline: false, coach: 1, cycleId: 'qa-assessment', ...overrides });

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

test('question-based scoring cannot be used for new results',()=>{assert.throws(()=>recordAssessment(seed(),input()),/retired/);assert.throws(()=>recordAssessment(seed(),input({baseline:true})),/retired/);});

test('saved workspaces ignore retired register data without losing assessment history', () => {
 const s=seed(),before=JSON.stringify(s.assessments);s.attendance='malformed legacy register';s.sessionDrafts={old:{notes:'Old notes'}};
 const upgraded=upgradeState(s);assert.equal(JSON.stringify(upgraded.assessments),before);assert(!('attendance' in upgraded));assert(!('sessionDrafts' in upgraded));
 const noRegister=structuredClone(upgraded);assert.equal(upgradeState(noRegister).students.length,20);
});

test('legacy state upgrades preserve custom records and do not guess ambiguous cycle membership', () => {
  const s=seed();delete s.demoDate;delete s.sessionDrafts;s.students[0].name='Edited student';
  s.cycles.push({id:'one',date:'2026-11-13',assignments:[{student:'VS001',skills:[16]}]},{id:'two',date:'2026-11-13',assignments:[{student:'VS001',skills:[16]}]});
  s.assessments.push({...input({cycleId:null}),id:'custom',outcome:'Passed'});
  const loaded=upgradeState(s);assert.equal(loaded.students[0].name,'Edited student');assert.equal(loaded.assessments.at(-1).cycleId,null);
  assert.equal(loaded.demoDate,'2026-11-13');assert(!('sessionDrafts' in loaded));
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
