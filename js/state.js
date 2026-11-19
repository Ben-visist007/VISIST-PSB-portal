import {seed} from './data.js';
import {upgradeState} from './domain.js';
import {ensureGroupingData} from './grouping-data.js?v=20261119-grouping-data';
export const KEY='visist-demo-v1';
export let storageError='';
export let state;
try {
 const raw=localStorage.getItem(KEY);
 if(raw){
  try {state=ensureGroupingData(upgradeState(JSON.parse(raw)));if(JSON.stringify(state)!==raw)persist();}
  catch(error){try{localStorage.setItem(KEY+'-recovery',raw);}catch{}throw error;}
 }else {state=ensureGroupingData(seed());persist();}
}catch{state=ensureGroupingData(seed());storageError='Saved workspace data could not be read. Starting records have been loaded; the previous data was retained as a recovery copy where browser storage permits.';}
export function persist(){try{localStorage.setItem(KEY,JSON.stringify(state));return true;}catch{storageError='Browser storage is unavailable or full. Changes remain available for this session only.';return false;}}
export function activity(text,type='update',student=null){state.activities.unshift({text,date:state.demoDate,type,...(Array.isArray(student)?{students:student}:{student})});state.notificationsRead=false;persist();}
export function reset(){state=ensureGroupingData(seed());persist();}
