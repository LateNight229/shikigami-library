const assert = require('node:assert/strict');
const {sortHeroes, neighborId} = require('../sort.js');
const heroes = [
  {id:'1',stats:{hp:{value:10},crit:{value:30}}},
  {id:'2',stats:{hp:{value:2},crit:{value:10}}},
  {id:'3',stats:{hp:{value:null}}},
  {id:'4',stats:{hp:{value:10}}},
  {id:'5',stats:{}},
];
const ids = a => a.map(x=>x.id);
assert.deepEqual(ids(sortHeroes(heroes,'hp','asc')),['2','1','4','3','5']);
assert.deepEqual(ids(sortHeroes(heroes,'hp','desc')),['1','4','2','3','5']);
assert.deepEqual(ids(sortHeroes(heroes,'crit','asc')),['2','1','3','4','5']);
assert.deepEqual(ids(sortHeroes(heroes,'default','asc')),['1','2','3','4','5']);
assert.deepEqual(ids(heroes),['1','2','3','4','5']);
const sorted = sortHeroes(heroes,'hp','asc');
assert.equal(neighborId(sorted,'2',1),'1');
assert.equal(neighborId(sorted,'2',-1),'5');
assert.equal(neighborId(sorted,'5',1),'2');
assert.equal(neighborId(sorted.filter(x=>['1','4'].includes(x.id)),'1',1),'4');
assert.equal(neighborId(sorted.filter(x=>x.id==='4'),'missing',1),'4');
assert.equal(neighborId([], '1', 1), null);
console.log('Sort số, phần trăm, thiếu dữ liệu, bằng điểm và mặc định: OK');
