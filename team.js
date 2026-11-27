/* Team slots store IDs only; catalog stats remain the source of truth. */
const TEAM_KEY = 'heian.team.v1';
let teamSlots = Array(10).fill(null);
let teamSouls = TeamSoulStore.empty();
let teamTarget = null;
let teamNotice = '';
let selectedSlots = [], currentTeamId = null, teamName = '', teamNote = '', teamCategory = '';
let savedTeams = [];
try { savedTeams = TeamStore.read(localStorage); } catch { teamNotice = 'Không thể đọc đội đã lưu; dữ liệu gốc được giữ lại.'; }
try {
  const saved = JSON.parse(localStorage.getItem(TEAM_KEY));
  if (saved && [1, 2].includes(saved.version) && Array.isArray(saved.slots) && (saved.slots.length === 5 || saved.slots.length === 10))
    { teamSlots = [...saved.slots.map(id => typeof id === 'string' && /^\d+$/.test(id) ? id : null), ...Array(10 - saved.slots.length).fill(null)]; if (saved.souls !== undefined) { if (!TeamSoulStore.validBuilds(saved.souls)) throw Error('Ngự không hợp lệ'); teamSouls = TeamSoulStore.copy(saved.souls); } }
} catch { teamNotice = 'Không thể đọc đội đã lưu trên trình duyệt.'; }
function saveTeam() {
  try { localStorage.setItem(TEAM_KEY, JSON.stringify({version: 2, slots: teamSlots, souls: teamSouls})); }
  catch { teamNotice = 'Không thể lưu đội trên trình duyệt; đội chỉ tồn tại trong phiên này.'; }
}
function teamHero(id) { return state.heroes.find(hero => String(hero.id) === String(id)); }
function teamSpeed(hero) {
  const value = hero?.stats?.speed?.value;
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : null;
}
function hideTeamInfo() { $('#team-info').hidden = true; }
function showTeamInfo(id, anchor) {
  const hero = teamHero(id); if (!hero || state.view !== 'team') return;
  const popup = $('#team-info');
  popup.innerHTML = `<div class="team-info-head"><div><span class="eyebrow">THÔNG TIN THỨC THẦN</span><h3>${esc(localName(hero.name))}</h3><p>Lv. ${esc(hero.level ?? 40)}/${esc(hero.maxLevel ?? 40)} · ${esc(hero.rarity || '—')}</p></div></div><div class="stat-list">${statRows(hero.stats)}</div>`;
  popup.hidden = false;
  const bounds = anchor.getBoundingClientRect(), box = popup.getBoundingClientRect();
  const left = bounds.right + 10 + box.width <= innerWidth ? bounds.right + 10 : Math.max(8, bounds.left - box.width - 10);
  popup.style.left = `${left}px`;
  popup.style.top = `${Math.max(8, Math.min(bounds.top, innerHeight - box.height - 8))}px`;
}
function teamAdd(id) {
  if (!teamHero(id)) return;
  const index = teamTarget === null ? teamSlots.findIndex((slot, i) => i < 5 && slot === null) : teamTarget;
  if (index < 0) { teamNotice = 'Đội chính đã đủ 5. Chọn một ô để thay thế hoặc chọn ô dự bị.'; drawTeam(); return; }
  teamSlots[index] = String(id); teamTarget = null; selectedSlots = []; teamNotice = ''; saveTeam();
  hideTeamInfo(); drawTeam();
}
function drawTeam() {
  const detail = $('#detail'), previousScroll = detail.querySelector('.team-board')?.scrollTop || 0; detail.classList.remove('hero-layout'); detail.classList.add('team-layout');
  const rows = teamSlots.map((id, index) => ({id, index, hero: id ? teamHero(id) : null}));
  const slotHtml = ({id,index,hero}) => `<div class="team-slot ${selectedSlots.includes(index) ? 'selected' : ''}"><button type="button" class="team-slot-select" data-team-slot="${index}" aria-label="${id ? 'Chọn ô để thay thế' : 'Chọn ô trống'} ${index+1}">${id ? '' : `<span>Ô ${index+1}${'Đang chọn'}</span>`}${hero ? `<b>${esc(localName(hero.name))}</b><small>${esc(hero.rarity)} · Tốc ${esc(teamSpeed(hero) ?? '—')}</small>` : `<b>${id ? 'Không tìm thấy thức thần' : '+ Chọn thức thần'}</b><small>${id ? 'Dữ liệu không còn trong danh mục' : 'Chọn ô này rồi chọn thức thần'}</small>`}</button>${hero ? `<button class="team-slot-image" type="button" data-team-info="${esc(id)}" aria-label="Xem chỉ số ${esc(localName(hero.name))}"><img src="${image('shishen',id)}" alt=""></button>` : ''}${hero ? `<a class="team-detail-link" href="?hero=${encodeURIComponent(id)}" target="_blank" rel="noopener" aria-label="Mở thông tin ${esc(localName(hero.name))} trong tab mới">☰</a>` : ''}${hero ? teamSoulSlotHtml(index) : ''}${id ? `<button class="team-remove" type="button" data-team-remove="${index}" aria-label="Xóa thức thần ở ô ${index+1}">×</button>` : ''}</div>`;
  const slots = rows.slice(0,5).map(slotHtml).join('');
  const reserves = rows.slice(5).map(slotHtml).join('');
  const order = rows.filter(row => row.index < 5 && row.id).sort((a,b) => { const x=TeamSoulStore.total(teamSpeed(a.hero),teamSouls[a.index]),y=TeamSoulStore.total(teamSpeed(b.hero),teamSouls[b.index]); return x === null ? (y === null ? a.index-b.index : 1) : y === null ? -1 : y-x || a.index-b.index; });
  const orderHtml = order.map(row => {const base=teamSpeed(row.hero), bonus=TeamSoulStore.bonus(teamSouls[row.index]), speed=TeamSoulStore.total(base,teamSouls[row.index]); const tie=speed!==null && order.some(other=>other.index!==row.index&&TeamSoulStore.total(teamSpeed(other.hero),teamSouls[other.index])===speed);return `<div class="team-order-row"><span class="team-order-number">${row.index+1}</span><div><b>${esc(row.hero ? localName(row.hero.name) : 'Không tìm thấy thức thần')}</b><small>Ô ${row.index+1}${tie?' · Cùng tốc, chưa xác định thứ tự':''}</small></div><strong>${speed===null?'Chưa có tốc':`${esc(base)}${bonus?` <span class="soul-speed-bonus">+ ${bonus}</span> = ${esc(speed)}`:''}`}</strong></div>`}).join('');
  detail.innerHTML = `<section class="card team-board"><div class="team-heading"><h2>Tạo đội</h2><button type="button" class="team-clear" data-team-clear>Xóa đội</button></div><div class="team-fields"><label>Tên đội <input id="team-name" maxlength="80" value="${esc(teamName)}" placeholder="Nhập tên đội"></label><label>Ghi chú <textarea id="team-note" maxlength="1000" placeholder="Ghi chú cho đội">${esc(teamNote)}</textarea></label><label>Loại đội <select id="team-category"><option value="">Chưa chọn</option><option value="pvp" ${teamCategory==='pvp'?'selected':''}>PvP</option><option value="pve" ${teamCategory==='pve'?'selected':''}>PvE</option><option value="other" ${teamCategory==='other'?'selected':''}>Khác</option></select></label><button type="button" data-save-team>Lưu đội</button><button type="button" data-new-team>Đội mới</button><button type="button" data-share-team>Chia sẻ</button></div><div class="team-status" role="status" aria-live="polite">${esc(teamNotice)}</div><h3 class="team-row-title">Đội chính</h3><div class="team-slots">${slots}</div><div class="team-reserve-heading"><h3 class="team-row-title">Dự bị · Pick tình huống</h3>${teamSoulSwapButton()}${selectedSlots.length===2?'<button type="button" class="swap-action" data-confirm-swap>⇄ Swap <small>Space</small></button>':''}${selectedSlots.length===2&&selectedSlots.every(i=>teamSlots[i]&&teamHero(teamSlots[i]))?'<button type="button" class="swap-action" data-compare-quick>⚖ So sánh</button>':''}</div><div class="team-slots">${reserves}</div></section><section class="card team-order"><span class="eyebrow">TỐC DỰ KIẾN</span><h2>Thứ tự hành động dự kiến</h2><p>Tính tốc cơ bản và tốc chính vị trí 2.</p><div class="team-order-list">${orderHtml || '<div class="message">Chưa có thức thần trong đội.</div>'}</div><p class="team-disclaimer">Chưa tính chỉ số phụ, hiệu ứng ngự, kỹ năng hay đối thủ. Cùng tốc chưa xác định thứ tự thực tế.</p></section>`;
  detail.querySelector('.team-board').scrollTop = previousScroll;
}
document.addEventListener('click', e => {
  const info=e.target.closest('[data-team-info]'), remove=e.target.closest('[data-team-remove]'), slot=e.target.closest('[data-team-slot]'), clear=e.target.closest('[data-team-clear]'), swap=e.target.closest('[data-confirm-swap]'), save=e.target.closest('[data-save-team]'), fresh=e.target.closest('[data-new-team]'), open=e.target.closest('[data-open-team]'), del=e.target.closest('[data-delete-team]'), exp=e.target.closest('[data-export-teams]'), imp=e.target.closest('[data-import-teams]');
  if(swap) performSwap();
  else if(save) saveNamedTeam();
  else if(fresh) { if(confirm('Bắt đầu đội mới? Hãy lưu đội hiện tại trước nếu cần.')) {teamSlots=Array(10).fill(null);teamSouls=TeamSoulStore.empty();selectedTeamSouls=[];teamName='';teamNote='';teamCategory='';currentTeamId=null;teamTarget=null;selectedSlots=[];teamNotice='';saveTeam();drawTeam();} }
  else if(open) {const t=savedTeams.find(x=>x.id===open.dataset.openTeam);if(t){teamSlots=t.slots.slice();teamSouls=t.souls?TeamSoulStore.copy(t.souls):TeamSoulStore.empty();selectedTeamSouls=[];teamName=t.name;teamNote=t.note||'';teamCategory=t.category||'';currentTeamId=t.id;selectedSlots=[];teamTarget=null;saveTeam();document.querySelector('[data-view=team]').click();}}
  else if(del) {if(confirm('Xóa đội đã lưu trên trình duyệt này?')){const next=savedTeams.filter(x=>x.id!==del.dataset.deleteTeam);try{TeamStore.write(localStorage,next);savedTeams=next;drawTeamList();}catch{teamNotice='Không thể lưu thay đổi.';drawTeamList();}}}
  else if(exp) exportTeams();
  else if(imp) document.querySelector('#team-import').click();
  else if(info) { const holder=info.closest('.team-slot'); const target=holder?.querySelector('[data-team-slot]'); if(target) selectTeamSlot(Number(target.dataset.teamSlot)); }
  else if(remove) {const i=Number(remove.dataset.teamRemove);teamSlots[i]=null;teamSouls[i]=null;selectedTeamSouls=selectedTeamSouls.filter(x=>x!==i);selectedSlots=selectedSlots.filter(x=>x!==i);teamTarget=null;teamNotice='';saveTeam();drawTeam();}
  else if(slot) selectTeamSlot(Number(slot.dataset.teamSlot));
  else if(clear && teamSlots.some(Boolean) && confirm('Xóa tất cả thức thần khỏi đội?')) {teamSlots=Array(10).fill(null);teamSouls=TeamSoulStore.empty();selectedTeamSouls=[];teamTarget=null;selectedSlots=[];teamNotice='';saveTeam();drawTeam();}
  if(e.target.closest('[data-view]') && state.view!=='team') { hideTeamInfo(); $('#detail').classList.remove('team-layout'); }
  if(matchMedia('(hover: none)').matches && !info && !e.target.closest('[data-team-avatar]')) hideTeamInfo();
});

