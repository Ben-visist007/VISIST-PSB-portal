// Active experience regressions: real badge dialogs, focus and scoped drilldowns.
(async()=>{
 const $=s=>document.querySelector(s),all=s=>[...document.querySelectorAll(s)],results=[];
 const assert=(name,ok)=>{results.push({name,passed:!!ok});if(!ok)throw Error(name)},click=s=>{const el=$(s);if(!el)throw Error('Missing '+s);el.focus();el.click()},view=v=>click('#nav [data-v="'+v+'"]'),key=(k,shift=false)=>document.dispatchEvent(new KeyboardEvent('keydown',{key:k,shiftKey:shift,bubbles:true,cancelable:true}));
 try{
  click('#acctBtn');click('#acctMenu [data-id="admin"]');view('curriculum');
  assert('Curriculum exposes every current badge exactly once',all('.curriculum-skill').length===SKILLS.length&&new Set(all('.curriculum-skill').map(e=>e.dataset.s)).size===SKILLS.length);
  assert('All official collection sections are available',LEVELS.every(l=>!!$('#collection-'+l.id)));
  for(const sk of SKILLS){
   const sel='.curriculum-skill[data-s="'+sk.id+'"]';click(sel);
   assert(sk.id+' opens a true detail dialog',!$('#modal').hidden&&!!$('#modal .skill-dialog[aria-modal="true"]')&&$('#skill-dialog-title').textContent===sk.name);
   assert(sk.id+' retains exact teaching standard and video checklist',$('#modal').textContent.includes(sk.std)&&all('#modal .skill-video-list li').length===sk.videos.length&&sk.videos.every(v=>$('#modal').textContent.includes(v.label)));
   assert(sk.id+' has visible official artwork and focus inside dialog',!!$('#modal .skill-detail-art .bdg')&&$('#modal').contains(document.activeElement));
   key('Escape');assert(sk.id+' Escape dismisses and restores badge focus',$('#modal').hidden&&document.activeElement===$(sel));
  }
  click('.curriculum-skill');const buttons=all('#modal button');buttons.at(-1).focus();key('Tab');assert('Dialog Tab cycles to its first control',document.activeElement===buttons[0]);key('Tab',true);assert('Dialog Shift+Tab cycles to its last control',document.activeElement===buttons.at(-1));
  $('#modal').click();assert('Backdrop dismisses badge detail and restores focus',$('#modal').hidden&&document.activeElement===$('.curriculum-skill'));
  view('overview');click('[data-act="insight"][data-kind="skill"]');const expected=visible().reduce((n,st)=>n+ev(st).timeline.filter(t=>t.kind==='skill'&&monthKey(t.date)===monthKey(state.today)).length,0);assert('Monthly badge metric opens real award records',all('#modal .insight-row').length===expected);click('#modal [data-act="closeInsight"]');
  click('.cols .bar');assert('Coach chart drilldown is scoped to selected coach',all('#modal .insight-row').every(el=>S(el.dataset.id).coachId===ui.insight.coach));click('#modal [data-act="closeInsight"]');
  click('.hbar-name');assert('Badge bottleneck chart shows actual scoped players',all('#modal .insight-row').length===visible().length);click('#modal .insight-row');assert('Record row opens the correct player profile',!!ui.prof&&!ui.insight);key('Escape');
  view('overview');click('[data-act="overviewPlayers"][data-f="attention"]');assert('Attention metric filters real player roster',ui.view==='students'&&ui.filter==='attention'&&all('.prow').every(el=>ev(S(el.dataset.id)).attention.length));click('[data-act="resetFilters"]');assert('Clear filters restores full scoped roster',ui.filter==='all'&&all('.prow').length===visible().length);
  click('.prow');click('#modal [data-act="selSkill"][data-s="grip"]');assert('Profile badge opens progress detail with recorded scores',!!$('#modal .skill-dialog')&&$('#modal').textContent.includes('Best AI score per video')&&!!$('#modal .meter'));click('#modal [data-act="closeSkill"]');assert('Back returns to profile and selected badge focus',!!ui.prof&&!ui.skill&&document.activeElement?.dataset.act==='selSkill'&&document.activeElement?.dataset.s==='grip');key('Escape');
  view('planner');assert('Planner exposes task stages and roster summary',all('.planner-steps li').length===3&&!!$('.planner-roster-status'));assert('Selected assessment date announces its state',!!$('.day[aria-pressed="true"]'));
  return {passed:results.length,failed:0,results};
 }catch(error){return {passed:results.filter(r=>r.passed).length,failed:1,error:error.message,results};}
})();
