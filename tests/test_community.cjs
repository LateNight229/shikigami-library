const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = fs.existsSync(path.join(__dirname, 'community.js')) ? __dirname : path.join(__dirname, '..');
const context = {
  URL, encodeURIComponent,
  esc: s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),
  localName: n => n.vi,
  state: {souls:[{id:20,name:{vi:'Ngự ví dụ'}}]},
};
vm.createContext(context);
const source=fs.readFileSync(path.join(root,'community.js'),'utf8');
vm.runInContext(source+'\nglobalThis.testApi={communityState,communitySoulsPanel,communityReviewPanel,communityLink};',context);
const api=context.testApi;
const reviews=JSON.parse(fs.readFileSync(path.join(root,'community/reviews.json'),'utf8'));
const builds=JSON.parse(fs.readFileSync(path.join(root,'community/recommendations.json'),'utf8'));
assert.equal(Object.keys(reviews).length,126);
assert.equal(Object.values(builds).flat().length,209);
assert.equal(Object.values(builds).flat().some(x=>'user_id' in x),false);
api.communityState.reviews=reviews;api.communityState.recommendations=builds;
assert.match(api.communityReviewPanel({id:593}),/PvP/);
assert.match(api.communitySoulsPanel({id:200}),/Ngự ví dụ/);
assert.match(api.communitySoulsPanel({id:'unknown'}),/Chưa có đề xuất/);
assert.equal(api.communityLink('javascript:alert(1)'),null);
api.communityState.reviews={'1':{summary:'<script>bad</script>'}};
assert.match(api.communityReviewPanel({id:1}),/&lt;script&gt;/);
console.log('OK: snapshot, review, recommendations, empty state and escaped content.');
