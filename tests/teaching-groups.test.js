import test from 'node:test';
import assert from 'node:assert/strict';
import {seed} from '../js/data.js';
import {teachingGroups,teachingGroupPreview} from '../js/planner.js';
const date='2026-11-13';
const player=(id,badges=[],extra={})=>({id,name:id,joined:'2026-01-01',venue:'Indiranagar',level:'Spark',badges,...extra});
const workspace=()=>({...seed(),assessments:[]});

test('shared gaps group students together instead of splitting their different individual gaps',()=>{
 const s=workspace(),kids=[player('Arjun',[1,2,6]),player('Ananya',[1,2,3],{level:'Champ'})];
 const before=structuredClone(kids),plan=teachingGroups(s,kids,date);
 assert.equal(plan.groups.length,1);assert.deepEqual(plan.groups[0].students.map(s=>s.id),['Ananya','Arjun']);assert.equal(plan.groups[0].skill.id,4);assert.equal(plan.groups[0].level,'Spark');
 assert.deepEqual(kids,before);assert.equal(kids[1].level,'Champ');
});

test('primary teaching groups are disjoint even when a student is missing several skills',()=>{
 const s=workspace(),kids=[player('A'),player('B',[1]),player('C',[1,2,3,4]),player('D',[1,2,3,4,6])];
 const plan=teachingGroups(s,[...kids,kids[0]],date),ids=plan.groups.flatMap(g=>g.students.map(s=>s.id));
 assert.equal(plan.students.length,4);assert.equal(ids.length,4);assert.equal(new Set(ids).size,4);
 assert.equal(plan.groups.find(g=>g.students.some(s=>s.id==='C')).skill.id,5);
 assert.equal(plan.groups.find(g=>g.students.some(s=>s.id==='D')).skill.id,5);
});

test('the same skill at different physical venues creates separate teaching groups',()=>{
 const s=workspace(),plan=teachingGroups(s,[player('A'),player('B',[],{venue:'Whitefield'})],date);
 assert.equal(plan.groups.length,2);assert.equal(new Set(plan.groups.map(g=>g.id)).size,2);
 assert(plan.groups.every(g=>new Set(g.students.map(s=>s.venue)).size===1));
});

test('future enrolments are excluded and complete students remain in continued practice',()=>{
 const s=workspace(),all=Array.from({length:16},(_,i)=>i+1),kids=[player('Future',[],{joined:'2026-11-14'}),player('Complete',all,{level:'Champ'}),player('Today',[],{joined:date})];
 const plan=teachingGroups(s,kids,date);
 assert.deepEqual(plan.complete.map(s=>s.id),['Complete']);assert.deepEqual(plan.groups.flatMap(g=>g.students.map(s=>s.id)),['Today']);assert.equal(plan.students.length,2);
 assert.deepEqual(teachingGroups(s,[],date),{students:[],groups:[],complete:[]});
});

test('priorities prefer common gaps, then support needs, then a stable curriculum and venue order',()=>{
 const s=workspace(),kids=[player('A'),player('B'),player('G'),player('C',[1,2,3],{venue:'Whitefield'}),player('F',[1],{venue:'Whitefield'}),player('D',[1],{venue:'JP Nagar'}),player('E',[1,2],{venue:'JP Nagar'})];
 s.assessments=[1,2].map(i=>({student:'C',skill:4,date,outcome:'Needs Practice',baseline:false,id:String(i)}));
 const plan=teachingGroups(s,kids,date);
 assert.equal(plan.groups[0].skill.id,1);assert.equal(plan.groups[0].students.length,3);assert.equal(plan.groups[1].skill.id,4);assert.equal(plan.groups[1].attention,1);assert.equal(plan.groups[2].skill.id,3);
 assert.deepEqual(teachingGroups(s,kids.slice().reverse(),date).groups.map(g=>[g.id,g.students.map(s=>s.id)]),plan.groups.map(g=>[g.id,g.students.map(s=>s.id)]));
 s.assessments=[];assert.deepEqual(teachingGroups(s,kids,date).groups.map(g=>g.skill.id),[1,3,4]);
});

test('new students receive foundation guidance without being classified as failures',()=>{
 const s=workspace(),plan=teachingGroups(s,[player('New')],date);
 assert.equal(plan.groups[0].skill.id,1);assert.equal(plan.groups[0].attention,0);assert(plan.groups[0].skill.instructions);assert.equal('attendance' in s,false);
});

test('provided student scope determines all roster names and counts without hidden students',()=>{
 const s=workspace(),kids=[player('Visible'),player('Hidden')];
 const plan=teachingGroups(s,kids.filter(s=>s.id==='Visible'),date);
 assert.deepEqual(plan.students.map(s=>s.id),['Visible']);assert.deepEqual(plan.groups.flatMap(g=>g.students.map(s=>s.id)),['Visible']);
});


test('the dashboard preview represents mixed collections without changing full group priority',()=>{
 const groups=[{id:'s1',level:'Spark'},{id:'s2',level:'Spark'},{id:'s3',level:'Spark'},{id:'sc1',level:'Scout'},{id:'st1',level:'Star'},{id:'c1',level:'Champ'}];
 const before=structuredClone(groups),preview=teachingGroupPreview(groups);
 assert.deepEqual(preview.map(g=>g.id),['s1','sc1','st1','c1']);assert.deepEqual(groups,before);
 assert.deepEqual(teachingGroupPreview(groups.slice(0,3)).map(g=>g.id),['s1','s2','s3']);
 assert.deepEqual(teachingGroupPreview([]),[]);
});
