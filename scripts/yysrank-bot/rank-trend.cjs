const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const teamKey=t=>t.slots.slice(0,5).map(String).sort().join('|');
function scope(source){const keys=['period','rank','upper','length','minimum'];if(!source||keys.some(k=>source[k]==null))return null;return JSON.stringify(keys.map(k=>source[k]));}
function addTrend(current,previous){
 const matching=previous&&scope(current.source.scope)&&scope(current.source.scope)===scope(previous.source?.scope)&&previous.source.updatedAt!==current.source.updatedAt;
 const old=matching?new Map(previous.teams.map(t=>[teamKey(t),t.rank])):new Map();let max=0;
 for(const t of current.teams){const rank=old.get(teamKey(t));t.rankChange=rank==null?null:rank-t.rank;if(t.rankChange>max)max=t.rankChange;}
 for(const t of current.teams)t.biggestRise=max>0&&t.rankChange===max;
 current.comparison={available:!!matching,previousUpdatedAt:matching?previous.source.updatedAt:null,reason:matching?null:'Chưa có kỳ trước cùng bộ lọc và kỳ thống kê.'};return current;
}
function applyReport(target,snapshot,collectedAt,{dry=false}={}){
 const directory=path.join(path.dirname(path.dirname(target)),'scripts','yysrank-bot','output','applied-history');
 const existing=fs.existsSync(target)?JSON.parse(fs.readFileSync(target,'utf8')):null;
 if(existing?.source?.updatedAt===snapshot.source.updatedAt&&scope(existing.source.scope)===scope(snapshot.source.scope)&&scope(snapshot.source.scope)){const rows=x=>JSON.stringify(x.teams.map(t=>[teamKey(t),t.rank,t.winRate,t.pickRate,t.picks]));if(rows(existing)!==rows(snapshot))throw Error('Cùng thời điểm nguồn nhưng dữ liệu khác; cần kiểm tra trước khi áp dụng.');return {snapshot:existing,unchanged:true};}
 if(existing?.source?.updatedAt&&existing.source.updatedAt>snapshot.source.updatedAt)throw Error('Bản duyệt cũ hơn dữ liệu đang áp dụng; không thay thế.');
 const prepared=addTrend(snapshot,existing);prepared.source.collectedAt=collectedAt;
 if(dry)return {snapshot:prepared,unchanged:false};
 fs.mkdirSync(directory,{recursive:true});
 const archive=(obj)=>{const stamp=(obj.source?.collectedAt||obj.source?.updatedAt||'unknown').replace(/[^\dTZ-]/g,'-');const json=JSON.stringify(obj,null,2)+'\n';const digest=crypto.createHash('sha256').update(json).digest('hex').slice(0,12);const name=path.join(directory,`${stamp}-${digest}.json`);if(!fs.existsSync(name))fs.writeFileSync(name,json,{flag:'wx'})};
 if(existing)archive(existing);archive(prepared);
 const tmp=target+'.tmp';try{fs.writeFileSync(tmp,JSON.stringify(prepared,null,2)+'\n');fs.renameSync(tmp,target)}finally{if(fs.existsSync(tmp))fs.unlinkSync(tmp)}
 return {snapshot:prepared,unchanged:false};
}
module.exports={teamKey,scope,addTrend,applyReport};
