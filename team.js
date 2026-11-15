/* Team slots store IDs only; catalog stats remain the source of truth. */
const TEAM_KEY = 'heian.team.v1';
let teamSlots = Array(10).fill(null);
let teamTarget = null;
let teamNotice = '';
try {
  const saved = JSON.parse(localStorage.getItem(TEAM_KEY));
  if (saved && [1, 2].includes(saved.version) && Array.isArray(saved.slots) && (saved.slots.length === 5 || saved.slots.length === 10))
    teamSlots = [...saved.slots.map(id => typeof id === 'string' && /^\d+$/.test(id) ? id : null), ...Array(10 - saved.slots.length).fill(null)];
} catch { teamNotice = 'Không thể đọc đội đã lưu trên trình duyệt.'; }
function saveTeam() {
  try { localStorage.setItem(TEAM_KEY, JSON.stringify({version: 2, slots: teamSlots})); }
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
  popup.innerHTML = `<div class="team-info-head"><div><span class="eyebrow">THÔNG TIN THỨC THẦN</span><h3>${esc(localName(hero.name))}</h3><p>Lv. ${esc(hero.level ?? 40)}/${esc(hero.maxLevel ?? 40)} · ${esc(hero.rarity || '—')}</p><p class="source">Dữ liệu tham khảo · chưa xác minh phiên bản.</p></div></div><div class="stat-list">${statRows(hero.stats)}</div>`;
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
  teamSlots[index] = String(id); teamTarget = null; teamNotice = ''; saveTeam();
  hideTeamInfo(); drawTeam();
}
function drawTeam() {
  const detail = $('#detail'); detail.classList.remove('hero-layout'); detail.classList.add('team-layout');
  const rows = teamSlots.map((id, index) => ({id, index, hero: id ? teamHero(id) : null}));
  const slotHtml = ({id,index,hero}) => `<div class="team-slot ${teamTarget === index ? 'selected' : ''}"><button type="button" class="team-slot-select" data-team-slot="${index}" aria-label="${id ? 'Chọn ô để thay thế' : 'Chọn ô trống'} ${index+1}"><span>Ô ${index+1}${teamTarget === index ? ' · Đang chọn' : ''}</span>${hero ? `<b>${esc(localName(hero.name))}</b><small>${esc(hero.rarity)} · Tốc ${esc(teamSpeed(hero) ?? '—')}</small>` : `<b>${id ? 'Không tìm thấy thức thần' : '+ Chọn thức thần'}</b><small>${id ? 'Dữ liệu không còn trong danh mục' : 'Chọn ô này rồi chọn thức thần'}</small>`}</button>${hero ? `<button class="team-slot-image" type="button" data-team-info="${esc(id)}" aria-label="Xem chỉ số ${esc(localName(hero.name))}"><img src="${image('shishen',id)}" alt=""></button>` : ''}${hero ? `<a class="team-detail-link" href="?hero=${encodeURIComponent(id)}" target="_blank" rel="noopener" aria-label="Mở thông tin ${esc(localName(hero.name))} trong tab mới">☰</a>` : ''}${id ? `<button class="team-remove" type="button" data-team-remove="${index}" aria-label="Xóa thức thần ở ô ${index+1}">×</button>` : ''}</div>`;
  const slots = rows.slice(0,5).map(slotHtml).join('');
  const reserves = rows.slice(5).map(slotHtml).join('');
  const order = rows.filter(row => row.index < 5 && row.id).sort((a,b) => { const x=teamSpeed(a.hero),y=teamSpeed(b.hero); return x === null ? (y === null ? a.index-b.index : 1) : y === null ? -1 : y-x || a.index-b.index; });
  const orderHtml = order.map(row => {const speed=teamSpeed(row.hero); const tie=speed!==null && order.some(other=>other.index!==row.index&&teamSpeed(other.hero)===speed);return `<div class="team-order-row"><span class="team-order-number">${row.index+1}</span><div><b>${esc(row.hero ? localName(row.hero.name) : 'Không tìm thấy thức thần')}</b><small>Ô ${row.index+1}${tie?' · Cùng tốc, chưa xác định thứ tự':''}</small></div><strong>${speed===null?'Chưa có tốc':esc(speed)}</strong></div>`}).join('');
  detail.innerHTML = `<section class="card team-board"><div class="team-heading"><div><span class="eyebrow">ĐỘI HÌNH CỦA BẠN</span><h2>Tạo đội thức thần</h2><p>5 ô chính · 5 ô dự bị · Có thể chọn trùng</p></div><button type="button" class="team-clear" data-team-clear>Xóa đội</button></div><p class="team-hint">Chọn thức thần từ danh mục. Rê chuột lên ảnh để xem chỉ số; chọn ô để thay thế.</p><h3 class="team-row-title">Đội chính</h3><div class="team-slots">${slots}</div><h3 class="team-row-title">Dự bị · Pick tình huống</h3><p class="team-reserve-note">Chọn ô dự bị trước, sau đó chọn thức thần từ danh mục. Dự bị không tính vào thứ tự hành động.</p><div class="team-slots">${reserves}</div><p class="team-notice" role="status">${esc(teamNotice)}</p></section><section class="card team-order"><span class="eyebrow">TỐC ĐỘ CƠ BẢN</span><h2>Thứ tự hành động dự kiến</h2><p>Thức thần có tốc cơ bản cao hơn được xếp trước.</p><div class="team-order-list">${orderHtml || '<div class="message">Chưa có thức thần trong đội.</div>'}</div><p class="team-disclaimer">Chưa tính ngự hồn, kỹ năng, hiệu ứng hay đối thủ. Cùng tốc chưa xác định thứ tự thực tế.</p></section>`;
}
document.addEventListener('click', e => {
  const info=e.target.closest('[data-team-info]'), remove=e.target.closest('[data-team-remove]'), slot=e.target.closest('[data-team-slot]'), clear=e.target.closest('[data-team-clear]');
  if(info) { if(matchMedia('(hover: none)').matches) showTeamInfo(info.dataset.teamInfo,info); }
  else if(remove) {teamSlots[Number(remove.dataset.teamRemove)]=null;teamTarget=null;teamNotice='';saveTeam();drawTeam();}
  else if(slot) {teamTarget=Number(slot.dataset.teamSlot);teamNotice='Chọn thức thần trong danh mục để đặt vào ô '+(teamTarget+1)+'.';drawTeam();library(true);}
  else if(clear && teamSlots.some(Boolean) && confirm('Xóa tất cả thức thần khỏi đội?')) {teamSlots=Array(10).fill(null);teamTarget=null;teamNotice='';saveTeam();drawTeam();}
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