document.addEventListener('pointerover', e => {
  if (state.view !== 'team' || e.pointerType === 'touch') return;
  const anchor=e.target.closest('[data-team-avatar], [data-team-info]');
  if(anchor && !anchor.contains(e.relatedTarget)) showTeamInfo(anchor.dataset.teamAvatar || anchor.dataset.teamInfo, anchor);
});
document.addEventListener('pointerout', e => {
  const anchor=e.target.closest('[data-team-avatar], [data-team-info]');
  if(anchor && !anchor.contains(e.relatedTarget)) hideTeamInfo();
});
document.addEventListener('focusin', e => {
  if(state.view!=='team') return;
  const anchor=e.target.closest('[data-team-info]') || e.target.closest('#list .list-item')?.querySelector('[data-team-avatar]');
  if(anchor) showTeamInfo(anchor.dataset.teamAvatar || anchor.dataset.teamInfo,anchor);
});
document.addEventListener('focusout', e => {if(e.target.closest('[data-team-info], #list .list-item')) hideTeamInfo();});
document.addEventListener('scroll', hideTeamInfo, true);
window.addEventListener('resize', hideTeamInfo);

document.addEventListener('input', e => { if(e.target.id==='team-name') teamName=e.target.value; if(e.target.id==='team-note') teamNote=e.target.value; if(e.target.id==='team-category') teamCategory=e.target.value; });
function selectTeamSlot(i){selectedTeamSouls=[];selectedSlots=TeamStore.select(selectedSlots,i);teamTarget=selectedSlots.at(-1) ?? null;teamNotice=selectedSlots.length===2?'Đã chọn 2 ô. Bấm Swap hoặc Space để đổi chỗ.':teamTarget!==null?'Đã chọn ô '+(teamTarget+1)+'. Chọn ô thứ hai để đổi hoặc chọn thức thần trong danh mục.':'';drawTeam();}
function performSwap(){if(selectedSlots.length!==2)return;teamSlots=TeamStore.swap(teamSlots,selectedSlots[0],selectedSlots[1]);teamSouls=TeamSoulStore.swap(teamSouls,selectedSlots[0],selectedSlots[1]);selectedSlots=[];teamTarget=null;teamNotice='Đã đổi vị trí.';saveTeam();drawTeam();}
document.addEventListener('keydown',e=>{if(state.view!=='team'||document.querySelector('#compare-dialog')?.open)return;if(e.key==='Escape'&&selectedSlots.length){selectedSlots=[];teamTarget=null;teamNotice='Đã bỏ chọn.';drawTeam();}else if(e.code==='Space'&&selectedSlots.length===2&&!e.target.closest('input,textarea,select,[contenteditable=true]')){e.preventDefault();performSwap();}});
function saveNamedTeam(){
 const name=teamName.trim(); if(!name){teamNotice='Không thể lưu: hãy nhập tên đội.';drawTeam();return;}
 try { const now=new Date().toISOString(), old=savedTeams.find(t=>t.id===currentTeamId);
 const entry={id:old?.id||crypto.randomUUID(),name,note:teamNote.trim(),category:teamCategory,createdAt:old?.createdAt||now,updatedAt:now,slots:teamSlots.slice(),souls:TeamSoulStore.copy(teamSouls)};
 const next=old?savedTeams.map(t=>t.id===old.id?entry:t):[...savedTeams,entry];
 TeamStore.write(localStorage,next);savedTeams=next;currentTeamId=entry.id;teamNotice='✓ Đã lưu đội trên trình duyệt này.';}catch{teamNotice='Không thể lưu đội; hãy kiểm tra bộ nhớ trình duyệt.';} drawTeam();
}
function drawTeamList(){
 const detail=$('#detail');detail.classList.remove('hero-layout','team-layout');detail.classList.add('teams-layout');
 if(cloud.adminOpen || cloud.tab!=='mine'){detail.innerHTML=`<section class="card team-saved"><div class="teams-heading"><div><span class="eyebrow">DANH SÁCH ĐỘI</span><h2>Đội hình</h2></div>${!cloud.adminOpen&&cloud.tab==='curated'?cloudCuratedFilters():''}${cloudTabs()}</div><p role="status">${esc(teamNotice)}</p>${cloud.adminOpen?cloudAdminHtml():cloud.tab==='community'?cloudCommunityHtml():cloudCuratedHtml()}</section>`;return;}
 const entries=savedTeams.slice().sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt))||a.id.localeCompare(b.id));
 detail.innerHTML=`<section class="card team-saved"><div class="teams-heading"><div><span class="eyebrow">DANH SÁCH ĐỘI</span><h2>Đội hình của tôi</h2></div>${cloudTabs()}</div><p class="source">Lưu trên trình duyệt này. Dùng xuất/nhập để sao lưu hoặc chuyển máy.</p><div class="team-list-actions"><button data-export-teams>Xuất file</button><button data-import-teams>Nhập file</button><input id="team-import" type="file" accept="application/json,.json" hidden></div><p role="status">${esc(teamNotice)}</p>${entries.length?entries.map(t=>`<article class="saved-team"><h3>${esc(t.name)}</h3><p>${esc(t.note||'Chưa có ghi chú')}</p><p>${esc(t.category?.toUpperCase()||'Chưa chọn loại')} · ${esc(t.createdAt?.slice(0,10)||'Không rõ ngày')}</p><div class="saved-team-heroes">${t.slots.slice(0,5).map(id=>id?`<img src="${image('shishen',id)}" alt="${esc(localName(teamHero(id)?.name))}">`:'<span>+</span>').join('')}</div><button data-open-team="${esc(t.id)}">Mở đội</button> <button data-delete-team="${esc(t.id)}">Xóa</button></article>`).join(''):'<div class="message">Chưa có đội đã lưu. Hãy tạo và lưu đội đầu tiên.</div>'}</section>`;
}
function exportTeams(){const blob=new Blob([JSON.stringify({version:1,teams:savedTeams},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download='heian-doi-hinh.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
document.addEventListener('change',async e=>{if(e.target.id!=='team-import'||!e.target.files[0])return;try{const data=JSON.parse(await e.target.files[0].text());if(data.version!==1||!Array.isArray(data.teams)||!data.teams.every(t=>typeof t.id==='string'&&typeof t.name==='string'&&TeamStore.validSlots(t.slots)&&(t.souls===undefined||TeamSoulStore.validBuilds(t.souls))))throw Error();const existing=new Set(savedTeams.map(t=>t.id));const added=data.teams.filter(t=>{if(existing.has(t.id))return false;existing.add(t.id);return true;});const next=[...savedTeams,...added];TeamStore.write(localStorage,next);savedTeams=next;teamNotice=`Đã nhập ${added.length} đội; bỏ qua ID đã có.`;}catch{teamNotice='Không nhập được file. Hãy kiểm tra định dạng hoặc bộ nhớ trình duyệt.';}drawTeamList();});
