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
  const lockup=$(innerWidth>760?'.portal-partnership':'.portal-mobile-logo'),footer=$('.portal-powered-by'),logos=all('.portal-partnership img,.portal-powered-by img,.portal-mobile-logo img'),box=lockup.getBoundingClientRect();
  await Promise.all(logos.map(img=>img.complete?Promise.resolve():new Promise(r=>img.addEventListener('load',r,{once:true}))));
  assert('PSB alone heads the sidebar and mobile header',all('.portal-partnership img').length===1&&all('.portal-mobile-logo img').length===1&&[...lockup.querySelectorAll('img')].every(img=>img.src.includes('/assets/psb-logo.png'))&&!lockup.textContent.includes('×'));
  assert('VISIST attribution follows navigation',footer.textContent.includes('Powered by')&&footer.querySelector('img').src.includes('/assets/visist-logo-green.png')&&!!($('#nav').compareDocumentPosition(footer)&Node.DOCUMENT_POSITION_FOLLOWING));
  assert('Official brand assets load and retain aspect ratios',logos.every(img=>{if(!img.complete||!img.naturalWidth)return false;const r=img.getBoundingClientRect();return !r.width||Math.abs(r.width/r.height-img.naturalWidth/img.naturalHeight)<.03}));
  assert('PSB fits its designed logo area',[...lockup.querySelectorAll('img')].every(img=>{const r=img.getBoundingClientRect();return r.left>=box.left&&r.right<=box.right+1&&r.top>=box.top&&r.bottom<=box.bottom+1}));
  if(innerWidth>980){assert('Coach chart begins in the first desktop viewport',$('.cols').closest('.card').getBoundingClientRect().top<innerHeight-100);assert('Sidebar branding is compact',box.height<=145);}
  else assert('Mobile controls retain comfortable touch targets',$('#simBtn').getBoundingClientRect().height>=40);
  return {width:innerWidth,height:innerHeight,passed:results.length,failed:0,results};
 }catch(error){return {width:innerWidth,passed:results.filter(r=>r.passed).length,failed:1,error:error.message,results};}
})();
