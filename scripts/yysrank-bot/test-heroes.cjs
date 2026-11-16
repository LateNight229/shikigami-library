const test=require('node:test'),assert=require('node:assert/strict'),{normalize}=require('./collect-heroes.cjs');
const base={updatedAt:'2026-11-16 02:02:17',period:'mùa',rank:'名仕(0星)',upper:'不设上限',matches:10,rows:Array.from({length:10},(_,i)=>({name:'英雄'+i,winRate:50,pickRate:10,banRate:0}))};
const heroes=base.rows.map((x,i)=>({id:String(i),name:{zh:x.name}}));
test('preserves true zero and skips unknown names',()=>{const result=normalize(base,heroes.slice(0,9));assert.equal(Object.keys(result.heroes).length,9);assert.equal(result.heroes['0'].banRate,0);assert.equal(result.unmatched.length,1);});
test('rejects invalid source, bad values and incomplete pages',()=>{assert.throws(()=>normalize({...base,rank:'other'},heroes));assert.throws(()=>normalize({...base,rows:base.rows.slice(0,2)},heroes));assert.throws(()=>normalize({...base,rows:base.rows.map((x,i)=>i?x:{...x,winRate:null})},heroes));});
