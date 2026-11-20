const fs = require('node:fs');
const path = require('node:path');

function convert(rows, heroes, meta, options = {}) {
  if (!Array.isArray(rows) || !Number.isInteger(meta.total) || !meta.total || (rows.length !== meta.total && !(options.allowExtra && rows.length > meta.total))) throw Error('Nguồn không trả đủ số đội đã công bố.');
  if (!meta.updatedAt || !meta.period || meta.minimum !== 100 || meta.rank !== '名仕(0星)' || meta.upper !== '不设上限' || meta.length !== '完整阵容') throw Error('Bộ lọc nguồn thay đổi hoặc không đọc được; giữ nguyên dữ liệu cũ.');
  const seen = new Set();
  const teams = rows.map((row, i) => {
    if (row.rank !== i + 1 || row.names.length !== 5 || !Number.isFinite(row.winRate) || row.winRate < 0 || row.winRate > 100 || !Number.isFinite(row.pickRate) || row.pickRate < 0 || row.pickRate > 100 || !Number.isInteger(row.picks) || row.picks < 100 || (i && rows[i-1].winRate < row.winRate)) throw Error(`Dữ liệu hoặc thứ tự đội ${i+1} không hợp lệ.`);
    const ids = row.names.map(name => {
      const matches = heroes.filter(h => h.name?.zh === name);
      if (matches.length !== 1) throw Error(`Không ánh xạ được thức thần: ${name} (${matches.length} kết quả).`);
      return String(matches[0].id);
    });
    const key = [...ids].sort().join(',');
    if (seen.has(key)) throw Error(`Đội ${i+1} bị trùng.`);
    seen.add(key);
    return {id:`yysrank-${meta.updatedAt.slice(0,10).replaceAll('-','')}-${String(i+1).padStart(2,'0')}`,rank:i+1,winRate:row.winRate,pickRate:row.pickRate,picks:row.picks,slots:[...ids,...Array(5).fill(null)]};
  });
  return {source:{name:'阳间斗技',url:'https://yysrank.win/query/team',updatedAt:meta.updatedAt,filter:`PvP · Danh sĩ từ 0 sao · ${meta.period} · tối thiểu 100 lượt chọn`,metric:'外战胜率'},teams};
}

