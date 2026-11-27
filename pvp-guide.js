/* Counter relations stay attributed to their original source. */
function pvpGuideRecommendations(selected, snapshots) {
  const found = new Map();
  for (const enemy of new Set(selected.map(String))) for (const source of snapshots) {
    const entry = source.heroes?.[enemy];
    for (const item of entry?.[source.field] || []) {
      const id = String(item.id); if (!id || id === 'undefined') continue;
      if (!found.has(id)) found.set(id, {id, matches: new Map()});
      const matches = found.get(id).matches;
      if (!matches.has(enemy)) matches.set(enemy, []);
      const refs = matches.get(enemy);
      if (!refs.some(ref => ref.name === source.name)) refs.push({name: source.name, url: entry.url || source.url, updatedAt: entry.updatedAt || source.updatedAt, stale: source.stale});
    }
  }
  return [...found.values()].sort((a,b) => b.matches.size-a.matches.size || a.id.localeCompare(b.id));
}
function pvpGuideRemaining(recommendations, own) {
  const picked = new Set(own.filter(Boolean).map(String));
  const covered = new Set();
  for (const rec of recommendations) if (picked.has(rec.id)) for (const enemy of rec.matches.keys()) covered.add(enemy);
  const remaining = recommendations.filter(rec => !picked.has(rec.id)).map(rec => ({...rec, matches: new Map([...rec.matches].filter(([enemy]) => !covered.has(enemy)))})).filter(rec => rec.matches.size).sort((a,b) => b.matches.size-a.matches.size || a.id.localeCompare(b.id));
  return {covered, remaining};
}
if (typeof module !== 'undefined') module.exports = {pvpGuideRecommendations,pvpGuideRemaining};
if (typeof document !== 'undefined') {
const guide = {slots: [null,null,null,null,null], target: 0, side: 'enemy', own: [null,null,null,null,null], notice:'', data: {}, errors: {}, started: false, showAll: false};
const guidePaths = {counters:'curated/hero-counter-periods.json', kamigame:'curated/kamigame.json', teams:'curated/yysrank-top20.json', notes:'curated/pvp-guide-notes.json'};
function guideName(id) { const hero=state.heroes.find(h=>String(h.id)===String(id)); return hero ? localName(hero.name) : `Thức thần #${id}`; }
function guideSources() {
  const periods=(guide.data.counters?.periods||[]).filter(p=>p.snapshot?.heroes).sort((a,b)=>(b.snapshot.source?.updatedAt||'').localeCompare(a.snapshot.source?.updatedAt||''));
  const snapshot=periods[0]?.snapshot, kami=guide.data.kamigame;
  return [snapshot && {...snapshot.source, heroes:snapshot.heroes, field:'counters'}, kami && {...kami.source, heroes:kami.heroes, field:'weak', updatedAt:kami.collectedAt}].filter(Boolean);
}
function pvpGuideStart() {
  guideDraw(); if (guide.started) return; guide.started=true;
  for (const [key,path] of Object.entries(guidePaths)) getJson(path).then(data=>{guide.data[key]=data}).catch(()=>{guide.errors[key]=true}).finally(()=>{if(state.view==='pvp-guide') guideUpdate()});
}
function guideDraw() {
  document.querySelector('#detail').innerHTML=`<section class="guide card"><div class="guide-heading"><div><span class="eyebrow">TRA CỨU TRONG TRẬN</span><h2>Cẩm nang PvP</h2><p>Chọn một ô, rồi chọn thức thần trong danh mục bên trái.</p></div><button type="button" data-guide-reset>Trận mới</button></div><h3>Đội đối thủ</h3><div id="guide-slots" class="guide-slots"></div><h3>Đội của bạn</h3><div id="guide-own" class="guide-slots"></div><p id="guide-notice" role="status"></p><div id="guide-results" aria-live="polite"></div></section>`;
  guideUpdate();
}
function pvpGuideSelect(id) {
  id=String(id); const slots=guide.side==='own'?guide.own:guide.slots;
  if(guide.target===null){guide.notice='Đã đủ 5 ô. Chọn một ô để thay thức thần.';guideUpdate();return;}
  if(slots.includes(id)&&slots[guide.target]!==id){guide.notice='Thức thần đã có trong đội này.';guideUpdate();return;}
  slots[guide.target]=id;guide.target=slots.findIndex(x=>!x);if(guide.target<0)guide.target=null;guide.notice='';guide.showAll=false;guideUpdate();
}
function guideUpdate() {
  const slots=document.querySelector('#guide-slots'), own=document.querySelector('#guide-own'), out=document.querySelector('#guide-results'); if(!slots||!own||!out)return;
  const renderSlots=(items,side)=>items.map((id,i)=>`<div class="guide-slot ${guide.side===side&&guide.target===i?'selected':''}"><button type="button" data-guide-target="${i}" data-guide-side="${side}" aria-pressed="${guide.side===side&&guide.target===i}" aria-label="${id?'Thay '+esc(guideName(id)):'Chọn ô '+(i+1)}">${id?`<span class="guide-slot-spacer"></span><span>${esc(guideName(id))}</span>`:`<span class="guide-plus">+</span><span>Ô ${i+1}</span>`}</button>${id?`<a class="guide-slot-hero" href="?hero=${encodeURIComponent(id)}" target="_blank" rel="noopener noreferrer" aria-label="Xem ${esc(guideName(id))} trong tab mới"><img src="${image('shishen',id)}" alt=""></a><button type="button" data-guide-remove="${i}" data-guide-side="${side}" aria-label="Xóa ${esc(guideName(id))}">×</button>`:''}</div>`).join('');
  slots.innerHTML=renderSlots(guide.slots,'enemy');own.innerHTML=renderSlots(guide.own,'own');document.querySelector('#guide-notice').textContent=guide.notice;
  const selected=guide.slots.filter(Boolean); if(!selected.length){out.innerHTML='<div class="guide-empty">Chọn ô rồi tìm thức thần đầu tiên của đối thủ để bắt đầu.</div>';return;}
  const sources=guideSources(), allRecs=pvpGuideRecommendations(selected,sources), {covered,remaining:recs}=pvpGuideRemaining(allRecs,guide.own), ids=new Set([...recs.map(r=>r.id),...allRecs.filter(r=>guide.own.includes(r.id)).map(r=>r.id)]);
  const missing=selected.filter(id=>!sources.some(s=>s.heroes?.[id]?.[s.field]?.length));
  const sourceErrors=['counters','kamigame'].filter(k=>guide.errors[k]);
  const loading=['counters','kamigame'].some(k=>!guide.data[k]&&!guide.errors[k]);
  let html=`<section class="guide-section"><h3>Gợi ý thức thần <small>${recs.length} lựa chọn</small></h3><p>Ưu tiên theo số đối thủ chưa được đội bạn chọn khắc chế theo nguồn; không phải dự đoán thắng thua.</p>${covered.size?`<p>Đã có lựa chọn theo dữ liệu cho: ${[...covered].map(id=>esc(guideName(id))).join(', ')}.</p>`:''}`;
  if(loading)html+='<p>Đang tải dữ liệu khắc chế…</p>';
  if(sourceErrors.length)html+=`<p role="status">Không tải được ${sourceErrors.map(k=>k==='counters'?'阳间斗技':'Kamigame').join(', ')}. <button type="button" data-guide-retry>Thử lại</button></p>`;
  if(missing.length&&!loading)html+=`<p>Chưa có thông tin khắc chế đã đối chiếu cho: ${missing.map(id=>esc(guideName(id))).join(', ')}.</p>`;
  html+=recs.length?`<div class="guide-recs">${recs.map(r=>`<article class="guide-rec"><a href="?hero=${encodeURIComponent(r.id)}" target="_blank" rel="noopener noreferrer"><img src="${image('shishen',r.id)}" alt=""><strong>${esc(guideName(r.id))} ↗</strong></a><div><button type="button" data-guide-pick="${esc(r.id)}">+ Thêm vào đội</button>${[...r.matches].map(([enemy,refs])=>`<p><b>Gặp ${esc(guideName(enemy))}</b> · ${refs.map(ref=>`<a href="?hero=${encodeURIComponent(enemy)}" target="_blank" rel="noopener noreferrer" title="Mở ${esc(guideName(enemy))}, chọn mục Khắc chế">${esc(ref.name)} ↗</a> (${esc(ref.updatedAt||'chưa rõ ngày')}${ref.stale?' · dữ liệu cũ':''})`).join(' / ')}</p>`).join('')}</div></article>`).join('')}</div>`:(!loading?`<div class="guide-empty">${covered.size?'Không còn gợi ý cho những đối thủ chưa có lựa chọn theo dữ liệu.':'Chưa có gợi ý từ dữ liệu hiện có.'}</div>`:''); html+='</section>';
  html+='<section class="guide-section"><h3>Đội hình tham khảo</h3><p>Đội mẫu có chứa lựa chọn khắc chế hoặc thức thần được gợi ý; không chứng minh đội này thắng đội đối thủ.</p>';
  const teams=guide.data.teams;
  if(guide.errors.teams) html+='<p role="status">Không tải được đội mẫu. <button type="button" data-guide-retry>Thử lại</button></p>';
  else if(!teams) html+='<p>Đang tải đội mẫu…</p>';
  else { const matching=(teams.teams||[]).filter(t=>t.slots.slice(0,5).some(id=>ids.has(String(id)))); html+=`<p>Nguồn: ${esc(teams.source.name)} · ${esc(teams.source.updatedAt)} (giờ nguồn) · ${matching.length} đội liên quan</p>`; html+=matching.length?`<div class="team-table-wrap"><table class="team-table guide-team-table"><thead><tr><th>Hạng</th><th>Đội hình</th><th>Tỷ lệ thắng</th><th>Tỷ lệ chọn</th></tr></thead><tbody>${matching.slice(0,guide.showAll?matching.length:6).map(t=>`<tr><td><b>#${esc(t.rank)}</b></td><td><div class="curated-heroes">${t.slots.slice(0,5).filter(Boolean).map(id=>`<a href="?hero=${encodeURIComponent(id)}" target="_blank" rel="noopener noreferrer" aria-label="Xem ${esc(guideName(id))} trong tab mới"><img loading="lazy" src="${image('shishen',id)}" alt=""><span>${esc(guideName(id))}</span></a>`).join('')}</div></td><td><strong>${t.winRate==null?'—':esc(t.winRate)+'%'}</strong></td><td>${t.pickRate==null?'—':esc(t.pickRate)+'%'}</td></tr>`).join('')}</tbody></table></div>${matching.length>6&&!guide.showAll?'<button type="button" data-guide-more>Xem tất cả đội liên quan</button>':''}`:'<div class="guide-empty">Chưa có đội mẫu liên quan trong dữ liệu hiện có.</div>'; }
  html+='</section><section class="guide-section"><h3>Lưu ý khi đối đầu</h3><p>Nội dung biên tập · cần nguồn và ngày cập nhật.</p>';
  if(guide.errors.notes)html+='<p role="status">Không tải được lưu ý. <button type="button" data-guide-retry>Thử lại</button></p>';
  else if(!guide.data.notes)html+='<p>Đang tải lưu ý…</p>';
  else {const notes=(guide.data.notes.notes||[]).filter(n=>selected.includes(String(n.enemyId))&&(!n.counterId||ids.has(String(n.counterId)))&&n.text&&n.source?.url&&n.updatedAt);html+=notes.length?notes.map(n=>`<article class="guide-note"><b>${esc(guideName(n.enemyId))}${n.counterId?' · '+esc(guideName(n.counterId)):''}</b><p>${esc(n.text)}</p><a href="${esc(n.source.url)}" target="_blank" rel="noopener noreferrer">${esc(n.source.name)} ↗</a> · ${esc(n.updatedAt)}</article>`).join(''):'<div class="guide-empty">Chưa có lưu ý được biên tập và kiểm chứng cho các thức thần đã chọn.</div>';}
  out.innerHTML=html+'</section>';
}
document.addEventListener('click',e=>{if(state.view!=='pvp-guide')return; const target=e.target.closest('[data-guide-target]'),remove=e.target.closest('[data-guide-remove]'),pick=e.target.closest('[data-guide-pick]');
  if(target){guide.side=target.dataset.guideSide;guide.target=Number(target.dataset.guideTarget);guide.notice='';guideUpdate();document.querySelector('#search')?.focus()}
  else if(remove){guide.side=remove.dataset.guideSide;const i=Number(remove.dataset.guideRemove);(guide.side==='own'?guide.own:guide.slots)[i]=null;guide.target=i;guide.notice='';guide.showAll=false;guideUpdate()}
  else if(pick){guide.side='own';guide.target=guide.own.findIndex(x=>!x);if(guide.target<0){guide.target=null;guide.notice='Đội của bạn đã đủ 5 ô. Chọn một ô để thay thức thần.';guideUpdate()}else pvpGuideSelect(pick.dataset.guidePick)}
  else if(e.target.closest('[data-guide-reset]')){guide.slots.fill(null);guide.own.fill(null);guide.side='enemy';guide.target=0;guide.notice='';guide.showAll=false;guideUpdate()}
  else if(e.target.closest('[data-guide-more]')){guide.showAll=true;guideUpdate()}
  else if(e.target.closest('[data-guide-retry]')){guide.started=false;guide.errors={};pvpGuideStart()}
});
}
