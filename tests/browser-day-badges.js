// Isolated source workspace: verify day-plan grouping follows badges rather than levels.
(async()=>{
 const $=s=>document.querySelector(s),all=s=>[...document.querySelectorAll(s)],results=[];
 const assert=(name,ok)=>{results.push({name,passed:!!ok});if(!ok)throw Error(name);},click=s=>{const e=$(s);if(!e)throw Error('Missing '+s);e.click();},set=(s,v)=>{const e=$(s);e.value=v;e.dispatchEvent(new Event('change',{bubbles:true}));},members=()=>all('[data-day-student]').map(e=>e.dataset.dayStudent),close=()=>click('#modal [data-act="closeRes"]');
 try{
  click('#simBtn');click('#sim [data-act="stab"][data-t="rules"]');click('#sim [data-act="scenario"][data-s="dry"]');click('#sim [data-act="stab"][data-t="run"]');set('#simLvl','star');click('#sim [data-act="allpass"]');click('#sim [data-act="submitSim"]');close();click('#sim [data-act="stab"][data-t="rules"]');click('[name="lr"][value="count"]');click('#sim [data-act="closeSim"]');click('#nav [data-v="dayplan"]');
  assert('Different displayed levels share the same missing Grip badge',ev(S('d0')).level!==ev(S('d1')).level&&all('.day-badge-group').length===1&&$('.day-badge-group').dataset.dayBadge==='grip'&&members().length===4);
  assert('Groups are labelled by badge rather than level',!!$('.day-badge-group h2')&&$('.day-badge-group h2').textContent==='Grip Scout'&&!$('#main').textContent.includes('Spark group')&&!$('#main').textContent.includes('Star group'));
  assert('Badge focus includes teaching standard and original badge artwork',$('.day-badge-standard').textContent.includes('Perfect grip')&&$('.day-badge-art img').src.includes('01-grip.png'));
  assert('Player levels are context inside the same group',all('.day-badge-group .kid small').some(e=>e.textContent==='Scout')&&all('.day-badge-group .kid small').some(e=>e.textContent==='Spark'));
  click('[data-act="absent"][data-id="d1"]');assert('Absent learner is excluded from badge teaching groups',members().length===3&&!members().includes('d1'));click('[data-act="absent"][data-id="d1"]');assert('Restored learner rejoins the shared badge group',members().length===4);
  click('[data-day-student="d0"]');assert('Group player opens the existing profile',!$('#modal').hidden&&$('#modal h2').textContent==='Aarav Kumar');click('#modal [data-act="close"]');
  const initial=members().join(',');click('#simBtn');click('#sim [data-act="stab"][data-t="rules"]');click('[name="lr"][value="tier"]');click('#sim [data-act="closeSim"]');assert('Level-rule changes do not rebucket unchanged badge gaps',members().join(',')===initial&&$('.day-badge-group').dataset.dayBadge==='grip');
  click('#simBtn');click('#sim [data-act="stab"][data-t="run"]');set('#simLvl','spark');click('#sim [data-act="allpass"]');click('#sim [data-act="submitSim"]');close();click('#sim [data-act="closeSim"]');assert('Earned badges move the learner to their next missing badge group',all('.day-badge-group').length===2&&$('[data-day-badge="gripchange"] [data-day-student="d0"]')&&!$('[data-day-badge="grip"] [data-day-student="d0"]'));
  assert('Each learner appears exactly once across the primary groups',members().length===4&&new Set(members()).size===4);
  for(const level of ['scout','champ']){click('#simBtn');set('#simLvl',level);click('#sim [data-act="allpass"]');click('#sim [data-act="submitSim"]');close();click('#sim [data-act="closeSim"]');}
  assert('All-badge learners remain visible for continued practice',!!$('.day-badge-complete')&&$('.day-badge-complete').textContent.includes('Aarav Kumar')&&!members().includes('d0'));
  click('#acctBtn');click('#acctMenu [data-id="c2"]');click('#nav [data-v="dayplan"]');assert('A coach with no assigned learners has no invented badge groups',all('.day-badge-group').length===0&&$('#main').textContent.includes('Nobody marked present.'));
  return {passed:results.length,failed:0,results};
 }catch(error){return {passed:results.filter(r=>r.passed).length,failed:1,error:error.message,results};}
})();
