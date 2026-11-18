import test from 'node:test';
import assert from 'node:assert/strict';
import {seed} from '../js/data.js';
import {upgradeState,recordAssessment,cycleOutcome} from '../js/domain.js';
import {defaultPlanner,validatePlannerSettings,scheduledDays,nextLevelDay,recommendations,workingLevel,ensureRoster,setRosterStudent,visibleRoster,createPlanCycle,deferStudent,dayPractice,failureStreak} from '../js/planner.js';

test('recurring schedule crosses month/year boundaries with exact nth weekdays',()=>{
 const s=defaultPlanner().settings;
 assert.deepEqual(scheduledDays(s,'2026-11-17',8).map(d=>[d.date,d.level]),[['2026-11-20','Star'],['2026-11-27','Champ'],['2026-12-04','Spark'],['2026-12-11','Scout'],['2026-12-18','Star'],['2026-12-25','Champ'],['2027-01-01','Spark'],['2027-01-08','Scout']]);
 assert.equal(nextLevelDay(s,'Spark','2028-02-04'),'2028-03-03');
});
test('catch-up setting changes fifth-Friday calendar and collisions are rejected',()=>{
 const s=defaultPlanner().settings;assert(scheduledDays(s,'2026-10-29',2).some(d=>d.kind==='catchup'&&d.date==='2026-10-30'));s.fifth='off';assert(!scheduledDays(s,'2026-10-29',2).some(d=>d.kind==='catchup'));
 s.days.Scout={...s.days.Spark};assert.throws(()=>validatePlannerSettings(s),/share a day/);
});
test('custom weekdays produce matching monthly dates',()=>{
 const s=defaultPlanner().settings;s.days.Spark={week:1,dow:1};assert.equal(nextLevelDay(s,'Spark','2026-11-01'),'2026-11-02');assert.equal(nextLevelDay(s,'Spark','2026-11-02'),'2026-12-07');
});
test('recommendations use earliest incomplete column and show stretch gaps and repeated failures',()=>{
 const s=seed(),a=s.students[0];a.level='Champ';assert.equal(workingLevel(s,a),'Spark');
 const rec=recommendations(s,[a],'Spark',s.demoDate).rec[0];assert.deepEqual(rec.missing.map(k=>k.id),[3,4]);assert(rec.attention);assert.equal(failureStreak(s,a.id,3),2);
 assert.equal(recommendations(s,[a],'Scout',s.demoDate).stretch.length,1);
 a.badges=Array.from({length:16},(_,i)=>i+1);assert.equal(workingLevel(s,a),null);assert.equal(recommendations(s,[a],'Spark',s.demoDate).rec.length,0);
});
test('recommendations exclude future enrolments and never include unprovided students',()=>{
 const s=seed();s.students[0].joined='2027-01-01';assert.equal(recommendations(s,s.students.slice(0,1),'Spark','2026-12-04').rec.length,0);
 const rows=recommendations(s,s.students.slice(1,2),'Spark','2026-12-04').rec;assert.deepEqual(rows.map(r=>r.student.id),['VS002']);
});
test('auto rosters retain empty removals while initializing newly visible scopes',()=>{
 const s=seed();s.planner.settings.mode='auto';const date='2026-12-04',a=s.students[0],b=s.students[1];let r=ensureRoster(s,date,'Spark',[a]);assert.deepEqual(r.students,[a.id]);setRosterStudent(s,date,'Spark',[a],a.id,false);assert.deepEqual(ensureRoster(s,date,'Spark',[a]).students,[]);
 r=ensureRoster(s,date,'Spark',[a,b]);assert.deepEqual(r.students,[b.id]);const loaded=upgradeState(JSON.parse(JSON.stringify(s)));assert.deepEqual(ensureRoster(loaded,date,'Spark',[a,b]).students,[b.id]);
});
test('roster mutations and fixed-date assignments stay inside provided scope',()=>{
 const s=seed(),a=s.students[0],b=s.students[1],date='2026-12-04';assert.throws(()=>setRosterStudent(s,date,'Spark',[a],b.id,true));setRosterStudent(s,date,'Spark',[a,b],a.id,true);setRosterStudent(s,date,'Spark',[a,b],b.id,true);const r=ensureRoster(s,date,'Spark',[a]);assert.deepEqual(visibleRoster(s,r,[a]),[a.id]);const c=createPlanCycle(s,date,'Spark',[a]);assert.deepEqual(c.assignments,[{student:a.id,skills:[1,2,3,4]}]);assert.equal(createPlanCycle(s,date,'Spark',[a,b]).id,c.id);assert.equal(c.assignments.length,2);setRosterStudent(s,date,'Spark',[a],a.id,false);assert(!c.assignments.some(x=>x.student===a.id));assert(c.assignments.some(x=>x.student===b.id));
});
test('deferral preserves recorded evidence and removes unfinished source modules',()=>{
 const s=seed(),a=s.students[0],date=s.demoDate;setRosterStudent(s,date,'Scout',[a],a.id,true);const c=createPlanCycle(s,date,'Scout',[a]);const result=recordAssessment(s,{student:a.id,skill:5,date,answers:[true,true,true,true,false],remarks:'Good control',coach:1,cycleId:c.id,baseline:false});
 const next=deferStudent(s,date,'Scout',[a],a.id);assert.equal(next,'2026-12-11');assert.deepEqual(c.assignments[0].skills,[5]);assert.equal(cycleOutcome(s,c,a.id,5).id,result.id);assert.deepEqual(visibleRoster(s,ensureRoster(s,date,'Scout',[a]),[a]),[]);assert(ensureRoster(s,next,'Scout',[a]).students.includes(a.id));assert.equal(a.level,'Spark');
});
test('deferral into an existing target cycle assigns the student and rejects outsiders',()=>{
 const s=seed(),[a,b]=s.students,date='2026-11-13';setRosterStudent(s,'2026-12-11','Scout',[a,b],b.id,true);const target=createPlanCycle(s,'2026-12-11','Scout',[a,b]);setRosterStudent(s,date,'Scout',[a,b],a.id,true);assert.throws(()=>deferStudent(s,date,'Scout',[b],a.id));deferStudent(s,date,'Scout',[a,b],a.id);assert(target.assignments.some(x=>x.student===a.id));
});
test('day plan uses only canonical Present marks in chosen date and session',()=>{
 const s=seed(),date=s.demoDate,session='Evening';s.attendance=[{student:'VS001',date,session,status:'Present'},{student:'VS002',date,session,status:'Absent'},{student:'VS003',date,session,status:'Excused'},{student:'VS004',date,session:'Morning',status:'Present'}];
 const p=dayPractice(s,s.students.slice(0,4),date,session);assert.deepEqual(p.present.map(s=>s.id),['VS001']);assert.equal(p.unmarked.length,1);assert.equal(p.excluded,2);assert.equal(p.groups[0].focus[0].skill.id,3);assert.equal(p.groups[0].focus[0].attention,1);
});
test('migration defaults invalid settings and preserves existing custom records and rosters',()=>{
 const s=seed();delete s.planner;const before=JSON.stringify(s.assessments);upgradeState(s);assert.equal(s.planner.settings.notice,15);assert.equal(JSON.stringify(s.assessments),before);setRosterStudent(s,'2026-12-04','Spark',s.students,'VS001',true);s.planner.settings.notice=100;const loaded=upgradeState(s);assert.equal(loaded.planner.settings.notice,15);assert.deepEqual(loaded.planner.rosters['2026-12-04|Spark'].students,['VS001']);assert.equal(JSON.stringify(upgradeState(loaded)),JSON.stringify(loaded));
});


