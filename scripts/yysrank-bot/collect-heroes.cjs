const fs=require('node:fs');
const path=require('node:path');

function normalize(data,heroes){
  if(!data.updatedAt||!data.period||data.rank!=='名仕(0星)'||data.upper!=='不设上限'||!Number.isInteger(data.matches)||data.matches<=0||data.rows.length<10)throw Error('Nguồn thiếu dữ liệu hoặc bộ lọc thay đổi.');
  const entries={},unmatched=[];
  for(const row of data.rows){
    if(!row.name||![row.winRate,row.pickRate,row.banRate].every(x=>Number.isFinite(x)&&x>=0&&x<=100))throw Error(`Dữ liệu thiếu hoặc không hợp lệ: ${row.name}`);
    const matches=heroes.filter(h=>h.name?.zh===row.name);
    if(matches.length!==1){unmatched.push(row.name);continue;}
    const id=String(matches[0].id);if(entries[id])throw Error(`Trùng thức thần ${row.name}`);
    entries[id]={winRate:row.winRate,pickRate:row.pickRate,banRate:row.banRate};
  }
  return {source:{name:'阳间斗技',url:'https://yysrank.win/query/shishen',updatedAt:data.updatedAt,period:data.period,rank:'Danh sĩ 0 sao trở lên',matches:data.matches,metric:'外战胜率'},unmatched,heroes:entries};
}
function normalizeCounters(data,heroes){
  if(!data.updatedAt||!data.period||data.rank!=='名仕(0星)'||data.upper!=='不设上限'||!Number.isInteger(data.matches)||data.matches<=0||data.rows.length<10||data.counterHeader!=='受制于')throw Error('Nguồn thiếu cột khắc chế hoặc bộ lọc thay đổi.');
  const index=new Map();for(const hero of heroes){const name=hero.name?.zh;if(!name)continue;const items=index.get(name)||[];items.push(hero);index.set(name,items);}
  const entries={},unmatched=[];
  for(const row of data.rows){
    if(!row.name||!Array.isArray(row.counterNames))throw Error('Dữ liệu khắc chế không hợp lệ.');
    const matches=index.get(row.name)||[];if(matches.length!==1){unmatched.push({hero:row.name,reason:'Không khớp thức thần'});continue;}
    const id=String(matches[0].id);if(entries[id])throw Error(`Trùng thức thần ${row.name}`);
    const seen=new Set(),counters=[];
    for(const name of row.counterNames){if(!name||seen.has(name))continue;seen.add(name);const candidates=index.get(name)||[];if(candidates.length!==1){unmatched.push({hero:row.name,counter:name,reason:'Không khớp thức thần khắc chế'});continue;}counters.push({id:String(candidates[0].id),nameZh:name,nameVi:candidates[0].name.vi||null});}
    entries[id]={nameZh:row.name,nameVi:matches[0].name.vi||null,counters,sourceCount:seen.size};
  }
  if(!Object.values(entries).some(x=>x.sourceCount))throw Error('Không đọc được icon khắc chế; không tạo dữ liệu rỗng.');
  return {source:{name:'阳间斗技',url:'https://yysrank.win/query/shishen',updatedAt:data.updatedAt,period:data.period,rank:'Danh sĩ 0 sao trở lên',matches:data.matches,field:'受制于',meaning:'Bị khắc chế theo bảng xếp hạng nguồn'},collectedAt:new Date().toISOString(),unmatched,heroes:entries};
}
async function main(){
  const {chromium}=require('playwright-core'),args=process.argv.slice(2);
  const opt=name=>{const i=args.indexOf(name);return i<0?null:args[i+1];};
  const repo=path.resolve(opt('--repo')||'E:/1_Github/shikigami-library');
  const heroes=JSON.parse(fs.readFileSync(path.join(repo,'data/shikigami-catalog.json'),'utf8')).heroes;
  const browser=await chromium.launch({channel:'msedge',headless:true});
  try{
    const page=await browser.newPage();await page.goto('https://yysrank.win/query/shishen',{waitUntil:'domcontentloaded',timeout:30000});
    await page.locator('table tbody tr').first().waitFor({timeout:30000});
    const data=await page.evaluate(()=>{const text=document.body.innerText,selects=Array.from(document.querySelectorAll('.el-select')).map(x=>x.innerText.trim()).filter(Boolean),headers=Array.from(document.querySelectorAll('table thead th')).map(x=>x.innerText.trim()),counterIndex=headers.indexOf('受制于');const pct=s=>{const match=s?.match(/^\s*(\d+(?:\.\d+)?)\s*%/);return match?Number(match[1]):null;};return {counterHeader:headers[counterIndex],updatedAt:text.match(/更新于\s*(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/)?.[1],matches:Number(text.match(/统计自\s*([\d,]+)\s*场对局/)?.[1]?.replaceAll(',','')),period:selects[0],rank:selects[1],upper:selects[2],rows:Array.from(document.querySelectorAll('table tbody tr')).map(tr=>{const cells=tr.querySelectorAll('td');return {name:cells[1]?.querySelector('img[alt]')?.alt,winRate:pct(cells[2]?.innerText),pickRate:pct(cells[3]?.innerText),banRate:pct(cells[4]?.innerText),counterNames:counterIndex<0?null:Array.from(cells[counterIndex]?.querySelectorAll('img[alt]')||[]).map(img=>img.alt.trim()).filter(Boolean)};}).filter(row=>row.name)};});
    const snapshot=normalize(data,heroes);console.log(`Nguồn ${data.updatedAt}: ${data.rows.length} dòng, khớp ${Object.keys(snapshot.heroes).length}, chưa khớp ${snapshot.unmatched.length}.`);
    const counters=normalizeCounters(data,heroes);console.log(`Khắc chế: ${Object.keys(counters.heroes).length} thức thần, ${Object.values(counters.heroes).reduce((n,x)=>n+x.counters.length,0)} quan hệ khớp, ${counters.unmatched.length} cảnh báo.`);
    if(args.includes('--dry-run')){console.log('Chạy thử: không ghi file.');return;}
    const output=path.resolve(opt('--output')||path.join(__dirname,'output','hero-pvp.json'));fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(snapshot,null,2)+'\n','utf8');const counterOutput=path.resolve(opt('--counters-output')||path.join(__dirname,'output','hero-counters.json'));fs.mkdirSync(path.dirname(counterOutput),{recursive:true});fs.writeFileSync(counterOutput,JSON.stringify(counters,null,2)+'\n','utf8');console.log(`Đã xuất ${output} và ${counterOutput}; chưa cập nhật website.`);
  }finally{await browser.close();}
}
if(require.main===module)main().catch(error=>{console.error(`Không thu thập: ${error.message}`);process.exitCode=1;});
module.exports={normalize,normalizeCounters};
