/* Anonymous player sessions and a separate admin session; no secret key in client. */
const cloud = {guest:null, admin:null, list:[], adminRows:[], sort:'recent', offset:0, search:'', loading:false, error:'', tab:'mine', adminOpen:false, expanded:null, curated:null, curatedLoading:false, curatedError:false};
async function cloudCuratedLoad() {
  if (cloud.curated || cloud.curatedLoading) return;
  cloud.curatedLoading=true; cloud.curatedError=false; drawTeamList();
  try { cloud.curated=await getJson('curated/yysrank-top20.json'); }
  catch { cloud.curatedError=true; }
  finally { cloud.curatedLoading=false; if(state.view==='teams' && cloud.tab==='curated' && !cloud.adminOpen)drawTeamList(); }
}
function cloudCuratedHtml() {
  if(cloud.curatedLoading)return '<div class="message">Đang tải đội mẫu…</div>';
  if(cloud.curatedError)return '<div class="message">Không tải được đội mẫu. Hãy kiểm tra kết nối và thử lại.</div><button type="button" data-curated-retry>Thử lại</button>';
  if(!cloud.curated)return '<div class="message">Chưa tải đội mẫu.</div>';
  const {source,teams}=cloud.curated;
  return `<p class="curated-source">20 đội PvP xếp theo tỷ lệ thắng (外战胜率) của <a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.name)} ↗</a> · ${esc(source.filter)}<br>Dữ liệu nguồn cập nhật: ${esc(source.updatedAt)} (giờ hiển thị tại nguồn). Đây là thứ hạng thống kê, không phải phân loại T0/T1; chưa có ngự hồn hoặc dự bị.</p>` + teams.map(t=>`<article class="saved-team curated-team"><h3>#${esc(t.rank)} · Đội mẫu PvP</h3><p>Tỷ lệ thắng: <strong>${esc(t.winRate)}%</strong> · ${esc(t.picks)} lượt chọn</p><div class="curated-heroes">${t.slots.slice(0,5).map(id=>{const hero=teamHero(id);const name=hero?localName(hero.name):'Không tìm thấy thức thần';return `<div><img loading="lazy" src="${image('shishen',id)}" alt=""><span>${esc(name)}</span></div>`;}).join('')}</div><button type="button" data-curated-copy="${esc(t.id)}">Dùng đội</button></article>`).join('');
}
function cloudClient() {
  if (!window.supabase || !window.HEIAN_CLOUD) throw Error('Không tải được dịch vụ cộng đồng.');
  if (!cloud.guest) cloud.guest = window.supabase.createClient(HEIAN_CLOUD.url,HEIAN_CLOUD.publishableKey,{auth:{storageKey:'heian-guest-auth',persistSession:true}});
  return cloud.guest;
}
function adminClient() {
  if (!window.supabase || !window.HEIAN_CLOUD) throw Error('Không tải được dịch vụ cộng đồng.');
  if (!cloud.admin) cloud.admin = window.supabase.createClient(HEIAN_CLOUD.url,HEIAN_CLOUD.publishableKey,{auth:{storageKey:'heian-admin-auth',persistSession:true}});
  return cloud.admin;
}
async function guestSession() {
  const client=cloudClient();let {data,error}=await client.auth.getSession();if(error)throw error;
  if(!data.session){({data,error}=await client.auth.signInAnonymously());if(error)throw error;}
  if(!data.session)throw Error('Không tạo được phiên người chơi.');return client;
}
async function cloudLoad() {
  cloud.loading=true;cloud.error='';drawTeamList();
  try {const {data,error}=await cloudClient().rpc('heian_team_search',{p_sort:cloud.sort,p_offset:cloud.offset,p_search:cloud.search});if(error)throw error;cloud.list=data||[];}
  catch {cloud.error='Không tải được đội cộng đồng. Hãy kiểm tra kết nối và thử lại.';}
  finally{cloud.loading=false;if(state.view==='teams'&&cloud.tab==='community')drawTeamList();}
}
async function cloudPublish(displayName) {
  const title=teamName.trim();if(!title)throw Error('Hãy nhập tên đội trước khi chia sẻ.');
  if(!teamSlots.some(Boolean))throw Error('Hãy chọn ít nhất một thức thần.');
  const client=await guestSession();const {error}=await client.rpc('heian_team_publish',{p_title:title,p_note:teamNote.trim(),p_category:teamCategory,p_display_name:displayName.trim(),p_slots:teamSlots.slice()});
  if(error)throw error;
}
async function cloudLike(id,liked) {const client=await guestSession();const {error}=await client.rpc('heian_team_like',{p_id:id,p_liked:liked});if(error)throw error;await cloudLoad();}
async function cloudAdminLogin(email,password) {
  const client=adminClient();const {error}=await client.auth.signInWithPassword({email,password});if(error)throw error;
  const result=await client.rpc('heian_is_admin');if(result.error||!result.data){await client.auth.signOut();throw Error('Tài khoản không có quyền quản trị.');}
}
async function cloudAdminLoad(){const {data,error}=await adminClient().rpc('heian_admin_list');if(error)throw error;cloud.adminRows=data||[];}
async function cloudAdminModerate(id,hide){const {error}=await adminClient().rpc('heian_team_moderate',{p_id:id,p_hide:hide});if(error)throw error;await cloudAdminLoad();}
function cloudCommunityHtml(){
  const header=`<div class="cloud-toolbar"><label>Tìm tên <input id="cloud-search" maxlength="80" value="${esc(cloud.search)}" placeholder="Tên đội"></label><button type="button" data-cloud-search>Tìm</button><label>Sắp xếp <select id="cloud-sort"><option value="recent" ${cloud.sort==='recent'?'selected':''}>Mới nhất</option><option value="likes" ${cloud.sort==='likes'?'selected':''}>Nhiều lượt thích</option></select></label><button type="button" data-cloud-refresh>Làm mới</button></div>`;
  if(cloud.loading)return header+'<div class="message">Đang tải đội cộng đồng…</div>';
  if(cloud.error)return header+`<div class="message">${esc(cloud.error)}</div>`;
  if(!cloud.list.length)return header+`<div class="message">${cloud.search?'Không tìm thấy đội phù hợp.':cloud.offset?'Không còn đội ở trang này.':'Chưa có đội cộng đồng. Hãy chia sẻ đội đầu tiên!'}</div>${cloud.offset?'<button type="button" data-cloud-page="prev">Trang trước</button>':''}`;
  return header+cloud.list.map(t=>`<article class="saved-team"><h3>${esc(t.title)}</h3><p>${esc(t.note||'Chưa có ghi chú')}</p><p>${esc(t.category?.toUpperCase()||'Chưa chọn loại')} · ${esc(t.display_name||'Người chơi ẩn danh')} · ${esc(t.created_at?.slice(0,10)||'')}</p><div class="saved-team-heroes">${t.slots.slice(0,5).map(id=>id?`<img src="${image('shishen',id)}" alt="${esc(localName(teamHero(id)?.name))}">`:'<span>+</span>').join('')}</div>${cloud.expanded===t.id?`<p>Đội dự bị</p><div class="saved-team-heroes">${t.slots.slice(5,10).map(id=>id?`<img src="${image('shishen',id)}" alt="${esc(localName(teamHero(id)?.name))}">`:'<span>+</span>').join('')}</div>`:''}<button type="button" data-cloud-view="${esc(t.id)}">${cloud.expanded===t.id?'Thu gọn':'Xem dự bị'}</button> <button type="button" data-cloud-like="${esc(t.id)}" data-liked="${t.liked?'true':'false'}" aria-pressed="${t.liked?'true':'false'}">${t.liked?'♥':'♡'} ${esc(t.like_count)}</button> <button type="button" data-cloud-copy="${esc(t.id)}">Dùng đội</button></article>`).join('')+`<div class="cloud-toolbar"><button type="button" data-cloud-page="prev" ${cloud.offset===0?'disabled':''}>Trang trước</button><span>Trang ${Math.floor(cloud.offset/20)+1}</span><button type="button" data-cloud-page="next" ${cloud.list.length<20?'disabled':''}>Trang sau</button></div>`;
}
function cloudTabs(){return `<div class="cloud-tabs"><button type="button" data-cloud-tab="mine" class="${cloud.tab==='mine'?'active':''}">Của tôi</button><button type="button" data-cloud-tab="community" class="${cloud.tab==='community'?'active':''}">Cộng đồng</button><button type="button" data-cloud-tab="curated" class="${cloud.tab==='curated'?'active':''}">Đội mẫu</button><button type="button" data-cloud-admin>Cài đặt · Admin</button></div>`;}
function cloudAdminHtml(){
  return `<h3>Quản lý đội cộng đồng</h3><p class="source">Ẩn đội sẽ không hiện cho người xem; bạn có thể khôi phục.</p>${cloud.adminRows.length?cloud.adminRows.map(t=>`<article class="saved-team"><b>${esc(t.title)}</b><p>${esc(t.note||'')}</p><span>${t.hidden_at?'Đã ẩn':'Đang hiển thị'} · ${esc(t.created_at?.slice(0,10)||'')}</span> <button type="button" data-cloud-moderate="${esc(t.id)}" data-hide="${t.hidden_at?'false':'true'}">${t.hidden_at?'Khôi phục':'Ẩn đội'}</button></article>`).join(''):'<div class="message">Chưa có đội cộng đồng.</div>'}<button type="button" data-cloud-signout>Đăng xuất admin</button>`;
}
function showCloudMessage(message){teamNotice=message;if(state.view==='teams')drawTeamList();else if(state.view==='team')drawTeam();}
document.addEventListener('click',async e=>{
  const target=e.target.closest('[data-cloud-tab],[data-cloud-search],[data-cloud-view],[data-cloud-page],[data-cloud-refresh],[data-cloud-like],[data-cloud-copy],[data-curated-copy],[data-curated-retry],[data-cloud-admin],[data-cloud-moderate],[data-cloud-signout],[data-share-team],[data-share-cancel],[data-share-confirm],[data-admin-cancel]');
  if(!target)return;
  if(target.dataset.cloudTab){cloud.tab=target.dataset.cloudTab;cloud.adminOpen=false;teamNotice='';if(cloud.tab==='community')await cloudLoad();else if(cloud.tab==='curated'){if(cloud.curated)drawTeamList();else await cloudCuratedLoad();}else drawTeamList();}
  else if(target.hasAttribute('data-curated-retry'))await cloudCuratedLoad();
  else if(target.dataset.curatedCopy){const t=cloud.curated?.teams.find(x=>x.id===target.dataset.curatedCopy);if(t && (!teamSlots.some(Boolean) || confirm('Mở bản sao đội này? Hãy lưu đội đang chỉnh sửa trước nếu cần.'))){teamSlots=t.slots.slice();teamName=`Đội mẫu PvP #${t.rank}`;teamNote=`Theo 阳间斗技: tỷ lệ thắng ${t.winRate}%, ${t.picks} lượt chọn. Dữ liệu 16/11/2026.`;teamCategory='pvp';currentTeamId=null;teamTarget=null;selectedSlots=[];saveTeam();document.querySelector('[data-view=team]').click();}}
  else if(target.hasAttribute('data-cloud-search')){cloud.search=document.querySelector('#cloud-search').value.trim();cloud.offset=0;await cloudLoad();}
  else if(target.dataset.cloudView){cloud.expanded=cloud.expanded===target.dataset.cloudView?null:target.dataset.cloudView;drawTeamList();}
  else if(target.dataset.cloudPage){cloud.offset=Math.max(0,cloud.offset+(target.dataset.cloudPage==='next'?20:-20));await cloudLoad();}
  else if(target.hasAttribute('data-cloud-refresh'))await cloudLoad();
  else if(target.dataset.cloudLike){target.disabled=true;try{await cloudLike(target.dataset.cloudLike,target.dataset.liked!=='true');}catch{showCloudMessage('Không thể cập nhật lượt thích. Vui lòng thử lại.');}finally{target.disabled=false;}}
  else if(target.dataset.cloudCopy){const t=cloud.list.find(x=>x.id===target.dataset.cloudCopy);if(t && (!teamSlots.some(Boolean) || confirm('Mở bản sao đội này? Hãy lưu đội đang chỉnh sửa trước nếu cần.'))){teamSlots=t.slots.slice();teamName=t.title;teamNote=t.note||'';teamCategory=t.category||'';currentTeamId=null;teamTarget=null;selectedSlots=[];saveTeam();document.querySelector('[data-view=team]').click();}}
  else if(target.hasAttribute('data-share-team')){if(!teamName.trim()){showCloudMessage('Nhập tên đội trước khi chia sẻ.');return;}if(!teamSlots.some(Boolean)){showCloudMessage('Chọn ít nhất một thức thần trước khi chia sẻ.');return;}document.querySelector('#share-preview').textContent=`${teamName.trim()}\n${teamNote.trim()||'Không có ghi chú'}\nĐội chính: ${teamSlots.slice(0,5).map(id=>id?localName(teamHero(id)?.name):'—').join(' · ')}\nDự bị: ${teamSlots.slice(5).map(id=>id?localName(teamHero(id)?.name):'—').join(' · ')}`;document.querySelector('#share-dialog').showModal();}
  else if(target.hasAttribute('data-share-cancel'))document.querySelector('#share-dialog').close();
  else if(target.hasAttribute('data-share-confirm')){target.disabled=true;try{await cloudPublish(document.querySelector('#share-author').value);document.querySelector('#share-dialog').close();showCloudMessage('✓ Đã chia sẻ đội với cộng đồng.');}catch{document.querySelector('#share-error').textContent='Không thể chia sẻ. Hãy kiểm tra kết nối hoặc thử lại sau.';}finally{target.disabled=false;}}
  else if(target.hasAttribute('data-cloud-admin')){try{const client=adminClient(), session=await client.auth.getSession();if(session.data.session){const check=await client.rpc('heian_is_admin');if(check.data){await cloudAdminLoad();cloud.adminOpen=true;drawTeamList();return;}}document.querySelector('#admin-dialog').showModal();}catch{showCloudMessage('Không mở được phần quản trị.');}}
  else if(target.hasAttribute('data-admin-cancel'))document.querySelector('#admin-dialog').close();
  else if(target.dataset.cloudModerate){if(!confirm(target.dataset.hide==='true'?'Ẩn đội này khỏi cộng đồng?':'Khôi phục đội này?'))return;try{await cloudAdminModerate(target.dataset.cloudModerate,target.dataset.hide==='true');drawTeamList();}catch{showCloudMessage('Không thể thay đổi trạng thái đội.');}}
  else if(target.hasAttribute('data-cloud-signout')){await adminClient().auth.signOut();cloud.adminOpen=false;drawTeamList();}
});
document.addEventListener('change',e=>{if(e.target.id==='cloud-sort'){cloud.sort=e.target.value;cloud.offset=0;cloudLoad();}});
document.addEventListener('submit',async e=>{if(e.target.id!=='admin-form')return;e.preventDefault();const submit=e.target.querySelector('button[type=submit]');submit.disabled=true;try{await cloudAdminLogin(e.target.querySelector('[name=email]').value,e.target.querySelector('[name=password]').value);e.target.querySelector('[name=password]').value='';document.querySelector('#admin-dialog').close();await cloudAdminLoad();cloud.adminOpen=true;cloud.tab='community';drawTeamList();}catch{document.querySelector('#admin-error').textContent='Đăng nhập thất bại hoặc tài khoản chưa có quyền quản trị.';}finally{submit.disabled=false;}});
