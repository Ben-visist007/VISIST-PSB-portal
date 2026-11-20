// Run after browser-workspace.js and a full reload in the same isolated browser.
(()=>{const results=[],assert=(name,ok)=>{results.push({name,passed:!!ok});if(!ok)throw Error(name);};try{
 assert('Reload restores the exact source seeded academy',state.students.length===18&&state.students[0].id==='s0');
 assert('Source fixture clock restarts on its reference date',state.today==='2026-11-17');
 assert('Transient added skill sets and mappings reset on reload',SKILLS.length===16&&!LIB.some(k=>k.name==='QA Source Library Skill'));
 assert('Threshold and rule comparison reset to source defaults',rules.threshold===70&&rules.levelRule==='tier');
 assert('Planner settings reset to source defaults',PLAN.days.spark.week===1&&PLAN.days.scout.week===2&&PLAN.notice===15&&PLAN.mode==='recommend');
 assert('Reload retains the selected account and opens a permitted destination',ui.role===(sessionStorage.getItem('visist-psb-account-role')||'admin')&&navItems().some(([view])=>view===ui.view));
 assert('Earlier portal storage remains byte-for-byte untouched',localStorage.getItem('visist-demo-v1')==='legacy-records-untouched');
 return {passed:results.length,failed:0,results};
}catch(error){return {passed:results.filter(r=>r.passed).length,failed:1,error:error.message,results};}})();
