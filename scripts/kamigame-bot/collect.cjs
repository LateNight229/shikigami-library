'use strict';
const fs=require('node:fs'),path=require('node:path');
const INDEX='https://kamigame.jp/%E9%99%B0%E9%99%BD%E5%B8%AB/%E5%BC%8F%E7%A5%9E/index.html';
// Explicit Japanese aliases only; never infer identity from a source link.
const SOUL_ZH={'雪幽魂':'雪幽魂','地蔵の像':'地藏像','招き猫':'招财猫','火霊':'火灵','薙魂':'薙魂','玉樹':'木魅','蛤の精':'蚌精','遺念火':'遗念火','共潜':'共潜','塗仏':'涂佛','破勢':'破势','墓守り':'镇墓兽','狂骨':'狂骨','網切':'网切','針女':'针女','青女房':'青女房','魅妖':'魅妖','魍魎の匣':'魍魉之匣','返魂香':'返魂香','輪入道':'轮入道','鍾霊':'钟灵','貝吹坊':'贝吹坊','海月の火の玉':'海月火玉','悲鳴鳥':'伤魂鸟','応声虫':'应声虫','釣瓶火':'钓瓶火'};
function mapSouls(items,souls){const seen=new Set(),mapped=[],unmatched=[];for(const item of items){if(!item.name||seen.has(item.name))continue;seen.add(item.name);const zh=SOUL_ZH[item.name]||item.name,matches=souls.filter(s=>s.name?.zh===zh);if(matches.length!==1){unmatched.push(item);continue}mapped.push({id:String(matches[0].id),nameVi:matches[0].name.vi,nameJa:item.name});}return {mapped,unmatched};}
function mapWeak(items,byUrl){const seen=new Set(),mapped=[],unmatched=[];for(const item of items){const match=byUrl.get(item.url);if(!match||!item.name||!match.title?.includes(item.name)){unmatched.push(item);continue}if(!seen.has(match.id)){seen.add(match.id);mapped.push({id:match.id,nameVi:match.nameVi})}}return {mapped,unmatched};}
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function main(){
 const args=process.argv.slice(2),option=(k,d)=>{let i=args.indexOf(k);return i<0?d:args[i+1]};
 const root=option('--repo','E:/1_Github/shikigami-library'),limit=Number(option('--limit','0')),dry=args.includes('--dry-run');
 if(!Number.isInteger(limit)||limit<0)throw Error('Giới hạn không hợp lệ');
 const catalog=JSON.parse(fs.readFileSync(path.join(root,'data/shikigami-catalog.json'),'utf8')).heroes,souls=JSON.parse(fs.readFileSync(path.join(root,'data/souls.json'),'utf8')).souls;
 let playwright;try{playwright=require('playwright-core')}catch(error){try{playwright=require('../yysrank-bot/node_modules/playwright-core')}catch{throw new Error('Thiếu playwright-core: chạy npm install trong thư mục scripts/kamigame-bot.')}}const {chromium}=playwright,browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const page=await browser.newPage();page.setDefaultTimeout(15000);
  const visit=async url=>{let error;for(let i=0;i<2;i++){try{const r=await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000});if(!r||!r.ok())throw Error(`HTTP ${r?.status()}`);return}catch(e){error=e;await wait(1000)}}throw error};
  await visit(INDEX);
  const links=await page.evaluate(()=>[...document.querySelectorAll('a[href]')].map(a=>a.href).filter(url=>{try{const u=new URL(url),p=decodeURIComponent(u.pathname);return u.hostname==='kamigame.jp'&&p.startsWith('/陰陽師/')&&(p.includes('/式神/')||p.includes('/page/'))&&p.endsWith('.html')&&!p.endsWith('/index.html')}catch{return false}}));
  const unique=[...new Set(links)].filter(url=>!decodeURIComponent(new URL(url).pathname).includes('/index-')), only=option('--url',null),targets=only?[only]:(limit?unique.slice(0,limit):unique),records=[],errors=[];
  for(let i=0;i<targets.length;i++){
   const url=targets[i];try{await visit(url);const parsed=await page.evaluate(()=>{
    const rows=[...document.querySelectorAll('tr')],getValue=label=>{const row=rows.find(tr=>[...tr.querySelectorAll('th,td')].some(c=>c.textContent.trim()===label));return row?[...row.querySelectorAll('th,td')].map(c=>c.textContent.trim()).find(t=>t&&t!==label):null};
    const headings=[...document.querySelectorAll('h2,h3')],tablesAfter=h=>{let out=[];for(let n=h.nextElementSibling;n&&!/^H[23]$/.test(n.tagName);n=n.nextElementSibling)if(n.tagName==='TABLE')out.push(n);return out};
    const collect=h=>tablesAfter(h).flatMap(t=>[...t.querySelectorAll('tr')].flatMap(tr=>{const cell=tr.querySelector('td');return cell?[...cell.querySelectorAll('a[href]')].map(a=>({name:(a.textContent||a.querySelector('img')?.alt||'').trim(),url:a.href})):[]}));
    const soulHeads=headings.filter(h=>h.tagName==='H3'&&/オススメ御魂|おすすめ御魂/.test(h.textContent));
    const counterHeads=headings.filter(h=>h.tagName==='H3'&&/の対策になる式神/.test(h.textContent));
    return {title:document.querySelector('h1')?.innerText.trim(),nameZh:getValue('中国名'),updatedAt:document.body.innerText.match(/最終更新日\s*(\d{4}\/\d{2}\/\d{2})/)?.[1]||null,souls:soulHeads.flatMap(collect),weak:counterHeads.flatMap(collect)};
   });const slug=decodeURIComponent(new URL(url).pathname.split('/').at(-1).replace(/\.html$/,''));const matches=parsed.nameZh?catalog.filter(x=>x.name?.zh===parsed.nameZh):catalog.filter(x=>x.name?.zh===slug&&parsed.title?.includes(slug));if(matches.length===1)records.push({url,...parsed,id:String(matches[0].id),nameVi:matches[0].name.vi});else errors.push({url,error:parsed.nameZh?`Tên Trung không khớp duy nhất: ${parsed.nameZh}`:'Không có tên Trung hoặc tên khớp chính xác'});
   }catch(e){if(/HTTP (403|429)/.test(e.message))throw Error(`Nguồn từ chối hoặc giới hạn truy cập: ${e.message}`);errors.push({url,error:String(e.message).slice(0,150)})}if((i+1)%10===0)console.log(`Đã kiểm tra ${i+1}/${targets.length}`);await wait(700);
  }
  if(!records.some(r=>r.id))throw Error('Không ghép được bài thức thần nào; không ghi snapshot.');
  const byUrl=new Map(records.filter(r=>r.id).map(r=>[r.url,r])),heroes={},unmatched=[];
  for(const r of records.filter(r=>r.id)){const weak=mapWeak(r.weak,byUrl),mappedSouls=mapSouls(r.souls,souls);for(const item of weak.unmatched)unmatched.push({hero:r.nameVi,kind:'counter',reason:'Link hoặc tên chưa khớp tiêu đề',...item});for(const item of mappedSouls.unmatched)unmatched.push({hero:r.nameVi,kind:'soul',...item});
   heroes[r.id]={nameVi:r.nameVi,url:r.url,updatedAt:r.updatedAt,souls:mappedSouls.mapped,unresolvedSouls:mappedSouls.unmatched.length,weak:weak.mapped,unresolvedWeak:weak.unmatched.length};
  }
  const snapshot={source:{name:'Kamigame',url:INDEX,stale:true},collectedAt:new Date().toISOString(),coverage:{discovered:unique.length,attempted:targets.length,matched:Object.keys(heroes).length,errors:errors.length},heroes,unmatched,errors,rawRecords:records};
  console.log(JSON.stringify(snapshot.coverage));if(dry){console.log('Chạy thử: không ghi file.');return}const output=path.resolve(option('--output',path.join(__dirname,'output','kamigame-preview.json')));fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(snapshot,null,2)+'\n');console.log(`Đã xuất ${output}; cần duyệt và ghép ngự trước khi áp dụng.`);
 }finally{await browser.close()}
}
if(require.main===module)main().catch(e=>{console.error(e.message);process.exitCode=1});
module.exports={mapSouls,mapWeak};
