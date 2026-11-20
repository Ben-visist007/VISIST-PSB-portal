// Active workspace: source-faithful HTML controller plus the VISIST visual adapter.

/* ---------------- Curriculum config (names from the PSB "Reward based assessment system" sheet) ----------------
   A column is the stage a kid is in. Its 4 skill badges carry the name of the badge they unlock:
   4 "Scout" skills in the Spark column = Scout badge, 4 "Star" skills = Star, 4 "Champ" skills = Champ, finishing the Champ column completes all 16 (no extra badge). */
const STAGES=[
  {id:'spark',name:'Spark',sub:''},
  {id:'scout',name:'Scout',sub:''},
  {id:'star',name:'Star',sub:''},
  {id:'champ',name:'Champ',sub:''},
  {id:'champ',name:'All 16',sub:'',final:true}];
const LEVELS=[
  {id:'spark',name:'Spark',week:1,award:'Scout',who:'Just picked up the racket: grip, footwork basics, and how not to hit anyone on the serve.',focus:['Fun oriented','Less duration','High engagement']},
  {id:'scout',name:'Scout',week:2,award:'Star',who:'Solid fundamentals, improving consistently, starting to understand technique and court dimensions.',focus:['Fun oriented','Higher frequency','Moderate attention','Corrections start']},
  {id:'star',name:'Star',week:3,award:'Champ',who:'Strong technique, competitive in learning, has a go-to shot or two that threatens most younger players.',focus:['Goal oriented','Higher training volume','Attention to detail','Corrections priority']},
  {id:'champ',name:'Champ',week:4,award:'All 16',who:'Rally hungry, counting points, knows the rules and competes with a personalised stroke.',focus:['½-court game oriented','Higher intensity & volume','Corrections priority with an element of speed']}].map((l,i)=>({...l,idx:i}));
const SKILLS=[
  ['grip','spark','Grip Scout','Gr','Perfect grip demonstrations',[['fh','Forehand grip'],['bh','Backhand grip']]],
  ['airtoss','spark','Airtoss Scout','AT','Min 10 FH & 10 BH air tosses with right grip',[['fh','10 forehand air tosses'],['bh','10 backhand air tosses']]],
  ['keeplift','spark','Keep & Lift Scout','KL','Perfect one-step underarm stroke with fair accuracy & leg alignment',[['keep','Net keep'],['lift','Underarm lift']]],
  ['lowserve','spark','Low Serve Scout','LS','No-fault accurate BH low serves',[['bh','Backhand low serves'],['acc','Accuracy to target']]],
  ['gripchange','scout','Grip Change Star','GC','Min 10 alternate air tosses with quick grip change',[['alt','10 alternate air tosses'],['speed','Quick grip change']]],
  ['forecourt','scout','Fore-Court Star','FC','Half-court movement, keeps & lift with fair accuracy, technique & leg alignment',[['move','Half-court movement'],['keep','Keeps'],['lift','Lifts']]],
  ['hawkeye','scout','Hawk Eye Star','HE','Ball catch from an underarm throw, catch back with the opposite hand without a bounce, 10 times',[['throw','Underarm throw & catch'],['opp','Opposite-hand catch ×10']]],
  ['highserve','scout','High Serve Star','HS','No-fault, clean FH high serves',[['fh','Forehand high serves'],['clean','No-fault check']]],
  ['drive','star','Drive Champ','Dr','Lateral movement + FH & BH drives with fair technique, flat returns & alignment',[['fh','Forehand drives'],['bh','Backhand drives']]],
  ['overhead','star','Overhead Champ','OH','Standing hand-fed clear, drop & smash with body-weight transfer and arm extension',[['clear','Clear'],['drop','Drop'],['smash','Smash']]],
  ['shadow','star','Shadow Champ','Sh','Double-leg hops, split jumps, high knees & shuffle over the agility ladder',[['hops','Hops & split jumps'],['ladder','High knees & shuffle (ladder)']]],
  ['fhfront','star','Forehand Front Serve Champ','FS','FH low serves, 3 variations along the service line',[['v1','Variation 1'],['v2','Variation 2'],['v3','Variation 3']]],
  ['netking','champ','Netking Champ','NK','12 strokes, one-step single-shuttle rally with coach',[['rally','12-stroke net rally']]],
  ['rearcourt','champ','Rear-Court Champ','RC','½-court positioning under the shuttle; clear, drop & smash with fore-court follow-up',[['clear','Clear + follow-up'],['drop','Drop + follow-up'],['smash','Smash + follow-up']]],
  ['consistency','champ','Consistency Champ','Co','20 basic strokes, single shuttle in half court with a coach',[['rally','20-stroke half-court rally']]],
  ['bhflick','champ','Backhand Flick Serve Champ','BF','BH high serves, 3 variations along the back lobby',[['v1','Variation 1'],['v2','Variation 2'],['v3','Variation 3']]],
].map(([id,tier,name,abbr,std,v],i)=>({id,tier,name,abbr,std,order:i,videos:v.map(([k,label])=>({id:id+'.'+k,label}))}));

/* ---------------- skill library (100+ skills) → skill sets (16) → badges (4 columns) ---------------- */
const LIB_RAW={
  'Grip':['Forehand grip','Backhand grip','Panhandle grip','Bevel grip','Thumb grip','Grip change FH→BH','Grip change BH→FH','Finger power squeeze'],
  'Footwork':['Ready stance','Split step','Chasse step','Cross-over step','Front lunge','Lunge recovery','Scissor jump','Round-the-head footwork','Side shuffle','Two-step to net','Three-step to rear','Return to base','Pivot turn','Heel-first landing','Knee alignment on lunge','Centre-court recovery'],
  'Serve':['BH low serve','FH low serve','FH high serve','BH flick serve','FH flick serve','Drive serve','Serve stance','Service-line accuracy','No-fault serve legality','Serve variation (3 targets)','Shuttle drop & release','Serve follow-through'],
  'Net play':['Net keep','Underarm lift','Net kill','Net tumble','Net push','Net brush','Racket up at net','Spinning net shot','Cross-court net shot','Net interception','One-step net reach','Net rally consistency'],
  'Overhead':['FH clear','BH clear','Round-the-head clear','FH drop','Slice drop','Reverse slice','FH smash','Jump smash','Stick smash','Body-weight transfer','Arm extension at contact','Contact above head','Overhead follow-through','Sideways turn'],
  'Mid-court':['FH drive','BH drive','Flat return','Push to mid-court','Block return','Lateral movement for drives','Drive rally','Wrist snap on drive','Short-swing preparation','Body-smash return'],
  'Defence':['FH smash defence','BH smash defence','Lift from defence','Block to net','Low ready position','Counter-drive','Clear from defence','Recovery after defence'],
  'Hand–eye':['Air toss FH','Air toss BH','Alternate air toss','Underarm throw & catch','Opposite-hand catch','Shuttle tap-up count','Racket balance','Reaction catch','Tracking focus','Wall rally'],
  'Fitness':['Double-leg hops','Split jumps','High knees (ladder)','Ladder shuffle','Shadow 6-corner','Skipping','Core plank','Shuttle run','Lateral bounds','Reaction sprint','Single-leg balance','Flexibility routine'],
  'Game sense':['Rules knowledge','Score counting','Court lines awareness','Half-court positioning','Rally building','Shot selection','Base position','Doubles rotation basics','Sportsmanship','Point strategy'],
  'Consistency':['12-stroke net rally','20-stroke half-court rally','Clear–clear rally','Drop–lift rally','Drive rally ×20','Serve–return rally']};
const LIB=[];Object.entries(LIB_RAW).forEach(([cat,names])=>names.forEach(name=>LIB.push({id:'k'+LIB.length,name,cat})));
const LIBN=Object.fromEntries(LIB.map(k=>[k.name,k.id])),LK=Object.fromEntries(LIB.map(k=>[k.id,k]));
const CATS=Object.keys(LIB_RAW);
const MAP={};
Object.entries({
  grip:['Forehand grip','Backhand grip','Panhandle grip','Thumb grip'],
  airtoss:['Air toss FH','Air toss BH','Forehand grip','Backhand grip','Shuttle tap-up count'],
  keeplift:['Net keep','Underarm lift','One-step net reach','Knee alignment on lunge','Ready stance'],
  lowserve:['BH low serve','Serve stance','Shuttle drop & release','No-fault serve legality','Service-line accuracy'],
  gripchange:['Alternate air toss','Grip change FH→BH','Grip change BH→FH','Finger power squeeze'],
  forecourt:['Two-step to net','Front lunge','Lunge recovery','Net keep','Underarm lift','Centre-court recovery'],
  hawkeye:['Underarm throw & catch','Opposite-hand catch','Tracking focus','Reaction catch'],
  highserve:['FH high serve','Serve stance','Serve follow-through','No-fault serve legality'],
  drive:['FH drive','BH drive','Flat return','Lateral movement for drives','Short-swing preparation'],
  overhead:['FH clear','FH drop','FH smash','Body-weight transfer','Arm extension at contact','Contact above head'],
  shadow:['Double-leg hops','Split jumps','High knees (ladder)','Ladder shuffle'],
  fhfront:['FH low serve','Serve variation (3 targets)','Service-line accuracy','Shuttle drop & release'],
  netking:['12-stroke net rally','Net push','Racket up at net','One-step net reach'],
  rearcourt:['Half-court positioning','Three-step to rear','FH clear','FH drop','FH smash','Return to base'],
  consistency:['20-stroke half-court rally','Rally building','Base position'],
  bhflick:['BH flick serve','Serve variation (3 targets)','Serve stance','No-fault serve legality']
}).forEach(([set,names])=>{MAP[set]=names.map(n=>{if(!LIBN[n])console.error('missing skill',n);return LIBN[n]})});
const setsUsing=kid=>SKILLS.filter(s=>(MAP[s.id]||[]).includes(kid));
const stageOf=lvl=>STAGES[lvl+1];
const awardTxt=L=>L.idx===3?'all 16 skills':`the ${L.award} badge`;
const SK=Object.fromEntries(SKILLS.map(s=>[s.id,s]));
const LV=Object.fromEntries(LEVELS.map((l,i)=>[l.id,{...l,idx:i}]));
const skillsOf=t=>SKILLS.filter(s=>s.tier===t);
const videosOf=t=>skillsOf(t).flatMap(s=>s.videos);

/* ---------------- dates ---------------- */
const D=s=>{const[y,m,d]=s.split('-').map(Number);return new Date(Date.UTC(y,m-1,d))};
const iso=dt=>dt.toISOString().slice(0,10);
const addDays=(s,n)=>{const t=D(s);t.setUTCDate(t.getUTCDate()+n);return iso(t)};
const fmt=(s,o={weekday:'short',day:'numeric',month:'short'})=>D(s).toLocaleDateString('en-GB',{...o,timeZone:'UTC'});
/* planner settings: which week + weekday each level is assessed, what happens on a 5th week, notice period, who adds students */
const PLAN={days:{spark:{week:1,dow:5},scout:{week:2,dow:5},star:{week:3,dow:5},champ:{week:4,dow:5}},fifth:'makeup',notice:15,mode:'recommend'};
const DOWS=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],ORD=['1st','2nd','3rd','4th'];
const dayLabel=id=>{const x=PLAN.days[id];return `${ORD[x.week-1]} ${DOWS[x.dow]}`};
const levelForDate=s=>{const t=D(s),w=Math.ceil(t.getUTCDate()/7),dw=t.getUTCDay();const L=LEVELS.find(L=>PLAN.days[L.id].week===w&&PLAN.days[L.id].dow===dw);return L?LV[L.id]:null};
const planClash=()=>{const seen={},out=[];LEVELS.forEach(L=>{const k=PLAN.days[L.id].week+'-'+PLAN.days[L.id].dow;if(seen[k])out.push([seen[k],L.name]);else seen[k]=L.name});return out};
function assessmentDays(from,n){const out=[];let s=from;for(let i=0;i<400&&out.length<n;i++){if(levelForDate(s))out.push(s);s=addDays(s,1)}return out}
function nextDayFor(idx,from){let s=from;for(let i=0;i<120;i++){const l=levelForDate(s);if(l&&l.idx===idx)return s;s=addDays(s,1)}return null}
const monthKey=s=>s.slice(0,7);

/* ---------------- RNG ---------------- */
function mulberry(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));

/* ---------------- state ---------------- */
let rules={threshold:70,levelRule:'tier'};
let state, ui={mapSel:'grip',libQ:'',libCat:'all',libFree:false,view:'overview',role:'admin',filter:'all',q:'',planDay:null,absent:new Set(),prof:null,form:null,more:new Set(),curSel:null,layout:'list',group:'venue',venueF:'all',coachF:'all',sort:'progress'};
const VENUES=[
  {id:'mal',name:'Malleshwaram',sub:'Main centre · 4 courts'},
  {id:'ind',name:'Indiranagar',sub:'2 courts'},
  {id:'wf',name:'Whitefield',sub:'Weekend centre · 3 courts'}];
const VE=Object.fromEntries(VENUES.map(v=>[v.id,v]));
const ACADEMY={name:'PSB Academy',title:'Academy account',desc:'Owner · billing, curriculum & rules, every venue'};
const COACHES=[
  {id:'hc',name:'Kiran Rao',role:'head',title:'Head coach',venues:['mal','ind','wf'],batch:'All venues'},
  {id:'c1',name:'Divya Shetty',role:'assistant',title:'Coach',venues:['mal','ind'],batch:'Mon · Wed · Fri, 4–5 pm'},
  {id:'c2',name:'Rahul Menon',role:'assistant',title:'Coach',venues:['ind'],batch:'Tue · Thu · Sat, 5–6 pm'},
  {id:'c3',name:'Meera Iyer',role:'assistant',title:'Coach',venues:['wf','mal'],batch:'Sat · Sun, 8–9 am'}];
const CO=Object.fromEntries(COACHES.map(c=>[c.id,c]));
const coachList=()=>COACHES.filter(c=>c.role==='assistant');
const roleKind=()=>ui.role==='admin'?'admin':CO[ui.role]?.role==='head'?'head':'assistant';
const me=()=>ui.role==='admin'?{name:ACADEMY.name,title:ACADEMY.title}:CO[ui.role];

function genScores(st,levelId,date,r){
  const out={},weeks=Math.max(0,(D(date)-D(st.joined))/6048e5),ti=LV[levelId].idx;
  for(const s of skillsOf(levelId))for(const v of s.videos){
    const base=st.ability-9*ti+Math.min(14,weeks*1.3)-(st.weak===s.id?17:0)+(r()*22-11);
    out[v.id]=clamp(Math.round(base),18,99)}
  return out}

const NAMES=['Aarav Kumar','Diya Nair','Vihaan Rao','Anika Sharma','Kabir Singh','Myra Reddy','Arjun Pillai','Ira Joshi','Reyansh Gowda','Saanvi Hegde','Ishaan Bhat','Tara Menon','Advik Das','Kiara Shah','Rohan Kulkarni','Navya Prasad','Dev Malhotra','Aditi Rao'];
function seeded(){
  const r=mulberry(20261117);
  const joins=['2026-08-24','2026-09-07','2026-09-28','2026-10-12','2026-11-02'];
  const students=NAMES.map((name,i)=>({id:'s'+i,name,age:6+Math.floor(r()*7),coachId:['c1','c2','c3'][i%3],
    joined:joins[Math.floor(r()*joins.length)],ability:Math.round(63+r()*24),weak:r()<.55?SKILLS[Math.floor(r()*8)].id:null,attempts:[],notified:[],note:''}));
  students.forEach((st,i)=>{const v=CO[st.coachId].venues;st.venue=v[Math.floor(i/3)%v.length]});
  // story students
  Object.assign(students[0],{joined:'2026-10-26',ability:90,weak:null,transfer:true,note:'Joined from another academy — fast-tracked with placement tests'});
  Object.assign(students[3],{joined:'2026-08-24',ability:70,weak:'airtoss',note:''});
  Object.assign(students[6],{joined:'2026-08-24',ability:86,weak:null});
  Object.assign(students[13],{joined:'2026-11-16',ability:66,weak:null,note:'New this week — no assessment yet'});
  const s={students,plans:{},done:{},today:'2026-11-17',log:[]};
  const past=[];for(let x='2026-08-28';x<'2026-11-17';x=addDays(x,1))if(levelForDate(x))past.push(x);
  for(const st of students){
    for(const day of past){if(day<st.joined)continue;
      const L=levelForDate(day),e=evaluate(st),w=e.working;if(w<0)continue;
      const attend=st.transfer?L.idx<=1:((L.idx===w&&r()<.88)||(L.idx===w+1&&st.ability>80&&r()<.5));
      if(attend){st.attempts.push({date:day,level:L.id,scores:genScores(st,L.id,day,r)});s.done[day]=true}}}
  for(const st of students){const e=evaluate(st);st.notified=e.timeline.filter(t=>t.date<'2026-11-13').map(t=>t.kind+':'+t.id)}
  s.log.push({date:'2026-11-17',kind:'info',text:'Loaded seeded academy: 18 students, assessment history from Aug 28 to Nov 13.'});
  return s}
function dryRun(){
  const base=[['Aarav Kumar',8,84,null],['Diya Nair',7,72,'airtoss'],['Kabir Singh',9,63,'grip'],['Myra Reddy',6,77,null]];
  const students=base.map(([name,age,ability,weak],i)=>({id:'d'+i,name,age,coachId:'c1',venue:'mal',joined:'2026-11-17',ability,weak,attempts:[],notified:[],note:''}));
  return {students,plans:{},done:{},today:'2026-11-17',log:[{date:'2026-11-17',kind:'info',text:'Dry run: 4 new athletes onboarded under Divya Shetty, all at 0 badges.'}]}}

/* ---------------- badge engine (pure) ---------------- */
function levelMet(i,sk){
  if(rules.levelRule==='count')return SKILLS.filter(s=>sk[s.id].earned).length>=4*(i+1);
  return LEVELS.slice(0,i+1).every(L=>skillsOf(L.id).every(s=>sk[s.id].earned))}