async function readPage(page) {
  return page.evaluate(() => {
    const text=document.body.innerText;
    const updatedAt=text.match(/更新于\s*(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/)?.[1];
    const selections=Array.from(document.querySelectorAll('.el-select')).map(x=>x.innerText.trim()).filter(Boolean);
    const minimum=Number(document.querySelector('input[role="spinbutton"]')?.value);
    const rows=Array.from(document.querySelectorAll('table tbody tr')).map(tr=>{
      const cells=Array.from(tr.querySelectorAll('td'));
      const names=Array.from(cells[1]?.querySelectorAll('img[alt]')||[]).map(img=>img.alt);
      const picks=cells[3]?.innerText.match(/\/\s*([\d,]+)/)?.[1]?.replaceAll(',','');
      const pickRate=cells[3]?.innerText.match(/([\d.]+)\s*%/)?.[1];
      return {rank:Number(cells[0]?.innerText.trim()),names,winRate:Number(cells[2]?.innerText.replace('%','').trim()),pickRate:pickRate==null?null:Number(pickRate),picks:Number(picks)};
    }).filter(row=>row.names.length);
    const total=Number(text.match(/筛选条件下共\s*([\d,]+)\s*个阵容/)?.[1]?.replaceAll(',',''));
    return {rows,meta:{updatedAt,period:selections[0],rank:selections[1],upper:selections[2],length:selections[3],minimum,total}};
  });
}

async function collect(page, full=false, review=false) {
  await page.goto('https://yysrank.win/query/team', {waitUntil:'domcontentloaded',timeout:30000});
  await page.locator('table tbody tr').first().waitFor({timeout:30000});
  const first=await readPage(page), rows=[...first.rows];
  if(!first.meta.total || rows.length!==Math.min(20,first.meta.total))throw Error('Không đọc được trang đầu hoặc tổng số đội.');
  if(!full)return {rows,meta:{...first.meta,total:rows.length}};
  while(rows.length < first.meta.total) {
    const expected=rows.length+1;
    const previous=rows.slice(-Math.min(20,rows.length))[0].names.join('|');
    await page.getByRole('button',{name:'下一页'}).click({timeout:15000});
    await page.waitForFunction(({expected,previous}) => {const tr=document.querySelector('table tbody tr');const names=Array.from(tr?.querySelectorAll('td:nth-child(2) img[alt]')||[]).map(img=>img.alt).join('|');return Number(tr?.querySelector('td')?.innerText.trim())===expected && names && names!==previous;},{expected,previous},{timeout:30000});
    const next=await readPage(page);
    const expectedCount=Math.min(20,first.meta.total-rows.length);
    if(JSON.stringify(next.meta)!==JSON.stringify(first.meta) || !next.rows.length || next.rows[0].rank!==expected || (next.rows.length!==expectedCount && !(review && rows.length+expectedCount===first.meta.total && next.rows.length>expectedCount && next.rows.length<=20)))throw Error(`Nguồn không nhất quán ở hạng ${expected}: nhận ${next.rows.length} dòng, dự kiến ${expectedCount}; giữ dữ liệu cũ.`);
    rows.push(...next.rows);
    console.log(`Đã đọc ${rows.length}/${first.meta.total} đội`);
  }
  return {rows,meta:first.meta};
}

function makeReport(rows, heroes, meta) {
  const seen=new Map(), warnings=[];
  if(rows.length!==meta.total)warnings.push(`Nguồn báo ${meta.total} đội nhưng đã đọc ${rows.length} dòng; không tự cắt bỏ dòng thừa.`);
  const results=rows.map((row,i)=>{
    const issues=[];
    const mapped=row.names.map(name=>{const candidates=heroes.filter(h=>h.name?.zh===name);if(candidates.length!==1){issues.push(`Không khớp tên ${name}`);return {zh:name,vi:null,id:null};}const h=candidates[0];return {zh:name,vi:h.name.vi||null,id:String(h.id)};});
    const key=[...row.names].sort().join('|');
    if(seen.has(key))issues.push(`Trùng thành phần với hạng ${seen.get(key)}`);else seen.set(key,row.rank);
    if(row.rank!==i+1)issues.push('Hạng không liên tục');
    if(i&&rows[i-1].winRate<row.winRate)issues.push('Tỷ lệ thắng tăng so với dòng trước');
    if(row.names.length!==5 || !Number.isFinite(row.winRate) || !Number.isInteger(row.picks))issues.push('Thiếu hoặc sai dữ liệu');
    return {...row,heroes:mapped,issues};
  });
  return {source:{url:'https://yysrank.win/query/team',...meta},collectedAt:new Date().toISOString(),reportedTotal:meta.total,collectedRows:rows.length,issueCount:results.filter(x=>x.issues.length).length,warnings,teams:results};
}
function csvReport(report) {
  const safe=value=>{let s=String(value??'');if(/^[=+\-@\t\r]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';};
  const rows=[['Hạng nguồn','Tỷ lệ thắng (%)','Lượt chọn',...Array.from({length:5},(_,i)=>`Thức thần ${i+1}`),...Array.from({length:5},(_,i)=>`Tên Trung ${i+1}`),'Cảnh báo'],...report.teams.map(t=>[t.rank,t.winRate,t.picks,...t.heroes.map(h=>h.vi||h.zh),...t.heroes.map(h=>h.zh),t.issues.join('; ')])];
  return '\uFEFF'+rows.map(row=>row.map(safe).join(',')).join('\r\n')+'\r\n';
}

async function main() {
  const args=process.argv.slice(2), dry=args.includes('--dry-run'), apply=args.includes('--apply');
  const option=name=>{const i=args.indexOf(name);return i<0?null:args[i+1];};
  const repo=path.resolve(option('--repo')||'E:/1_Github/shikigami-library');
  const heroes=JSON.parse(fs.readFileSync(path.join(repo,'data/shikigami-catalog.json'),'utf8')).heroes;
  const reportPath=option('--apply-report');
  if(reportPath){
    const report=JSON.parse(fs.readFileSync(path.resolve(reportPath),'utf8'));
    if(!Array.isArray(report.teams) || report.collectedRows!==report.teams.length || report.reportedTotal!==report.source?.total || report.issueCount!==0 || report.teams.some(t=>!Array.isArray(t.issues)||t.issues.length)) throw Error('Bản duyệt không đầy đủ hoặc có cảnh báo từng đội.');
    const snapshot=convert(report.teams,heroes,report.source,{allowExtra:args.includes('--accept-extra')});
    const target=path.join(repo,'curated/yysrank-top20.json');
    console.log(`Bản duyệt: nguồn báo ${report.reportedTotal}, đọc ${report.collectedRows} đội; ${snapshot.teams.length} đội hợp lệ.`);
    if(dry){console.log('Chạy thử: không ghi file.');return;}
    const temporary=target+'.tmp';
    try {fs.writeFileSync(temporary,JSON.stringify(snapshot,null,2)+'\n','utf8');fs.renameSync(temporary,target);}
    finally {if(fs.existsSync(temporary))fs.unlinkSync(temporary);}
    console.log(`Đã cập nhật ${target}. Kiểm tra thay đổi trước khi commit/push.`);return;
  }
  const {chromium} = require('playwright-core');
  const browser=await chromium.launch({channel:'msedge',headless:true});
  try {
    const page=await browser.newPage(); let result, lastError;
    for(let attempt=0;attempt<2;attempt++){try{result=await collect(page,args.includes('--full'),!apply);break;}catch(e){lastError=e;}}
    if(!result)throw lastError;
    if(!apply){
      const report=makeReport(result.rows,heroes,result.meta);
      console.log(`Nguồn báo ${report.reportedTotal}, đã đọc ${report.collectedRows} dòng; ${report.issueCount} dòng có cảnh báo.`);
      report.warnings.forEach(w=>console.warn(`Cảnh báo: ${w}`));
      if(dry){console.log('Chạy thử: không ghi file.');return;}
      const out=path.resolve(option('--output')||path.join(__dirname,'output'));
      fs.mkdirSync(out,{recursive:true});
      const stamp=new Date().toISOString().replace(/[:.]/g,'-');
      const base=path.join(out,`doi-hinh-${stamp}`);
      fs.writeFileSync(base+'.json',JSON.stringify(report,null,2)+'\n','utf8');
      fs.writeFileSync(base+'.csv',csvReport(report),'utf8');
      console.log(`Đã xuất ${base}.json và .csv; chưa thay đổi dữ liệu website.`);
      return;
    }
    const target=path.join(repo,'curated/yysrank-top20.json');
    if(!args.includes('--full')&&fs.existsSync(target)){const existing=JSON.parse(fs.readFileSync(target,'utf8'));if(existing.teams?.length>result.rows.length)throw Error('Không thể thay danh sách nhiều đội bằng 20 đội; hãy giữ bản hiện tại và xuất để duyệt.');}
    const snapshot=convert(result.rows,heroes,result.meta);
    console.log(`Nguồn ${snapshot.source.updatedAt}: ${snapshot.teams.length} đội; #1 ${snapshot.teams[0].winRate}%`);
    if(dry){console.log('Chạy thử: không ghi file.');return;}
    const temporary=target+'.tmp';
    try {fs.writeFileSync(temporary,JSON.stringify(snapshot,null,2)+'\n','utf8');fs.renameSync(temporary,target);}
    finally {if(fs.existsSync(temporary))fs.unlinkSync(temporary);}
    console.log(`Đã cập nhật ${target}. Kiểm tra thay đổi trước khi commit/push.`);
  } finally {await browser.close();}
}
if(require.main===module)main().catch(error=>{console.error(`Không cập nhật: ${error.message}`);process.exitCode=1;});
module.exports={convert,makeReport,csvReport};
