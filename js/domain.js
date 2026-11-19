import {upgradeProgression} from './progression.js';
import {upgradeOperations} from './operations.js';
import {upgradePlanner} from './planner.js';
import {applyReferenceCurriculum} from './curriculum.js';
// Assessment operations and safe saved-workspace migration.
export const DEMO_DATE = '2026-11-13';
export const roles = ['Management', 'Head Coach', 'Assistant Coach'];
export const allowedPages = role => role === 'Assistant Coach'
  ? ['dashboard', 'students', 'curriculum', 'assessments']
  : ['dashboard', 'students', 'curriculum', 'assessments', 'coaches', 'reports', 'settings'];

export function validDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
    && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
}

export function cycleOutcome(state, cycle, student, skill) {
  return state.assessments.filter(a => !a.baseline && a.cycleId === cycle.id
    && a.student === student && a.skill === skill).at(-1);
}

export function pendingModules(state, student) {
  return state.cycles.flatMap(cycle => cycle.assignments
    .filter(a => a.student === student.id)
    .flatMap(a => a.skills.map(skill => ({ cycle, skill }))))
    .filter(({cycle, skill}) => !cycleOutcome(state, cycle, student.id, skill));
}

export function latestAttempts(assessments, { student, through = '9999-12-31', baseline = false } = {}) {
  const latest = new Map();
  for (const a of assessments) {
    if (!!a.baseline !== baseline || a.date > through || (student && a.student !== student)) continue;
    const key = `${a.student}:${a.skill}`;
    if (!latest.has(key) || a.date >= latest.get(key).date) latest.set(key, a);
  }
  return [...latest.values()];
}

export function needsPractice(state, options) {
  return latestAttempts(state.assessments, options).filter(a => a.outcome === 'Needs Practice');
}

export function recordAssessment(){throw new Error('Question-based scoring is retired. Record the participant’s assessment clearance result.');}

// Upgrade old browser data without discarding created students or records.
export function upgradeState(saved) {
  if (!saved || saved.version !== 1 || !['students','skills','assessments','cycles','fitness','activities'].every(k => Array.isArray(saved[k]))) {
    throw new Error('Unsupported or incomplete saved workspace data');
  }
  if (saved.skills.length !== 16 || saved.students.some(s => !Array.isArray(s.badges) || !s.id || !s.name)
    || saved.skills.some(s => !Array.isArray(s.criteria) || s.criteria.length !== 5)
    || saved.cycles.some(c => !Array.isArray(c.assignments) || c.assignments.some(a => !Array.isArray(a.skills)))) {
    throw new Error('Invalid saved workspace records');
  }
  const levels = ['Spark','Scout','Star','Champ'];
  const studentIds = new Set(saved.students.map(s => s.id));
  const skillIds = new Set(saved.skills.map(s => s.id));
  if (studentIds.size !== saved.students.length || skillIds.size !== 16
    || saved.skills.some(s => !Number.isInteger(s.id) || s.id < 1 || s.id > 16 || s.level !== levels[Math.floor((s.id-1)/4)] || typeof s.name !== 'string')
    || saved.students.some(s => typeof s.name !== 'string' || !levels.includes(s.level) || !validDate(s.joined)
      || s.badges.some(id => !skillIds.has(id)) || new Set(s.badges).size !== s.badges.length)
    || saved.cycles.some(c => !validDate(c.date) || c.assignments.some(a => !studentIds.has(a.student) || a.skills.some(id => !skillIds.has(id))))
    || saved.fitness.some(f => !studentIds.has(f.student) || !validDate(f.date) || !Array.isArray(f.values) || f.values.length !== 7 || f.values.some(v => !Number.isFinite(v)))) {
    throw new Error('Inconsistent saved workspace records');
  }
  saved.demoDate = validDate(saved.demoDate) ? saved.demoDate : DEMO_DATE;
  saved.role = roles.includes(saved.role) ? saved.role : 'Management';
  saved.settings = { threshold: 4, ...saved.settings };
  if (![1,2,3,4,5].includes(saved.settings.threshold)) saved.settings.threshold = 4;
  for (const a of saved.assessments) {
    const skill = saved.skills.find(k => k.id === a.skill);
    if (a.type==='clearance') {
      if ((!skill&&a.skill!==null)||!saved.students.some(s=>s.id===a.student)||!validDate(a.date)||!['CLEARED','NOT_CLEARED'].includes(a.status))throw new Error('Invalid clearance evidence');
      continue;
    }
    if (!skill || !saved.students.some(s => s.id === a.student) || !validDate(a.date) || !Array.isArray(a.answers)
      || a.answers.length !== 5 || !a.answers.every(v => typeof v === 'boolean')) throw new Error('Invalid assessment reference');
    a.criteria ??= [...skill.criteria];
    a.skillName ??= skill.name;
    a.threshold ??= 4;
    // Legacy records did not store a cycle. Associate only an unambiguous exact-date assignment.
    if (!('cycleId' in a)) {
      const cycles = saved.cycles.filter(c => c.date === a.date && c.assignments.some(x => x.student === a.student && x.skills.includes(a.skill)));
      a.cycleId = !a.baseline && cycles.length === 1 ? cycles[0].id : null;
    }
  }
  // The first prototype seeded 44 abbreviated assessments independently from
  // its badge stock and enrolment dates. Reconcile only that identifiable
  // fictional fixture, preserving custom records and every earned badge.
  if (saved.dataRevision !== 2 && saved.assessments.filter(a => /^A(?:[1-9]|[1-3]\d|4[0-4])$/.test(a.id)).length === 44) {
    for (const student of saved.students.filter(s => /^VS0(?:0[1-9]|1\d|20)$/.test(s.id))) {
      const history = saved.assessments.filter(a => a.student === student.id);
      const earliest = history.map(a => a.date).sort()[0];
      if (earliest && earliest < student.joined) {
        student.previousSampleEnrolment = student.joined;
        student.joined = earliest;
      }
      for (const skillId of student.badges) {
        if (history.some(a => !a.baseline && a.skill === skillId && a.outcome === 'Passed')) continue;
        const skill = saved.skills.find(k => k.id === skillId);
        saved.assessments.push({id:`imported-${student.id}-${skillId}`,student:student.id,skill:skillId,
          date:student.joined,outcome:'Passed',answers:[true,true,true,true,false],threshold:4,
          criteria:[...skill.criteria],skillName:skill.name,coach:student.coach,baseline:false,cycleId:null,
          remarks:'Prior learning imported from the original badge record.',importedSample:true});
      }
    }
  }
  saved.dataRevision = 2;
  return upgradeProgression(upgradeOperations(upgradePlanner(applyReferenceCurriculum(saved))));
}
