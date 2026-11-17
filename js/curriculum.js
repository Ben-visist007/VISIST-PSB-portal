// User-selected reference: new psb gamified.pdf, page 1. Group by the four
// visual columns; printed skill suffixes differ from their column headings.
export const levelGuidance = {
 Spark: 'Fun oriented · Short sessions · High engagement',
 Scout: 'Fun oriented · Higher frequency · Moderate attention · Introduce corrections',
 Star: 'Goal oriented · Higher training volume · Attention to detail · Prioritise corrections',
 Champ: 'Half-court games · Higher intensity and volume · Corrections with speed'
};
const entries = [
 ['Grip Scout','Perfect grip demonstrations.','Forehand and backhand grip demonstration',
  ['Demonstrates the forehand grip','Demonstrates the backhand grip','Shows the grip clearly to the coach','Repeats the grip demonstration','Coach confirms the reference grip standard']],
 ['Airtoss Scout','At least 10 forehand and 10 backhand air tosses with the correct grip.','Forehand and backhand air tosses',
  ['Uses the correct forehand grip','Completes at least 10 forehand air tosses','Uses the correct backhand grip','Completes at least 10 backhand air tosses','Maintains the correct grip throughout']],
 ['Keep & Lift Scout','One-step underarm stroke with fair accuracy and leg alignment.','One-step underarm keep and lift',
  ['Uses a one-step approach','Demonstrates the underarm stroke','Demonstrates the keep action','Demonstrates the lift with fair accuracy','Maintains leg alignment']],
 ['Low Serve Scout','Accurate backhand low serves without a service fault.','Backhand low-serve practice',
  ['Uses a backhand serving action','Produces a low serve','Serves without a fault','Places the serve accurately','Repeats an accurate legal serve']],
 ['Grip Change Star','At least 10 alternating air tosses with quick grip changes.','Alternating air tosses and grip changes',
  ['Alternates forehand and backhand air tosses','Changes grip between strokes','Changes grip quickly','Completes at least 10 alternating air tosses','Maintains control during grip changes']],
 ['Fore-court Star','Half-court movement, keeps and lifts with fair accuracy, technique and leg alignment.','Half-court fore-court movement',
  ['Moves within the half court','Demonstrates keeps','Demonstrates lifts','Shows fair accuracy and technique','Maintains leg alignment']],
 ['Hawk Eye Star','Underarm ball throw and catch with the opposite hand, without a bounce, 10 times.','Opposite-hand throw and catch',
  ['Uses an underarm ball throw','Catches with the opposite hand','Catches without a bounce','Completes 10 throw-and-catch repetitions','Maintains control through the sequence']],
 ['High Serve Star','Clean forehand high serves without a service fault.','Forehand high-serve practice',
  ['Uses a forehand serving action','Produces a high serve','Makes clean contact','Serves without a fault','Repeats a clean legal high serve']],
 ['Drive Champ','Lateral movement with forehand and backhand drives, fair technique, flat returns and alignment.','Lateral forehand and backhand drives',
  ['Moves laterally','Demonstrates forehand drives','Demonstrates backhand drives','Produces flat returns','Maintains fair technique and alignment']],
 ['Overhead Champ','Standing, hand-fed clear, drop and smash with body weight transfer and arm extension.','Hand-fed overhead strokes',
  ['Demonstrates a standing hand-fed clear','Demonstrates a standing hand-fed drop','Demonstrates a standing hand-fed smash','Transfers body weight','Extends the racket arm']],
 ['Shadow Champ','Double-leg hops, split jumps, high knees and shuffle over an agility ladder.','Agility-ladder shadow sequence',
  ['Performs double-leg hops','Performs split jumps','Performs high knees','Performs a shuffle','Completes the movements over an agility ladder']],
 ['Forehand Front Serve Champ','Forehand low serves: three variations along the service line.','Three forehand low-serve variations',
  ['Uses a forehand low serve','Demonstrates the first service-line variation','Demonstrates the second service-line variation','Demonstrates the third service-line variation','Places the variations along the service line']],
 ['Netking Champ','12 strokes in a one-step, single-shuttle rally with the coach.','One-step net rally with coach',
  ['Rallies with the coach','Uses a single shuttle','Uses a one-step movement','Completes 12 strokes','Maintains the rally through the target count']],
 ['Rear-court Champ','Half-court positioning under the shuttle, clear, drop and smash with fore-court follow-up.','Rear-court strokes and fore-court follow-up',
  ['Positions under the shuttle in half court','Demonstrates a clear','Demonstrates a drop','Demonstrates a smash','Follows up into the fore court']],
 ['Consistency Champ','20 basic strokes with a single shuttle in half court with a coach.','20-stroke half-court rally',
  ['Rallies in half court','Rallies with a coach','Uses a single shuttle','Demonstrates basic strokes','Completes 20 strokes']],
 ['Backhand Flick Serve Champ','Backhand high serves: three variations along the back lobby.','Three backhand flick-serve variations',
  ['Uses a backhand high serve','Demonstrates the first back-lobby variation','Demonstrates the second back-lobby variation','Demonstrates the third back-lobby variation','Places the variations along the back lobby']]
];
export function referenceSkills() {
 return entries.map(([name,description,drill,criteria],i)=>({id:i+1,level:['Spark','Scout','Star','Champ'][Math.floor(i/4)],name,description,drill,criteria:[...criteria],
  instructions:`Coach-led practice: ${description} Demonstrate the action, let the player practise, then observe against the reference target.`,
  source:'PSB gamified · Page 1',reference:true}));
}
// Only untouched placeholder fields are upgraded. Existing assessment snapshots
// and user-authored curriculum fields retain exactly what was recorded.
export function applyReferenceCurriculum(state) {
 if(state.curriculumRevision===1)return state;
 for(const ref of referenceSkills()){
  const skill=state.skills.find(k=>k.id===ref.id);if(!skill)continue;
  const defaults={name:`Sample skill ${String(ref.id).padStart(2,'0')}`,drill:`Sample practice ${String(ref.id).padStart(2,'0')}`,
   description:`Illustrative ${ref.level.toLowerCase()} movement and racket-control activity. Replace with academy-approved curriculum content.`,
   instructions:'Set up a safe practice area. Demonstrate the sample movement slowly, practise in short repetitions, and offer individual feedback.'};
  let changed=false;
  for(const [key,value] of Object.entries(defaults))if(skill[key]===value){skill[key]=ref[key];changed=true;}
  skill.criteria=skill.criteria.map((c,i)=>c===`Sample criterion ${i+1}`?(changed=true,ref.criteria[i]):c);
  if(changed){skill.reference=true;skill.source=ref.source;}
 }
 state.curriculumRevision=1;return state;
}
