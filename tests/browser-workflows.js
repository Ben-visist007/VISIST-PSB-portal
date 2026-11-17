// Execute ONLY in an isolated demo browser session; this suite resets that
// browser's fictional records through the UI. It does not touch another profile.
(async () => {
  const results = [];
  const $ = selector => document.querySelector(selector);
  const all = selector => [...document.querySelectorAll(selector)];
  const click = selector => { const el=$(selector); if(!el) throw Error('Missing control: '+selector); el.click(); };
  const set = (selector,value,type='change') => { const el=$(selector); if(!el) throw Error('Missing field: '+selector);el.value=value;el.dispatchEvent(new Event(type,{bubbles:true})); };
  const nav = page => click('a[href="#'+page+'"]');
  const state = () => JSON.parse(localStorage.getItem('visist-demo-v1'));
  const assert = (name,condition) => {results.push({name,passed:!!condition}); if(!condition) throw Error(name);};
  const submit = () => $('dialog form').requestSubmit();
  const close = () => click('dialog [data-action="close-modal"]');
  const chooseModules = (id,skills) => { $('input[name="students"][value="'+id+'"]').checked=true;for(const o of $('[name="modules-'+id+'"]').options)o.selected=skills.includes(+o.value); };
  const assess = (yes=4) => {for(let i=0;i<5;i++)$('input[name="criterion'+i+'"][value="'+(i<yes?'yes':'no')+'"]').checked=true;set('[name="remarks"]','QA observation: controlled sample execution.','input');submit();};
  const openProfile = id => {nav('students');set('#global-search',id,'input');click('[data-action="profile:'+id+'"]');};
  const execute = (id,skill) => {openProfile(id);click('[data-action="execute:'+id+'"]');set('#assessment-skill',String(skill));};
  const createCycle = (name,date,assignments) => {nav('assessments');click('[data-action="cycle-add"]');set('[name="name"]',name,'input');set('[name="date"]',date);for(const [id,skills] of assignments)chooseModules(id,skills);submit();return state().cycles.at(-1);};
  try {
    $('dialog')?.close();set('#role-switch','Management');nav('settings');click('[data-action="reset-confirm"]');click('[data-action="reset"]');
    for(const page of ['dashboard','students','curriculum','assessments','coaches','attendance','toolkit','fitness','reports','settings']){
      nav(page);assert('Navigation: '+page,location.hash==='#'+page&&!!$('h1'));
    }
    nav('curriculum');assert('All 16 skill badges render',all('.skill-card').length===16);
    assert('Exactly four badges per level',all('.curriculum-level').every(el=>el.querySelectorAll('.skill-card').length===4));
    click('[data-action="skill:16"]');assert('Skill criteria and prerequisites open',$('dialog').textContent.includes('Foundational prerequisites')&&$('dialog').textContent.includes('Places the variations along the back lobby'));close();
    openProfile('VS001');assert('Profile has a persistent URL',location.hash==='#students/VS001/progression');
    assert('Profile badge counts match saved record',all('.skill-card.done').length===state().students[0].badges.length);
    assert('Unsuccessful skill and repeated attempts are visible',$('[data-action="skill:3:VS001"]').textContent.includes('Needs Practice')&&$('.profile-attention').textContent.includes('2 unsuccessful'));
    nav('students');click('[data-action="student-add"]');set('[name="name"]','   ','input');set('[name="email"]','qa@example.com','input');set('[name="phone"]','9876543210','input');submit();assert('Whitespace-only student name rejected',state().students.length===20&&$('dialog').open);
    set('[name="name"]','QA Demo Player','input');set('[name="venue"]','Whitefield');assert('Venue selects its matching head coach',$('[name="coach"]').value==='2');submit();
    const player=state().students.at(-1).id;assert('Student creation saves coherent assignment',state().students.at(-1).venue==='Whitefield'&&state().students.at(-1).coach===2);
    openProfile(player);click('[data-action="student-edit:'+player+'"]');set('[name="name"]','QA Revised Player','input');submit();assert('Editing student updates profile',$('h1').textContent==='QA Revised Player');
    nav('students');click('[data-action="student-add"]');set('[name="name"]','QA Journey Player','input');set('[name="email"]','journey@example.com','input');set('[name="phone"]','9876543210','input');set('[name="track"]','Intermediate');submit();const journey=state().students.at(-1).id;
    const cycleA=createCycle('QA cycle A','2026-11-13',[[journey,[16]],['VS001',[3]]]);
    assert('Cycle saves different modules per student',cycleA.assignments.some(a=>a.student===journey&&a.skills.includes(16))&&cycleA.assignments.some(a=>a.student==='VS001'&&a.skills.includes(3)));
    const cycleB=createCycle('QA cycle B','2026-11-13',[[journey,[16]]]);
    click('[data-action="cycle:'+cycleA.id+'"]');click('[data-action="cycle-execute:'+cycleA.id+':'+journey+':16"]');
    const count=state().assessments.length;submit();assert('Incomplete Yes/No form cannot submit',state().assessments.length===count);
    assess();assert('Passing cycle assessment saves membership',state().assessments.at(-1).cycleId===cycleA.id);
    assert('Higher-level badge does not promote',state().students.find(s=>s.id===journey).badges.includes(16)&&state().students.find(s=>s.id===journey).level==='Spark');
    click('[data-action="cycle:'+cycleA.id+'"]');assert('Recorded module appears in its cycle',$('dialog').textContent.includes('Recorded'));close();click('[data-action="cycle:'+cycleB.id+'"]');assert('Identical module in another cycle stays pending',!$('dialog').textContent.includes('Recorded'));close();
    execute('VS001',3);assess();close();openProfile('VS001');assert('Passing reassessment clears current attention',$('.profile-attention').textContent.includes('No unresolved unsuccessful skill assessments.')&&$('[data-action="skill:3:VS001"]').textContent.includes('Completed'));
    nav('settings');set('[name="threshold"]','5');$('#settings-form').requestSubmit();assert('Sample threshold saves',state().settings.threshold===5);
    for(let n=0;n<2;n++){execute(journey,15);assess(4);assert('Threshold 5/5 rejects four Yes answers ('+(n+1)+')',$('dialog').textContent.includes('Needs Practice'));close();}
    openProfile(journey);assert('Failed attempts do not award a badge',!state().students.find(s=>s.id===journey).badges.includes(15));assert('Profile shows unresolved repeated failures',$('.profile-attention').textContent.includes('2 unsuccessful')&&$('[data-action="skill:15:'+journey+'"]').textContent.includes('Needs Practice'));
    nav('settings');set('[name="threshold"]','4');$('#settings-form').requestSubmit();
    nav('assessments');click('[data-action="dayzero"]');set('dialog select[name="student"]',journey);for(const skill of [13,14])$('input[name="skills"][value="'+skill+'"]').checked=true;submit();
    assert('Baseline queue locks student and skill',$('#assessment-student').disabled&&$('#assessment-skill').disabled);assess();click('[data-action="baseline-next:'+journey+'"]');assess();click('[data-action="baseline-next:'+journey+'"]');
    const baseline=state().students.find(s=>s.id===journey);assert('Multiple baseline results are separate from badges',baseline.baseline.includes(13)&&baseline.baseline.includes(14)&&!baseline.badges.includes(13)&&!baseline.badges.includes(14));
    nav('curriculum');click('[data-action="skill:16"]');click('[data-action="skill-edit:16"]');set('[name="criterion0"]','Updated sample criterion for future attempts','input');set('[name="drill"]','Sample QA connected drill','input');submit();
    assert('Historical criteria stay unchanged',state().assessments.find(a=>a.cycleId===cycleA.id).criteria[0]==='Uses a backhand high serve');
    nav('toolkit');set('[data-filter="level"]','Champ');set('#tool-skill','16');assert('Toolkit filters and curriculum edit connect',all('.tool-card').length===1&&$('main').textContent.includes('Sample QA connected drill'));click('[data-action="drill:16"]');assert('Drill instructions and media placeholders open',all('dialog .video-placeholder').length===2);click('[data-action="skill:16"]');assert('Drill links back to skill',$('dialog').textContent.includes('Foundational prerequisites'));close();
    nav('attendance');click('[data-action="attendance-all"]');set('#session-notes','QA saved draft observations','input');nav('toolkit');nav('attendance');assert('Attendance draft survives navigation',$('#session-notes').value==='QA saved draft observations'&&$('[data-attendance="'+journey+'"]').value==='Present');click('[data-action="attendance-save"]');
    assert('Attendance and notes persist together',state().attendance.some(a=>a.student===journey&&a.date==='2026-11-13'&&a.status==='Present'&&a.notes==='QA saved draft observations'));
    set('#role-switch','Head Coach');assert('Coach dashboard reflects saved attendance',$('.coach-scope h2').textContent.includes('8 / 8 present'));
    nav('attendance');set('[data-attendance="'+journey+'"]','Unmarked');click('[data-action="attendance-save"]');nav('dashboard');assert('Clearing a saved mark updates coach dashboard',$('.coach-scope h2').textContent.includes('7 / 8 present'));
    nav('attendance');for(const select of all('[data-attendance]'))set('[data-attendance="'+select.dataset.attendance+'"]','Unmarked');click('[data-action="attendance-save"]');nav('dashboard');assert('Entire register can be cleared',$('.coach-scope h2').textContent.includes('0 / 8 present'));
    set('#role-switch','Assistant Coach');assert('Assistant navigation changes',!$('nav a[href="#coaches"]')&&!$('a[href="#reports"]')&&!$('a[href="#settings"]'));
    assert('Assistant actions change',!$('[data-action="student-add"]')&&!$('[data-action="export"]'));
    nav('students');assert('Assistant only sees Spark session group',all('tbody tr').every(r=>r.textContent.includes('Spark')&&r.textContent.includes('Indiranagar')));
    set('#role-switch','Head Coach');nav('students');click('[data-action="student-add"]');assert('Head coach cannot accidentally assign another venue',all('[name="venue"] option').length===1&&$('[name="coach"]').value==='1');close();
    set('#role-switch','Management');nav('fitness');set('#fitness-student',journey);for(let n=0;n<2;n++){click('[data-action="fitness-add"]');for(let i=0;i<7;i++)set('[name="value'+i+'"]',String(4+i+n));submit();}
    assert('Same-day fitness entry displays the latest result',$('.fitness-metric strong').textContent==='5');
    nav('dashboard');const total=$('.stat-value').textContent;set('[data-filter="venue"]','Whitefield');assert('Venue updates dashboard',+$('.stat-value').textContent<+total);set('[data-filter="level"]','Champ');assert('Level filter applies',+$('.stat-value').textContent===2);set('[data-filter="venue"]','All venues');set('[data-filter="level"]','All levels');const allCount=all('.stat-value')[1].textContent;set('[data-filter="range"]','7');assert('Date filter updates outcomes',all('.stat-value')[1].textContent!==allCount);set('[data-filter="range"]','90');
    nav('students');set('#student-search','no such fictional player','input');assert('Search has a useful empty state',all('tbody tr').length===0&&$('main').textContent.includes('No records found'));set('#student-search','QA Revised','input');assert('Student search works',all('tbody tr').length===1);set('#student-search','','input');set('#student-sort','progress');assert('Sorting by badge count works',all('tbody tr')[0].textContent.includes('15 / 16'));click('[data-action="page-next"]');assert('Pagination works',!$('[data-action="page-prev"]').disabled);
    nav('coaches');const assistantCard=all('.coach-grid section').find(el=>el.textContent.includes('Ananya Das'));assistantCard.querySelector('button').click();assert('Coach assignment count uses the actual assistant group',all('dialog tbody tr').every(r=>r.textContent.includes('Spark')));close();
    nav('assessments');click('[data-action="cycle:C1"]');const assignment=state().cycles.find(c=>c.id==='C1').assignments[0];click('[data-action="cycle-execute:C1:'+assignment.student+':'+assignment.skills[0]+'"]');assert('Future cycle makes demo date change explicit',$('dialog').textContent.includes('Preview this assessment date'));click('[data-action="cycle-start:C1:'+assignment.student+':'+assignment.skills[0]+'"]');assess();assert('Future cycle records on its fixed date',state().demoDate==='2026-11-18'&&state().assessments.at(-1).date==='2026-11-18');close();nav('dashboard');assert('Future cycle result is included in reporting',$('.filter-count').textContent.includes('18 Nov')&&all('.stat-value')[1].textContent===String(state().assessments.filter(a=>!a.baseline&&a.date>='2026-08-20'&&a.date<='2026-11-18').length));
    click('[data-action="demo-date"]');set('[name="date"]','2026-11-13');submit();assert('Demo date control persists',state().demoDate==='2026-11-13');
    click('[data-action="notifications"]');assert('Notifications show real saved activity',!!$('dialog .notification-list article'));close();
    openProfile(journey);click('[data-action="profile-tab:information"]');
    window.__qaContext={player,journey,cycleA:cycleA.id,cycleB:cycleB.id};window.__qaResults=results;
    return {passed:results.length,failed:0,results,refreshRoute:location.hash};
  }catch(error){return {passed:results.filter(r=>r.passed).length,failed:results.filter(r=>!r.passed),error:error.message,results};}
})();
