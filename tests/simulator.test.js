import test from 'node:test';
import assert from 'node:assert/strict';
import {seed} from '../js/data.js';
import {createSimulation,simulateClearance} from '../js/simulator.js';
import {visibleStudents} from '../js/operations.js';

const input=(s,extra={})=>({student:s.students[0].id,level:'Spark',date:s.demoDate,status:'CLEARED',...extra});
test('simulation scenarios are detached and preserve official identities',()=>{
 const source=seed(),before=structuredClone(source),copy=createSimulation(source);
 copy.students[0].name='Changed in simulation';assert.deepEqual(source,before);
 assert.deepEqual(copy.skills.map(k=>k.id),Array.from({length:16},(_,i)=>i+1));assert.deepEqual(copy.assessments,source.assessments);
 const dry=createSimulation(source,'dry');assert.equal(dry.students.length,4);assert(dry.students.every(s=>s.level==='Spark'&&!s.badges.length));assert.equal(dry.assessments.length,0);assert.equal(dry.cycles.length,0);assert.deepEqual(source,before);
});
test('dry-run scenarios stay within the current coach scope, including empty assignments',()=>{
 const source=seed();source.role='Assistant Coach';const ids=new Set(visibleStudents(source).map(s=>s.id)),copy=createSimulation(source,'dry');assert(copy.students.every(s=>ids.has(s.id)));assert(copy.students.length<=4);
 source.students.forEach(s=>s.assistantCoaches=[]);assert.equal(createSimulation(source,'dry').students.length,0);
});
test('simulation clears award once, retain failed evidence and preserve earned badges',()=>{
 const source=seed(),copy=createSimulation(source,'dry'),before=structuredClone(source);
 const result=simulateClearance(copy,input(copy));assert.equal(result.newBadgeIds.length,4);assert.equal(copy.students[0].level,'Scout');
 assert.equal(simulateClearance(copy,input(copy)).newBadgeIds.length,0);
 assert.equal(simulateClearance(copy,input(copy,{status:'NOT_CLEARED'})).newBadgeIds.length,0);
 assert.equal(copy.students[0].badges.length,4);assert.equal(copy.students[0].level,'Scout');assert.equal(copy.clearanceResults.length,3);assert.deepEqual(source,before);
});
test('simulated advanced collections do not skip foundation requirements',()=>{
 const copy=createSimulation(seed(),'dry');simulateClearance(copy,input(copy,{level:'Star'}));assert.equal(copy.students[0].level,'Spark');assert.deepEqual(copy.students[0].badges,[9,10,11,12]);
 for(const level of ['Spark','Scout','Champ'])simulateClearance(copy,input(copy,{level}));assert.equal(copy.students[0].badges.length,16);assert.equal(copy.students[0].level,'Champ');
});
test('invalid simulated events are atomic and cannot bypass scope, dates or badge mappings',()=>{
 const copy=createSimulation(seed(),'dry');
 for(const overrides of [{student:'missing'},{status:'READY'},{date:'2026-02-30'},{date:'2020-01-01'},{badgeIds:[]},{badgeIds:[16]},{badgeIds:[1,1]}]){const before=structuredClone(copy);assert.throws(()=>simulateClearance(copy,input(copy,overrides)));assert.deepEqual(copy,before);}
 assert.throws(()=>simulateClearance(seed(),{}),/simulation workspace/);
 const assistant=createSimulation(seed());assistant.role='Assistant Coach';const allowed=visibleStudents(assistant),hidden=assistant.students.find(s=>!allowed.some(v=>v.id===s.id));assert.throws(()=>simulateClearance(assistant,input(assistant,{student:hidden.id})),/assigned/);
});
test('future events advance only the simulated workspace date',()=>{
 const source=seed(),copy=createSimulation(source,'dry'),date=source.demoDate;
 simulateClearance(copy,input(copy,{date:'2026-12-25'}));assert.equal(copy.demoDate,'2026-12-25');assert.equal(source.demoDate,date);
});
test('browser state persistence excludes every simulation mutation and restores the original object',async()=>{
 const entries=new Map();globalThis.localStorage={getItem:key=>entries.get(key)||null,setItem:(key,value)=>entries.set(key,value)};
 const module=await import('../js/state.js');const original=module.state,raw=entries.get(module.KEY);
 module.beginSimulation('dry');simulateClearance(module.state,input(module.state));module.activity('Simulation event','assessment',module.state.students[0].id);module.state.role='Head Coach';module.persist();
 assert.equal(entries.get(module.KEY),raw);assert.equal(module.state.simulationEvents.length,1);assert.equal(module.simulationActive,true);
 module.reset();assert.equal(entries.get(module.KEY),raw);module.endSimulation();assert.equal(module.state,original);assert.equal(module.simulationActive,false);assert.equal(JSON.stringify(module.state),raw);
});
