// Date-only analytics: inclusive calendar-day windows, independent of local time.
const DAY = 86400000;
const dayNumber = date => Math.floor(Date.parse(date+'T00:00:00Z')/DAY);
const dateAt = day => new Date(day*DAY).toISOString().slice(0,10);
export function dateWindow(today, range, records = []) {
 const end=dayNumber(today);
 const start=range==='all' ? Math.min(end,...records.filter(r=>r.date<=today).map(r=>dayNumber(r.date))) : end-Math.max(1,Number(range))+1;
 return {start:dateAt(start),end:today};
}
export function withinWindow(date,today,range) {
 return date<=today && (range==='all'||date>=dateWindow(today,range).start);
}
export function assessmentBuckets(records,today,range,maxBuckets=6) {
 const window=dateWindow(today,range,records),start=dayNumber(window.start),end=dayNumber(window.end),days=end-start+1;
 const count=Math.min(Math.max(1,maxBuckets),days);
 return Array.from({length:count},(_,i)=>{
  const from=dateAt(start+Math.floor(i*days/count));
  const through=dateAt(start+Math.floor((i+1)*days/count)-1);
  return {start:from,end:through,count:records.filter(r=>r.date>=from&&r.date<=through).length};
 });
}

// Each individual badge has one earning event, even if its skill is assessed again.
export function uniqueBadgeAwards(records,through='9999-12-31'){
 const earned=new Map();
 for(const a of records){
  if(a.baseline||a.outcome!=='Passed'||!Number.isInteger(a.skill)||a.date>through)continue;
  const key=a.student+':'+a.skill;
  if(!earned.has(key)||a.date<earned.get(key).date)earned.set(key,a);
 }
 return [...earned.values()].sort((a,b)=>a.date.localeCompare(b.date)||String(a.student).localeCompare(String(b.student))||a.skill-b.skill);
}
export function cumulativeBadgeBuckets(records,today,range,maxBuckets=6){
 const awards=uniqueBadgeAwards(records,today),buckets=assessmentBuckets(awards,today,range,maxBuckets);
 const opening=awards.filter(a=>a.date<buckets[0].start).length;
 return buckets.map(b=>({...b,newCount:b.count,opening,count:awards.filter(a=>a.date<=b.end).length}));
}
