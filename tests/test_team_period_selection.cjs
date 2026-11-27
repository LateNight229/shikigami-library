const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
test('chọn kỳ đồng bộ đội và hai bảng đề cử thức thần',async()=>{
 const handlers={},current={source:{scope:{period:'Kỳ'},updatedAt:'2026-01-02'},teams:[{slots:['1']}]},old={source:{updatedAt:'2026-01-01'},teams:[{slots:['2']}]};
 const ctx={document:{addEventListener:(name,fn)=>handlers[name]=fn},getJson:async p=>p.includes('top20')?current:{periods:[{id:'old',label:'Kỳ cũ',snapshot:old}]},esc:x=>String(x),cloud:{},heroPvp:{},state:{view:'hero'},display:async()=>{},drawTeamList:()=>{}};
 vm.createContext(ctx);vm.runInContext(fs.readFileSync(path.join(__dirname,'../team-periods.js'),'utf8')+'\nglobalThis.api={loadTeamPeriods,periodSelect,teamPeriods}',ctx);
 await ctx.api.loadTeamPeriods();assert.match(ctx.api.periodSelect(),/2026-01-02/);
 await handlers.change({target:{matches:()=>true,value:'old'}});
 assert.equal(ctx.cloud.curated,old);assert.equal(ctx.heroPvp.teams,old);assert.equal(ctx.api.teamPeriods.selected,'old');
});
test('tải kỳ khi dữ liệu đội đã được phần so sánh tải trước',async()=>{
 const current={source:{updatedAt:'2026-01-02'},teams:[]},archive={periods:[{id:'old',label:'Kỳ cũ',snapshot:current}]};
 const ctx={document:{addEventListener(){}},getJson:async p=>p.includes('top20')?current:archive,esc:String,cloud:{},state:{view:'hero',tab:'hero-teams',heroes:[]},display:async()=>{},image:()=>'',localName:()=>''};
 vm.createContext(ctx);
 vm.runInContext(fs.readFileSync(path.join(__dirname,'../team-periods.js'),'utf8')+'\n'+fs.readFileSync(path.join(__dirname,'../hero-pvp.js'),'utf8')+'\nglobalThis.api={teamPeriods,heroPvp,heroTeamPanel,heroAlliesPanel}',ctx);
 ctx.api.heroPvp.teams=current;
 assert.match(ctx.api.heroTeamPanel({id:'1'}),/Đang tải/);
 assert.match(ctx.api.heroAlliesPanel({id:'1'}),/Đang tải/);
 await ctx.api.teamPeriods.loading;
 await new Promise(resolve=>setImmediate(resolve));
 assert.match(ctx.api.heroTeamPanel({id:'1'}),/Kỳ cũ/);
 assert.match(ctx.api.heroAlliesPanel({id:'1'}),/Kỳ cũ/);
});
