// Compact overview and co-branding: run in an isolated browser at desktop/mobile widths.
(async()=>{
 const $=s=>document.querySelector(s),all=s=>[...document.querySelectorAll(s)],results=[];
 const assert=(name,ok)=>{results.push({name,passed:!!ok});if(!ok)throw Error(name)},click=s=>$(s).click();
 try{
  click('#acctBtn');click('#acctMenu [data-id="admin"]');click('#nav [data-v="overview"]');
  await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));await Promise.all(document.getAnimations().filter(a=>Number.isFinite(a.effect.getComputedTiming().endTime)).map(a=>a.finished.catch(()=>{})));
  assert('Overview has no photo hero',!$('.portal-overview-banner')&&!$('.portal-hero-photo'));
  const metrics=all('.overview-workspace .kpi-action'),calendar=$('.overview-next');
  assert('All four metrics precede the calendar row',metrics.length===4&&metrics.every(e=>e.getBoundingClientRect().top<calendar.getBoundingClientRect().top));
  assert('All headline metrics appear without scrolling',metrics.every(e=>e.getBoundingClientRect().bottom<innerHeight));
  assert('Existing charts and status data remain available',!!$('.cols .bar')&&!!$('.hbar-name')&&$('#main').textContent.includes('Current Badge Status'));
  assert('No document horizontal overflow',document.documentElement.scrollWidth<=innerWidth+1);
  const lockup=$(innerWidth>760?'.portal-partnership':'.portal-mobile-logo'),logos=[...lockup.querySelectorAll('img')],box=lockup.getBoundingClientRect();
  await Promise.all(logos.map(img=>img.complete?Promise.resolve():new Promise(r=>img.addEventListener('load',r,{once:true}))));
  assert('Both official logos load',logos.length===2&&logos.every(img=>img.complete&&img.naturalWidth>0));
  assert('Official logos retain their aspect ratios',logos.every(img=>{const r=img.getBoundingClientRect();return Math.abs(r.width/r.height-img.naturalWidth/img.naturalHeight)<.03}));
  assert('Logos fit inside the designed lockup',logos.every(img=>{const r=img.getBoundingClientRect();return r.left>=box.left&&r.right<=box.right+1&&r.top>=box.top&&r.bottom<=box.bottom+1}));
  if(innerWidth>980){assert('Coach chart begins in the first desktop viewport',$('.cols').closest('.card').getBoundingClientRect().top<innerHeight-100);assert('Sidebar branding is compact',box.height<=145);}
  else assert('Mobile controls retain comfortable touch targets',$('#simBtn').getBoundingClientRect().height>=40);
  return {width:innerWidth,height:innerHeight,passed:results.length,failed:0,results};
 }catch(error){return {width:innerWidth,passed:results.filter(r=>r.passed).length,failed:1,error:error.message,results};}
})();
