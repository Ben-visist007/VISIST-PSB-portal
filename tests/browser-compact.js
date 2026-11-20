// Compact overview and co-branding: run in an isolated browser at desktop/mobile widths.
(async()=>{
 const $=s=>document.querySelector(s),all=s=>[...document.querySelectorAll(s)],results=[];
 const assert=(name,ok)=>{results.push({name,passed:!!ok});if(!ok)throw Error(name)},click=s=>$(s).click();
 try{
  click('#acctBtn');click('#acctMenu [data-id="admin"]');click('#nav [data-v="overview"]');
  await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));await Promise.all(document.getAnimations().filter(a=>Number.isFinite(a.effect.getComputedTiming().endTime)).map(a=>a.finished.catch(()=>{})));
  assert('Overview has no photo hero',!$('.portal-overview-banner')&&!$('.portal-hero-photo'));
  const metrics=all('.overview-workspace .kpi-action'),metricHeights=metrics.map(e=>e.getBoundingClientRect().height),calendar=$('.overview-calendar');
  assert('All four metrics precede the single upcoming-assessments panel',metrics.length===4&&all('.overview-calendar').length===1&&!$('.overview-next')&&metrics.every(e=>e.getBoundingClientRect().top<calendar.getBoundingClientRect().top));
  assert('All headline metrics appear without scrolling',metrics.every(e=>e.getBoundingClientRect().bottom<innerHeight));
  assert('Existing charts and status data remain available',!!$('.cols .bar')&&!!$('.hbar-name')&&$('#main').textContent.includes('Current Badge Status'));
  assert('No document horizontal overflow',document.documentElement.scrollWidth<=innerWidth+1);
  assert('Level distribution uses compact badge rows without duplicate rings',all('.overview-levels .dcard').every(e=>e.getBoundingClientRect().height<=80)&&!$('.overview-levels .ring'));
  assert('Supporting explanations remain available as disclosures',all('.overview-workspace details.overview-help').length>=3);
  const chart=$('.overview-coach'),chartHeight=chart.getBoundingClientRect().height;calendar.style.minHeight=(calendar.getBoundingClientRect().height+120)+'px';await new Promise(r=>requestAnimationFrame(r));assert('Chart height is independent of its neighbouring assessment panel',Math.abs(chart.getBoundingClientRect().height-chartHeight)<1);calendar.style.minHeight='';
  const lower=all('.overview-workspace>.grid.g2>.card'),attentionHeight=lower[1].getBoundingClientRect().height;lower[0].style.minHeight=(lower[0].getBoundingClientRect().height+120)+'px';await new Promise(r=>requestAnimationFrame(r));assert('Attention card height is independent of the badge-status panel',Math.abs(lower[1].getBoundingClientRect().height-attentionHeight)<1);lower[0].style.minHeight='';
  const bar=$('.cols .bar'),coach=bar.dataset.coach,month=bar.dataset.month,expected=visible().filter(st=>st.coachId===coach).reduce((n,st)=>n+ev(st).timeline.filter(t=>t.kind==='skill'&&monthKey(t.date)===month).length,0);bar.click();assert('Coach bars retain the correct award-record drilldown',!!ui.insight&&all('#modal .insight-row').length===expected);click('#modal [data-act="closeInsight"]');
  const level=$('.dcard'),filter=level.dataset.f;level.click();assert('Compact level rows still filter the player roster',ui.view==='students'&&ui.filter===filter);click('#nav [data-v="overview"]');

  const lockup=$(innerWidth>760?'.portal-partnership':'.portal-mobile-logo'),footer=$('.portal-powered-by'),logos=all('.portal-partnership img,.portal-powered-by img,.portal-mobile-logo img'),box=lockup.getBoundingClientRect();
  await Promise.all(logos.map(img=>img.complete?Promise.resolve():new Promise(r=>img.addEventListener('load',r,{once:true}))));
  assert('PSB alone heads the sidebar and mobile header',all('.portal-partnership img').length===1&&all('.portal-mobile-logo img').length===1&&[...lockup.querySelectorAll('img')].every(img=>img.src.includes('/assets/psb-logo.png'))&&!lockup.textContent.includes('×'));
  assert('VISIST attribution follows navigation',footer.textContent.includes('Powered by')&&footer.querySelector('img').src.includes('/assets/visist-logo-green.png')&&!!($('#nav').compareDocumentPosition(footer)&Node.DOCUMENT_POSITION_FOLLOWING));
  assert('Official brand assets load and retain aspect ratios',logos.every(img=>{if(!img.complete||!img.naturalWidth)return false;const r=img.getBoundingClientRect();return !r.width||Math.abs(r.width/r.height-img.naturalWidth/img.naturalHeight)<.03}));
  assert('PSB fits its designed logo area',[...lockup.querySelectorAll('img')].every(img=>{const r=img.getBoundingClientRect();return r.left>=box.left&&r.right<=box.right+1&&r.top>=box.top&&r.bottom<=box.bottom+1}));
  if(innerWidth>980){assert('Desktop metric cards use compact90–105px height',metricHeights.every(h=>h>=90&&h<=105));assert('Coach chart begins in the first desktop viewport',$('.cols').closest('.card').getBoundingClientRect().top<innerHeight-100);assert('Sidebar branding is compact',box.height<=145);}
  else assert('Mobile controls retain comfortable touch targets',$('#simBtn').getBoundingClientRect().height>=40);
  return {width:innerWidth,height:innerHeight,passed:results.length,failed:0,results};
 }catch(error){return {width:innerWidth,passed:results.filter(r=>r.passed).length,failed:1,error:error.message,results};}
})();
