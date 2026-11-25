const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {applyReport}=require('./rank-trend.cjs');
test('mỗi lần nguồn cập nhật giữ kỳ cũ, so hạng và áp dụng lại an toàn',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'periods-'));
 try{
  fs.mkdirSync(path.join(root,'curated'));
  const target=path.join(root,'curated','yysrank-top20.json'),archive=path.join(root,'curated','team-periods.json');
  const mk=(period,date,ids,rank='r')=>({source:{updatedAt:date,scope:{period,rank,upper:'a',length:'5',minimum:100}},teams:ids.map((id,i)=>({rank:i+1,slots:[id,'2','3','4','5'],winRate:70-i,pickRate:1,picks:200}))});
  const old=mk('old','2026-01-01',['1','6']);fs.writeFileSync(target,JSON.stringify(old));
  let result=applyReport(target,mk('new','2026-01-02',['6','1']),'2026-01-02T00:00:00Z',{dry:true});
  assert.equal(result.snapshot.teams[0].rankChange,1);assert.equal(fs.existsSync(archive),false);assert.deepEqual(JSON.parse(fs.readFileSync(target)),old);
  applyReport(target,mk('new','2026-01-02',['6','1']),'2026-01-02T00:00:00Z');
  result=applyReport(target,mk('new','2026-01-03',['1','6']),'2026-01-03T00:00:00Z');
  assert.equal(result.snapshot.teams[0].rankChange,1);
  let periods=JSON.parse(fs.readFileSync(archive)).periods;
  assert.deepEqual(periods.map(p=>p.snapshot.source.updatedAt),['2026-01-02','2026-01-01']);
  assert.match(periods[0].label,/2026-01-02/);
  assert.equal(applyReport(target,mk('new','2026-01-03',['1','6']),'later').unchanged,true);
  assert.equal(JSON.parse(fs.readFileSync(archive)).periods.length,2);
  result=applyReport(target,mk('new','2026-01-04',['6','1'],'other'),'later');
  assert.equal(result.snapshot.comparison.available,false);assert.equal(result.snapshot.teams[0].rankChange,null);
  periods=JSON.parse(fs.readFileSync(archive)).periods;assert.equal(periods.length,3);
 }finally{fs.rmSync(root,{recursive:true,force:true})}
});
