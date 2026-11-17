// Run after browser-workflows.js and a full browser reload in the same isolated session.
(() => {
  const $=s=>document.querySelector(s), all=s=>[...document.querySelectorAll(s)];
  const s=JSON.parse(localStorage.getItem('visist-demo-v1')), results=[];
  const assert=(name,condition)=>{results.push({name,passed:!!condition});if(!condition)throw Error(name);};
  assert('Profile URL restored after refresh',location.hash==='#students/VS022/information'&&$('h1').textContent==='QA Journey Player');
  assert('Selected profile tab restored',$('.tab.active').textContent==='Information');
  assert('Edited student persists',s.students.find(x=>x.id==='VS021').name==='QA Revised Player');
  const student=s.students.find(x=>x.id==='VS022');
  assert('Higher badge and overall level persist',student.badges.includes(16)&&student.level==='Spark');
  assert('Baseline evidence persists separately',student.baseline.includes(13)&&student.baseline.includes(14)&&!student.badges.includes(13));
  assert('Cleared attendance remains cleared',!s.attendance.some(a=>a.student==='VS022'&&a.date==='2026-11-13'));
  assert('Curriculum edit persists',s.skills[15].criteria[0]==='Updated sample criterion for future attempts');
  assert('Historical snapshot persists',s.assessments.some(a=>a.student==='VS022'&&a.skill===16&&a.criteria[0]==='Uses a backhand high serve'));
  assert('Fitness records persist',s.fitness.filter(a=>a.student==='VS022').length===2);
  assert('Demo date and role persist',s.demoDate==='2026-11-13'&&$('#role-switch').value==='Management');
  $('a[href="#assessments"]').click();$('[data-action="assessment-tab:history"]').click();
  assert('Assessment history is paginated',all('tbody tr').length===12&&!$('[data-action="history-next"]').disabled);
  $('[data-action="history-next"]').click();assert('History next page works',!$('[data-action="history-prev"]').disabled);
  return {passed:results.length,failed:0,results};
})();
