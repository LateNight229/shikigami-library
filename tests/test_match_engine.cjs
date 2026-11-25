const {test} = require('node:test');
const assert = require('node:assert/strict');
const engine = require('../match-engine.js');
const unit = {hp:100, atk:25, speed:100, crit:50, critDamage:200};
const team = Array.from({length:5},()=>({...unit}));
test('fixture runs 100 bounded battles reproducibly without mutating inputs',()=>{
  const before=JSON.stringify(team), a=engine.simulateFixture(team,team,100,42), b=engine.simulateFixture(team,team,100,42);
  assert.deepEqual(a,b); assert.equal(a.red+a.blue+a.unresolved,100); assert.equal(JSON.stringify(team),before);
});
test('action limit reports unresolved instead of declaring winner',()=>{
  assert.deepEqual(engine.simulateFixture(team,team,100,1,1),{red:0,blue:0,unresolved:100});
});
test('rejects invalid fixture and refuses unverified actual game',()=>{
  assert.throws(()=>engine.simulateFixture([],team));
  const report=engine.validateGameTeams(Array(5).fill(null),Array(5).fill(null));
  assert.equal(report.ok,false); assert.equal(report.errors.filter(x=>x.includes('chưa chọn thức thần')).length,10);
});
test('rejects incomplete real stats and does not mistake zero for missing',()=>{
  const character={id:'12',soul:'1',stats:{hp:'100',atk:'0',def:'0',speed:'100',crit:'0',critDamage:'150',effectHit:'0',effectRes:'0'}};
  const report=engine.validateGameTeams(Array(5).fill(character),Array(5).fill(character));
  assert.equal(report.errors.some(x=>x.includes('chỉ số')),false);
  assert.equal(report.ok,true);
});
test('approximate teams run reproducibly without mutating inputs',()=>{
  const stats={hp:20000,atk:5000,def:700,speed:150,crit:80,critDamage:200,effectHit:0,effectRes:0};
  const red=Array.from({length:5},(_,i)=>({id:String(i+1),stats:{...stats},mode:'aoe'}));
  const blue=Array.from({length:5},(_,i)=>({id:String(i+6),stats:{...stats},mode:'single'}));
  const before=JSON.stringify([red,blue]);
  const result=engine.simulateApproximate(red,blue,100,42);
  assert.deepEqual(result,engine.simulateApproximate(red,blue,100,42));
  assert.equal(result.red+result.blue+result.unresolved,100);
  assert.equal(JSON.stringify([red,blue]),before);
  assert.deepEqual(engine.simulateApproximate(red,blue,100,1,1),{red:0,blue:0,unresolved:100});
  assert.throws(()=>engine.simulateApproximate([],blue));
});
