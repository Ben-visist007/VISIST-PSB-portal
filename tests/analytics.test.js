import test from 'node:test';
import assert from 'node:assert/strict';
import {dateWindow,withinWindow,assessmentBuckets} from '../js/analytics.js';
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
