// Active HTML-workspace layout checks. Run at desktop, tablet and mobile widths.
(async()=>{
 const $=s=>document.querySelector(s),all=s=>[...document.querySelectorAll(s)],results=[];
 const assert=(name,ok)=>{results.push({name,passed:!!ok});if(!ok)throw Error(name);},click=s=>{const e=$(s);if(!e)throw Error('Missing '+s);e.click();},role=id=>{click('#acctBtn');click('#acctMenu [data-id="'+id+'"]');},settle=async()=>{await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));await Promise.all(document.getAnimations().filter(a=>Number.isFinite(a.effect.getComputedTiming().endTime)).map(a=>a.finished.catch(()=>{})));};
 try{
  for(const id of ['admin','hc','c1','c2','c3']){
   role(id);await settle();const views=navItems().map(row=>row[0]);
   for(const view of views){click('#nav [data-v="'+view+'"]');await settle();assert(id+' '+view+' fits '+innerWidth,!!$('#main h1')&&document.documentElement.scrollWidth<=innerWidth+1);}
   click('#nav [data-v="students"]');click('[data-act="prof"]');await settle();let r=$('#modal .dialog').getBoundingClientRect();assert(id+' player profile fits viewport',r.left>=0&&r.right<=innerWidth+1);click('#modal [data-act="ptab"][data-t="parent"]');await settle();assert(id+' family preview fits viewport',$('#modal .phone').getBoundingClientRect().right<=innerWidth+1);click('#modal [data-act="close"]');
   click('#simBtn');for(const tab of ['run','onboard','rules','log']){click('#sim [data-act="stab"][data-t="'+tab+'"]');await settle();r=$('#sim').getBoundingClientRect();assert(id+' simulator '+tab+' fits '+innerWidth,r.left>=0&&r.right<=innerWidth+1&&$('#sim').scrollWidth<=$('#sim').clientWidth+1);}click('#sim [data-act="closeSim"]');
  }
  role('admin');click('#nav [data-v="overview"]');await settle();assert('Both official partner images load',all('.portal-partnership img').every(img=>img.complete&&img.naturalWidth>0));assert('VISIST forest sidebar is retained',getComputedStyle($('#portal-sidebar')).backgroundColor==='rgb(13, 45, 23)');if(innerWidth<=760){assert('Closed mobile navigation is inert',$('#portal-sidebar').inert);click('#portal-menu');await settle();assert('Mobile navigation opens',document.body.classList.contains('portal-nav-open')&&!$('#portal-sidebar').inert);click('[data-portal-dismiss]');await settle();assert('Mobile navigation closes',!document.body.classList.contains('portal-nav-open')&&$('#portal-sidebar').inert);}
  return {width:innerWidth,passed:results.length,failed:0,results};
 }catch(error){const overflow=all('body *').filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.right>innerWidth+2&&getComputedStyle(e).position!=='fixed';}).slice(0,8).map(e=>({tag:e.tagName,class:e.className,text:e.textContent?.slice(0,60)}));return {width:innerWidth,passed:results.filter(r=>r.passed).length,failed:1,error:error.message,overflow,results};}
})();
