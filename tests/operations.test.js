import {recordAssessmentClearance} from '../js/progression.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {seed} from '../js/data.js';
import {upgradeState} from '../js/domain.js';
import {activeCoach,visibleStudents,coachStudents,allowedSkills,canAccessSkill,addCoach,assignStudent,librarySkills,saveLibrarySkill,saveCurriculum,saveBatch,createAssessment,addToAssessment,recordFitness,rescheduleStudent} from '../js/operations.js';

const assessment=(s,extra={})=>createAssessment(s,{name:'Friday group',date:s.demoDate,level:'Spark',studentIds:['VS001'],...extra});
// Historical fixture, not a supported new-result entry point.
const score=(s,c,skill=3)=>{if(!c.assignments.some(a=>a.student==='VS001'&&a.skills.includes(skill))||c.rescheduled?.VS001)throw Error('not assigned');const k=s.skills.find(k=>k.id===skill),r={id:crypto.randomUUID(),student:'VS001',skill,date:c.date,answers:[true,true,true,true,false],criteria:[...k.criteria],skillName:k.name,threshold:4,outcome:'Passed',remarks:'Historical evidence',cycleId:c.id,baseline:false,coach:1};s.assessments.push(r);if(!s.students[0].badges.includes(skill))s.students[0].badges.push(skill);return r;};

test('legacy migration preserves progression while retiring optional or malformed register records',()=>{
 const s=seed(),before={students:structuredClone(s.students),assessments:structuredClone(s.assessments),cycles:structuredClone(s.cycles),fitness:structuredClone(s.fitness)};
 s.attendance={invalid:'legacy'};s.sessionDrafts='retired';s.activities.push({type:'attendance',text:'Old register event'});
 const migrated=upgradeState(s);for(const key of Object.keys(before))assert.deepEqual(migrated[key],before[key]);
 assert(!('attendance' in migrated));assert(!('sessionDrafts' in migrated));assert(!migrated.activities.some(a=>a.type==='attendance'));
 assert.deepEqual(upgradeState(structuredClone(migrated)),migrated);
});

test('head coaches see their venues and assistants see explicit assignments across venues',()=>{
 const s=seed(),coach=s.coaches.find(c=>c.id===1);coach.venues=['Indiranagar','Whitefield'];s.role='Head Coach';
 assert.deepEqual(new Set(visibleStudents(s).map(x=>x.venue)),new Set(['Indiranagar','Whitefield']));
 s.role='Management';addCoach(s,{id:4,name:'Ananya Das',role:'Assistant Coach',venues:['Indiranagar','Whitefield']});
 assignStudent(s,'VS002',{coachId:2,assistantIds:[4],venue:'Whitefield'});
 s.role='Assistant Coach';assert.equal(activeCoach(s).id,4);assert(visibleStudents(s).some(x=>x.id==='VS002'));
 assert(!visibleStudents(s).some(x=>x.id==='VS005'));assert.equal(coachStudents(s,s.coaches.find(c=>c.id===4)).length,3);
});

test('assistant privacy predicates and recording reject unrelated curriculum even in a group',()=>{
 const s=seed(),c=assessment(s,{level:'Champ'});s.role='Assistant Coach';
 assert.deepEqual(new Set(allowedSkills(s).map(k=>k.level)),new Set(['Spark']));assert(!canAccessSkill(s,16));
 const count=s.assessments.length;assert.throws(()=>recordAssessmentClearance(s,{assessmentId:c.id,student:'VS002',date:c.date,status:'CLEARED'}),/participant/);assert.equal(s.assessments.length,count);
 assert.throws(()=>addCoach(s,{name:'New coach',role:'Assistant Coach',venues:['Indiranagar']}),/Only management/);
});

test('head coach mutations cannot move students or new coaches outside authorized venues',()=>{
 const s=seed();s.role='Head Coach';const before=structuredClone(s.students[0]),count=s.coaches.length;
 assert.throws(()=>assignStudent(s,'VS001',{coachId:2,venue:'Whitefield',assistantIds:[]}),/destination venue/);
 assert.deepEqual(s.students[0],before);assert.throws(()=>addCoach(s,{name:'Outside coach',role:'Head Coach',venues:['Whitefield']}),/venues managed/);assert.equal(s.coaches.length,count);
});

test('coach creation and reassignment persist and venue removal protects assigned pupils',()=>{
 const s=seed(),coach=addCoach(s,{name:'Priya Iyer',role:'Assistant Coach',venues:['Indiranagar','Whitefield']});
 assignStudent(s,'VS001',{coachId:1,assistantIds:[coach.id]});assert.throws(()=>addCoach(s,{id:coach.id,name:coach.name,role:coach.role,venues:['Whitefield']}),/Reassign/);
 assert.throws(()=>addCoach(s,{name:'priya iyer',role:'Head Coach',venues:['JP Nagar']}),/already in use/);
 const loaded=upgradeState(JSON.parse(JSON.stringify(s)));loaded.role='Assistant Coach';loaded.activeCoachIds['Assistant Coach']=coach.id;
 assert.deepEqual(visibleStudents(loaded).map(x=>x.id),['VS001']);
});

