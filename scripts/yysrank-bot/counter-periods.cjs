const crypto=require('node:crypto');
const clean=value=>String(value??'').replace(/\s+/g,'');
function validatePair(team,counters){
 const a=team?.source,b=counters?.source?.scope;
 if(!a?.updatedAt||!a.period||!a.rank||!a.upper||!b?.period||!b.rank||!b.upper||!counters.source.updatedAt)throw Error('Thiếu kỳ, rank hoặc thời gian nguồn của đội/khắc chế.');
 if(['period','rank','upper'].some(k=>clean(a[k])!==clean(b[k])))throw Error('Kỳ hoặc bộ lọc rank của đội và khắc chế không khớp; chưa áp dụng.');
 if(!Array.isArray(counters.unmatched)||counters.unmatched.length)throw Error('Có tên khắc chế chưa đối chiếu; chưa áp dụng.');
 if(!counters.heroes||Object.keys(counters.heroes).length<10||!Object.values(counters.heroes).some(x=>Array.isArray(x.counters)&&x.counters.length))throw Error('Dữ liệu khắc chế thiếu hoặc rỗng; chưa áp dụng.');
 if(Object.values(counters.heroes).some(x=>!Array.isArray(x.counters)||x.sourceCount!==x.counters.length))throw Error('Danh sách khắc chế chưa đầy đủ; chưa áp dụng.');
 return true;
}
function prepareRegistry(registry,team,counters){
 validatePair(team,counters);if(!Array.isArray(registry?.periods))throw Error('Danh sách kỳ khắc chế không hợp lệ.');
 const match=registry.periods.find(p=>clean(p.snapshot?.source?.period)===clean(counters.source.period));
 if(match?.snapshot?.source?.updatedAt>counters.source.updatedAt)throw Error('Dữ liệu khắc chế cũ hơn kỳ đã lưu.');
 const id=match?.id||crypto.createHash('sha256').update(JSON.stringify([clean(counters.source.period),clean(counters.source.scope.rank),clean(counters.source.scope.upper)])).digest('hex').slice(0,16);
 const label=`${counters.source.period} · ${counters.source.updatedAt} · ${team.collectedRows} đội`;
 const periods=registry.periods.filter(p=>p.id!==id);periods.push({id,label,snapshot:counters});periods.sort((a,b)=>(b.snapshot.source.updatedAt||'').localeCompare(a.snapshot.source.updatedAt||''));return {periods};
}
module.exports={validatePair,prepareRegistry};
