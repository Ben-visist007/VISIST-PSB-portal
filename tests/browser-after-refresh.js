// Run after browser-workflows.js / browser-planner.js and a full reload in the same isolated session.
(()=>{const s=JSON.parse(localStorage.getItem('visist-demo-v1')),results=[],assert=(name,ok)=>{results.push({name,passed:!!ok});if(!ok)throw Error(name);};try{
 assert('Retired attendance data is not required or recreated',!('attendance'in s)&&!('sessionDrafts'in s));
 const coach=s.coaches.find(c=>c.name==='QA Multi Venue Coach');assert('Multi-venue coach and explicit assignments persist',coach.venues.length===2&&s.students.filter(x=>x.assistantCoaches.includes(coach.id)).length===2);
 const library=s.library.find(k=>k.name==='QA Controlled Footwork'),curriculum=s.curricula.find(c=>c.name==='QA Foundation Curriculum'),batch=s.batches.find(b=>b.name==='QA Foundation Batch');assert('Library, curriculum and batch survive reload',curriculum.libraryIds.includes(library.id)&&batch.curriculumId===curriculum.id&&batch.studentIds.length===2);
 const group=s.cycles.find(c=>c.name==='QA Group Assessment');assert('Group assessment and immutable recorded result persist',s.assessments.some(a=>a.cycleId===group.id&&a.student==='VS001'&&a.skill===3&&a.threshold===4&&a.criteria.length===5));
 assert('Fitness remains linked to the assessment',s.fitness.some(f=>f.cycleId===group.id&&f.student==='VS001'));
 assert('Rescheduled destination and source history persist',group.rescheduled.VS002.date==='2026-11-20'&&s.cycles.some(c=>c.id===group.rescheduled.VS002.assessmentId));
 assert('Appearance and four official levels remain',s.settings.appearance==='contrast'&&s.skills.length===16&&s.students[0].level==='Spark');
 assert('Current route renders after reload',!!document.querySelector('h1')&&!/attendance|absent|excused/i.test(document.querySelector('main').textContent));return {passed:results.length,failed:0,results};
 }catch(error){return {passed:results.filter(r=>r.passed).length,failed:results.filter(r=>!r.passed),error:error.message,results};}})();
