const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=process.argv[2]||path.join(__dirname,'..'),source=fs.readFileSync(path.join(root,'souls-view.js'),'utf8');
const context={document:{addEventListener(){},querySelector(){return {addEventListener(){}}}},state:{},norm:s=>String(s??'').toLowerCase()};vm.createContext(context);
vm.runInContext(source+'\nglobalThis.api={soulBonus,soulImage};',context);
const {soulBonus,soulImage}=context.api,souls=JSON.parse(fs.readFileSync(path.join(root,'data/souls.json'),'utf8')).souls;
assert.equal(souls.length,70);assert.equal(soulBonus(souls[0]),'DEF');assert.equal(soulBonus(souls[2]),'ATK');assert.equal(soulBonus({set2:{vi:'Crit DMG +20%'}}),'CRIT DMG');assert.equal(soulBonus({set2:{vi:'Nhận hiệu ứng bỏ qua 50 DEF'}}),'special');
for(const s of souls){assert.match(soulImage(s,'portrait'),/^https:\/\/thucthanluc\.io\.vn\/souls\/portraits\//);assert.match(soulImage(s,'full'),/^https:\/\/thucthanluc\.io\.vn\/souls\/full\//);}
assert.equal(soulImage({assets:{iconFile:'../evil.webp'}},'portrait'),'');assert.match(soulImage(souls[33],'full'),/Ml1\.webp$/);
console.log('OK: 70 image paths, safe filenames and two-piece filters');
