import test from 'node:test';
import assert from 'node:assert/strict';
import {dateWindow,withinWindow,assessmentBuckets,uniqueBadgeAwards,cumulativeBadgeBuckets} from '../js/analytics.js';
test('reporting windows include exactly 7, 30 or 90 days through the selected date',()=>{
 assert.deepEqual(dateWindow('2026-11-13','7'),{start:'2026-11-07',end:'2026-11-13'});
 assert.equal(dateWindow('2026-11-13','30').start,'2026-10-15');
 assert.equal(dateWindow('2026-11-13','90').start,'2026-08-16');
 assert(withinWindow('2026-11-07','2026-11-13','7'));
 assert(!withinWindow('2026-11-06','2026-11-13','7'));
 assert(!withinWindow('2026-11-14','2026-11-13','all'));
});
test('buckets cover every date exactly once, including earliest, today and leap day',()=>{
 const records=[{date:'2024-02-28'},{date:'2024-02-29'},{date:'2024-03-01'},{date:'2024-03-01'}];
 const buckets=assessmentBuckets(records,'2024-03-01','all');
 assert.equal(buckets.reduce((n,b)=>n+b.count,0),records.length);
 assert.equal(buckets[0].start,'2024-02-28');assert.equal(buckets.at(-1).end,'2024-03-01');
 for(const r of records)assert.equal(buckets.filter(b=>r.date>=b.start&&r.date<=b.end).length,1);
});
test('aggregation respects already role-filtered records and excludes future/out-of-range data',()=>{
 const rows=[{student:'mine',date:'2026-11-07'},{student:'mine',date:'2026-11-13'},{student:'other',date:'2026-11-13'},{student:'mine',date:'2026-11-14'},{student:'mine',date:'2026-11-06'}];
 const scoped=rows.filter(r=>r.student==='mine');
 const buckets=assessmentBuckets(scoped,'2026-11-13','7');
 assert.equal(buckets.reduce((n,b)=>n+b.count,0),2);
});
test('empty windows and a one-day all-time history remain useful and finite',()=>{
 const empty=assessmentBuckets([],'2026-11-13','all');
 assert.deepEqual(empty,[{start:'2026-11-13',end:'2026-11-13',count:0}]);
 assert.equal(assessmentBuckets([{date:'2026-11-13'}],'2026-11-13','all')[0].count,1);
});

test('cumulative badges include opening balance and exclude repeat passes, failures and baseline',()=>{
 const rows=[{id:'opening',student:'a',skill:1,date:'2026-10-01',outcome:'Passed'},
  {id:'repeat',student:'a',skill:1,date:'2026-11-12',outcome:'Passed'},
  {id:'new',student:'a',skill:2,date:'2026-11-09',outcome:'Passed'},
  {id:'baseline',student:'a',skill:3,date:'2026-11-10',outcome:'Passed',baseline:true},
  {id:'failed',student:'a',skill:4,date:'2026-11-11',outcome:'Needs Practice'},
  {id:'future',student:'a',skill:4,date:'2026-11-14',outcome:'Passed'}];
 assert.deepEqual(uniqueBadgeAwards(rows,'2026-11-13').map(a=>a.id),['opening','new']);
 const b=cumulativeBadgeBuckets(rows,'2026-11-13','7');assert.equal(b[0].opening,1);assert.equal(b.at(-1).count,2);assert.equal(b.reduce((n,b)=>n+b.newCount,0),1);
 assert(b.every((v,i)=>i===0||v.count>=b[i-1].count));
});

test('the same skill earned by different students counts individually and scope stays explicit',()=>{
 const rows=[{student:'a',skill:1,date:'2026-11-01',outcome:'Passed'},{student:'b',skill:1,date:'2026-11-02',outcome:'Passed'}];
 assert.equal(cumulativeBadgeBuckets(rows,'2026-11-13','all').at(-1).count,2);
 assert.equal(cumulativeBadgeBuckets(rows.filter(a=>a.student==='a'),'2026-11-13','all').at(-1).count,1);
});
