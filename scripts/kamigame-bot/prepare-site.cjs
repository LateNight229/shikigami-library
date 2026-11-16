'use strict';
const fs=require('node:fs'),path=require('node:path');
const args=process.argv.slice(2),opt=(name,d)=>{const i=args.indexOf(name);return i<0?d:args[i+1]};
const input=path.resolve(opt('--input',path.join(__dirname,'output','kamigame-preview.json'))),output=path.resolve(opt('--output',path.join(__dirname,'output','kamigame-site-preview.json')));
const data=JSON.parse(fs.readFileSync(input,'utf8'));if(data.source?.name!=='Kamigame'||!data.heroes||Object.keys(data.heroes).length===0)throw Error('Snapshot không hợp lệ, không xuất dữ liệu website.');
const result={source:data.source,collectedAt:data.collectedAt,coverage:data.coverage,heroes:data.heroes};
if(args.includes('--dry-run'))console.log(`Chạy thử: ${Object.keys(result.heroes).length} thức thần, không ghi file.`);else{fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(result,null,2)+'\n');console.log(`Đã xuất bản website để duyệt: ${output}. Chưa cập nhật website.`)}
