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
  assert('Level tiles show badge, level and factual student count with percentage',all('.overview-levels .dcard').every(el=>{const n=visible().filter(st=>ev(st).level===Number(el.dataset.f)).length,p=visible().length?Math.round(n/visible().length*100):0;return !!el.querySelector('.em')&&!!el.querySelector('strong')&&el.querySelector('small').textContent===n+' '+(n===1?'student':'students')+' · '+p+'%'&&el.getBoundingClientRect().height<=80}));assert('Level tiles omit redundant bars, arrows, detached counts and rules',!$('.overview-levels .level-distribution,.overview-levels .level-open,.overview-levels .ring,.overview-levels .dcard>b,.overview-levels details'));
  assert('Student counts and percentages fit on one line',all('.overview-levels .level-copy small').every(el=>el.getBoundingClientRect().height<=parseFloat(getComputedStyle(el).lineHeight)+1));
  assert('Supporting explanations remain available as disclosures',all('.overview-workspace details.overview-help').length>=2);
  const chart=$('.overview-coach'),attention=$('.overview-attention'),cards=all('.overview-command-grid>.card'),sameRow=(a,b)=>Math.abs(a.getBoundingClientRect().top-b.getBoundingClientRect().top)<1;
  assert('Dashboard cards on the same row have equal heights',cards.every(a=>cards.every(b=>!sameRow(a,b)||Math.abs(a.getBoundingClientRect().height-b.getBoundingClientRect().height)<1)));
  const attentionHeight=attention.getBoundingClientRect().height;chart.style.minHeight=(chart.getBoundingClientRect().height+120)+'px';await new Promise(r=>requestAnimationFrame(r));assert('Cards stretch together only when sharing a row',sameRow(chart,attention)?Math.abs(chart.getBoundingClientRect().height-attention.getBoundingClientRect().height)<1:Math.abs(attention.getBoundingClientRect().height-attentionHeight)<1);chart.style.minHeight='';
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