test('later scopes can auto-populate an assigned cycle without readding removals',()=>{
 const s=seed(),[a,b]=s.students,date='2026-12-04';s.planner.settings.mode='auto';ensureRoster(s,date,'Spark',[a]);const c=createPlanCycle(s,date,'Spark',[a]);setRosterStudent(s,date,'Spark',[a],a.id,false);ensureRoster(s,date,'Spark',[a,b]);assert.deepEqual(c.assignments.map(x=>x.student),[b.id]);assert.deepEqual(s.planner.rosters[date+'|Spark'].students,[b.id]);
});
test('recorded pupils cannot be removed while unrecorded assignments remain editable',()=>{
 const s=seed(),[a,b]=s.students,date=s.demoDate;setRosterStudent(s,date,'Scout',[a,b],a.id,true);const c=createPlanCycle(s,date,'Scout',[a,b]);recordAssessment(s,{student:a.id,skill:5,date,answers:[true,true,true,true,false],remarks:'Recorded evidence',coach:1,cycleId:c.id,baseline:false});assert.throws(()=>setRosterStudent(s,date,'Scout',[a,b],a.id,false),/recorded results/);setRosterStudent(s,date,'Scout',[a,b],b.id,true);assert(c.assignments.some(x=>x.student===b.id));setRosterStudent(s,date,'Scout',[a,b],b.id,false);assert(!c.assignments.some(x=>x.student===b.id));assert(c.assignments.some(x=>x.student===a.id));
});
