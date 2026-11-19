// Run at desktop, tablet and mobile viewport sizes in an isolated browser.
(async()=>{
 const $=s=>document.querySelector(s),results=[];
 const assert=(name,ok)=>{results.push({name,passed:!!ok});if(!ok)throw Error(name);},nav=async path=>{location.hash='#'+path;await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));};
 try{
  $('dialog')?.close();
  for(const role of ['Management','Head Coach','Assistant Coach']){
   const select=$('#role-switch');select.value=role;select.dispatchEvent(new Event('change',{bubbles:true}));
   const pages=['dashboard','students','curriculum/official','curriculum/drills','curriculum/training','assessments/planner','assessments/planner/all','assessments/practice-plan','assessments/history','assessments/fitness',...(role==='Assistant Coach'?[]:['coaches','reports','settings'])];
   for(const path of pages){await nav(path);assert(role+' '+path+' fits '+innerWidth+'px',!!$('h1')&&document.documentElement.scrollWidth<=innerWidth+1);}
   await nav('curriculum/drills');const drill=$('[data-action^="drill:"]');if(drill){drill.click();const r=$('dialog').getBoundingClientRect();assert(role+' detail fits viewport',r.left>=0&&r.right<=innerWidth&&r.width>100);$('dialog [data-action="close-modal"]').click();}
  }
  const select=$('#role-switch');select.value='Management';select.dispatchEvent(new Event('change',{bubbles:true}));await nav('dashboard');
  $('.workspace-menu').open=true;const menu=$('.workspace-options').getBoundingClientRect();assert('Workspace menu fits '+innerWidth+'px',menu.left>=0&&menu.right<=innerWidth);$('.workspace-menu').open=false;
  assert('Official logos load',[...document.querySelectorAll('.partnership-lockup img')].every(img=>img.complete&&img.naturalWidth>0));
  return {width:innerWidth,passed:results.length,failed:0,results};
 }catch(error){return {width:innerWidth,passed:results.filter(r=>r.passed).length,failed:1,error:error.message,results};}
})();
