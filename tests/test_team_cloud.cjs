const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = fs.existsSync(path.join(__dirname,'team-cloud.js')) ? __dirname : path.join(__dirname,'..');
const context = {
  window:{},document:{addEventListener(){}},
  esc: value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),
  image: (_,id)=>`/${id}.png`, localName: n=>n?.vi||'Không rõ', teamHero:id=>({name:{vi:`#${id}`}}),
};
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root,'team-cloud.js'),'utf8')+'\nglobalThis.testApi={cloud,cloudCommunityHtml,cloudAdminHtml};',context);
const {cloud,cloudCommunityHtml,cloudAdminHtml}=context.testApi;
cloud.list=[{id:'123',title:'<script>x</script>',note:'note',slots:['200',null,null,null,null,'593',null,null,null,null],like_count:1,liked:true}];
assert.match(cloudCommunityHtml(),/&lt;script&gt;/);
assert.doesNotMatch(cloudCommunityHtml(),/<script>x<\/script>/);
assert.match(cloudCommunityHtml(),/♥ 1/);
cloud.expanded='123'; assert.match(cloudCommunityHtml(),/Đội dự bị/);
cloud.list=[];cloud.search='abc';assert.match(cloudCommunityHtml(),/Không tìm thấy/);
cloud.offset=20;assert.match(cloudCommunityHtml(),/Trang trước/);
cloud.adminRows=[{id:'123',title:'test',hidden_at:'2026-01-01'}];assert.match(cloudAdminHtml(),/Khôi phục/);
console.log('OK: escaping, likes, reserve, search empty and moderation rendering.');
