// Read-only data checks in an isolated browser. Does not create/reset records.
(async()=>{
 const $=s=>document.querySelector(s),all=s=>[...document.querySelectorAll(s)],results=[];
 const assert=(name,condition)=>{results.push({name,passed:!!condition});if(!condition)throw Error(name);};
 const pause=()=>new Promise(resolve=>setTimeout(resolve,30));
 const click=s=>{const el=$(s);if(!el)throw Error('Missing '+s);el.dispatchEvent(new MouseEvent('click',{bubbles:true}));};
 const set=(s,v)=>{const el=$(s);el.value=v;el.dispatchEvent(new Event('change',{bubbles:true}));};
 const close=async()=>{click('dialog [data-action="close-modal"]');await pause();};
 try{
  if($('dialog').open){$('dialog').close();await pause();}
  click('a[href="#dashboard"]');if($('[data-action="chart-clear"]'))click('[data-action="chart-clear"]');
  const saved=JSON.parse(localStorage.getItem('visist-demo-v1'));
  const scoped=saved.students.filter(s=>saved.role==='Management'||(saved.role==='Head Coach'?s.coach===1:s.venue==='Indiranagar'&&s.level==='Spark'));
  const ids=new Set(scoped.map(s=>s.id)),today=saved.demoDate;
  for(const range of ['7','30','90','all']){
   set('[data-filter="range"]',range);
   const start=range==='all'?'0000-01-01':new Date(Date.parse(today+'T00:00:00Z')-(+range-1)*86400000).toISOString().slice(0,10);
   const expected=saved.assessments.filter(a=>ids.has(a.student)&&!a.baseline&&a.outcome==='Passed'&&a.date>=start&&a.date<=today).length;
   const points=all('.progression-interactive .chart-point');
   const sum=points.reduce((n,p)=>n+Number(p.querySelector('.point-count').textContent),0);
   assert('Point totals match '+range+' reporting window',sum===expected);
  }
  const point=$('.progression-interactive .chart-point');point.focus();
  assert('Keyboard focus exposes period readout',$('#progression-readout').textContent.includes('passed assessment'));
  point.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));
  assert('Keyboard opens real period drilldown',$('dialog').open&&$('#modal-title').textContent==='Passed assessments');await close();
  click('[data-action="chart-outcome:Passed"]');
  assert('Outcome chart has independent pagination',!!$('.analytics-pagination'));
  if(!$('[data-action="analytics-next"]').disabled){click('[data-action="analytics-next"]');assert('Modal advances page without changing route',$('.analytics-pagination').textContent.includes('Page 2')&&location.hash==='#dashboard');}
  if($('dialog [data-action^="assessment-detail:"]')){click('dialog [data-action^="assessment-detail:"]');assert('Outcome opens assessment detail',!!$('[data-action="analytics-back"]'));click('[data-action="analytics-back"]');assert('Back restores outcome rows',!!$('.analytics-pagination'));}
  await close();
  click('.level-filter[data-action="chart-level:Scout"]');assert('Legend applies global level filter',$('[data-filter="level"]').value==='Scout');
  click('.level-filter[data-action="chart-level:Star"]');assert('Another level remains selectable',$('[data-filter="level"]').value==='Star');
  click('[data-action="chart-level:All levels"]');assert('Donut reset recovers all levels',$('[data-filter="level"]').value==='All levels');
  click('[data-action="chart-students"]');assert('Student drilldown matches scoped count',all('dialog tbody tr').length===scoped.length);await close();
  click('[data-action="chart-venue:Whitefield"]');assert('Venue bars apply workspace venue',$('[data-filter="venue"]').value==='Whitefield');
  click('[data-action="chart-venue:All venues"]');assert('Venue reset recovers all venues',$('[data-filter="venue"]').value==='All venues');
  click('a[href="#students"]');click('.progress-profile');assert('Roster progress opens progression',/^#students\/[^/]+\/progression$/.test(location.hash));
  click('a[href="#dashboard"]');set('[data-filter="range"]','90');
  assert('Analytics do not mutate stored records',JSON.stringify(JSON.parse(localStorage.getItem('visist-demo-v1')).assessments)===JSON.stringify(saved.assessments));
  return {passed:results.length,failed:0,results};
 }catch(error){return {passed:results.filter(r=>r.passed).length,error:error.message,results};}
})();
