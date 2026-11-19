// Read-only fixture validation in an isolated browser; filters and roles are changed.
(()=>{
 const $=s=>document.querySelector(s),all=s=>[...document.querySelectorAll(s)],read=()=>JSON.parse(localStorage.getItem('visist-demo-v1')),results=[];
 const assert=(name,ok)=>{results.push({name,passed:!!ok});if(!ok)throw Error(name);};
 const set=(s,v)=>{const e=$(s);if(!e)throw Error('Missing '+s);e.value=v;e.dispatchEvent(new Event('change',{bubbles:true}));};
 const click=s=>{const e=$(s);if(!e)throw Error('Missing '+s);e.click();};
 try{
  $('dialog')?.close();set('#role-switch','Management');click('a[href="#dashboard"]');
  let s=read();assert('Expanded data is available without resetting the workspace',s.students.length===56&&s.groupingData.studentIds.length===36);
  assert('Existing records remain alongside the new clearance evidence',s.students.some(p=>p.id==='VS001')&&s.assessments.filter(a=>a.type!=='clearance').length===158&&s.clearanceResults.length===48);
  assert('Each example batch is available in the dashboard filter',s.groupingData.batchIds.every(id=>!!$('[data-filter="batch"] option[value="'+id+'"]')));
  for(const venue of ['Indiranagar','Whitefield','JP Nagar']){
   const batch=s.batches.find(b=>b.name===venue+' Mixed Coaching');set('[data-filter="batch"]',batch.id);
   assert(venue+' batch shows 12 learners and six teaching groups',$('.teaching-summary').textContent.includes('12 students in view')&&$('.teaching-summary').textContent.includes('6 teaching groups'));
   assert(venue+' preview covers all four working collections',new Set(all('.teaching-card').map(e=>s.skills.find(k=>k.id===+e.dataset.teachingSkill).level)).size===4);
   if($('[data-action="teaching-expand"]')?.getAttribute('aria-expanded')==='false')click('[data-action="teaching-expand"]');
   const ids=[];
   for(const card of all('.teaching-card')){
    card.querySelector('[data-action^="teaching-group:"]').click();
    ids.push(...all('dialog [data-action^="profile:"]').map(e=>e.dataset.action.split(':')[1]));click('dialog [data-action="close-modal"]');
   }
   assert(venue+' full rosters contain 11 unique learners in their own venue',ids.length===11&&new Set(ids).size===11&&ids.every(id=>batch.studentIds.includes(id)&&s.students.find(p=>p.id===id).venue===venue));
   assert(venue+' completed learner remains in continued practice',!!$('.teaching-complete')&&$('.teaching-complete').textContent.includes('One player'));
  }
  const continued=s.batches.find(b=>b.name==='Continued Practice');set('[data-filter="batch"]',continued.id);
  assert('Continued-practice batch shows three graduates and no missing-skill groups',all('.teaching-card').length===0&&$('.teaching-complete').textContent.includes('3 players'));
  const mixed=s.batches.find(b=>b.name==='Academy Mixed Coaching');set('[data-filter="batch"]',mixed.id);
  assert('Academy batch offers a larger 36-player grouping check',$('.teaching-summary').textContent.includes('36 students in view')&&$('.teaching-summary').textContent.includes('18 teaching groups'));
  set('#role-switch','Assistant Coach');s=read();const coach=s.coaches.find(c=>c.id===s.activeCoachIds['Assistant Coach']);
  assert('Assistant has mixed assigned learners without crossing venue scope',s.students.filter(p=>p.dataPack==='grouping-v1'&&p.assistantCoaches.includes(coach.id)).length===12&&all('.teaching-card').every(e=>coach.venues.includes(e.dataset.teachingVenue)));
  assert('Larger datasets do not overflow the page',document.documentElement.scrollWidth<=innerWidth);
  return {passed:results.length,failed:0,results};
 }catch(error){return {passed:results.filter(r=>r.passed).length,failed:results.filter(r=>!r.passed),error:error.message,results};}
})();
