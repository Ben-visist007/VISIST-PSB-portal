import {createSimulation} from './simulator.js';
import {seed} from './data.js';
import {upgradeState} from './domain.js';
import {ensureGroupingData} from './grouping-data.js?v=20261119-grouping-data';
export const KEY='visist-demo-v1';
export let storageError='';
export let simulationActive=false;
let academyState=null;
export let state;
try {
 const raw=localStorage.getItem(KEY);
 if(raw){
  try {state=ensureGroupingData(upgradeState(JSON.parse(raw)));if(JSON.stringify(state)!==raw)persist();}
  catch(error){try{localStorage.setItem(KEY+'-recovery',raw);}catch{}throw error;}
 }else {state=simulationActive?createSimulation(academyState):ensureGroupingData(seed());persist();}
}catch{state=ensureGroupingData(seed());storageError='Saved workspace data could not be read. Starting records have been loaded; the previous data was retained as a recovery copy where browser storage permits.';}
export function persist(){if(simulationActive)return true;try{localStorage.setItem(KEY,JSON.stringify(state));return true;}catch{storageError='Browser storage is unavailable or full. Changes remain available for this session only.';return false;}}
export function activity(text,type='update',student=null){const entry={text,date:state.demoDate,type,...(Array.isArray(student)?{students:student}:{student})};state.activities.unshift(entry);if(simulationActive)state.simulationEvents.unshift(structuredClone(entry));state.notificationsRead=false;persist();}
export function reset(){state=simulationActive?createSimulation(academyState):ensureGroupingData(seed());persist();}

export function beginSimulation(scenario='academy'){const source=simulationActive?academyState:state;const next=createSimulation(source,scenario);academyState=source;state=next;simulationActive=true;return state;}
export function endSimulation(){if(simulationActive){state=academyState;academyState=null;simulationActive=false;}return state;}