test('custom curricula and batches preserve the official badge map and reject invalid mappings',()=>{
 const s=seed(),badges=structuredClone(s.students.map(x=>x.badges)),skill=saveLibrarySkill(s,{name:'Recovery footwork',level:'Spark',description:'Recover to a balanced base.',instructions:'Demonstrate the recovery and repeat.',videoUrl:'assets/recovery.mp4'});
 const curriculum=saveCurriculum(s,{name:'Foundation practice',level:'Spark',libraryIds:['official-1',skill.id]});
 const batch=saveBatch(s,{name:'Friday foundations',curriculumId:curriculum.id,studentIds:['VS001','VS002']});
 assert.equal(s.skills.length,16);assert.deepEqual(s.students.map(x=>x.badges),badges);assert.equal(librarySkills(s).length,17);
 assert.deepEqual(batch.libraryIds,['official-1',skill.id]);assert.throws(()=>saveCurriculum(s,{name:'Bad mapping',level:'Scout',libraryIds:[skill.id]}));
 assert.throws(()=>saveLibrarySkill(s,{name:'Unsafe URL',level:'Spark',description:'Target',instructions:'Do this',videoUrl:'javascript:alert(1)'}));
 assert.throws(()=>saveCurriculum(s,{name:curriculum.name,level:'Spark',libraryIds:['official-1']}),/already in use/);
 saveCurriculum(s,{id:curriculum.id,name:'Updated foundation',level:'Spark',libraryIds:['official-1',skill.id]});
 const loaded=upgradeState(JSON.parse(JSON.stringify(s)));assert.equal(loaded.curricula[0].name,'Updated foundation');assert.equal(loaded.batches[0].id,batch.id);
});

test('batch edits cannot erase participants outside the head coach view',()=>{
 const s=seed(),c=saveCurriculum(s,{name:'Foundation',level:'Spark',libraryIds:['official-1']}),b=saveBatch(s,{name:'Multi venue',curriculumId:c.id,studentIds:['VS001','VS002']});
 s.role='Head Coach';assert.throws(()=>saveBatch(s,{id:b.id,name:b.name,curriculumId:c.id,studentIds:['VS001']}),/outside your venues/);assert.deepEqual(b.studentIds,['VS001','VS002']);
});

test('curriculum edits protect skill mappings already used by a batch',()=>{
 const s=seed(),c=saveCurriculum(s,{name:'Foundation',level:'Spark',libraryIds:['official-1','official-2']}),b=saveBatch(s,{name:'Racket control',curriculumId:c.id,studentIds:['VS001'],libraryIds:['official-1']});
 const before=structuredClone(c);
 assert.throws(()=>saveCurriculum(s,{id:c.id,name:c.name,level:'Spark',libraryIds:['official-2']}),/Update the assigned batches/);
 assert.throws(()=>saveCurriculum(s,{id:c.id,name:c.name,level:'Scout',libraryIds:['official-5']}),/Update the assigned batches/);
 assert.deepEqual(c,before);assert.deepEqual(b.libraryIds,['official-1']);
 // Removing an unused skill remains possible, as does expanding the curriculum.
 saveCurriculum(s,{id:c.id,name:'Updated foundation',level:'Spark',libraryIds:['official-1','official-3']});
 assert.deepEqual(c.libraryIds,['official-1','official-3']);assert.equal(b.curriculumId,c.id);
});

test('optional custom record migration skips malformed rows and preserves usable content and mappings',()=>{
 const s=seed(),skill=saveLibrarySkill(s,{name:'Recovery steps',level:'Spark',description:'Return to base.',instructions:'Practise controlled recovery.'}),c=saveCurriculum(s,{name:'Foundation',level:'Spark',libraryIds:['official-1',skill.id]}),b=saveBatch(s,{name:'Friday group',curriculumId:c.id,studentIds:['VS001']});
 const valid={skill:structuredClone(skill),curriculum:structuredClone(c),batch:structuredClone(b)};
 s.library.push(null,'bad',{id:'broken',name:{},level:'Spark'},{id:'empty',name:'Missing target',level:'Spark'},structuredClone(skill));
 s.library.unshift({id:skill.id,name:'Invalid duplicate',level:'Spark'});
 s.curricula.push(null,{id:'missing-skills',name:'Broken curriculum',level:'Spark'}, {id:'unknown-ref',name:'Unknown library',level:'Spark',libraryIds:['not-a-skill']});
 s.batches.push(null,{id:'missing-students',name:'Broken batch',curriculumId:c.id},{id:'missing-curriculum',name:'Broken mapping',curriculumId:'unknown',studentIds:['VS001']});
 const loaded=upgradeState(s);assert.deepEqual(loaded.library,[valid.skill]);assert.deepEqual(loaded.curricula,[valid.curriculum]);assert.deepEqual(loaded.batches,[valid.batch]);
 assert.doesNotThrow(()=>librarySkills(loaded).map(k=>k.name.toLowerCase()));assert.deepEqual(upgradeState(structuredClone(loaded)),loaded);
 const empty=seed();empty.library={bad:true};empty.curricula='broken';empty.batches=null;const normalized=upgradeState(empty);assert.deepEqual(normalized.library,[]);assert.deepEqual(normalized.curricula,[]);assert.deepEqual(normalized.batches,[]);
});

