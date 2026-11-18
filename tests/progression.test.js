import test from 'node:test';
import assert from 'node:assert/strict';
import {seed} from '../js/data.js';
import {createAssessment,recordFitness,canAccessSkill,rescheduleStudent} from '../js/operations.js';
import {recordAssessmentClearance,levelProgress,latestClearance} from '../js/progression.js';
import {upgradeState} from '../js/domain.js';
import {uniqueBadgeAwards} from '../js/analytics.js';
const group=(s,extra={})=>createAssessment(s,{name:'Spark clearance',date:s.demoDate,level:'Spark',studentIds:['VS001'],...extra});
const result=(s,c,extra={})=>recordAssessmentClearance(s,{assessmentId:c.id,student:'VS001',date:c.date,status:'CLEARED',...extra});

test('clearance awards all linked badges without a rubric and unlocks the next level',()=>{
 const s=seed(),c=group(s);s.settings.threshold=5;const r=result(s,c);
 assert.deepEqual(r.newBadgeIds,[3,4]);assert.equal(s.students[0].level,'Scout');assert.equal(r.previousLevel,'Spark');assert.equal(r.level,'Scout');assert.equal(s.clearanceResults.length,1);assert.equal(s.assessments.filter(a=>a.clearanceId===r.id).length,4);assert(!('answers'in r));assert(!('threshold'in r));assert.equal(s.levelEvents.length,1);
});
test('not cleared and operational completion cannot award badges',()=>{
 const s=seed(),c=group(s),before=[...s.students[0].badges];c.workflowState='ASSESSMENTS_COMPLETE';const r=result(s,c,{status:'NOT_CLEARED'});assert.deepEqual(s.students[0].badges,before);assert.deepEqual(r.newBadgeIds,[]);assert.equal(s.students[0].level,'Spark');
 for(const status of ['PENDING','ASSESSMENTS_COMPLETE','RECORDING_COMPLETE','REPORTS_GENERATED','Passed']){const snapshot=JSON.stringify(s);assert.throws(()=>result(s,c,{status}),/Cleared or Not cleared/);assert.equal(JSON.stringify(s),snapshot);}
});
test('an explicit badge mapping awards only linked badges and preserves names from the module snapshot',()=>{
 const s=seed(),c=group(s,{badgeIds:[3]});const name=s.skills[2].name;s.skills[2].name='Edited afterwards';const r=result(s,c);
 assert.deepEqual(r.newBadgeIds,[3]);assert.equal(r.badgeSnapshots[0].name,name);assert(!s.students[0].badges.includes(4));assert.equal(s.students[0].level,'Spark');
});
test('replayed source results are idempotent even after assistant curriculum access changes',()=>{
 const s=seed(),c=group(s);for(const player of s.students.filter(x=>x.id!=='VS001'))player.assistantCoaches=player.assistantCoaches.filter(id=>id!==4);s.role='Assistant Coach';assert(canAccessSkill(s,3));const r=result(s,c,{sourceResultId:'external-result-1'});assert.equal(s.students[0].level,'Scout');assert(!canAccessSkill(s,3));const snapshot=JSON.stringify(s);const replay=result(s,c,{sourceResultId:'external-result-1'});assert(replay.replayed);assert.equal(replay.id,r.id);assert.equal(JSON.stringify(s),snapshot);
});
test('late authoritative results can apply to the assigned participant without exposing curriculum standards',()=>{
 const s=seed(),c=group(s,{badgeIds:[16]});s.role='Assistant Coach';assert(!canAccessSkill(s,16));result(s,c);assert(s.students[0].badges.includes(16));assert.equal(s.students[0].level,'Spark');assert(!canAccessSkill(s,16));
});
test('result-reference collisions and badge injection reject without partial changes',()=>{
 const s=seed(),c=group(s,{studentIds:['VS001','VS002']});result(s,c,{sourceResultId:'unique-source'});
 for(const extra of [{student:'VS002',sourceResultId:'unique-source'},{sourceResultId:'unique-source',status:'NOT_CLEARED'},{badgeIds:[1,2,3,4,16]},{sourceResultId:'x'.repeat(201)}]){const before=JSON.stringify(s);assert.throws(()=>result(s,c,extra));assert.equal(JSON.stringify(s),before);}
});
test('scope, unknown participants, enrolment and future dates are validated before any mutation',()=>{
 const s=seed(),c=group(s);for(const extra of [{student:'unknown'},{assessmentId:'unknown'},{date:'2026-11-14'},{date:'2026-02-30'},{date:'2020-01-01'}]){const before=JSON.stringify(s);assert.throws(()=>result(s,c,extra));assert.equal(JSON.stringify(s),before);}
 s.role='Head Coach';s.activeCoachIds['Head Coach']=2;const before=JSON.stringify(s);assert.throws(()=>result(s,c),/participant/);assert.equal(JSON.stringify(s),before);
});
test('rescheduled old participation cannot award badges',()=>{
 const s=seed(),c=group(s);c.rescheduled={VS001:{date:'2026-11-20',assessmentId:'later'}};const before=JSON.stringify(s);assert.throws(()=>result(s,c),/rescheduled/);assert.equal(JSON.stringify(s),before);
});
test('ordered collections unlock Scout, Star and Champ with no fifth level or approval gate',()=>{
 const s=seed();s.students[0].badges=[];for(const [i,level]of ['Spark','Scout','Star','Champ'].entries()){const c=group(s,{name:level,level});result(s,c);assert.equal(s.students[0].level,['Scout','Star','Champ','Champ'][i]);}assert(levelProgress(s.students[0]).complete);assert.deepEqual(levelProgress(s.students[0]).unlocked,['Spark','Scout','Star','Champ']);assert.equal(s.levelEvents.length,3);
});
test('higher badges cannot skip missing foundation collections and migrated current levels never demote',()=>{
 const s=seed();s.students[0].badges=[];result(s,group(s,{level:'Champ'}));assert.equal(s.students[0].level,'Spark');result(s,group(s,{name:'Foundation',level:'Spark'}));assert.equal(s.students[0].level,'Scout');
 const old=seed();old.students[0].level='Champ';old.students[0].badges=[];const loaded=upgradeState(old);assert.equal(loaded.students[0].level,'Champ');result(loaded,group(loaded));assert.equal(loaded.students[0].level,'Champ');assert(!levelProgress(loaded.students[0]).complete);
});
test('a later not-cleared result preserves earned badges and level and source history',()=>{
 const s=seed(),c=group(s);result(s,c);const badges=[...s.students[0].badges];const r=result(s,c,{status:'NOT_CLEARED'});assert.deepEqual(s.students[0].badges,badges);assert.equal(s.students[0].level,'Scout');assert.equal(s.clearanceResults.length,2);assert.equal(latestClearance(s,c.id,'VS001').id,r.id);
});
test('repeated clearances never inflate badge analytics',()=>{
 const s=seed(),c=group(s),before=uniqueBadgeAwards(s.assessments).length;result(s,c);const r=result(s,c);assert.deepEqual(r.newBadgeIds,[]);assert.equal(uniqueBadgeAwards(s.assessments).length,before+2);assert.equal(new Set(s.students[0].badges).size,s.students[0].badges.length);
});
test('fitness measures are evidence only; explicit clearance mapping determines any award',()=>{
 const s=seed(),before=[...s.students[0].badges],c=group(s,{level:null,badgeIds:[],includeFitness:true});recordFitness(s,{student:'VS001',date:c.date,cycleId:c.id,values:[5,10,40,3,15,20,300]});assert.deepEqual(s.students[0].badges,before);const r=result(s,c);assert.deepEqual(r.newBadgeIds,[]);assert.deepEqual(s.students[0].badges,before);const total=uniqueBadgeAwards(s.assessments).length;
 result(s,group(s,{name:'Mapped fitness',level:null,badgeIds:[3],includeFitness:true}));assert(s.students[0].badges.includes(3));assert.equal(uniqueBadgeAwards(s.assessments).length,total+1);
});
test('legacy and new result history and all source references survive a saved-state round trip',()=>{
 const s=seed(),legacy=structuredClone(s.assessments);s.students[0].name='Custom saved player';const c=group(s),r=result(s,c,{sourceResultId:'portal-987',reportReference:'Report 123',notes:'Existing result received.'});const saved=JSON.parse(JSON.stringify(s)),loaded=upgradeState(saved);assert.deepEqual(loaded.assessments.slice(0,legacy.length),legacy);assert.equal(loaded.students[0].name,'Custom saved player');assert.equal(loaded.students[0].level,'Scout');assert.equal(loaded.clearanceResults[0].id,r.id);assert.equal(loaded.clearanceResults[0].sourceResultId,'portal-987');assert.deepEqual(upgradeState(structuredClone(loaded)),loaded);
});

test('rescheduling retains linked badge names across content edits, clearance and reload',()=>{
 const s=seed(),source=group(s,{badgeIds:[3,4]}),name=source.moduleSnapshot.badges.find(k=>k.id===3).name;
 const target=rescheduleStudent(s,source.id,'VS001','2026-11-20');
 assert.equal(target.moduleSnapshot.badges.find(k=>k.id===3).name,name);
 s.skills[2].name='Edited after rescheduling';
 const loaded=upgradeState(JSON.parse(JSON.stringify(s))),savedTarget=loaded.cycles.find(c=>c.id===target.id);loaded.demoDate=savedTarget.date;
 const received=result(loaded,savedTarget,{sourceResultId:'rescheduled-source-result'});
 assert.equal(received.badgeSnapshots.find(k=>k.id===3).name,name);
 assert.equal(received.moduleSnapshot.badges.find(k=>k.id===3).name,name);
 const final=upgradeState(JSON.parse(JSON.stringify(loaded)));assert.equal(final.clearanceResults.at(-1).badgeSnapshots.find(k=>k.id===3).name,name);
});