function evaluate(st){
  const T=rules.threshold,best={},sk={},lv={},timeline=[];
  SKILLS.forEach(s=>sk[s.id]={earned:null,tries:0,streak:0,lastPass:null,history:[]});
  const atts=[...st.attempts].sort((a,b)=>a.date<b.date?-1:a.date>b.date?1:0);
  for(const a of atts){
    for(const s of skillsOf(a.level)){
      s.videos.forEach(v=>{best[v.id]=Math.max(best[v.id]??0,a.scores[v.id]??0)});
      const passNow=s.videos.every(v=>(a.scores[v.id]??0)>=T),o=sk[s.id];
      o.tries++;o.history.push({date:a.date,scores:s.videos.map(v=>a.scores[v.id]),passNow});o.lastPass=passNow;
      if(!o.earned){if(s.videos.every(v=>best[v.id]>=T)){o.earned=a.date;o.streak=0;timeline.push({date:a.date,kind:'skill',id:s.id})}else o.streak++}}
    LEVELS.forEach((L,i)=>{if(!lv[L.id]&&levelMet(i,sk)){lv[L.id]=a.date;timeline.push({date:a.date,kind:'level',id:L.id})}})}
  let level=-1;LEVELS.forEach((L,i)=>{if(lv[L.id])level=i});
  const earnedCount=SKILLS.filter(s=>sk[s.id].earned).length;
  const working=LEVELS.findIndex(L=>skillsOf(L.id).some(s=>!sk[s.id].earned));
  const attention=SKILLS.filter(s=>!sk[s.id].earned&&sk[s.id].streak>=2);
  return {best,sk,lv,level,earnedCount,working,attention,timeline,lastDate:atts.length?atts[atts.length-1].date:null}}
let cache=new Map();
const ev=st=>{if(!cache.has(st.id))cache.set(st.id,evaluate(st));return cache.get(st.id)};
const invalidate=()=>{cache=new Map()};
const S=id=>state.students.find(s=>s.id===id);
const unNotified=st=>ev(st).timeline.filter(t=>!st.notified.includes(t.kind+':'+t.id));
function bookedDay(st){return Object.keys(state.plans).filter(d=>d>=state.today&&!state.done[d]&&state.plans[d].includes(st.id)).sort()[0]||null}
function nextAssessment(st){const e=ev(st);if(e.working<0)return null;const b=bookedDay(st);if(b)return {date:b,level:levelForDate(b),booked:true};
  const d=nextDayFor(e.working,state.today);return {date:d,level:LV[LEVELS[e.working].id],booked:false}}
function visible(){const k=roleKind();return state.students.filter(s=>k!=='assistant'||s.coachId===ui.role)}

/* ---------------- svg ---------------- */
const HEX='50,5 91,28 91,72 50,95 9,72 9,28';
const HEXO='50,3 92,27 92,73 50,97 8,73 8,27',HEXI='50,10.5 85.3,30.7 85.3,69.3 50,89.5 14.7,69.3 14.7,30.7',HEXR='50,15.2 81.1,33 81.1,67 50,84.8 18.9,67 18.9,33';
const METAL={spark:['#f7cfa6','#c2703a','#6e3412'],scout:['#ffffff','#b7c2cf','#5f6c7d'],star:['#fff2b0','#e2ad2a','#865900'],champ:['#c3cdff','#5163c9','#1f286b']};
function svgDefs(){
  const g=Object.entries(METAL).map(([t,[L,M,K]])=>`<linearGradient id="rim-${t}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${L}"/><stop offset=".32" stop-color="${M}"/><stop offset=".52" stop-color="${K}"/><stop offset=".72" stop-color="${M}"/><stop offset="1" stop-color="${L}"/></linearGradient>
   <radialGradient id="face-${t}" cx=".36" cy=".28" r=".9"><stop offset="0" stop-color="${L}"/><stop offset=".42" stop-color="${M}"/><stop offset="1" stop-color="${K}"/></radialGradient>
   <linearGradient id="rib-${t}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${M}"/><stop offset="1" stop-color="${K}"/></linearGradient>`).join('');
  return `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>${g}
   <linearGradient id="gloss" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".6"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
   <linearGradient id="rim-off" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:var(--line)"/><stop offset=".5" style="stop-color:var(--subtle)"/><stop offset="1" style="stop-color:var(--line)"/></linearGradient></defs></svg>`}
const GLYPH={
  racket:'<g transform="rotate(-38 50 47)"><ellipse cx="50" cy="35" rx="11" ry="14" stroke-width="4"/><path d="M44 30h12M43 36h14M45 42h10M50 22v26M45 25v20M55 25v20" stroke-width="1.4" opacity=".75"/><path d="M50 49v20" stroke-width="5.5"/></g>',
  shuttle:'<g transform="rotate(28 50 47)"><path d="M38 24h24l-7 27H45z" fill="currentColor" fill-opacity=".22" stroke-width="3" stroke-linejoin="round"/><path d="M46 24l2 27M54 24l-2 27M38 34h24" stroke-width="1.8"/><circle cx="50" cy="60" r="8.5" fill="currentColor" stroke="none"/></g>',
  grip:'<rect x="42" y="20" width="16" height="52" rx="7" stroke-width="4"/><path d="M42 33l16-7M42 43l16-7M42 53l16-7M42 63l16-7" stroke-width="2.4"/>',
  eye:'<path d="M24 47q26-26 52 0q-26 26-52 0z" stroke-width="4" stroke-linejoin="round"/><circle cx="50" cy="47" r="9" fill="currentColor" stroke="none"/><circle cx="46.5" cy="43.5" r="2.6" fill="rgba(0,0,0,.35)" stroke="none"/>',
  bolt:'<path d="M56 20 35 52h14l-4 25 22-34H53z" fill="currentColor" stroke="none"/>',
  arrows:'<path d="M27 47h46M27 47l9-9M27 47l9 9M73 47l-9-9M73 47l-9 9" stroke-width="5" stroke-linejoin="round"/><circle cx="50" cy="47" r="4.5" fill="currentColor" stroke="none"/>',
  net:'<path d="M26 32h48v22H26z" stroke-width="3.2"/><path d="M26 43h48M38 32v22M50 32v22M62 32v22" stroke-width="1.8"/><path d="M26 30v40M74 30v40" stroke-width="4.5"/>',
  loop:'<path d="M33 47c0-8 7-12 13-6l8 12c6 6 13 2 13-6s-7-12-13-6l-8 12c-6 6-13 2-13-6z" stroke-width="5" stroke-linejoin="round"/>'};
