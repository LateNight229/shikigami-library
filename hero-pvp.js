/* Statistics and team snapshots are separate: do not infer one from the other. */
const heroPvp={stats:null,teams:null,counters:null,statsError:false,teamsError:false,countersError:false,loading:{},sort:'pickRate',direction:'desc',allyDirection:'desc',soulSource:'community'};
function heroPvpLoad(kind){
  if(heroPvp[kind]||heroPvp.loading[kind]||heroPvp[kind+'Error'])return;
  const paths={stats:'curated/hero-pvp.json',teams:'curated/yysrank-top20.json',counters:'curated/hero-counters.json'};
  heroPvp.loading[kind]=true;
  getJson(paths[kind]).then(data=>{heroPvp[kind]=data;}).catch(()=>{heroPvp[kind+'Error']=true;}).finally(()=>{heroPvp.loading[kind]=false;if(state.view==='hero'&&((kind==='stats'&&state.tab==='pvp')||(kind==='teams'&&['hero-teams','hero-allies'].includes(state.tab))||(kind==='counters'&&state.tab==='hero-counters')))display();});
}
function heroSoulsPanel(hero){const tabs=`<div class="soul-source-tabs" aria-label="Nguồn ngự hồn"><button type="button" data-hero-soul-source="community" aria-pressed="${heroPvp.soulSource==='community'}">Thức Thần Lục</button><button type="button" data-hero-soul-source="yysrank" aria-pressed="${heroPvp.soulSource==='yysrank'}">阳间斗技</button></div>`;return tabs+(heroPvp.soulSource==='community'?communitySoulsPanel(hero):'<div class="card-body hero-source-section"><h3>Ngự hồn · 阳间斗技</h3><p class="source">Thống kê ngự hồn theo nguồn 阳间斗技.</p><div class="message">Chưa có dữ liệu từ nguồn này.</div></div>');}
function heroAllyCounts(id,teams){const wanted=String(id),matching=teams.filter(t=>t.slots.slice(0,5).some(x=>String(x)===wanted)),counts=new Map();for(const team of matching){const unique=new Set(team.slots.slice(0,5).filter(Boolean).map(String));unique.delete(wanted);for(const ally of unique)counts.set(ally,(counts.get(ally)||0)+1);}return {total:matching.length,allies:[...counts].map(([id,count])=>({id,count}))};}
function heroAlliesPanel(hero){
  heroPvpLoad('teams');if(heroPvp.teamsError)return '<div class="card-body"><h3>Thức thần đề cử</h3><div class="message">Không tải được dữ liệu đội hình.</div></div>';
  if(!heroPvp.teams)return '<div class="card-body"><h3>Thức thần đề cử</h3><div class="message">Đang tải dữ liệu…</div></div>';
  const {source,teams}=heroPvp.teams,{total,allies}=heroAllyCounts(hero.id,teams),direction=heroPvp.allyDirection==='asc'?1:-1;
  allies.sort((a,b)=>(a.count-b.count)*direction||a.id.localeCompare(b.id));
  const rows=allies.map(item=>{const member=state.heroes.find(x=>String(x.id)===item.id);const name=member?localName(member.name):`Thức thần #${item.id}`;return `<div class="hero-ally-row"><div><img loading="lazy" src="${image('shishen',item.id)}" alt=""><span>${esc(name)}</span></div><strong>${item.count}</strong><span>${(item.count/total*100).toFixed(1)}%</span></div>`;}).join('');
  return `<div class="card-body hero-allies"><h3>Thức thần đề cử <small>· Thường đi cùng</small></h3><p class="source">Số đội cùng xuất hiện trong ${total} đội có thức thần này (từ ${teams.length} đội tham khảo), không phải tỷ lệ thắng hay thống kê toàn bộ người chơi · <a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.name)} ↗</a> · ${esc(source.updatedAt)} (giờ nguồn).</p>${total?`<div class="hero-ally-head"><span>Thức thần</span><button type="button" data-hero-ally-sort>Số đội ${direction===1?'↑':'↓'}</button><span>Tỷ lệ</span></div>${rows}`:'<div class="message">Chưa có đội phù hợp để thống kê.</div>'}</div>`;
}
function heroCountersPanel(hero){
  heroPvpLoad('counters');const title='<h3>Thức thần khắc chế</h3>';
  if(heroPvp.countersError)return `<div class="card-body">${title}<div class="message">Không tải được dữ liệu khắc chế.</div></div>`;
  if(!heroPvp.counters)return `<div class="card-body">${title}<div class="message">Đang tải dữ liệu khắc chế…</div></div>`;
  const {source,heroes}=heroPvp.counters,entry=heroes[String(hero.id)];
  const intro=`<div class="soul-source-tabs"><span>阳间斗技</span></div><p class="source">Theo cột 受制于 của nguồn · ${esc(source.rank)} · ${esc(source.period)} · ${esc(source.updatedAt)} (giờ nguồn). Đây là dữ liệu tham khảo theo thống kê, không đảm bảo kết quả trong mọi trận.</p>`;
  const weak=entry?.counters||[];
  const strong=Object.entries(heroes).filter(([,item])=>item.counters?.some(counter=>String(counter.id)===String(hero.id))).map(([id,item])=>({id,nameVi:item.nameVi,nameZh:item.nameZh}));
  const cards=items=>items.length?`<div class="counter-grid">${items.map(item=>{const member=state.heroes.find(h=>String(h.id)===String(item.id));const name=member?localName(member.name):item.nameVi||item.nameZh||`Thức thần #${item.id}`;return `<a class="counter-card" href="?hero=${encodeURIComponent(item.id)}" target="_blank" rel="noopener noreferrer" title="${esc(name)}"><img src="${image('shishen',item.id)}" alt="" loading="lazy"><span>${esc(name)}</span></a>`}).join('')}</div>`:'<div class="message">Chưa có dữ liệu trong bảng nguồn hiện tại.</div>';
  const warning=entry&&entry.sourceCount>weak.length?'<p class="source">Một số tên từ nguồn chưa khớp với danh mục và đang chờ kiểm tra.</p>':'';
  return `<div class="card-body">${title}${intro}<section><h4>Yếu khi gặp</h4><p class="source">Những thức thần nguồn liệt kê là gây bất lợi cho ${esc(localName(hero.name))}.</p>${cards(weak)}${warning}</section><section><h4>Mạnh hơn khi gặp</h4><p class="source">Các thức thần có ${esc(localName(hero.name))} trong mục “Yếu khi gặp”. Suy ra từ bảng xếp hạng hiện có, không phải danh sách đầy đủ hay thứ tự sức mạnh.</p>${cards(strong)}</section></div>`;
}
function heroPvpStatsPanel(hero){
  heroPvpLoad('stats');if(heroPvp.statsError)return '<div class="card-body"><h3>Thông số PvP</h3><div class="message">Không tải được thống kê PvP.</div></div>';
  if(!heroPvp.stats)return '<div class="card-body"><h3>Thông số PvP</h3><div class="message">Đang tải thống kê PvP…</div></div>';
  const {source,heroes}=heroPvp.stats,stats=heroes[String(hero.id)];
  const provenance=`<p class="source">Nguồn: <a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.name)} ↗</a> · ${esc(source.rank)} · ${esc(source.period)} · ${esc(source.matches)} trận · Cập nhật ${esc(source.updatedAt)} (giờ nguồn). Tỷ lệ thắng theo chỉ số 外战胜率 của nguồn.</p>`;
  if(!stats)return `<div class="card-body"><h3>Thông số PvP</h3><div class="message">Chưa có thống kê cho thức thần này trong bảng dữ liệu hiện có.</div>${provenance}</div>`;
  return `<div class="card-body"><h3>Thông số PvP</h3><div class="hero-pvp-stats">${[['Tỷ lệ thắng',stats.winRate],['Tỷ lệ chọn',stats.pickRate],['Tỷ lệ cấm',stats.banRate]].map(([label,value])=>`<div><span>${label}</span><strong>${value==null?'—':`${esc(value)}%`}</strong></div>`).join('')}</div>${provenance}</div>`;
}
function heroTeamPanel(hero){
  heroPvpLoad('teams');if(heroPvp.teamsError)return '<div class="card-body"><h3>Đội đề cử</h3><div class="message">Không tải được dữ liệu đội hình.</div></div>';
  if(!heroPvp.teams)return '<div class="card-body"><h3>Đội đề cử</h3><div class="message">Đang tải đội hình…</div></div>';
  const {source,teams}=heroPvp.teams;const selected=teams.filter(t=>t.slots.slice(0,5).some(id=>String(id)===String(hero.id)));
  const field=heroPvp.sort,direction=heroPvp.direction==='asc'?1:-1;
  selected.sort((a,b)=>{const x=a[field],y=b[field];return x==null?(y==null?a.rank-b.rank:1):y==null?-1:(x-y)*direction||a.rank-b.rank;});
  const sort=(key,label)=>`<button type="button" class="hero-team-sort" data-hero-team-sort="${key}">${label} ${field===key?(direction===1?'↑':'↓'):'↕'}</button>`;
  const rows=selected.map(t=>`<div class="hero-team-row"><div class="hero-team-icons">${t.slots.slice(0,5).map(id=>{const member=state.heroes.find(x=>String(x.id)===String(id));const name=member?localName(member.name):`Thức thần #${id}`;return `<span class="hero-team-member" tabindex="0" aria-label="${esc(name)}" title="${esc(name)}"><img loading="lazy" src="${image('shishen',id)}" alt=""><span>${esc(name)}</span></span>`;}).join('')}</div><span>${t.winRate==null?'—':esc(t.winRate)+'%'}</span><span>${t.pickRate==null?'—':esc(t.pickRate)+'%'}</span></div>`).join('');
  return `<div class="card-body hero-team-panel"><h3>Đội đề cử <small>· ${selected.length} đội</small></h3><p class="source">Đội hình có thức thần này trong ${teams.length} đội tham khảo · <a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.name)} ↗</a> · ${esc(source.updatedAt)} (giờ nguồn)</p>${selected.length?`<div class="hero-team-table"><div class="hero-team-header"><span>Đội hình</span>${sort('winRate','Thắng')}${sort('pickRate','Chọn')}</div>${rows}</div>`:'<div class="message">Chưa có đội hình phù hợp trong dữ liệu hiện có.</div>'}</div>`;
}
document.addEventListener('click',e=>{const button=e.target.closest('[data-hero-team-sort]');if(!button)return;const field=button.dataset.heroTeamSort;if(!['winRate','pickRate'].includes(field))return;heroPvp.direction=heroPvp.sort===field&&heroPvp.direction==='desc'?'asc':'desc';heroPvp.sort=field;const panel=document.querySelector('.content-card'),scroll=panel?.scrollTop||0;display().then(()=>{const current=document.querySelector('.content-card');if(current)current.scrollTop=scroll;});});
document.addEventListener('click',e=>{if(!e.target.closest('[data-hero-ally-sort]'))return;heroPvp.allyDirection=heroPvp.allyDirection==='desc'?'asc':'desc';display();});
document.addEventListener('click',e=>{const button=e.target.closest('[data-hero-soul-source]');if(!button||!['community','yysrank'].includes(button.dataset.heroSoulSource))return;heroPvp.soulSource=button.dataset.heroSoulSource;display();});