test('assessment creation validates scope, dates and group skills without partial changes',()=>{
 const s=seed();s.role='Assistant Coach';const before=s.cycles.length;
 for(const overrides of [{studentIds:['VS002']},{date:'2026-02-30'},{date:'2026-11-12'},{level:'Champ'},{studentIds:[]}])assert.throws(()=>assessment(s,overrides));
 assert.equal(s.cycles.length,before);const c=assessment(s);assert.deepEqual(c.assignments,[{student:'VS001',skills:[1,2,3,4],badgeIds:[1,2,3,4]}]);
 assert.throws(()=>assessment(s),/already scheduled/);
});

test('adding pupils to a group deduplicates and keeps other students and recorded evidence',()=>{
 const s=seed(),c=assessment(s);score(s,c);const original=s.assessments.at(-1);
 addToAssessment(s,c.id,'VS002');addToAssessment(s,c.id,'VS002');assert.equal(c.assignments.length,2);assert.deepEqual(c.assignments[1].skills,[1,2,3,4]);assert.equal(s.assessments.at(-1),original);
 s.students[2].joined='2027-01-01';assert.throws(()=>addToAssessment(s,c.id,'VS003'),/enrolled/);assert.equal(c.assignments.length,2);
 s.role='Assistant Coach';assert.throws(()=>addToAssessment(s,c.id,'VS005'),/assigned/);assert.equal(c.assignments.length,2);
});

test('linked fitness uses the scheduled step and never awards badges or promotes pupils',()=>{
 const s=seed(),c=assessment(s,{includeFitness:true}),before=structuredClone(s.students[0]),values=[5,10,40,3,15,20,300];
 const result=recordFitness(s,{student:'VS001',date:c.date,cycleId:c.id,values});assert.equal(result.cycleId,c.id);assert.deepEqual(s.students[0],before);
 const count=s.fitness.length;assert.throws(()=>recordFitness(s,{student:'VS002',date:c.date,cycleId:c.id,values}),/assigned assessment/);
 assert.throws(()=>recordFitness(s,{student:'VS001',date:c.date,cycleId:c.id,values:[-1,...values.slice(1)]}));assert.equal(s.fitness.length,count);
 const only=assessment(s,{name:'Onboarding fitness',level:null,skillIds:[],includeFitness:true});assert.equal(only.assignments[0].skills.length,0);
});

test('rescheduling moves unfinished steps into a regular assessment and retains source evidence',()=>{
 const s=seed(),source=assessment(s,{includeFitness:true});const result=score(s,source);
 const target=rescheduleStudent(s,source.id,'VS001','2026-11-20');assert.deepEqual(source.assignments[0].skills,[3]);assert.deepEqual(target.assignments[0].skills,[1,2,4]);assert(target.includeFitness);
 assert.equal(source.rescheduled.VS001.assessmentId,target.id);assert.equal(s.assessments.find(x=>x.id===result.id).cycleId,source.id);
 assert.throws(()=>addToAssessment(s,source.id,'VS001'),/later assessment/);
 assert.throws(()=>score(s,source),/not assigned/);assert.throws(()=>rescheduleStudent(s,source.id,'VS001','2026-11-27'));
 s.demoDate='2026-11-20';score(s,target,1);assert(s.students[0].badges.includes(1));assert.equal(s.students[0].level,'Spark');
});

test('rescheduling reuses a compatible scheduled group without touching its other members',()=>{
 const s=seed(),source=assessment(s),target=assessment(s,{name:'Next Friday',date:'2026-11-20',studentIds:['VS002']});
 assert.equal(rescheduleStudent(s,source.id,'VS001','2026-11-20').id,target.id);assert.deepEqual(target.assignments.map(a=>a.student),['VS002','VS001']);
});

test('empty retired assessment groups cannot receive new pupils without a meaningful step',()=>{
 const s=seed(),c={id:'empty',name:'Retired group',date:s.demoDate,assignments:[{student:'VS001',skills:[]}]};s.cycles.push(c);
 assert.throws(()=>addToAssessment(s,c.id,'VS002'),/no active skills/);assert.equal(c.assignments.length,1);
});