const GL={grip:'grip',airtoss:'racket',keeplift:'racket',lowserve:'shuttle',gripchange:'grip',forecourt:'arrows',hawkeye:'eye',highserve:'shuttle',drive:'racket',overhead:'bolt',shadow:'arrows',fhfront:'shuttle',netking:'net',rearcourt:'racket',consistency:'loop',bhflick:'shuttle'};
const glyph=(id,col,dy=0)=>`<g transform="translate(50 ${45+dy}) scale(.74) translate(-50 -47)" fill="none" stroke="currentColor" stroke-linecap="round" style="color:${col}">${GLYPH[GL[id]]||GLYPH.racket}</g>`;
function badgeSVG(s,e,{pop=false}={}){
  const o=e?e.sk[s.id]:null,earned=!!(o&&o.earned),T=rules.threshold,t=s.tier;
  const passed=e?s.videos.filter(v=>(e.best[v.id]??0)>=T).length:0,n=s.videos.length;
  const pips=s.videos.map((v,i)=>`<circle cx="${50+(i-(n-1)/2)*9}" cy="83" r="2.9" fill="${i<passed?(earned?'#fff':`url(#face-${t})`):'var(--line)'}"/>`).join('');
  const rib=`<path d="M25 76h50l-5 7 5 7H25l5-7z" fill="${earned?`url(#rib-${t})`:'var(--surface)'}" stroke="${earned?'rgba(0,0,0,.18)':'var(--line)'}" stroke-width="1.2"/>`;
  if(earned)return `<svg viewBox="0 0 100 100" class="bdg on ${pop?'pop':''}" role="img" aria-label="${portalEscape(s.name)} badge earned">
    <polygon points="${HEXO}" fill="url(#rim-${t})"/><polygon points="${HEXI}" fill="url(#face-${t})"/>
    <polygon points="${HEXR}" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="1.4"/>
    ${glyph(s.id,'rgba(0,0,0,.32)',1.8)}${glyph(s.id,'#fff')}
    <path d="M50 10.5 85.3 30.7V40Q50 51 14.7 40V30.7Z" fill="url(#gloss)"/>${rib}${pips}</svg>`;
  return `<svg viewBox="0 0 100 100" class="bdg" role="img" aria-label="${portalEscape(s.name)} badge not earned, ${passed} of ${n} videos passed">
    <polygon points="${HEXO}" fill="url(#rim-off)" opacity=".5"/><polygon points="${HEXI}" fill="var(--surface-2)"/>
    ${passed?`<polygon points="${HEXI}" fill="none" stroke="url(#rim-${t})" stroke-width="3"/>`:''}
    <g opacity="${passed?.75:.45}">${glyph(s.id,passed?`var(--t-${t})`:'var(--subtle)')}</g>${rib}${pips}</svg>`}
function emblem(L,got){const t=L.id;
  const star='M50 47l4.6 9.4 10.4 1.5-7.5 7.3 1.8 10.3L50 70.6l-9.3 4.9 1.8-10.3-7.5-7.3 10.4-1.5z';
  return `<svg viewBox="0 0 100 110" class="em" aria-hidden="true">
   <path d="M27 2h19l9 38H37z" fill="${got?`url(#rib-${t})`:'var(--line)'}"/><path d="M54 2h19L63 40H45z" fill="${got?`url(#face-${t})`:'var(--sunk)'}"/>
   <path d="M36 2h4l8 36h-4zM60 2h4l-8 36h-4z" fill="#fff" opacity="${got?.35:.5}"/>
   ${got?'<ellipse cx="50" cy="104" rx="26" ry="3.5" fill="#000" opacity=".15"/>':''}
   <circle cx="50" cy="66" r="34" fill="${got?`url(#rim-${t})`:'url(#rim-off)'}" opacity="${got?1:.55}"/>
   <circle cx="50" cy="66" r="27" fill="${got?`url(#face-${t})`:'var(--surface-2)'}"/>
   <circle cx="50" cy="66" r="23" fill="none" stroke="${got?'#fff':'var(--line)'}" stroke-opacity=".5" stroke-width="1.3" stroke-dasharray="1.5 2.6"/>
   ${got?`<path d="${star}" transform="translate(0 6.6)" fill="rgba(0,0,0,.3)"/>`:''}
   <path d="${star}" transform="translate(0 5)" fill="${got?'#fff':'var(--line)'}"/>
   ${got?'<path d="M25 60a25 25 0 0 1 50 0q-25 9-50 0z" fill="url(#gloss)"/>':''}</svg>`}
const IC={plus:'<path d="M8 3v10M3 8h10"/>',search:'<circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5 14 14"/>',
  rows:'<path d="M2 4h12M2 8h12M2 12h12"/>',cards:'<rect x="2" y="2" width="5" height="5" rx="1.2"/><rect x="9" y="2" width="5" height="5" rx="1.2"/><rect x="2" y="9" width="5" height="5" rx="1.2"/><rect x="9" y="9" width="5" height="5" rx="1.2"/>',
  cal:'<rect x="2" y="3" width="12" height="11" rx="1.6"/><path d="M2 6.5h12M5 1.5v3M11 1.5v3"/>',share:'<path d="M10.2 4.6 5.8 7.2M5.8 8.8l4.4 2.6"/><circle cx="12" cy="3.6" r="1.9"/><circle cx="4" cy="8" r="1.9"/><circle cx="12" cy="12.4" r="1.9"/>',
  alert:'<path d="M8 2.2 14.5 13.5h-13z"/><path d="M8 6.5v3M8 11.6v.1"/>',chev:'<path d="M4 6l4 4 4-4"/>',close:'<path d="M4 4l8 8M12 4l-8 8"/>',
  pin:'<path d="M8 14.5s4.8-4.4 4.8-8.1a4.8 4.8 0 0 0-9.6 0c0 3.7 4.8 8.1 4.8 8.1z"/><circle cx="8" cy="6.4" r="1.7"/>',
  whistle:'<circle cx="6" cy="9.5" r="3.6"/><path d="M8.6 7 14 4.5V8l-4.2 1.4"/>',
  user:'<circle cx="8" cy="5.5" r="2.8"/><path d="M2.5 14c.6-3 2.8-4.5 5.5-4.5s4.9 1.5 5.5 4.5"/>',check:'<path d="M3 8.5 6.5 12 13 4.5"/>',
  clock:'<circle cx="8" cy="8" r="6"/><path d="M8 4.8V8l2.2 1.5"/>',building:'<path d="M2.5 14V3.5l6-1.5v12M8.5 6l5 1.5V14M1.5 14h13M5 6v.1M5 9v.1M11 10v.1"/>'};
const ic=(n,s=14)=>`<svg width="${s}" height="${s}" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[n]}</svg>`;
const lvlChip=i=>{const g=stageOf(i);return `<span class="lvl ${g.id}"><i></i>${g.name}</span>`};
const initials=n=>portalEscape(n.split(' ').map(x=>x[0]).join('').slice(0,2));
function strip(e){return `<div class="strip" aria-label="${e.earnedCount} of 16 badges">${LEVELS.map(L=>`<span>${skillsOf(L.id).map(s=>{
  const o=e.sk[s.id],p=s.videos.some(v=>(e.best[v.id]??0)>=rules.threshold);return `<i style="--c:var(--t-${L.id})" class="${o.earned?'on':p?'half':''}" title="${portalEscape(s.name)}"></i>`}).join('')}</span>`).join('')}</div>`}
const ICON={
  overview:'<path d="M2 2h5v6H2zM9 2h5v3H9zM9 7h5v7H9zM2 10h5v4H2z"/>',
  students:'<circle cx="6" cy="5" r="2.6"/><path d="M1.5 14c0-2.8 2-4.5 4.5-4.5s4.5 1.7 4.5 4.5z"/><circle cx="11.5" cy="5.5" r="2"/><path d="M11 9.6c2 0 3.6 1.4 3.6 4.4h-3c0-1.8-.3-3.2-1.4-4.2z"/>',
  planner:'<path d="M2 3h12v11H2zM2 6h12" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M5 1v3M11 1v3" stroke="currentColor" stroke-width="1.6"/><rect x="4" y="8" width="3" height="2.5"/>',
  dayplan:'<circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8 4.5V8l2.5 1.6" fill="none" stroke="currentColor" stroke-width="1.6"/>',
  team:'<circle cx="8" cy="4.6" r="2.5"/><path d="M3.6 13.5c0-2.7 2-4.4 4.4-4.4s4.4 1.7 4.4 4.4z"/><circle cx="2.9" cy="7.2" r="1.6"/><circle cx="13.1" cy="7.2" r="1.6"/>',
  mapping:'<circle cx="3" cy="3.5" r="1.6"/><circle cx="3" cy="8" r="1.6"/><circle cx="3" cy="12.5" r="1.6"/><rect x="7" y="5.5" width="3.5" height="5" rx="1"/><path d="M13 6.5l2 1.5-2 1.5z"/><path d="M4.5 3.5 7 7M4.5 8H7M4.5 12.5 7 9" stroke="currentColor" stroke-width="1.2" fill="none"/><path d="M10.5 8h2.5" stroke="currentColor" stroke-width="1.4"/>',
  settings:'<path d="M8 5.2a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 0 0 0-5.6zm6 3.6V7.2l-1.7-.4a4.6 4.6 0 0 0-.5-1.2l.9-1.5-1.1-1.1-1.5.9a4.6 4.6 0 0 0-1.2-.5L8.8 1.7H7.2l-.4 1.7a4.6 4.6 0 0 0-1.2.5l-1.5-.9L3 4.1l.9 1.5a4.6 4.6 0 0 0-.5 1.2l-1.7.4v1.6l1.7.4c.1.4.3.8.5 1.2l-.9 1.5 1.1 1.1 1.5-.9c.4.2.8.4 1.2.5l.4 1.7h1.6l.4-1.7c.4-.1.8-.3 1.2-.5l1.5.9 1.1-1.1-.9-1.5c.2-.4.4-.8.5-1.2z" fill-rule="evenodd"/>',
  curriculum:'<path d="M2 3c2-1 4-1 6 .5C10 2 12 2 14 3v10c-2-1-4-1-6 .5C6 12 4 12 2 13z" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 3.5v10" stroke="currentColor" stroke-width="1.5"/>'};

/* ---------------- nav ---------------- */
function navItems(){const k=roleKind();
  if(k==='admin')return [['overview','Academy overview'],['students','Players'],['team','Coaches & venues'],['planner','Assessment planner'],['curriculum','Curriculum & rules'],['mapping','Skill mapping'],['settings','Settings']];
  if(k==='head')return [['overview','Academy overview'],['students','Players'],['team','Coaches & venues'],['planner','Assessment planner']];
  return [['students','My players'],['dayplan','Day plan'],['planner','Assessment planner']]}
function renderNav(){
  const items=navItems();if(!items.some(i=>i[0]===ui.view))ui.view=items[0][0];
  const att=visible().filter(s=>ev(s).attention.length).length;
  document.getElementById('nav').innerHTML=`<div class="eyebrow">${roleKind()==='assistant'?'Coach':roleKind()==='head'?'Head coach':'Academy account'}</div>`+
   items.map(([id,l])=>`<button class="nav ${ui.view===id?'on':''}" data-act="view" data-v="${id}"><svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">${ICON[id]}</svg>${l}${id==='students'&&att?`<span class="pill danger num">${att}</span>`:''}</button>`).join('');
  document.getElementById('clock').textContent='Today · '+fmt(state.today,{weekday:'short',day:'numeric',month:'short',year:'numeric'});
}

/* ---------------- views ---------------- */
function vOverview(){
  const list=visible(),k=roleKind(),mk=monthKey(state.today);
  const evs=list.map(ev),dist=[-1,0,1,2,3].map(i=>evs.filter(e=>e.level===i).length);
  const monthSkill=evs.reduce((a,e)=>a+e.timeline.filter(t=>t.kind==='skill'&&monthKey(t.date)===mk).length,0);
  const monthLevel=evs.reduce((a,e)=>a+e.timeline.filter(t=>t.kind==='level'&&monthKey(t.date)===mk).length,0);
  const att=list.filter(s=>ev(s).attention.length);
  const months=['2026-09','2026-10','2026-11'].concat(mk>'2026-11'?[mk]:[]);
  const assist=coachList();
  const per=assist.map(c=>({c,m:months.map(m=>state.students.filter(s=>s.coachId===c.id).reduce((a,s)=>a+ev(s).timeline.filter(t=>t.kind==='skill'&&monthKey(t.date)===m).length,0)),n:state.students.filter(s=>s.coachId===c.id).length}));
  const maxPer=Math.max(1,...per.flatMap(p=>p.m));
  const segC=STAGES.map(g=>`var(--t-${g.id})`),segL=STAGES.map(g=>g.name);
  const upcoming=assessmentDays(state.today,4);
  return `<div class="wrap overview-workspace">
  <div class="head"><div class="grow"><div class="eyebrow">PSB Academy · ${VENUES.length} venues</div><h1>Academy overview</h1>
</div>
</div>

  <div class="grid g4">
   <button class="card kpi kpi-action" data-act="overviewPlayers" data-f="all"><span class="metric-label">Academy roster</span><div class="v num">${list.length}</div><div class="l">Active students <span aria-hidden="true">↗</span></div></button>
   <button class="card kpi kpi-action" data-act="insight" data-kind="skill"><span class="metric-label">This month</span><div class="v num">${monthSkill}</div><div class="l">Skill badges earned in ${fmt(state.today+'',{month:'long'})} <span aria-hidden="true">↗</span></div></button>
   <button class="card kpi kpi-action" data-act="insight" data-kind="level"><span class="metric-label">This month</span><div class="v num">${monthLevel}</div><div class="l">Level-ups in ${fmt(state.today,{month:'long'})} <span aria-hidden="true">↗</span></div></button>
   <button class="card kpi kpi-action" data-act="overviewPlayers" data-f="attention"><span class="metric-label">Coaching priority</span><div class="v num" style="color:${att.length?'var(--danger)':'inherit'}">${att.length}</div><div class="l">Need attention <span aria-hidden="true">↗</span></div></button>
  </div>

  <div class="card overview-levels"><div class="ch"><div class="grow"><h2>Where students stand</h2></div><span class="pill num">${list.length} students</span></div>
   ${(()=>{const idx=[0,1,2,3].concat(dist[4]?[4]:[]),tot=Math.max(1,list.length);
    return `<div class="dstats" style="grid-template-columns:repeat(${idx.length},minmax(0,1fr))">${idx.map(i=>{const g=STAGES[i],p=Math.round(dist[i]/tot*100);return `<button class="dcard ${dist[i]?'':'zero'}" data-act="overviewPlayers" data-f="${i-1}" style="--c:var(--t-${g.id})" aria-label="View ${dist[i]} ${g.name} players">
      <span class="level-art">${emblem(g,dist[i]>0)}</span><span class="level-copy"><strong>${portalEscape(g.name)}</strong><small>${p}% of students</small></span><b class="num">${dist[i]}</b><span class="level-open" aria-hidden="true">↗</span></button>`}).join('')}</div>`})()}<details class="overview-help"><summary>Progression rules</summary><p>Everyone starts at Spark and moves up one badge per finished column.</p></details></div>
  <div class="grid g32 overview-analysis">
   <div class="card overview-coach"><div class="ch"><h2 class="grow">Skill badges earned by each coach’s students</h2><span class="muted">per month</span></div>
    <div class="cols">${per.map(p=>`<div class="grp"><div class="bars">${p.m.map((v,i)=>`<button class="bar" data-act="insight" data-kind="skill" data-coach="${p.c.id}" data-month="${months[i]}" aria-label="${portalEscape(p.c.name)}, ${fmt(months[i]+'-01',{month:'short'})}: ${v} skill badges" style="height:${Math.max(3,v/maxPer*96)}px;background:var(--brand);opacity:${.4+.6*(i+1)/p.m.length}" title="${fmt(months[i]+'-01',{month:'short'})}: ${v}"><span class="num">${v}</span></button>`).join('')}</div><small><b>${portalEscape(p.c.name.split(' ')[0])}</b> · ${p.n} kids</small></div>`).join('')}</div>
    <div class="legend">${months.map((m,i)=>`<span><i style="background:var(--brand);opacity:${.4+.6*(i+1)/months.length}"></i>${fmt(m+'-01',{month:'short'})}</span>`).join('')}</div><details class="overview-help"><summary>About this comparison</summary><p>Fixed assessment days stop end-of-month cramming, so this is a fair comparison.</p></details></div>
   <div class="card overview-calendar"><h2>Next assessment days</h2><div class="list">${upcoming.map(d=>{const L=levelForDate(d),n=(state.plans[d]||[]).length,rec=recommend(d).rec.length;
     return `<div class="li"><span class="lvl ${L.id}"><i></i>${L.name}</span><div class="grow"><b>${fmt(d)}</b><small>${n?n+' booked':'Nothing booked'} · ${rec} recommended</small></div><button class="btn sm" data-act="plan" data-d="${d}">Plan</button></div>`}).join('')}</div></div>
  </div>
  <div class="grid g2">
   <div class="card"><div class="ch"><h2 class="grow">Current Badge Status</h2><span class="muted">% of students holding each badge</span></div>
    <div class="hbars">${LEVELS.map(L=>`<div class="t" style="color:var(--t-${L.id})">${L.name}</div>`+skillsOf(L.id).map(s=>{const n=evs.filter(e=>e.sk[s.id].earned).length,p=list.length?Math.round(n/list.length*100):0;
      return `<button class="hbar-name" data-act="insight" data-kind="badge" data-s="${s.id}">${portalEscape(s.name)}</button><button class="track hbar-track" data-act="insight" data-kind="badge" data-s="${s.id}" aria-label="${portalEscape(s.name)}: ${n} of ${list.length} players"><span style="width:${p}%;background:var(--t-${L.id})"></span></button><b class="num" style="text-align:right">${p}%</b>`}).join('')).join('')}</div></div>
   <div class="card"><h2>Needs attention</h2>${att.length?`<div class="list">${att.map(s=>{const e=ev(s);return `<div class="li"><div class="av">${initials(s.name)}</div><div class="grow"><b>${portalEscape(s.name)}</b><small>${e.attention.map(x=>`${portalEscape(x.name)} · failed ${e.sk[x.id].streak}× in a row`).join(', ')} · ${portalEscape(CO[s.coachId].name)}</small></div><button class="btn sm" data-act="prof" data-id="${s.id}">Open</button></div>`}).join('')}</div>
    <details class="overview-help"><summary>What needs attention means</summary><p>These kids have already been through the drills and failed the same skill twice. The coach gets an alert, and the central team can send a coaching note.</p></details>`:`<div class="empty">No one is stuck right now.</div>`}</div>
  </div></div>`}

const pct=e=>Math.round(e.earnedCount/16*100);
const avRing=(s,e)=>`<div class="pav" style="--c:var(--t-${stageOf(e.level).id});--p:${pct(e)}"><span>${initials(s.name)}</span></div>`;
function playerFlags(s,e){const u=unNotified(s).length;return `${e.attention.length?`<span class="flag danger" title="Needs attention: ${portalEscape(e.attention.map(x=>x.name).join(', '))}">${ic('alert',13)}</span>`:''}${false&&u?`<span class="flag info" title="${u} new ${u>1?'badges':'badge'} to share">${ic('share',13)}</span>`:''}${!s.attempts.length?`<span class="flag mute" title="Not assessed yet">${ic('clock',13)}</span>`:''}`}
function nextTxt(n){return n?`${fmt(n.date,{day:'numeric',month:'short'})} · ${n.level.name}${n.booked?' · booked':''}`:'All 16 earned'}
function coachCell(s,k){
  if(k==='head')return `<select data-coach="${s.id}" aria-label="Coach for ${portalEscape(s.name)}">${coachList().map(c=>`<option value="${c.id}" ${c.id===s.coachId?'selected':''}>${portalEscape(c.name)}</option>`).join('')}</select>`;
  return `<span class="cell-main">${portalEscape(CO[s.coachId].name)}</span>`}
function playerRow(s,k){const e=ev(s),n=nextAssessment(s),W=e.working>=0?LEVELS[e.working]:null,g=stageOf(e.level),nx=W?STAGES[W.idx+1]:g;
  const got=W?skillsOf(W.id).filter(x=>e.sk[x.id].earned).length:4;
  return `<div class="prow" data-act="prof" data-id="${s.id}" tabindex="0" role="button" aria-label="Open ${portalEscape(s.name)}">
   <div class="who">${avRing(s,e)}<div style="min-width:0"><b>${portalEscape(s.name)}</b><span class="cell-sub">Age ${s.age} · ${ic('pin',11)} ${VE[s.venue].name}</span></div></div>
   <div class="c-coach">${coachCell(s,k)}<span class="cell-sub">${portalEscape(CO[s.coachId].batch)}</span></div>
   <div class="c-prog" style="--c:var(--t-${nx.id})"><div class="prog-line">${lvlChip(e.level)}<div class="bar">${[0,1,2,3].map(i=>`<i class="${i<got?'on':''}"></i>`).join('')}</div><b class="num">${e.earnedCount}<span class="subtle">/16</span></b></div>
    <span class="cell-sub">${W?`${got}/4 toward ${awardTxt(W)}`:'All 16 skills done'}</span></div>
   <div class="c-next"><span class="cell-main">${n?fmt(n.date,{weekday:'short',day:'numeric',month:'short'}):'—'}</span><span class="cell-sub">${n?n.level.name+' day'+(n.booked?' · booked':''):'All 16 earned'}</span></div>
   <div class="flags">${playerFlags(s,e)}</div></div>`}
function playerCard(s,k){const e=ev(s),n=nextAssessment(s),g=stageOf(e.level),W=e.working>=0?LEVELS[e.working]:null;
  const got=W?skillsOf(W.id).filter(x=>e.sk[x.id].earned).length:4,nx=W?STAGES[W.idx+1]:g;
  return `<article class="pc" style="--c:var(--t-${g.id});--cs:var(--t-${g.id}-soft)" data-act="prof" data-id="${s.id}" tabindex="0" role="button" aria-label="Open ${portalEscape(s.name)}">
   <div class="pc-top">${avRing(s,e)}<div class="grow"><b>${portalEscape(s.name)}</b><small>Age ${s.age} · ${VE[s.venue].name} · ${portalEscape(CO[s.coachId].name.split(' ')[0])}</small></div>${emblem(g,true)}</div>
   <div class="pc-stage"><span class="s">${g.name}</span><span class="num">${e.earnedCount}<i>/16</i></span></div>
   <div style="--c:var(--t-${nx.id})"><div class="cell-sub" style="margin:0 0 4px">${W?`${got}/4 toward <b style="color:var(--fg)">${awardTxt(W)}</b>`:'All 16 skills done'}</div><div class="prog"><div style="width:${got/4*100}%"></div></div></div>
   <div class="pc-badges">${LEVELS.map(L=>`<div>${skillsOf(L.id).map(x=>badgeSVG(x,e)).join('')}</div>`).join('')}</div>
   <div class="pc-foot">${ic('cal',13)}<span>${n?`Next <b>${nextTxt(n)}</b>`:'<b>All 16 earned</b>'}</span><span class="grow"></span><span class="flags">${playerFlags(s,e)}</span></div></article>`}
function vStudents(){
  const k=roleKind(),all=visible();
  let list=all.filter(s=>s.name.toLowerCase().includes(ui.q.toLowerCase()));
  if(ui.venueF!=='all')list=list.filter(s=>s.venue===ui.venueF);
  if(k!=='assistant'&&ui.coachF!=='all')list=list.filter(s=>s.coachId===ui.coachF);
  const f=ui.filter;
  if(f==='attention')list=list.filter(s=>ev(s).attention.length);
  else if(f==='share')list=list.filter(s=>unNotified(s).length);
  else if(f!=='all')list=list.filter(s=>ev(s).level===Number(f));
  const sorters={progress:(a,b)=>ev(b).earnedCount-ev(a).earnedCount||a.name.localeCompare(b.name),name:(a,b)=>a.name.localeCompare(b.name),
    next:(a,b)=>(nextAssessment(a)?.date||'9')<(nextAssessment(b)?.date||'9')?-1:(nextAssessment(a)?.date||'9')>(nextAssessment(b)?.date||'9')?1:a.name.localeCompare(b.name)};
  list.sort(sorters[ui.sort]);
  const share=all.filter(s=>unNotified(s).length),att=all.filter(s=>ev(s).attention.length),M=me();
  const myVenues=k==='assistant'?CO[ui.role].venues:VENUES.map(v=>v.id);
  const group=k==='assistant'&&ui.group==='coach'?'venue':ui.group;
  let groups;
  if(group==='venue')groups=VENUES.filter(v=>myVenues.includes(v.id)).map(v=>({key:v.id,title:v.name,sub:v.sub,icon:'pin',items:list.filter(s=>s.venue===v.id),
    meta:`${[...new Set(all.filter(s=>s.venue===v.id).map(s=>CO[s.coachId].name.split(' ')[0]))].join(', ')}`}));
  else if(group==='coach')groups=coachList().map(c=>({key:c.id,title:c.name,sub:c.batch,icon:'whistle',items:list.filter(s=>s.coachId===c.id),meta:c.venues.map(v=>VE[v].name).join(' · ')}));
  else groups=[{key:'all',title:null,items:list}];
  groups=groups.filter(g=>g.items.length);
  const tiles=[...STAGES.slice(0,4).map((g,i)=>({f:String(i-1),label:g.name,n:all.filter(s=>ev(s).level===i-1).length,html:emblem(g,true),c:`var(--t-${g.id})`,cs:`var(--t-${g.id}-soft)`})),
    {f:'attention',label:'Need attention',n:att.length,html:`<span class="ic">${ic('alert',16)}</span>`,c:'var(--danger)',cs:'var(--danger-soft)'}];
  const body=p=>ui.layout==='cards'?`<div class="pgrid">${p.map(s=>playerCard(s,k)).join('')}</div>`
    :`<div class="plist"><div class="plist-h"><span>Player</span><span>Coach</span><span>Badge progress</span><span>Next assessment</span><span style="text-align:right">Flags</span></div>${p.map(s=>playerRow(s,k)).join('')}</div>`;
  return `<div class="wrap">
  <div class="head"><div class="grow"><div class="eyebrow">${portalEscape(k==='assistant'?M.name+' · '+M.batch:'PSB Academy · '+VENUES.length+' venues')}</div><h1>${k==='assistant'?'My players':'Players'}</h1>
   <p>${k==='assistant'?'Only the players assigned to you, across your venues.':k==='head'?'Every player at every venue. Reassign a player to another coach from the list.':'Every player at every venue (read-only for badges).'}</p></div>
   <button class="btn primary" data-act="addPlayer">${ic('plus')}Add player</button></div>
  <div class="stages">${tiles.map(t=>`<button class="stg ${f===t.f?'on':''}" style="--c:${t.c};--cs:${t.cs}" data-act="filter" data-f="${f===t.f?'all':t.f}" aria-pressed="${f===t.f}">${t.html}<div class="t"><b class="num">${t.n}</b><small>${t.label}</small></div></button>`).join('')}</div>
  <div class="toolbar">
   <label class="sbox">${ic('search',15)}<input id="q" type="search" placeholder="Search players" value="${ui.q.replace(/"/g,'&quot;')}" aria-label="Search players"></label>
   ${myVenues.length>1?`<label class="sel">${ic('pin',13)}<select id="pVenue" aria-label="Venue"><option value="all">All venues</option>${VENUES.filter(v=>myVenues.includes(v.id)).map(v=>`<option value="${v.id}" ${ui.venueF===v.id?'selected':''}>${v.name}</option>`).join('')}</select></label>`:''}
   ${k!=='assistant'?`<label class="sel">${ic('whistle',13)}<select id="pCoach" aria-label="Coach"><option value="all">All coaches</option>${coachList().map(c=>`<option value="${c.id}" ${ui.coachF===c.id?'selected':''}>${portalEscape(c.name)}</option>`).join('')}</select></label>`:''}
   <span class="grow"></span>
   <div class="seg" role="group" aria-label="Group by">${[['venue','By venue'],...(k!=='assistant'?[['coach','By coach']]:[]),['none','No groups']].map(([v,l])=>`<button class="${group===v?'on':''}" data-act="group" data-g="${v}">${l}</button>`).join('')}</div>
   <label class="sel"><select id="pSort" aria-label="Sort"><option value="progress" ${ui.sort==='progress'?'selected':''}>Most badges</option><option value="name" ${ui.sort==='name'?'selected':''}>Name A–Z</option><option value="next" ${ui.sort==='next'?'selected':''}>Next assessment</option></select></label>
   <div class="seg" role="group" aria-label="Layout"><button class="${ui.layout==='list'?'on':''}" data-act="layout" data-l="list" aria-label="List">${ic('rows')}</button><button class="${ui.layout==='cards'?'on':''}" data-act="layout" data-l="cards" aria-label="Cards">${ic('cards')}</button></div>
  </div>
  <div class="roster-feedback"><span><b>${list.length}</b> of ${all.length} players${f==='attention'?' · needs attention':f!=='all'?' · '+stageOf(Number(f)).name:''}</span><span class="muted">Select a player to open their journey</span>${ui.q||ui.venueF!=='all'||ui.coachF!=='all'||f!=='all'?'<button class="text-action" data-act="resetFilters">Clear filters '+ic('close',12)+'</button>':''}</div>
  ${groups.length?groups.map(g=>`${g.title?`<div class="grp-h"><span class="grp-ic">${ic(g.icon,15)}</span><div><h2>${portalEscape(g.title)}</h2><div class="muted" style="font-size:12px">${portalEscape(g.sub)}${portalEscape(g.meta?' · '+g.meta:'')}</div></div><span class="ln"></span><span class="pill num">${g.items.length} ${g.items.length>1?'players':'player'}</span></div>`:''}${body(g.items)}`).join('')
   :`<div class="empty">No players match these filters.</div>`}
  </div>`}

function vTeam(){
  const k=roleKind(),mk=monthKey(state.today);
  const stat=ids=>{const kids=state.students.filter(ids);return {n:kids.length,m:kids.reduce((a,s)=>a+ev(s).timeline.filter(t=>t.kind==='skill'&&monthKey(t.date)===mk).length,0),att:kids.filter(s=>ev(s).attention.length).length}};
  const card=c=>{const x=c.role==='head'?stat(()=>true):stat(s=>s.coachId===c.id);
    return `<div class="card tc"><div class="top"><div class="av k-${c.role}">${initials(c.name)}</div><div class="grow"><h3>${portalEscape(c.name)}</h3><div class="muted" style="font-size:12px">${c.title} · ${portalEscape(c.batch)}</div></div>
     ${ui.role===c.id?'<span class="pill ok">You</span>':`<button class="btn sm" data-act="asRole" data-id="${c.id}">View as</button>`}</div>
     <div class="vchips">${c.venues.map(v=>`<span class="pill">${ic('pin',11)}${VE[v].name}</span>`).join('')}</div>
     <div class="stats"><div><b class="num">${x.n}</b><small>${c.role==='head'?'players overseen':'players'}</small></div><div><b class="num">${x.m}</b><small>badges in ${fmt(state.today,{month:'short'})}</small></div><div><b class="num" style="color:${x.att?'var(--danger)':'inherit'}">${x.att}</b><small>need attention</small></div></div></div>`};
  const heads=COACHES.filter(c=>c.role==='head'),coaches=coachList();
  return `<div class="wrap">
  <div class="head"><div class="grow"><div class="eyebrow">PSB Academy</div><h1>Coaches & venues</h1>
   <p>Three kinds of account. The academy account owns the academy and its rules. A head coach oversees every venue and assigns players to coaches. A coach sees only their own players and runs the day plan.</p></div>
   <button class="btn primary" data-act="addCoach">${ic('plus')}Add ${k==='admin'?'coach or head coach':'coach'}</button></div>
  <div class="card tc"><div class="top"><div class="av k-admin">PSB</div><div class="grow"><h3>${ACADEMY.name}</h3><div class="muted" style="font-size:12px">${ACADEMY.title} · ${ACADEMY.desc}</div></div>
   ${ui.role==='admin'?'<span class="pill ok">You</span>':''}</div>
   <div class="stats" style="grid-template-columns:repeat(4,1fr)"><div><b class="num">${state.students.length}</b><small>players</small></div><div><b class="num">${COACHES.length}</b><small>coaches</small></div><div><b class="num">${VENUES.length}</b><small>venues</small></div><div><b class="num">${stat(()=>true).m}</b><small>badges in ${fmt(state.today,{month:'short'})}</small></div></div></div>
  <div class="grp-h"><span class="grp-ic">${ic('user',15)}</span><h2>Head coach${heads.length>1?'es':''}</h2><span class="ln"></span></div>
  <div class="tgrid">${heads.map(card).join('')}</div>
  <div class="grp-h"><span class="grp-ic">${ic('whistle',15)}</span><h2>Coaches</h2><span class="ln"></span><span class="pill num">${coaches.length}</span></div>
  <div class="tgrid">${coaches.map(card).join('')}</div>
  <div class="grp-h"><span class="grp-ic">${ic('pin',15)}</span><h2>Venues</h2><span class="ln"></span></div>
  <div class="tgrid">${VENUES.map(v=>{const x=stat(s=>s.venue===v.id);return `<div class="card tc"><div class="top"><span class="grp-ic" style="width:44px;height:44px">${ic('building',20)}</span><div class="grow"><h3>${v.name}</h3><div class="muted" style="font-size:12px">${v.sub}</div></div><button class="btn sm" data-act="venueGo" data-v="${v.id}">Players</button></div>
    <div class="vchips">${COACHES.filter(c=>c.venues.includes(v.id)).map(c=>`<span class="pill">${portalEscape(c.name)}</span>`).join('')}</div>
    <div class="stats"><div><b class="num">${x.n}</b><small>players</small></div><div><b class="num">${x.m}</b><small>badges in ${fmt(state.today,{month:'short'})}</small></div><div><b class="num" style="color:${x.att?'var(--danger)':'inherit'}">${x.att}</b><small>need attention</small></div></div></div>`}).join('')}</div>
  </div>`}

function formHTML(){const F=ui.form,k=roleKind();
  if(F.type==='player'){const coaches=coachList().filter(c=>k!=='assistant'||c.id===ui.role);const vs=k==='assistant'?CO[ui.role].venues:VENUES.map(v=>v.id);
    return `<div class="dialog" role="dialog" aria-modal="true" aria-label="Add player" style="max-width:520px">
     <div class="dh"><div class="grow"><h2>Add player</h2><div class="muted" style="font-size:13px;margin-top:2px">Starts at Spark with the Beginner badge and 0 skill badges.</div></div><button class="x" data-act="closeForm" aria-label="Close">${ic('close')}</button></div>
     <div class="db form">
      <div class="field"><label for="fName">Player name</label><input id="fName" type="text" placeholder="e.g. Neel Varma" autocomplete="off"></div>
      <div class="row2"><div class="field"><label for="fAge">Age</label><input id="fAge" type="number" min="4" max="18" value="8"></div>
       <div class="field"><label for="fPhone">Parent's WhatsApp</label><input id="fPhone" type="text" placeholder="Optional" autocomplete="off"></div></div>
      <div class="row2"><div class="field"><label for="fVenue">Venue</label><select id="fVenue">${vs.map(v=>`<option value="${v}">${VE[v].name}</option>`).join('')}</select></div>
       <div class="field"><label for="fCoach">Coach</label><select id="fCoach" ${k==='assistant'?'disabled':''}>${coaches.map(c=>`<option value="${c.id}">${portalEscape(c.name)}</option>`).join('')}</select></div></div>
      <div class="note">Their first assessment is the next Spark day (${dayLabel('spark')}): <b>${fmt(nextDayFor(0,state.today))}</b>.</div>
      <div class="ch"><span class="grow"></span><button class="btn" data-act="closeForm">Cancel</button><button class="btn primary" data-act="saveForm">${ic('check')}Add player</button></div></div></div>`}
  return `<div class="dialog" role="dialog" aria-modal="true" aria-label="Add coach" style="max-width:520px">
   <div class="dh"><div class="grow"><h2>Add ${k==='admin'?'coach or head coach':'coach'}</h2><div class="muted" style="font-size:13px;margin-top:2px">They get their own login and see only what their role allows.</div></div><button class="x" data-act="closeForm" aria-label="Close">${ic('close')}</button></div>
   <div class="db form">
    <div class="field"><label for="fName">Name</label><input id="fName" type="text" placeholder="e.g. Sana Khan" autocomplete="off"></div>
    <div class="field"><label>Role</label><div class="radio" id="fRole">
     <label class="on"><input type="radio" name="frole" value="assistant" checked><span><b>Coach</b><br><span class="muted">Sees only their players, runs the day plan, books assessments, shares badges.</span></span></label>
     ${k==='admin'?`<label><input type="radio" name="frole" value="head"><span><b>Head coach</b><br><span class="muted">Sees every venue, assigns players to coaches, plans assessment days.</span></span></label>`:''}</div></div>
    <div class="field"><label>Venues</label><div class="vchips">${VENUES.map((v,i)=>`<label class="pill" style="cursor:pointer"><input type="checkbox" name="fven" value="${v.id}" ${i===0?'checked':''} style="accent-color:var(--brand)">${v.name}</label>`).join('')}</div></div>
    <div class="field"><label for="fBatch">Batch timing</label><input id="fBatch" type="text" placeholder="e.g. Mon · Wed, 6–7 pm" autocomplete="off"></div>
    <div class="ch"><span class="grow"></span><button class="btn" data-act="closeForm">Cancel</button><button class="btn primary" data-act="saveForm">${ic('check')}Add</button></div></div></div>`}

function recommend(d){
  const L=levelForDate(d),list=visible(),rec=[],stretch=[];
  for(const s of list){const e=ev(s);const missing=skillsOf(L.id).filter(x=>!e.sk[x.id].earned);if(!missing.length)continue;
    if(e.working===L.idx)rec.push({s,missing});else if(e.working<L.idx)stretch.push({s,missing})}
  return {L,rec,stretch}}
// Manual planner: dates and assignments; scoring remains in assessment workflows.
function plannerDateIsScheduled(date){return typeof date==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(date)&&!isNaN(D(date))&&iso(D(date))===date&&!!levelForDate(date)}
function plannerCompleted(student,date){const L=levelForDate(date);return !!L&&student.attempts.some(a=>a.date===date&&a.level===L.id)}
function plannerRoster(date){const ids=new Set(state.plans[date]||[]);return visible().filter(st=>ids.has(st.id)).sort((a,b)=>a.name.localeCompare(b.name))}
function plannerDates(){return [...new Set([...assessmentDays(state.today,8),...Object.keys(state.plans).filter(d=>plannerDateIsScheduled(d)&&plannerRoster(d).length)])].sort()}
function plannerStatus(date){const list=plannerRoster(date);return list.length&&list.every(st=>plannerCompleted(st,date))?'Completed':'Not completed'}
function plannerSaveAssignments(date,selected){
 if(!plannerDateIsScheduled(date)||!Array.isArray(selected))return false;
 const allowed=new Set(visible().map(st=>st.id)),old=state.plans[date]||[];
 if(selected.some(id=>!allowed.has(id)))return false;
 const preserved=old.filter(id=>!allowed.has(id)||(S(id)&&plannerCompleted(S(id),date)));
 state.plans[date]=[...new Set([...preserved,...selected])];return true;
}
function plannerRemoveStudent(date,id){
 if(!visible().some(st=>st.id===id)||!plannerDateIsScheduled(date)||plannerCompleted(S(id),date))return false;
 state.plans[date]=(state.plans[date]||[]).filter(x=>x!==id);return true;
}
function plannerOpenPicker(){
 if(!plannerDateIsScheduled(ui.planDay))return;
 ui.plannerPicker={date:ui.planDay,ids:new Set(plannerRoster(ui.planDay).map(st=>st.id)),query:''};renderModal();
 document.getElementById('plannerStudentSearch')?.focus();
}
function plannerPickerHTML(){
 const p=ui.plannerPicker,L=levelForDate(p.date),list=visible().filter(st=>st.name.toLowerCase().includes(p.query.toLowerCase())).sort((a,b)=>a.name.localeCompare(b.name));
 return `<div class="dialog planner-picker" role="dialog" aria-modal="true" aria-labelledby="planner-picker-title"><div class="dh"><div class="grow"><div class="eyebrow">${L.name} assessment · ${fmt(p.date)}</div><h2 id="planner-picker-title">Add students</h2><p class="muted">Choose the students assigned to this assessment.</p></div><button class="x" data-act="closePlannerPicker" aria-label="Cancel adding students">${ic('close')}</button></div><div class="db"><label class="planner-search"><span>Search students</span><input id="plannerStudentSearch" type="search" value="${portalEscape(p.query)}" placeholder="Search by name" autocomplete="off"></label><div class="planner-picker-list">${list.length?list.map(st=>{const complete=plannerCompleted(st,p.date),on=p.ids.has(st.id);return `<label class="planner-picker-row"><input type="checkbox" data-planner-student="${st.id}" ${on?'checked':''} ${complete&&on?'disabled':''}><span class="av">${initials(st.name)}</span><span class="grow"><b>${portalEscape(st.name)}</b><small>${portalEscape(VE[st.venue].name)} · ${portalEscape(CO[st.coachId].name)}</small></span>${complete&&on?'<span class="pill ok">Completed</span>':''}</label>`}).join(''):'<p class="empty">No students match this search.</p>'}</div></div><footer class="dialog-footer"><span id="plannerPickerCount" class="muted">${p.ids.size} selected</span><div class="planner-picker-actions"><button class="btn" data-act="closePlannerPicker">Cancel</button><button class="btn primary" data-act="savePlannerStudents">Save students</button></div></footer></div>`;
}
function vPlanner(){
 const days=plannerDates(),upcoming=assessmentDays(state.today,1)[0];if(!ui.planDay||!days.includes(ui.planDay))ui.planDay=upcoming;
 const d=ui.planDay,L=levelForDate(d),list=plannerRoster(d),status=plannerStatus(d);
 return `<div class="wrap portal-planner simple-planner"><div class="head"><div class="grow"><div class="eyebrow">Academy schedule</div><h1>Assessment planner</h1><p>Select an assessment day, add students and follow their completion status.</p></div>${roleKind()==='admin'?`<button class="btn" data-act="view" data-v="settings">${ic('cal',14)}Edit assessment days</button>`:''}</div><div class="split planner-layout"><div class="days" aria-label="Assessment dates">${days.map(date=>{const level=levelForDate(date),roster=plannerRoster(date);return `<button class="day ${date===d?'on':''}" data-act="plan" data-d="${date}" aria-pressed="${date===d}"><span class="date"><small>${fmt(date,{month:'short'})}</small><b>${D(date).getUTCDate()}</b></span><span class="grow"><span class="lvl ${level.id}"><i></i>${level.name} assessment</span><span class="planner-date-meta">${roster.length} ${roster.length===1?'student':'students'}${roster.length?' · '+plannerStatus(date):''}</span></span></button>`}).join('')}</div><section class="card planner-assignment"><header class="planner-assignment-head"><div><div class="eyebrow">${fmt(d,{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</div><h2>${L.name} assessment</h2><p>${list.length} ${list.length===1?'student':'students'} assigned</p></div><button class="btn primary" data-act="addPlannerStudents">${ic('plus',15)}Add students</button></header><div class="planner-assessment-skills"><span>Assessment skills</span><p>${skillsOf(L.id).map(sk=>portalEscape(sk.name)).join(' · ')}</p></div>${list.length?`<div class="planner-roster-heading"><h3>Assigned students</h3><span class="pill ${status==='Completed'?'ok':''}">${status}</span></div><div class="planner-assigned-list">${list.map(st=>{const complete=plannerCompleted(st,d);return `<div class="planner-assigned-row" data-planner-assigned="${st.id}"><button class="planner-student" data-act="prof" data-id="${st.id}"><span class="av">${initials(st.name)}</span><span><b>${portalEscape(st.name)}</b><small>${L.name} assessment</small></span></button><span class="pill ${complete?'ok':'pending'}">${complete?'Completed':'Not completed'}</span>${complete?`<button class="btn sm" data-act="plannerHistory" data-id="${st.id}">View history</button>`:`<button class="planner-remove" data-act="removePlannerStudent" data-id="${st.id}" aria-label="Remove ${portalEscape(st.name)} from this assessment">${ic('close',15)}</button>`}</div>`}).join('')}</div>`:`<div class="planner-empty"><span>${ic('user',28)}</span><h3>No students assigned</h3><p>Add the students who will take this ${L.name} assessment.</p></div>`}</section></div></div>`;
}

// Day-plan exception to the reference: group by the next unearned badge, never by level.
function dayBadgeGroups(students){
 const badges=[...SKILLS].sort((a,b)=>a.order-b.order),byBadge=new Map(),complete=[],seen=new Set();
 for(const student of students){
  if(seen.has(student.id))continue;seen.add(student.id);
  const progress=ev(student),badge=badges.find(sk=>!progress.sk[sk.id]?.earned);
  if(!badge){complete.push(student);continue;}
  if(!byBadge.has(badge.id))byBadge.set(badge.id,{badge,kids:[],failed:[]});
  const group=byBadge.get(badge.id),record=progress.sk[badge.id];group.kids.push(student);
  if(record?.history.length&&!record.lastPass)group.failed.push(student);
 }
 const groups=[...byBadge.values()].sort((a,b)=>b.kids.length-a.kids.length||b.failed.length-a.failed.length||a.badge.order-b.badge.order);
 for(const group of groups)group.kids.sort((a,b)=>a.name.localeCompare(b.name));
 return {groups,complete};
}
function vDayPlan(){
 const me=CO[ui.role],mine=visible(),present=mine.filter(s=>!ui.absent.has(s.id)),{groups,complete}=dayBadgeGroups(present),next=assessmentDays(state.today,1)[0],nl=levelForDate(next),due=recommend(next).rec.length;
 return `<div class="wrap day-plan-workspace">
 <div class="head"><div class="grow"><div class="eyebrow">${portalEscape(me.name)} · ${portalEscape(me.batch)}</div><h1>Day plan</h1><p>Groups today's players by their next unearned skill badge. Players with the same badge gap train together, regardless of their current level. Each player has one suggested focus. Drills come from the PSB curriculum.</p></div></div>
 <div class="card"><div class="ch"><h3 class="grow">Who's here today?</h3><span class="muted">${present.length} of ${mine.length} present · tap to mark absent</span></div><div class="att">${mine.map(s=>`<button class="${ui.absent.has(s.id)?'off':''}" data-act="absent" data-id="${s.id}" aria-pressed="${!ui.absent.has(s.id)}"><span class="av">${initials(s.name)}</span>${portalEscape(s.name.split(' ')[0])}</button>`).join('')}</div></div>
 ${due?`<div class="banner info"><b>${fmt(next)} is ${nl.name} day.</b>&nbsp;${due} of your students are recommended.<span style="flex:1"></span><button class="btn sm" data-act="plan" data-d="${next}">Open planner</button></div>`:''}
 ${groups.length?`<div class="groups day-badge-groups">${groups.map((g,i)=>`<section class="card day-badge-group ${i===0?'day-badge-group-priority':''}" data-day-badge="${g.badge.id}"><header class="day-badge-header"><button class="day-badge-art" data-act="badgeDetail" data-s="${g.badge.id}" aria-label="View ${portalEscape(g.badge.name)} skill">${badgeSVG(g.badge,null)}</button><div class="day-badge-heading"><div class="day-badge-kicker">Badge group ${String(i+1).padStart(2,'0')}${i===0?'<span class="day-badge-priority">Suggested focus</span>':''}</div><h2><button class="badge-title-link" data-act="badgeDetail" data-s="${g.badge.id}">${portalEscape(g.badge.name)} <span aria-hidden="true">↗</span></button></h2></div><span class="day-badge-count"><strong>${g.kids.length}</strong><span>${g.kids.length===1?'player':'players'}</span></span></header><div class="day-badge-target"><span class="day-badge-label">Teaching target</span><p class="day-badge-standard">${portalEscape(g.badge.std)}</p></div><div class="day-badge-roster-header"><span class="day-badge-label">Players</span>${g.failed.length?`<span class="day-badge-support">${g.failed.length} ${g.failed.length===1?'needs':'need'} support</span>`:''}</div><div class="day-badge-roster">${g.kids.map(s=>`<button class="kid ${g.failed.includes(s)?'f':''}" data-act="prof" data-id="${s.id}" data-day-student="${s.id}" title="Open ${portalEscape(s.name)} profile"><span class="day-player-avatar" aria-hidden="true">${initials(s.name)}</span><span class="day-player-details"><strong>${portalEscape(s.name)}</strong><small>${stageOf(ev(s).level).name}${g.failed.includes(s)?' · needs support':''}</small></span><span class="day-player-arrow" aria-hidden="true">›</span></button>`).join('')}</div>${g.kids.some(s=>!s.attempts.length)?'<p class="day-badge-new">New players start with their first unearned badge.</p>':''}</section>`).join('')}</div>`:''}
 ${complete.length?`<div class="card day-badge-complete"><b>${portalEscape(complete.map(s=>s.name).join(', '))}</b> <span class="muted">${complete.length===1?'has':'have'} all ${SKILLS.length} skill badges. Continue practice using the curriculum.</span></div>`:''}
 ${!present.length?'<div class="empty">Nobody marked present.</div>':''}
 </div>`;
}

const QUESTIONS=[
  ['Coach-awarded skill badges','The sheet says a coach can award a skill badge when they see a kid perform it (“prodigy” badge). The workshop said only AI-scored videos change badges. Which wins?'],
  ['Pass mark','What score counts as a pass? Is it per video, or 4 of 5 aspects per skill?'],
  ['Coach override','Can a head coach ever override an AI result? If so, it needs a reason and an audit log.'],
  ['Day-zero placement','How is a transfer student placed? Here they take the Spark and Scout tests in their first week.'],
  ['Last column','The Star and Champ columns both use “Champ” skill names. Here finishing the last column simply completes all 16. Should it earn anything?'],
  ['Single-video skills','Netking and Consistency are one continuous rally. Is one video enough, or should it be split?'],
  ['Family view','When do parents get the badge app (phase 2), and does sharing stay manual?'],
  ['Video split','Badge names and standards come from the PSB sheet; how each skill splits into 1–3 videos is a placeholder.']];
const more=(id,label)=>`<button class="more" data-act="more" data-id="${id}" aria-expanded="${ui.more.has(id)}">${ui.more.has(id)?'Show less':label||'Show more'}${ic('chev',12)}</button>`;
function vCurriculum(){
  const full={sk:Object.fromEntries(SKILLS.map(s=>[s.id,{earned:1}])),best:{}};
  return `<div class="wrap portal-curriculum">
   <div class="head"><div class="grow"><div class="eyebrow">The PSB learning pathway</div><h1>Curriculum & rules</h1><p>Four levels. ${SKILLS.length} skill badges. Explore what to teach and what each assessment measures.</p></div><span class="curriculum-count">${SKILLS.length}<small>skill badges</small></span></div>
   <div class="curriculum-journey" aria-label="Four official levels">${LEVELS.map((L,i)=>`<a href="#collection-${L.id}" class="journey-stop" style="--c:var(--t-${L.id})"><span class="journey-number">0${i+1}</span>${emblem(STAGES[i],true)}<span><b>${L.name}</b><small>${skillsOf(L.id).length} skill badges</small></span><span class="journey-arrow" aria-hidden="true">↗</span></a>`).join('')}</div>
   <div class="curriculum-collections">${LEVELS.map((L,i)=>`<section class="curriculum-collection" id="collection-${L.id}" style="--c:var(--t-${L.id});--cs:var(--t-${L.id}-soft)"><header class="collection-head"><div class="collection-title"><span class="collection-index">0${i+1}</span><div><div class="eyebrow">${i===3?'Complete the pathway':'Build toward '+L.award}</div><h2>${L.name} collection</h2></div></div><p>${L.who}</p></header><div class="curriculum-skills">${skillsOf(L.id).map(sk=>`<button class="curriculum-skill" data-act="curSel" data-s="${sk.id}" aria-haspopup="dialog"><div class="curriculum-art">${badgeSVG(sk,full)}<span class="skill-number">${String(sk.order+1).padStart(2,'0')}</span></div><div class="curriculum-skill-copy"><h3>${portalEscape(sk.name)}</h3><p>${portalEscape(sk.std)}</p><span class="skill-open">View skill <span>${sk.videos.length} ${sk.videos.length===1?'video':'videos'} ↗</span></span></div></button>`).join('')||'<p class="empty">No skill sets in this collection.</p>'}</div></section>`).join('')}</div>
   <details class="card curriculum-rules"><summary><span>${ic('check',19)}<b>How progression works</b></span><span>Assessment and badge rules ${ic('chev')}</span></summary><div class="curriculum-rule-grid"><div><span class="rule-no">01</span><h3>Start at Spark</h3><p>Everyone starts at Spark. Pass the skills in a column to earn the next badge.</p></div><div><span class="rule-no">02</span><h3>Clear every video</h3><p>Skill badge: every video scores <b>${rules.threshold}+</b>. The best AI score per video counts, across attempts.</p></div><div><span class="rule-no">03</span><h3>Progress automatically</h3><p>${rules.levelRule==='tier'?'All skill badges of a column, plus every earlier column, unlock the next level badge.':'Any 4 / 8 / 12 / 16 skill badges, from any column.'} Coaches share badges with families; they cannot award or remove one.</p></div></div><p class="note">Needs attention: failed the same skill at 2 assessments in a row. Try other rules from the Event simulator.</p></details>
  </div>`;
}


function vMapping(){
  const sel=SK[ui.mapSel]||SKILLS[0];ui.mapSel=sel.id;
  const mine=MAP[sel.id]||(MAP[sel.id]=[]);
  const used=new Set(Object.values(MAP).flat()),q=ui.libQ.toLowerCase();
  const lib=LIB.filter(k=>(ui.libCat==='all'||k.cat===ui.libCat)&&(!ui.libFree||!used.has(k.id))&&k.name.toLowerCase().includes(q));
  const free=LIB.length-used.size,full={sk:Object.fromEntries(SKILLS.map(s=>[s.id,{earned:1}])),best:{}};
  const colOf=L=>skillsOf(L.id);
  return `<div class="wrap">
  <div class="head"><div class="grow"><div class="eyebrow">Academy account only</div><h1>Skill mapping</h1>
   <p>Build the curriculum in three layers: pick skills from the library, put them into skill sets, then group 4 skill sets into each badge.</p></div></div>
  <div class="flow">
   <div><b class="num">${LIB.length}</b><span>Skills</span><small>${free} not used yet</small></div><i>${ic('chev',16)}</i>
   <div><b class="num">${SKILLS.length}</b><span>Skill sets</span><small>each one is a skill badge</small></div><i>${ic('chev',16)}</i>
   <div><b class="num">${LEVELS.length}</b><span>Badges</span><small>4 skill sets each</small></div></div>

  <div class="bcols">${LEVELS.map(L=>{const sets=colOf(L);return `<div class="bcol" data-drop="col" data-col="${L.id}" style="--c:var(--t-${L.id})">
    <div class="bch">${emblem(STAGES[L.idx],true)}<div class="grow"><b>${L.name}</b><small class="${sets.length===4?'':'warn'}">${sets.length} skill sets${sets.length===4?'':' · needs 4'}</small></div></div>
    ${sets.map(st=>`<button class="setrow ${st.id===sel.id?'on':''}" draggable="true" data-drag="set" data-id="${st.id}" data-drop="set" data-act="mapSel" data-s="${st.id}">
      <span class="sh">${badgeSVG(st,full)}</span><span class="grow"><b>${portalEscape(st.name)}</b><small>${(MAP[st.id]||[]).length} skills</small></span><span class="grip" aria-hidden="true">⋮⋮</span></button>`).join('')}
    <button class="addset" data-act="newSet" data-col="${L.id}">${ic('plus',13)}New skill set</button></div>`}).join('')}</div>

  <div class="mapgrid">
   <div class="card mdetail" style="--c:var(--t-${sel.tier})" data-drop="set" data-id="${sel.id}">
    <div class="mdh"><div class="mh">${badgeSVG(sel,full)}</div><div class="grow">
      <input class="mname" id="mapName" value="${sel.name.replace(/"/g,'&quot;')}" aria-label="Skill set name">
      <div class="mmeta"><label class="sel">Badge <select id="mapCol">${LEVELS.map(L=>`<option value="${L.id}" ${L.id===sel.tier?'selected':''}>${L.name}</option>`).join('')}</select></label><span class="pill num">${mine.length} skills</span><span class="pill num">${sel.videos.length} ${sel.videos.length>1?'videos':'video'}</span></div></div></div>
    <div class="mstd"><small>Standard</small>${sel.std}</div>
    <div class="mskills">${mine.length?mine.map(id=>{const k=LK[id];return `<span class="mchip" draggable="true" data-drag="skill" data-id="${id}"><i class="cdot" data-cat="${CATS.indexOf(k.cat)}"></i>${portalEscape(k.name)}<small>${k.cat}</small><button data-act="unmap" data-k="${id}" aria-label="Remove ${portalEscape(k.name)}">${ic('close',11)}</button></span>`}).join(''):''}
     <div class="mdrop">${ic('plus',14)}Drag skills here, or tap + in the library</div></div>
   </div>
   <div class="card mlib">
    <div class="ch"><h2 class="grow">Skill library</h2><span class="pill num">${lib.length} of ${LIB.length}</span></div>
    <label class="sbox" style="max-width:none">${ic('search',15)}<input id="libQ" type="search" placeholder="Search ${LIB.length} skills" value="${ui.libQ.replace(/"/g,'&quot;')}" aria-label="Search skills"></label>
    <div class="catrow">${['all',...CATS].map(c=>`<button class="chip ${ui.libCat===c?'on':''}" data-act="libCat" data-c="${c}">${c==='all'?'All':c}</button>`).join('')}</div>
    <label class="tog"><input type="checkbox" id="libFree" ${ui.libFree?'checked':''}>Only skills not used in any skill set</label>
    <div class="liblist" id="libList">${lib.map(k=>{const inSel=mine.includes(k.id),n=setsUsing(k.id).length;return `<div class="lrow ${inSel?'in':''}" draggable="true" data-drag="skill" data-id="${k.id}">
      <i class="cdot" data-cat="${CATS.indexOf(k.cat)}"></i><span class="grow"><b>${portalEscape(k.name)}</b><small>${k.cat}${n?` · in ${n} ${n>1?'sets':'set'}`:' · not used'}</small></span>
      <button class="ladd" data-act="${inSel?'unmap':'map'}" data-k="${k.id}" aria-label="${inSel?'Remove from':'Add to'} ${portalEscape(sel.name)}">${ic(inSel?'check':'plus',14)}</button></div>`}).join('')||'<div class="empty">No skills match.</div>'}</div>
    <div class="newsk"><input id="newSkill" type="text" placeholder="New skill name" autocomplete="off"><select id="newCat" aria-label="Category">${CATS.map(c=>`<option>${c}</option>`).join('')}</select><button class="btn sm" data-act="newSkill">${ic('plus',13)}Add</button></div>
   </div></div>
  <p class="muted" style="font-size:12px;margin:0">Changing which skill sets sit in a badge replays every student's badges in this mockup. In the real product, a badge already awarded would never be taken away.</p>
  </div>`}


function vSettings(){
  const clash=planClash(),up=assessmentDays(state.today,4);
  const opt=(arr,v,f)=>arr.map((x,i)=>`<option value="${f?f(i):i}" ${String(f?f(i):i)===String(v)?'selected':''}>${x}</option>`).join('');
  return `<div class="wrap">
  <div class="head"><div class="grow"><div class="eyebrow">Academy account only</div><h1>Settings</h1><p>Academy-wide settings. Changes apply to every venue straight away.</p></div></div>
  <div class="card set-card">
   <div class="ch"><span class="grp-ic" style="width:36px;height:36px">${ic('cal',18)}</span><div class="grow"><h2>Planner settings</h2><div class="muted" style="font-size:13px">Assessment dates are set by the academy. Coaches assign students to these dates.</div></div></div>
   <div class="set-sec"><h3>Assessment day per level</h3><p class="muted">Every month has a fixed day per level. That day tests the 4 skills of the level's column.</p>
    <div class="set-rows">${LEVELS.map(L=>{const x=PLAN.days[L.id],nx=nextDayFor(L.idx,state.today);return `<div class="set-row" style="--c:var(--t-${L.id})">
      <div class="set-l">${emblem(STAGES[L.idx],true)}<div><b>${L.name}</b><small>Tests the 4 ${L.name} column skills</small></div></div>
      <label class="sel"><select data-plan="week" data-l="${L.id}" aria-label="${L.name} week of month">${opt(ORD.map(o=>o+' week'),x.week,i=>i+1)}</select></label>
      <label class="sel"><select data-plan="dow" data-l="${L.id}" aria-label="${L.name} weekday">${opt(DOWS,x.dow)}</select></label>
      <div class="set-next"><small>Next</small><b>${nx?fmt(nx):'—'}</b></div></div>`}).join('')}</div>
    ${clash.length?`<div class="banner" style="margin-top:10px">${ic('alert',16)}<span><b>Two levels share a day:</b> ${clash.map(c=>c.join(' & ')).join(', ')}. Only the first one will be scheduled.</span></div>`:''}</div>
   <div class="set-sec"><h3>5th week of the month</h3>
    <div class="radio">${[['makeup','Make-up day','No assessment. Coaches use it to catch up or re-run drills.'],['off','No session','Nothing is planned in the 5th week.']].map(([v,t,d])=>`<label class="${PLAN.fifth===v?'on':''}"><input type="radio" name="fifth" value="${v}" ${PLAN.fifth===v?'checked':''}><span><b>${t}</b><br><span class="muted">${d}</span></span></label>`).join('')}</div></div>
   <div class="set-sec"><h3>Parent notice</h3>
    <div class="set-inline"><label class="sel">Notify parents <input type="number" id="pNotice" min="1" max="30" value="${PLAN.notice}" aria-label="Days before the assessment"> days before the assessment</label></div></div>
   <div class="set-sec" style="border-bottom:0;padding-bottom:0"><h3>Next 4 assessment days</h3>
    <div class="vchips">${up.map(d=>{const L=levelForDate(d);return `<span class="lvl ${L.id}"><i></i>${L.name} · ${fmt(d)}</span>`}).join('')}</div></div>
  </div></div>`}

/* ---------------- profile modal ---------------- */
function openProfile(id,tab='badges',sel=null){ui.prof={id,tab,sel};renderModal()}
function renderModalContent(){
  const m=document.getElementById('modal');
  if(ui.plannerPicker){m.innerHTML=plannerPickerHTML();m.hidden=false;return}
  if(ui.skill){m.innerHTML=portalSkillHTML();m.hidden=false;return}
  if(ui.insight){m.innerHTML=portalInsightHTML();m.hidden=false;return}
  if(ui.results){m.innerHTML=resultsHTML();m.hidden=false;return}
  if(ui.form){m.innerHTML=formHTML();m.hidden=false;return}
  if(!ui.prof){m.hidden=true;m.innerHTML='';return}
  const st=S(ui.prof.id);if(!st){ui.prof=null;return renderModal()}
  const e=ev(st),n=nextAssessment(st),u=unNotified(st),k=roleKind(),tab=ui.prof.tab;
  const sel=ui.prof.sel?SK[ui.prof.sel]:(LEVELS[e.working]?skillsOf(LEVELS[e.working].id).find(s=>!e.sk[s.id].earned):SKILLS[15]);
  let body='';
  if(tab==='badges'){
    const o=e.sk[sel.id];
    body=`<div class="pboard">${LEVELS.map(L=>{const got=skillsOf(L.id).filter(s=>e.sk[s.id].earned).length;return `<div class="pcol" style="--c:var(--t-${L.id})">
      <div class="pch"><b>${L.name}</b><span class="num ${got===4?'done':''}">${got===4?ic('check',12):''}${got}/4</span></div>
      ${skillsOf(L.id).map(s=>`<button class="pbd ${s.id===ui.prof.sel?'on':''}" data-act="selSkill" data-s="${s.id}">${badgeSVG(s,e)}<span>${portalEscape(s.name)}</span></button>`).join('')}</div>`}).join('')}</div>
    ${ui.prof.sel?`<div class="card pdet"><div class="ch"><div style="width:44px">${badgeSVG(sel,e)}</div><div class="grow"><h3>${portalEscape(sel.name)}</h3><div class="muted" style="font-size:12px">${LV[sel.tier].name} column · ${sel.std}</div></div>${o.earned?'<span class="pill ok">Earned</span>':o.streak>=2?'<span class="pill danger">Needs attention</span>':''}</div>
      ${vidTiles(sel,e,o)}
      <div class="vids">${sel.videos.map(v=>{const b=e.best[v.id];return `<div class="vid"><div class="lab"><span>${v.label}</span><b class="num" style="color:${b==null?'var(--subtle)':b>=rules.threshold?'var(--brand)':'var(--danger)'}">${b==null?'not recorded':b}</b></div><div class="meter"><div style="width:${b||0}%;background:${b>=rules.threshold?'var(--brand)':'var(--danger)'}"></div><span class="th" style="left:${rules.threshold}%"></span></div></div>`}).join('')}</div>
      <p class="muted" style="font-size:12px;margin:10px 0 4px">Best AI score per video · line = pass mark ${rules.threshold}</p>
      ${o.history.length?`<div class="list">${o.history.slice().reverse().map(h=>`<div class="li"><div class="grow"><b>${fmt(h.date)}</b><small class="num">${h.scores.join(' · ')}</small></div>${h.passNow?'<span class="pill ok">pass</span>':'<span class="pill danger">fail</span>'}</div>`).join('')}</div>`:`<div class="empty" style="padding:12px">Not assessed yet. Next ${LV[sel.tier].name} day: ${fmt(nextDayFor(LV[sel.tier].idx,state.today))}</div>`}
     </div>`:'<p class="muted" style="margin:0;font-size:13px;text-align:center">Tap a badge to see its videos and AI scores.</p>'}`}
  else if(tab==='history'){
    const items=[...e.timeline].reverse();
    body=`<div class="grid g2"><div class="card"><h3>Badge timeline</h3>${items.length?`<div class="list">${items.map(t=>{const lab=t.kind==='skill'?SK[t.id].name+' skill badge':(LV[t.id].idx===3?'All 16 skills complete':LV[t.id].award+' badge'),c=t.kind==='skill'?SK[t.id].tier:STAGES[LV[t.id].idx+1].id,sent=st.notified.includes(t.kind+':'+t.id);
      return `<div class="li"><span class="dot" style="background:var(--t-${c})"></span><div class="grow"><b>${lab}</b><small>${fmt(t.date)} · awarded by AI scoring</small></div>${sent?'<span class="pill">shared</span>':'<span class="pill info">not shared</span>'}</div>`}).join('')}</div>`:'<div class="empty">No badges yet.</div>'}</div>
     <div class="card"><h3>Assessments attended</h3>${st.attempts.length?`<div class="alist">${[...st.attempts].sort((a,b)=>a.date<b.date?1:-1).map(a=>attRow(st,a)).join('')}</div>`:'<div class="empty">No assessments yet.</div>'}</div></div>`}
  else body=parentPreview(st,e,n);
  m.innerHTML=`<div class="dialog" role="dialog" aria-modal="true" aria-label="${portalEscape(st.name)}">
   <div class="dh"><div class="av" style="width:46px;height:46px;font-size:16px">${initials(st.name)}</div>
    <div class="grow"><h2>${portalEscape(st.name)}</h2><div class="muted" style="font-size:13px;margin-top:2px">Age ${st.age} · ${VE[st.venue]?.name||''} · ${portalEscape(CO[st.coachId].name)} · joined ${fmt(st.joined,{day:'numeric',month:'short',year:'numeric'})}${portalEscape(st.note?' · '+st.note:'')}</div></div>
    ${lvlChip(e.level)}<button class="x" data-act="close" aria-label="Close">${ic('close')}</button></div>
   <div class="db" style="padding-bottom:0">
    <div class="ch">
     <div class="grow" style="display:flex;gap:18px;flex-wrap:wrap"><div><div class="eyebrow">Badges</div><b class="num" style="font-family:var(--font-head);font-size:20px">${e.earnedCount}<span class="subtle" style="font-size:14px">/16</span></b></div>
      <div><div class="eyebrow">Next assessment</div><b>${n?fmt(n.date,{weekday:'short',day:'numeric',month:'short'})+' · '+n.level.name+(n.booked?' (booked)':' (likely)'):'All done'}</b></div></div>
     ${n&&!n.booked&&k!=='admin'?`<button class="btn" data-act="book" data-id="${st.id}" data-d="${n.date}">Add to ${n.level.name} day</button>`:''}
     ${u.length&&k!=='admin'?`<button class="btn primary" data-act="notify" data-id="${st.id}">Share ${u.length} new ${u.length>1?'badges':'badge'} with family</button>`:''}
    </div>
    ${e.attention.length?`<div class="banner"><b>Needs attention:</b>&nbsp;failed ${portalEscape(e.attention.map(x=>x.name+' '+e.sk[x.id].streak+'×').join(', '))} in a row after the drill cycle.</div>`:''}
   </div>
   <div class="tabs" style="margin-top:14px">${[['badges','Badge board'],['history','History'],['parent','Family view (phase 2)']].map(([t,l])=>`<button class="tab ${tab===t?'on':''}" data-act="ptab" data-t="${t}">${l}</button>`).join('')}</div>
   <div class="db">${body}</div></div>`;
  m.hidden=false}
function parentPreview(st,e,n){
  const L=e.working>=0?LEVELS[e.working]:null,miss=L?skillsOf(L.id).filter(s=>!e.sk[s.id].earned).length:0,last=e.timeline.filter(t=>t.kind==='skill').slice(-1)[0];
  return `<div class="grid g2" style="align-items:center"><div class="phone"><div class="scr">
   <div class="eyebrow">PSB Academy</div><h2>${portalEscape(st.name.split(' ')[0])}'s journey</h2>
   <div style="display:flex;gap:10px;align-items:center"><div style="width:54px">${emblem(stageOf(e.level),true)}</div><div><b style="font-family:var(--font-head)">${stageOf(e.level).name}${stageOf(e.level).sub?' · '+stageOf(e.level).sub:''}</b><div class="muted" style="font-size:12px">${e.earnedCount} of 16 badges</div></div></div>
   ${last?`<div class="banner ok" style="font-size:12px"><b>New:</b>&nbsp;${SK[last.id].name} badge on ${fmt(last.date,{day:'numeric',month:'short'})}</div>`:''}
   <div class="mini">${SKILLS.map(s=>badgeSVG(s,e)).join('')}</div>
   ${L?`<div class="note"><b>${miss} more ${miss>1?'badges':'badge'}</b> for ${awardTxt(L)}. Next ${L.name} day: <b>${fmt(nextDayFor(L.idx,state.today))}</b></div>`:''}
  </div></div>
  <div><h3>Family view, phase 2</h3><p class="muted">The workshop agreed this comes after the academy portal. The same badge data feeds it: the badge wall, the newest badge, and the next assessment date sent ${PLAN.notice} days ahead. When a coach taps “Share”, this is what the family would receive.</p></div></div>`}

function thumb(i,score,label,dur,small){const T=rules.threshold;
  const tag=small?'span':'button';
  return `<${tag} class="vtile ${small?'sm':''}" ${small?'aria-hidden="true"':`data-act="playVid" data-l="${label}" aria-label="Play ${label}"`}>
   <svg class="court" viewBox="0 0 160 90" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="160" height="90" fill="#0f3b29"/><rect width="160" height="90" fill="url(#gloss)" opacity=".15"/>
    <path d="M30 88 50 22h60l20 66zM40 55h80M80 22v66M45 40h70M36 72h88" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="1"/><path d="M47 33h66" stroke="#fff" stroke-opacity=".55" stroke-width="1.6"/>
    <circle cx="${62+(i%3)*14}" cy="${58-(i%3)*6}" r="5" fill="#fff" fill-opacity=".18"/></svg>
   <span class="vplay"><svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M5 3v10l8-5z"/></svg></span>
   ${small?'':`<span class="vdur num">${dur}</span>`}${score!=null?`<span class="vscore num ${score>=T?'p':'f'}">AI ${score}</span>`:''}</${tag}>`}
function attRow(st,a){const vs=videosOf(a.level),T=rules.threshold,p=vs.filter(v=>a.scores[v.id]>=T).length,key=a.date+'|'+a.level,open=ui.prof.att===key;
  const dur=i=>`0:${String(18+((i*13+a.date.charCodeAt(9))%34)).padStart(2,'0')}`;
  return `<div class="arow ${open?'open':''}">
   <button class="ahead" data-act="attOpen" data-k="${key}" aria-expanded="${open}">
    <span class="astack">${thumb(0,null,'',dur(0),true)}<span class="acount num">${vs.length}</span></span>
    <span class="grow"><span class="lvl ${a.level}" style="margin-bottom:3px"><i></i>${LV[a.level].name} assessment</span><b>${fmt(a.date)}</b><small class="num">${vs.length} videos · ${p} at pass mark</small></span>
    <span class="achev">${ic('chev',14)}</span></button>
   ${open?`<div class="avids">${skillsOf(a.level).map(sk=>`<div class="askill"><div class="ask-h"><b>${portalEscape(sk.name)}</b>${sk.videos.every(v=>a.scores[v.id]>=T)?'<span class="pill ok">pass</span>':'<span class="pill danger">not yet</span>'}</div>
     <div class="vgrid">${sk.videos.map((v,i)=>`<div class="vcell">${thumb(i,a.scores[v.id],v.label,dur(i))}<small>${v.label}</small></div>`).join('')}</div></div>`).join('')}</div>`:''}</div>`}
function vidTiles(sk,e,o){const last=o.history.length?o.history[o.history.length-1].date:null,T=rules.threshold;
  return `<div class="vgrid" style="--c:var(--t-${sk.tier})">${sk.videos.map((v,i)=>{const b=e.best[v.id],has=b!=null,dur=`0:${String(18+((i*13+sk.order*7)%34)).padStart(2,'0')}`;
   return has?`<button class="vtile" data-act="playVid" data-l="${v.label}" aria-label="Play ${v.label}">
     <svg class="court" viewBox="0 0 160 90" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="vg${i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1f5a3f"/><stop offset="1" stop-color="#0d2a1e"/></linearGradient></defs><rect width="160" height="90" fill="url(#vg${i})"/>
      <path d="M30 88 50 22h60l20 66zM40 55h80M80 22v66M45 40h70M36 72h88" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="1"/><path d="M47 33h66" stroke="#fff" stroke-opacity=".55" stroke-width="1.6"/>
      <circle cx="${62+i*14}" cy="${58-i*6}" r="5" fill="#fff" fill-opacity=".18"/><path d="M${60+i*14} ${46-i*6}v-12" stroke="#fff" stroke-opacity=".18" stroke-width="3" stroke-linecap="round"/></svg>
     <span class="vplay"><svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M5 3v10l8-5z"/></svg></span>
     <span class="vtag">Video ${i+1}</span><span class="vdur num">${dur}</span>
     <span class="vscore num ${b>=T?'p':'f'}">AI ${b}</span></button>`
    :`<div class="vtile empty-v"><span class="vcam">${ic('cal',16)}</span><span>Not recorded yet</span><span class="vtag">Video ${i+1}</span></div>`}).join('')}</div>
   <div class="vcap">${last?`Latest recording ${fmt(last,{day:'numeric',month:'short'})} · tap to play`:'Recorded on the next '+LV[sk.tier].name+' day'}</div>`}
/* ---------------- results modal ---------------- */
function resultsHTML(){
  const R=ui.results;
  const ups=R.rows.reduce((a,r)=>a+r.levels.length,0),nb=R.rows.reduce((a,r)=>a+r.newSkills.length,0),nv=R.levels.reduce((a,l)=>a+videosOf(l).length,0);
  return `<div class="dialog" role="dialog" aria-modal="true" aria-label="Assessment results">
   <div class="dh">${R.levels.map(l=>`<span class="lvl ${l}"><i></i>${LV[l].name}</span>`).join('')}<div class="grow"><h2>AI scoring complete · ${fmt(R.date,{weekday:'long',day:'numeric',month:'long'})}</h2><div class="muted" style="font-size:13px;margin-top:2px">${R.students} ${R.students>1?'students':'student'} · ${nv} videos each · ${nb} new skill ${nb===1?'badge':'badges'}${ups?` · ${ups} level-up${ups>1?'s':''}`:''}</div></div><button class="x" data-act="closeRes" aria-label="Close">×</button></div>
   <div class="db"><div class="res">${R.rows.map((r,ri)=>{const st=S(r.id),e=ev(st),L=LV[r.level];return `<div class="rs">
    <div class="who"><div class="av">${initials(st.name)}</div><div><b>${portalEscape(st.name)}</b><small>${R.levels.length>1?L.name+' test · ':''}${e.earnedCount}/16 badges${r.newSkills.length?` · <span style="color:var(--brand);font-weight:700">+${r.newSkills.length}</span>`:''}</small></div></div>
    <div class="sk">${skillsOf(L.id).map((s,si)=>{const isNew=r.newSkills.includes(s.id),had=r.had.includes(s.id),sc=s.videos.map(v=>r.scores[v.id]),pass=sc.every(x=>x>=rules.threshold);
      return `<div class="rsk"><div class="${isNew?'shine':''}" style="animation-delay:${.15*si+.1*ri}s">${badgeSVG(s,e,{pop:isNew})}</div><b>${portalEscape(s.name)}</b><small class="num ${isNew?'new':''}">${isNew?'New badge':had?'Already earned':pass?'Passed':'Not yet'} · ${sc.join('/')}</small></div>`}).join('')}</div>
    ${r.levels.map(id=>{const A=STAGES[LV[id].idx+1];return `<div class="lvup" style="--c:var(--t-${A.id});--cs:var(--t-${A.id}-soft)">${emblem(A,true)}<div><b>${portalEscape(st.name.split(' ')[0])} ${A.final?'completed all 16 skills':'earned the '+A.name+' badge'}</b><div class="muted" style="font-size:12px">All 4 ${LV[id].name} column skills done · awarded automatically</div></div></div>`}).join('')}
   </div>`}).join('')}</div>
   <div class="ch"><span class="muted grow" style="font-size:12px">Badges are already on each profile. Sharing with families is a separate step.</span><button class="btn" data-act="closeRes">Done</button>${roleKind()!=='admin'?`<button class="btn primary" data-act="notifyRes">Share new badges with families</button>`:''}</div></div></div>`}

function runSession(date,levelIds,ids,manual){
  if(!Array.isArray(levelIds))levelIds=[levelIds];
  const before=new Map(ids.map(id=>[id,ev(S(id))]));
  const scoresBy={};
  ids.forEach(id=>{const st=S(id);levelIds.forEach(lid=>{const sc=manual?.[id]||genScores(st,lid,date,Math.random);scoresBy[id+'|'+lid]=sc;st.attempts.push({date,level:lid,scores:sc})})});
  if(date>state.today)state.today=date;
  if(levelForDate(date)&&levelIds.includes(levelForDate(date).id))state.done[date]=true;
  invalidate();
  const rows=ids.flatMap(id=>{const b=before.get(id),a=ev(S(id));
    return levelIds.map((lid,li)=>({id,level:lid,scores:scoresBy[id+'|'+lid],newSkills:skillsOf(lid).filter(s=>!b.sk[s.id].earned&&a.sk[s.id].earned).map(s=>s.id),
      had:skillsOf(lid).filter(s=>b.sk[s.id].earned).map(s=>s.id),levels:li===levelIds.length-1?LEVELS.filter(L=>!b.lv[L.id]&&a.lv[L.id]).map(L=>L.id):[]}))});
  const nb=rows.reduce((x,r)=>x+r.newSkills.length,0),ups=rows.flatMap(r=>r.levels.map(l=>S(r.id).name.split(' ')[0]+' → '+LV[l].award));
  const names=levelIds.map(l=>LV[l].name).join(' + ');
  state.log.unshift({date,kind:levelIds[0],text:`${names} assessment recorded for ${ids.length} ${ids.length>1?'students':'student'}: ${nb} new skill ${nb===1?'badge':'badges'}${ups.length?'; level-ups: '+ups.join(', '):''}.`});
  ui.results={date,levels:levelIds,students:ids.length,rows};ui.prof=null;
  render();if(ups.length)confetti()}

/* ---------------- simulator ---------------- */
let sim={tab:'run',student:null,level:'spark',date:null,scores:null};
function simDates(levelId){const L=LV[levelId];const out=[{v:state.today,l:'Today, off-cycle (placement)'}];
  let s=state.today;for(let i=0;i<3;i++){s=nextDayFor(L.idx,i?addDays(s,1):s);out.push({v:s,l:fmt(s)+' · '+L.name+' day'})}return out}
function renderSim(){
  const el=document.getElementById('sim');if(el.hidden)return;
  const list=visible().length?visible():state.students;
  if(!sim.student||!S(sim.student))sim.student=list[0]?.id||null;
  const st=sim.student?S(sim.student):null;
  if(st&&!sim.scores)sim.scores=genScores(st,sim.level,sim.date||state.today,Math.random);
  const dates=simDates(sim.level);if(!sim.date||!dates.some(d=>d.v===sim.date))sim.date=dates[0].v;
  let body='';
  if(sim.tab==='run'){const e=st?ev(st):null;
    body=st?`<p class="muted" style="margin:0">Assessment data is the only event that changes a badge. Pick a student and level, adjust the AI scores, then submit.</p>
     <div class="row2"><div class="field"><label for="simStu">Student</label><select id="simStu">${list.map(s=>`<option value="${s.id}" ${s.id===st.id?'selected':''}>${portalEscape(s.name)}</option>`).join('')}</select></div>
      <div class="field"><label for="simLvl">Assessment</label><select id="simLvl">${LEVELS.map(L=>`<option value="${L.id}" ${L.id===sim.level?'selected':''}>${L.name}</option>`).join('')}</select></div></div>
     <div class="field"><label for="simDate">Date</label><select id="simDate">${dates.map(d=>`<option value="${d.v}" ${d.v===sim.date?'selected':''}>${d.l}</option>`).join('')}</select></div>
     <div class="note">${portalEscape(st.name.split(' ')[0])}: ${lvlChip(e.level)} · ${e.earnedCount}/16 badges${e.working>=0&&e.working!==LV[sim.level].idx?` · <b>${e.working<LV[sim.level].idx?'stretch attempt':'re-test of a finished level'}</b>`:''}</div>
     <div><div class="ch" style="margin-bottom:8px"><h3 class="grow">AI scores · pass mark ${rules.threshold}</h3><button class="btn sm" data-act="reroll">Re-roll</button><button class="btn sm" data-act="allpass">All pass</button></div>
     <div class="vids">${skillsOf(sim.level).map(s=>`<div><div class="eyebrow" style="margin:4px 0">${portalEscape(s.name)}${e.sk[s.id].earned?' · already earned':''}</div>${s.videos.map(v=>{const x=sim.scores[v.id];return `<div class="slider"><span>${v.label}</span><input type="range" min="0" max="100" value="${x}" data-score="${v.id}" aria-label="${v.label} score"><b class="num ${x>=rules.threshold?'p':'f'}" id="sv-${v.id.replace('.','-')}">${x}</b></div>`}).join('')}</div>`).join('')}</div></div>
     <button class="btn primary" data-act="submitSim">Submit to AI scoring</button>`:'<div class="empty">No students. Onboard one first.</div>'}
  else if(sim.tab==='onboard'){
    const coaches=coachList().filter(c=>roleKind()!=='assistant'||c.id===ui.role);
    body=`<p class="muted" style="margin:0">A new student starts with 0 badges. A transfer can take placement tests straight away.</p>
     <div class="field"><label for="obName">Name</label><input id="obName" type="text" value="Neel Varma" autocomplete="off"></div>
     <div class="row2"><div class="field"><label for="obAge">Age</label><input id="obAge" type="number" min="4" max="18" value="8"></div>
      <div class="field"><label for="obCoach">Coach</label><select id="obCoach">${coaches.map(c=>`<option value="${c.id}">${portalEscape(c.name)}</option>`).join('')}</select></div></div>
     <div class="field"><label for="obSkill">Prior skill (hidden from coach, drives simulated AI scores)</label><select id="obSkill"><option value="62">Beginner</option><option value="76" selected>Some coaching</option><option value="92">Strong transfer</option></select></div>
     <div class="radio" id="obPlace"><label class="on"><input type="radio" name="place" value="none" checked><span><b>Start at Spark</b><br><span class="muted">Waits for the next Spark day.</span></span></label>
      <label><input type="radio" name="place" value="placement"><span><b>Placement today</b><br><span class="muted">Records Spark and Scout tests now; whatever they pass becomes their starting point.</span></span></label></div>
     <button class="btn primary" data-act="onboard">Onboard student</button>`}
  else if(sim.tab==='rules'){
    body=`<div class="field"><label for="thr">Pass mark per video: <b class="num" id="thrV">${rules.threshold}</b></label><input id="thr" type="range" min="50" max="90" step="1" value="${rules.threshold}" style="accent-color:var(--brand)"></div>
     <div class="field"><label>Level badge rule</label><div class="radio">
      <label class="${rules.levelRule==='tier'?'on':''}"><input type="radio" name="lr" value="tier" ${rules.levelRule==='tier'?'checked':''}><span><b>Complete the column</b> (PSB sheet + workshop)<br><span class="muted">All 4 skills of a column and every column before it. A Spark kid who passes a Star skill keeps that skill badge but doesn't get Star until Scout is done.</span></span></label>
      <label class="${rules.levelRule==='count'?'on':''}"><input type="radio" name="lr" value="count" ${rules.levelRule==='count'?'checked':''}><span><b>Count badges</b> (Arun's note)<br><span class="muted">Any 4 skill badges = Scout, 8 = Star, 12 = Champ, 16 = all done.</span></span></label></div></div>
     <p class="note">Changing a rule replays every student's history, so you can compare the two. In the real product a badge already awarded would never be taken away.</p>
     <div class="field"><label>Scenario</label><div class="row2"><button class="btn" data-act="scenario" data-s="seed">Seeded academy</button><button class="btn" data-act="scenario" data-s="dry">4-athlete dry run</button></div></div>`}
  else body=`<div class="list log">${state.log.map(l=>`<div class="li"><span class="dot" style="background:${LV[l.kind]?`var(--t-${l.kind})`:'var(--subtle)'}"></span><div class="grow">${portalEscape(l.text)}<small>${fmt(l.date)}</small></div></div>`).join('')}</div>`;
  el.innerHTML=`<div class="sh"><div class="grow"><h2>Event simulator</h2><div class="muted" style="font-size:12px">Feed events in and watch badges change</div></div><button class="x" data-act="closeSim" aria-label="Close simulator">${ic('close')}</button></div>
   <div class="tabs">${[['run','Assessment result'],['onboard','Onboard'],['rules','Rules'],['log','Event log']].map(([t,l])=>`<button class="tab ${sim.tab===t?'on':''}" data-act="stab" data-t="${t}">${l}</button>`).join('')}</div>
   <div class="sb">${body}</div>`}

/* ---------------- render ---------------- */
function render(){
  renderNav();renderAcct();
  const v={overview:vOverview,students:vStudents,team:vTeam,planner:vPlanner,dayplan:vDayPlan,curriculum:vCurriculum,mapping:vMapping,settings:vSettings}[ui.view];
  const main=document.getElementById('main'),ae=document.activeElement,fid=ae&&ae.id&&/INPUT/.test(ae.tagName)&&ae.type!=='checkbox'?ae.id:null,fpos=fid?ae.selectionStart:0;
  const ll=document.getElementById('libList'),lsc=ll?ll.scrollTop:0;
  main.innerHTML=v();
  if(fid){const el=document.getElementById(fid);if(el){el.focus();try{el.setSelectionRange(fpos,fpos)}catch(_){}}}
  const ll2=document.getElementById('libList');if(ll2)ll2.scrollTop=lsc;
  renderModal();renderSim();portalDecorate()}
function toast(t){const el=document.createElement('div');el.textContent=t;document.getElementById('toast').appendChild(el);setTimeout(()=>el.remove(),2600)}
function notify(st){const u=unNotified(st);u.forEach(t=>st.notified.push(t.kind+':'+t.id));if(u.length)state.log.unshift({date:state.today,kind:'info',text:`Shared ${u.length} ${u.length>1?'badges':'badge'} with ${st.name}'s family (WhatsApp, simulated).`});return u.length}

function renderAcct(){const k=roleKind(),M=me();
  document.getElementById('acctBtn').innerHTML=`<span class="av k-${k}">${k==='admin'?'PSB':initials(M.name)}</span><span class="t"><b>${portalEscape(M.name)}</b><small>${M.title}</small></span>${ic('chev',13)}`;
  const item=(id,name,sub,kind)=>`<button role="menuitem" class="${ui.role===id?'on':''}" data-act="asRole" data-id="${id}"><span class="av k-${kind}">${kind==='admin'?'PSB':initials(name)}</span><span class="grow"><b>${portalEscape(name)}</b><small>${portalEscape(sub)}</small></span>${ui.role===id?`<span class="ck">${ic('check')}</span>`:''}</button>`;
  document.getElementById('acctMenu').innerHTML=`<div class="eyebrow">Academy account</div>${item('admin',ACADEMY.name,ACADEMY.desc,'admin')}
   <div class="eyebrow">Head coach</div>${COACHES.filter(c=>c.role==='head').map(c=>item(c.id,c.name,'All venues · assigns players','head')).join('')}
   <div class="eyebrow">Coaches</div>${coachList().map(c=>item(c.id,c.name,c.venues.map(v=>VE[v].name).join(' · '),'assistant')).join('')}`}
function setAcctMenu(open){const m=document.getElementById('acctMenu');m.hidden=!open;document.getElementById('acctBtn').setAttribute('aria-expanded',open)}
function setSim(open){const el=document.getElementById('sim');el.hidden=!open;document.getElementById('simBtn').setAttribute('aria-pressed',open);if(open)renderSim()}

document.addEventListener('click',e=>{
  if(!e.target.closest('.acct'))setAcctMenu(false);
  if(e.target.id==='modal'){portalCloseModal();return}
  const a=e.target.closest('[data-act]');if(!a)return;const d=a.dataset;
  switch(d.act){
    case 'view':ui.view=d.v;render();scrollTo(0,0);break;
    case 'filter':ui.filter=d.f;render();break;
    case 'prof':if(e.target.closest('select'))return;ui.insight=null;openProfile(d.id);break;
    case 'close':ui.prof=null;renderModal();break;
    case 'ptab':ui.prof.tab=d.t;renderModal();break;
    case 'attOpen':ui.prof.att=ui.prof.att===d.k?null:d.k;renderModal();break;
    case 'selSkill':ui.prof.sel=d.s;portalOpenSkill(d.s,ui.prof.id);break;
    case 'book':{(state.plans[d.d]=state.plans[d.d]||[]).push(d.id);toast(`Added to ${levelForDate(d.d).name} day, ${fmt(d.d)}`);render();break}
    case 'notify':{const n=notify(S(d.id));toast(`Shared ${n} ${n>1?'badges':'badge'} with the family`);render();break}
    case 'notifyAll':{let n=0;visible().forEach(s=>n+=notify(s));toast(`Shared ${n} badges with families`);render();break}
    case 'notifyRes':{let n=0;ui.results.rows.forEach(r=>n+=notify(S(r.id)));ui.results=null;toast(n?`Shared ${n} new badges with families`:'No new badges to share');render();break}
    case 'closeRes':ui.results=null;render();break;
    case 'plan':ui.view='planner';ui.planDay=d.d;ui.prof=null;render();break;
    case 'addAll':{const r=recommend(ui.planDay).rec.map(x=>x.s.id);state.plans[ui.planDay]=[...new Set([...(state.plans[ui.planDay]||[]),...r])];render();break}
    case 'addPlannerStudents':plannerOpenPicker();break;
    case 'closePlannerPicker':ui.plannerPicker=null;renderModal();break;
    case 'savePlannerStudents':{const p=ui.plannerPicker;if(p&&plannerSaveAssignments(p.date,[...p.ids])){ui.plannerPicker=null;render();toast('Assessment students saved')}break}
    case 'removePlannerStudent':if(plannerRemoveStudent(ui.planDay,d.id)){render();toast('Student removed from assessment')}break;
    case 'plannerHistory':openProfile(d.id,'history');break;
    case 'runPlan':{const day=ui.planDay;runSession(day,levelForDate(day).id,state.plans[day]);break}
    case 'absent':ui.absent.has(d.id)?ui.absent.delete(d.id):ui.absent.add(d.id);render();break;
    case 'openSim':setSim(document.getElementById('sim').hidden);break;
    case 'closeSim':setSim(false);break;
    case 'acctMenu':setAcctMenu(document.getElementById('acctMenu').hidden);break;
    case 'asRole':ui.plannerPicker=null;portalRememberRole(d.id);ui.skill=null;ui.insight=null;ui.role=d.id;ui.filter='all';ui.coachF='all';ui.venueF='all';ui.absent=new Set();ui.prof=null;ui.form=null;sim.student=null;sim.scores=null;setAcctMenu(false);
      if(roleKind()==='assistant'&&ui.group==='coach')ui.group='venue';render();toast('Now viewing as '+me().name);break;
    case 'group':ui.group=d.g;render();break;
    case 'curSel':portalOpenSkill(d.s);break;
    case 'badgeDetail':portalOpenSkill(d.s);break;
    case 'closeSkill':ui.skill=null;renderModal();break;
    case 'closeInsight':ui.insight=null;renderModal();break;
    case 'insight':ui.insight={kind:d.kind,coach:d.coach,month:d.month||monthKey(state.today),skill:d.s};renderModal();break;
    case 'overviewPlayers':ui.view='students';ui.filter=d.f||'all';ui.q='';ui.venueF='all';ui.coachF='all';render();scrollTo(0,0);break;
    case 'resetFilters':ui.filter='all';ui.q='';ui.venueF='all';ui.coachF='all';render();break;
    case 'playVid':toast(`Sample clip · ${d.l} (the real recording plays here)`);break;
    case 'mapSel':ui.mapSel=d.s;render();break;
    case 'map':{const m=MAP[ui.mapSel]||(MAP[ui.mapSel]=[]);if(!m.includes(d.k))m.push(d.k);render();toast(`${LK[d.k].name} → ${SK[ui.mapSel].name}`);break}
    case 'unmap':{const m=MAP[ui.mapSel]||[];const i=m.indexOf(d.k);if(i>=0)m.splice(i,1);render();break}
    case 'libCat':ui.libCat=d.c;render();break;
    case 'newSkill':{const n=document.getElementById('newSkill').value.trim();if(!n){document.getElementById('newSkill').focus();break}
      const k={id:'k'+LIB.length,name:n,cat:document.getElementById('newCat').value};LIB.push(k);LK[k.id]=k;LIBN[n]=k.id;(MAP[ui.mapSel]=MAP[ui.mapSel]||[]).push(k.id);
      ui.libQ='';render();toast(`New skill “${n}” added to ${SK[ui.mapSel].name}`);break}
    case 'newSet':{const L=LV[d.col],id='set'+Date.now();
      const st={id,tier:d.col,name:'New '+L.name+' skill set',abbr:'NS',std:'Standard to be agreed with PSB',order:SKILLS.length,videos:[{id:id+'.v1',label:'Video 1'}]};
      SKILLS.push(st);SK[id]=st;MAP[id]=[];ui.mapSel=id;invalidate();render();toast('New skill set added. Add skills from the library.');break}
    case 'more':ui.more.has(d.id)?ui.more.delete(d.id):ui.more.add(d.id);render();break;
    case 'layout':ui.layout=d.l;render();break;
    case 'venueGo':ui.view='students';ui.venueF=d.v;ui.group='coach';ui.filter='all';render();scrollTo(0,0);break;
    case 'addPlayer':ui.form={type:'player'};renderModal();setTimeout(()=>document.getElementById('fName')?.focus(),30);break;
    case 'addCoach':ui.form={type:'coach'};renderModal();setTimeout(()=>document.getElementById('fName')?.focus(),30);break;
    case 'closeForm':ui.form=null;renderModal();break;
    case 'saveForm':{const name=document.getElementById('fName').value.trim();if(!name){document.getElementById('fName').focus();toast('Enter a name first');break}
      if(ui.form.type==='player'){const coachId=document.getElementById('fCoach').value,venue=document.getElementById('fVenue').value,age=+document.getElementById('fAge').value||8;
        const st={id:'n'+Date.now(),name,age,coachId,venue,joined:state.today,ability:70+Math.round(Math.random()*12),weak:null,attempts:[],notified:[],note:'New this week'};
        state.students.push(st);invalidate();state.log.unshift({date:state.today,kind:'info',text:`Added ${name} at ${VE[venue].name} under ${CO[coachId].name}: starts at Spark, 0 skill badges.`});
        ui.form=null;ui.filter='all';ui.q='';render();toast(`${name} added · starts at Spark`)}
      else{const role=document.querySelector('input[name=frole]:checked').value,venues=[...document.querySelectorAll('input[name=fven]:checked')].map(x=>x.value);
        const c={id:'c'+Date.now(),name,role,title:role==='head'?'Head coach':'Coach',venues:role==='head'?VENUES.map(v=>v.id):(venues.length?venues:['mal']),batch:role==='head'?'All venues':(document.getElementById('fBatch').value.trim()||'Batch to be set')};
        COACHES.push(c);CO[c.id]=c;state.log.unshift({date:state.today,kind:'info',text:`Added ${c.title.toLowerCase()} ${name}.`});
        ui.form=null;render();toast(`${name} added as ${c.title.toLowerCase()}`)}
      break}
    case 'stab':sim.tab=d.t;renderSim();break;
    case 'reroll':sim.scores=null;renderSim();break;
    case 'allpass':Object.keys(sim.scores).forEach(k=>sim.scores[k]=Math.max(sim.scores[k],rules.threshold+4));renderSim();break;
    case 'submitSim':{const st=S(sim.student);runSession(sim.date,sim.level,[st.id],{[st.id]:{...sim.scores}});sim.scores=null;renderSim();break}
    case 'onboard':{
      const name=document.getElementById('obName').value.trim()||'New student',age=+document.getElementById('obAge').value||8,coachId=document.getElementById('obCoach').value,ability=+document.getElementById('obSkill').value;
      const place=document.querySelector('input[name=place]:checked').value;
      const st={id:'n'+Date.now(),name,age,coachId,venue:CO[coachId].venues[0],joined:state.today,ability:ability+Math.round(Math.random()*6-3),weak:null,attempts:[],notified:[],note:place==='placement'?'Placement tests on joining':''};
      state.students.push(st);invalidate();state.log.unshift({date:state.today,kind:'info',text:`Onboarded ${name} under ${CO[coachId].name}: 0 badges, starts at Spark.`});
      if(place==='placement'){runSession(state.today,['spark','scout'],[st.id]);toast(`${name} placed with ${ev(st).earnedCount} badges from placement tests`)}
      else{toast(`${name} onboarded with 0 badges`);sim.student=st.id;sim.scores=null;render()}
      break}
    case 'scenario':state=d.s==='dry'?dryRun():seeded();invalidate();ui.prof=null;ui.results=null;ui.planDay=null;ui.absent=new Set();sim.student=null;sim.scores=null;
      if(d.s==='dry'){ui.role='c1';ui.view='students'}
      toast(d.s==='dry'?'Dry run loaded: 4 athletes at 0 badges':'Seeded academy loaded');render();break;
  }});
document.addEventListener('change',e=>{const t=e.target;
  if(t.dataset.plannerStudent){const p=ui.plannerPicker;if(!p||!visible().some(st=>st.id===t.dataset.plannerStudent))return;if(plannerCompleted(S(t.dataset.plannerStudent),p.date)&&(state.plans[p.date]||[]).includes(t.dataset.plannerStudent))return;t.checked?p.ids.add(t.dataset.plannerStudent):p.ids.delete(t.dataset.plannerStudent);document.getElementById('plannerPickerCount').textContent=p.ids.size+' selected';return}
  if(t.dataset.plan){if(roleKind()!=='admin')return;PLAN.days[t.dataset.l][t.dataset.plan]=+t.value;ui.planDay=null;render();toast(`${LV[t.dataset.l].name} day is now the ${dayLabel(t.dataset.l)}`);return}
  if(t.name==='fifth'){if(roleKind()!=='admin')return;PLAN.fifth=t.value;render();toast('5th week setting saved');return}
  if(t.name==='pmode')return;
  if(t.id==='pNotice'){if(roleKind()!=='admin')return;PLAN.notice=Math.max(1,Math.min(30,+t.value||15));render();toast(`Parents notified ${PLAN.notice} days ahead`);return}
  if(t.id==='libFree'){ui.libFree=t.checked;render();return}
  if(t.id==='mapName'){const v=t.value.trim();if(v){SK[ui.mapSel].name=v;render();toast('Skill set renamed')}return}
  if(t.id==='mapCol'){moveSet(ui.mapSel,t.value);return}
  if(t.id==='pVenue'){ui.venueF=t.value;render();return}
  if(t.id==='pCoach'){ui.coachF=t.value;render();return}
  if(t.id==='pSort'){ui.sort=t.value;render();return}
  if(t.name==='frole'){document.querySelectorAll('#fRole label').forEach(l=>l.classList.toggle('on',l.contains(document.querySelector('input[name=frole]:checked'))));return}
  if(t.dataset.coach){S(t.dataset.coach).coachId=t.value;toast(`${S(t.dataset.coach).name} assigned to ${CO[t.value].name}`);render();return}
  if(t.dataset.pick)return;
  if(t.id==='simStu'){sim.student=t.value;sim.scores=null;renderSim()}
  if(t.id==='simLvl'){sim.level=t.value;sim.scores=null;sim.date=null;renderSim()}
  if(t.id==='simDate'){sim.date=t.value}
  if(t.name==='lr'){rules.levelRule=t.value;invalidate();toast('Level rule changed: every badge replayed');render()}
  if(t.name==='place'){document.querySelectorAll('#obPlace label').forEach(l=>l.classList.toggle('on',l.contains(document.querySelector('input[name=place]:checked'))))}
  if(t.id==='thr'){rules.threshold=+t.value;invalidate();toast(`Pass mark set to ${rules.threshold}: badges replayed`);render()}});
document.addEventListener('input',e=>{const t=e.target;
  if(t.id==='plannerStudentSearch'&&ui.plannerPicker){const pos=t.selectionStart;ui.plannerPicker.query=t.value;renderModal();const search=document.getElementById('plannerStudentSearch');search.focus();try{search.setSelectionRange(pos,pos)}catch(_){}return}
  if(t.id==='libQ'){ui.libQ=t.value;render();return}
  if(t.id==='q'){ui.q=t.value;render()}
  if(t.dataset.score){const x=+t.value;sim.scores[t.dataset.score]=x;const b=document.getElementById('sv-'+t.dataset.score.replace('.','-'));b.textContent=x;b.className='num '+(x>=rules.threshold?'p':'f')}
  if(t.id==='thr'){document.getElementById('thrV').textContent=t.value}});
document.addEventListener('keydown',e=>{
  if(e.key==='Enter'&&e.target.matches&&e.target.matches('[role=button][data-act=prof]')){openProfile(e.target.dataset.id);return}
  if(e.key==='Escape'){setAcctMenu(false);if(ui.plannerPicker||ui.skill||ui.insight||ui.results||ui.prof||ui.form){portalCloseModal()}else setSim(false)}});


function moveSet(id,col){const st=SK[id];if(!st||st.tier===col)return;st.tier=col;invalidate();render();toast(`${st.name} moved to the ${LV[col].name} badge · badges replayed`)}
let drag=null;
document.addEventListener('dragstart',e=>{const el=e.target.closest&&e.target.closest('[data-drag]');if(!el)return;drag={type:el.dataset.drag,id:el.dataset.id};e.dataTransfer.effectAllowed='move';try{e.dataTransfer.setData('text/plain',drag.id)}catch(_){}el.classList.add('dragging')});
document.addEventListener('dragend',e=>{document.querySelectorAll('.dragging,.over').forEach(x=>x.classList.remove('dragging','over'));drag=null});
const dropTarget=e=>{if(!drag)return null;const el=e.target.closest&&e.target.closest('[data-drop]');if(!el)return null;
  if(drag.type==='skill'){const s=e.target.closest('[data-drop=set]');return s}
  return e.target.closest('[data-drop=col]')};
document.addEventListener('dragover',e=>{const t=dropTarget(e);document.querySelectorAll('.over').forEach(x=>x!==t&&x.classList.remove('over'));if(t){e.preventDefault();t.classList.add('over')}});
document.addEventListener('drop',e=>{const t=dropTarget(e);if(!t)return;e.preventDefault();t.classList.remove('over');
  if(drag.type==='skill'){const sid=t.dataset.id||t.dataset.s,m=MAP[sid]||(MAP[sid]=[]);if(!m.includes(drag.id)){m.push(drag.id);toast(`${LK[drag.id].name} → ${SK[sid].name}`)}ui.mapSel=sid;render()}
  else moveSet(drag.id,t.dataset.col);drag=null});

/* ---------------- confetti ---------------- */
function confetti(){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const c=document.getElementById('confetti');c.hidden=false;c.width=innerWidth*devicePixelRatio;c.height=innerHeight*devicePixelRatio;
  const x=c.getContext('2d'),cs=getComputedStyle(document.documentElement),cols=['--t-spark','--t-scout','--t-star','--t-champ','--brand'].map(v=>cs.getPropertyValue(v).trim());
  const P=Array.from({length:140},()=>({x:c.width/2+(Math.random()-.5)*c.width*.3,y:c.height*.35,vx:(Math.random()-.5)*16*devicePixelRatio,vy:(-Math.random()*14-4)*devicePixelRatio,r:Math.random()*6+3,c:cols[Math.floor(Math.random()*cols.length)],a:Math.random()*6}));
  let f=0;(function tick(){x.clearRect(0,0,c.width,c.height);P.forEach(p=>{p.vy+=.45*devicePixelRatio;p.x+=p.vx;p.y+=p.vy;p.a+=.15;x.save();x.translate(p.x,p.y);x.rotate(p.a);x.fillStyle=p.c;x.fillRect(-p.r,-p.r/2,p.r*2*devicePixelRatio/1.4,p.r*devicePixelRatio/1.4);x.restore()});
    if(++f<110)requestAnimationFrame(tick);else{x.clearRect(0,0,c.width,c.height);c.hidden=true}})()}


/* Presentation interactions: official skill detail, scoped analytics and accessible overlays. */
let portalModalFocus=null,portalModalKey=null;
function portalOpenSkill(id,student=null){if(!SK[id])return;ui.skill={id,student};renderModal()}
function portalSkillHTML(){
 const sk=SK[ui.skill.id],L=LV[sk.tier],st=ui.skill.student?S(ui.skill.student):null,e=st?ev(st):null,o=e?.sk[sk.id],full={sk:{[sk.id]:{earned:1}},best:{}};
 return `<div class="dialog skill-dialog" role="dialog" aria-modal="true" aria-labelledby="skill-dialog-title"><button class="x skill-dialog-close" data-act="closeSkill" aria-label="${st?'Back to player profile':'Close skill details'}">${ic(st?'chev':'close',18)}</button><div class="skill-detail-hero" style="--c:var(--t-${L.id});--cs:var(--t-${L.id}-soft)"><div class="skill-detail-art">${badgeSVG(sk,e||full)}</div><div class="skill-detail-heading"><div class="eyebrow">Skill badge ${String(sk.order+1).padStart(2,'0')} · ${L.name} collection</div><h2 id="skill-dialog-title">${portalEscape(sk.name)}</h2><p>${st?portalEscape(st.name)+' · ':''}${o?.earned?'Badge earned':st?'In progress':L.idx===3?'Complete the pathway':'Build toward '+L.award}</p><span class="pill">${sk.videos.length} ${sk.videos.length===1?'assessment video':'assessment videos'}</span></div></div><div class="skill-detail-content"><section class="skill-standard"><div class="eyebrow">The teaching standard</div><h3>${portalEscape(sk.std)}</h3></section><section><div class="ch"><div class="grow"><h3>${st?'Best AI score per video':'Assessment checklist'}</h3><p class="muted">${st?'Your strongest score from every attempt counts.':'Record these activities in the fixed assessment sequence.'}</p></div><span class="threshold-pill">${rules.threshold}+<small>per video</small></span></div><ol class="skill-video-list">${sk.videos.map((v,i)=>{const score=e?.best[v.id];return `<li><span class="video-index">${i+1}</span><div class="grow"><b>${portalEscape(v.label)}</b><small>${!st?'Required for this badge':score==null?'Not recorded':score>=rules.threshold?'Pass mark reached':'Below pass mark'}</small>${st?`<div class="meter"><div style="width:${score||0}%;background:${score>=rules.threshold?'var(--brand)':'var(--danger)'}"></div><span class="th" style="left:${rules.threshold}%"></span></div>`:''}</div><span class="${score!=null?(score>=rules.threshold?'score-pass':'score-fail'):'video-required'}">${score??(st?'—':'Required')}</span></li>`}).join('')}</ol></section>${st&&o?.history.length?`<section><h3>Assessment attempts</h3><div class="list">${o.history.slice().reverse().map(h=>`<div class="li"><b class="grow">${fmt(h.date)}</b><span class="num">${h.scores.join(' · ')}</span><span class="pill ${h.passNow?'ok':'danger'}">${h.passNow?'Passed':'Not yet'}</span></div>`).join('')}</div></section>`:''}<div class="skill-award-note">${ic('check',20)}<div><b>Clear the assessment. Earn the badge.</b><p>Every video must reach ${rules.threshold}+. The best score per video counts across attempts. ${rules.levelRule==='tier'?'Complete this collection and every earlier collection to progress.':'Level badges follow the current count rule.'} Badges are awarded automatically.</p></div></div></div><footer class="dialog-footer"><span class="muted">${L.name} · official skill standard</span><button class="btn primary" data-act="closeSkill">${st?'Back to player profile':'Done'}</button></footer></div>`;
}
function portalInsightHTML(){
 const q=ui.insight,list=visible().filter(s=>!q.coach||s.coachId===q.coach),rows=[];
 if(q.kind==='badge'){for(const st of list){const e=ev(st),o=e.sk[q.skill];rows.push({st,label:o.earned?'Badge earned':o.history.length?'Still practising':'Not assessed yet',date:o.earned?e.timeline.find(t=>t.kind==='skill'&&t.id===q.skill)?.date:null,earned:o.earned})}}
 else for(const st of list)for(const t of ev(st).timeline.filter(t=>t.kind===q.kind&&monthKey(t.date)===q.month))rows.push({st,label:t.kind==='skill'?SK[t.id].name:LV[t.id].idx===3?'All 16 skills complete':LV[t.id].award+' badge',date:t.date});
 rows.sort((a,b)=>(b.date||'').localeCompare(a.date||'')||a.st.name.localeCompare(b.st.name));
 const title=q.kind==='badge'?SK[q.skill].name:q.kind==='level'?'Level-ups':'Skill badges earned';
 return `<div class="dialog insight-dialog" role="dialog" aria-modal="true" aria-labelledby="insight-title"><div class="dh"><div class="grow"><div class="eyebrow">${q.kind==='badge'?'Badge progression':fmt(q.month+'-01',{month:'long',year:'numeric'})}${q.coach?' · '+portalEscape(CO[q.coach].name):''}</div><h2 id="insight-title">${portalEscape(title)}</h2><p class="muted">${q.kind==='badge'?rows.filter(r=>r.earned).length+' of '+list.length+' players have earned this badge.':rows.length+' awards across '+new Set(rows.map(r=>r.st.id)).size+' players.'}</p></div><button class="x" data-act="closeInsight" aria-label="Close records">${ic('close')}</button></div><div class="db"><div class="insight-list">${rows.length?rows.map(r=>`<button class="insight-row" data-act="prof" data-id="${r.st.id}"><span class="av">${initials(r.st.name)}</span><span class="grow"><b>${portalEscape(r.st.name)}</b><small>${portalEscape(r.label)}</small></span><span class="insight-date">${r.date?fmt(r.date,{day:'numeric',month:'short'}):''}</span><span aria-hidden="true">›</span></button>`).join(''):'<div class="empty">No awards in this period.</div>'}</div></div><footer class="dialog-footer"><span class="muted">Select a player to view their history.</span><button class="btn" data-act="closeInsight">Close</button></footer></div>`;
}
function portalCloseModal(){
 if(ui.plannerPicker)ui.plannerPicker=null;
 else if(ui.skill)ui.skill=null;
 else if(ui.insight)ui.insight=null;
 else{ui.results=null;ui.prof=null;ui.form=null;}
 renderModal();
}
function renderModal(){
 const m=document.getElementById('modal'),wasOpen=!m.hidden,active=document.activeElement;
 if(!wasOpen&&active){portalModalFocus={node:active,id:active.id,act:active.dataset?.act,data:{...active.dataset}};}
 renderModalContent();
 const open=!m.hidden,shell=document.querySelector('.portal-shell'),simEl=document.getElementById('sim');
 if(shell)shell.inert=open;if(simEl)simEl.inert=open;
 document.body.classList.toggle('portal-modal-open',open);
 if(open){const key=ui.plannerPicker?'planner-picker':ui.skill?'skill:'+ui.skill.id:ui.insight?'insight:'+ui.insight.kind:ui.results?'results':ui.form?'form:'+ui.form.type:'profile:'+ui.prof?.id;
  if(key!==portalModalKey||!m.contains(document.activeElement)){const returning=portalModalKey?.startsWith('skill:')&&key.startsWith('profile:');const target=returning?[...m.querySelectorAll('[data-act=selSkill]')].find(el=>el.dataset.s===ui.prof?.sel):m.querySelector('.x,button,input,select,[tabindex="0"]');if(target)target.focus({preventScroll:true});}portalModalKey=key;
 }else if(wasOpen){portalModalKey=null;let target=portalModalFocus?.node;
  if(!target?.isConnected&&portalModalFocus?.id)target=document.getElementById(portalModalFocus.id);
  if(!target?.isConnected&&portalModalFocus?.act)target=[...document.querySelectorAll('[data-act]')].find(el=>Object.entries(portalModalFocus.data).every(([k,v])=>el.dataset[k]===v));
  if(target?.isConnected)target.focus({preventScroll:true});portalModalFocus=null;
 }
}
document.addEventListener('keydown',event=>{
 const m=document.getElementById('modal');if(m.hidden||event.key!=='Tab')return;
 const items=[...m.querySelectorAll('button:not(:disabled),input:not(:disabled),select:not(:disabled),a[href],[tabindex="0"]')].filter(el=>el.getClientRects().length),first=items[0],last=items.at(-1);
 if(!first)return;if(event.shiftKey&&(document.activeElement===first||!m.contains(document.activeElement))){event.preventDefault();last.focus()}else if(!event.shiftKey&&(document.activeElement===last||!m.contains(document.activeElement))){event.preventDefault();first.focus()}
});

/* VISIST visual adapter only. Workspace behaviour above follows the supplied HTML. */
function portalEscape(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function portalInstallArtwork(){
 const nativeBadge=badgeSVG,nativeEmblem=emblem;
 const paths={"0":"assets/skill-badges/01-grip.png","1":"assets/skill-badges/02-airtoss.png","2":"assets/skill-badges/03-keep-lift.png","3":"assets/skill-badges/04-low-serve.png","4":"assets/skill-badges/05-grip-change.png","5":"assets/skill-badges/06-fore-court.png","6":"assets/skill-badges/07-hawk-eye.png","7":"assets/skill-badges/08-high-serve.png","8":"assets/skill-badges/09-drive.png","9":"assets/skill-badges/10-overhead.png","10":"assets/skill-badges/11-shadow.png","11":"assets/skill-badges/12-forehand-front-serve.png","12":"assets/skill-badges/13-netking.png","13":"assets/skill-badges/14-rear-court.png","14":"assets/skill-badges/15-consistency.png","15":"assets/skill-badges/16-backhand-flick.png"};
 badgeSVG=function(skill,e,options={}){const path=paths[String(skill.order)];if(!path)return nativeBadge(skill,e,options);const o=e?.sk[skill.id],earned=!!o?.earned,passed=e?skill.videos.filter(v=>(e.best[v.id]??0)>=rules.threshold).length:0;return `<img class="bdg ${earned?'on':''} ${options.pop?'pop':''}" src="${path}" alt="${portalEscape(skill.name)} badge ${earned?'earned':`not earned, ${passed} of ${skill.videos.length} videos passed`}" width="100" height="100" decoding="async">`;};
 emblem=function(level,got){const path={spark:'Spark.png',scout:'Scout.png',star:'Star.png',champ:'Champ.png'}[level.id];if(!path)return nativeEmblem(level,got);return `<img class="em ${got?'earned':'locked'}" src="${path}" alt="${portalEscape(level.name)}${level.final?' skills complete':' level'}" width="100" height="110" decoding="async">`;};
}
function portalDecorate(){
 document.getElementById('portal-section').textContent=({overview:'Academy overview',students:roleKind()==='assistant'?'My players':'Players',team:'Coaches & venues',planner:'Assessment planner',dayplan:'Day plan',curriculum:'Curriculum & rules',mapping:'Skill mapping',settings:'Settings'}[ui.view]||'Workspace');
}
// Keep the selected workspace account through refresh in this browser tab.
const portalRoleKey='visist-psb-account-role';
function portalRememberRole(role){
 if(role!=='admin'&&!CO[role])return;
 try{sessionStorage.setItem(portalRoleKey,role)}catch(_){}
}
function portalRestoreRole(){
 try{const role=sessionStorage.getItem(portalRoleKey);ui.role=role==='admin'||CO[role]?role:'admin'}catch(_){}
}
function portalSetNavigation(open){const mobile=matchMedia('(max-width:760px)').matches;document.body.classList.toggle('portal-nav-open',mobile&&open);const side=document.getElementById('portal-sidebar');side.inert=mobile&&!open;document.querySelector('.portal-backdrop').hidden=!(mobile&&open);document.getElementById('portal-menu').setAttribute('aria-expanded',String(mobile&&open));}
document.addEventListener('click',event=>{if(event.target.closest('[data-portal-menu]'))portalSetNavigation(!document.body.classList.contains('portal-nav-open'));if(event.target.closest('[data-portal-dismiss],#nav button[data-act=view]'))portalSetNavigation(false);});
document.addEventListener('keydown',event=>{if(event.key==='Escape')portalSetNavigation(false);});
window.addEventListener('resize',()=>portalSetNavigation(false));
portalSetNavigation(false);

document.body.insertAdjacentHTML('afterbegin',svgDefs());
portalInstallArtwork();
portalRestoreRole();
state=seeded();render();
