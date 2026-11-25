const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
test('chọn kỳ đồng bộ đội và hai bảng đề cử thức thần',async()=>{
 const handlers={},current={source:{scope:{period:'Kỳ'},updatedAt:'2026-01-02'},teams:[{slots:['1']}]},old={source:{updatedAt:'2026-01-01'},teams:[{slots:['2']}]};
 const ctx={document:{addEventListener:(name,fn)=>handlers[name]=fn},getJson:async p=>p.includes('top20')?current:{periods:[{id:'old',label:'Kỳ cũ',snapshot:old}]},esc:x=>String(x),cloud:{},heroPvp:{},state:{view:'hero'},display:async()=>{},drawTeamList:()=>{}};
 vm.createContext(ctx);vm.runInContext(fs.readFileSync(path.join(__dirname,'../team-periods.js'),'utf8')+'\nglobalThis.api={loadTeamPeriods,periodSelect,teamPeriods}',ctx);
 await ctx.api.loadTeamPeriods();assert.match(ctx.api.periodSelect(),/2026-01-02/);
 await handlers.change({target:{matches:()=>true,value:'old'}});
 assert.equal(ctx.cloud.curated,old);assert.equal(ctx.heroPvp.teams,old);assert.equal(ctx.api.teamPeriods.selected,'old');
});
