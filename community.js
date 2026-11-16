/* Read-only community snapshot. No user account identifiers are published. */
const communityState = { reviews: null, recommendations: null, reviewsError: false, recommendationsError: false };
function communityText(value) {
  return esc(String(value ?? '').replace(/\{[+-]([^}]+)\}/g, '$1')).replace(/\n/g, '<br>');
}
function communityLink(value) {
  try { const url = new URL(value); return ['http:', 'https:'].includes(url.protocol) ? url.href : null; }
  catch { return null; }
}
function communitySoulName(id) {
  if (id == null) return 'Không ghi';
  const soul = state.souls.find(item => String(item.id) === String(id));
  return soul ? localName(soul.name) : `Ngự hồn #${id}`;
}
function communityReviewPanel(hero) {
  const id = String(hero.id), review = communityState.reviews?.[id];
  if (communityState.reviewsError) return '<div class="card-body"><h3>Cách chơi & đánh giá</h3><div class="message">Không tải được dữ liệu đánh giá. Vui lòng tải lại trang.</div></div>';
  if (!communityState.reviews) return '<div class="card-body"><h3>Cách chơi & đánh giá</h3><div class="message">Đang tải đánh giá…</div></div>';
  if (!review) return '<div class="card-body"><h3>Cách chơi & đánh giá</h3><div class="message">Chưa có đánh giá cho thức thần này trong dữ liệu hiện có.</div></div>';
  const levels = {high:'Cao',medium:'Trung bình',low:'Thấp'};
  const ratings = Array.isArray(review.ratings) ? review.ratings : [];
  const sections = Array.isArray(review.sections) ? review.sections : [];
  const sources = Array.isArray(review.sources) ? review.sources : [];
  const items = (list) => Array.isArray(list) && list.length ? `<ul>${list.map(x=>`<li>${communityText(x)}</li>`).join('')}</ul>` : '<p>Chưa có thông tin.</p>';
  return `<div class="card-body community-panel"><h3>Cách chơi & đánh giá</h3><p class="community-meta">Độ tin cậy theo nguồn: ${communityText(levels[review.confidence] || review.confidence || 'Chưa rõ')} · Cập nhật: ${communityText(review.updatedAt || 'Chưa rõ')}</p><p class="source">Dữ liệu tham khảo từ Thức Thần Lục; điểm số và nhận định chưa được kiểm chứng độc lập.</p>${review.verdict?`<h4>${communityText(review.verdict)}</h4>`:''}${review.summary?`<p>${communityText(review.summary)}</p>`:''}${ratings.length?`<div class="community-ratings">${ratings.map(r=>`<div><b>${communityText(r.label)}</b><strong>${communityText(r.score ?? '—')}</strong>${r.note?`<small>${communityText(r.note)}</small>`:''}</div>`).join('')}</div>`:''}<h4>Điểm mạnh</h4>${items(review.strengths)}<h4>Hạn chế</h4>${items(review.weaknesses)}${sections.map(s=>`<section><h4>${communityText(s.title)}</h4>${Array.isArray(s.paragraphs)&&s.paragraphs.length?s.paragraphs.map(p=>`<p>${communityText(p)}</p>`).join(''):'<p class="source">Chưa có nội dung.</p>'}</section>`).join('')}<h4>Nguồn tham khảo</h4><ul>${sources.map(s=>{const url=communityLink(s.url);return `<li>${url?`<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${communityText(s.title || s.publisher || 'Xem nguồn')}</a>`:communityText(s.title || s.publisher || 'Không rõ nguồn')}${s.publishedAt?` · ${communityText(s.publishedAt)}`:''}${s.usedFor?` — ${communityText(s.usedFor)}`:''}</li>`}).join('') || '<li>Chưa có nguồn chi tiết.</li>'}</ul></div>`;
}
function communitySoulsPanel(hero) {
  const id = String(hero.id), builds = communityState.recommendations?.[id];
  if (communityState.recommendationsError) return '<div class="card-body"><h3>Ngự hồn đề xuất</h3><div class="message">Không tải được dữ liệu đề xuất. Vui lòng tải lại trang.</div></div>';
  if (!communityState.recommendations) return '<div class="card-body"><h3>Ngự hồn đề xuất</h3><div class="message">Đang tải đề xuất…</div></div>';
  if (!builds?.length) return '<div class="card-body"><h3>Ngự hồn đề xuất</h3><div class="message">Chưa có đề xuất cho thức thần này trong dữ liệu hiện có.</div></div>';
  const modes = {basic:'Cơ bản',pvp:'PvP',pve:'PvE'};
  return `<div class="card-body community-panel"><h3>Ngự hồn đề xuất</h3><p class="source">Đề xuất từ cộng đồng Thức Thần Lục · dữ liệu tham khảo, chưa xác minh độc lập.</p>${builds.map(r=>`<article class="community-build"><div class="community-build-head"><b>${communityText(modes[r.mode] || r.mode || 'Chưa rõ chế độ')}</b><span>${communityText((r.updated_at || r.created_at || '').slice(0,10))}</span></div><p><b>Ngự chính:</b> ${communityText(communitySoulName(r.primary_soul_id))}${r.secondary_soul_id!=null?` · <b>Ngự phụ:</b> ${communityText(communitySoulName(r.secondary_soul_id))}`:''}</p><div class="community-slots">${[2,4,6].map(n=>`<span>Vị trí ${n}<strong>${communityText(r[`slot_${n}_stat`] || '—')}</strong></span>`).join('')}</div>${r.secondary_bonus?`<p><b>Chỉ số phụ:</b> ${communityText(r.secondary_bonus)}</p>`:''}${r.requires_100_crit?'<p>Cần 100% chí mạng</p>':''}${r.speed_min!=null||r.speed_max!=null?`<p><b>Tốc độ:</b> ${r.speed_min!=null?'tối thiểu '+communityText(r.speed_min):''}${r.speed_min!=null&&r.speed_max!=null?' · ':''}${r.speed_max!=null?'tối đa '+communityText(r.speed_max):''}</p>`:''}${r.note?`<p>${communityText(r.note)}</p>`:''}${r.recommendation_note?`<p>${communityText(r.recommendation_note)}</p>`:''}</article>`).join('')}</div>`;
}
function loadCommunityData() {
  for (const [kind,path] of [['reviews','community/reviews.json'],['recommendations','community/recommendations.json']]) {
    getJson(path).then(data=>{communityState[kind]=data;}).catch(()=>{communityState[kind+'Error']=true;}).finally(()=>{
      if(state.view==='hero' && (kind==='reviews' ? state.tab==='guide' : state.tab==='souls')) display();
    });
  }
}
