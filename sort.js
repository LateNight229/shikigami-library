/* Pure numeric sorting; missing values stay last in either direction. */
(function (root) {
  const allowed = new Set(['hp', 'atk', 'def', 'speed', 'crit', 'critDamage', 'pickRate', 'winRate', 'banRate', 'teamCount', 'teamPicks', 'teamWinRate', 'teamPickRate']);
  function sortHeroes(heroes, key, direction) {
    if (key === 'default') return heroes.map((hero, index) => ({hero, index})).sort((a, b) => {
      const number = id => /^\d+$/.test(String(id)) ? Number(id) : NaN;
      const av = number(a.hero.id), bv = number(b.hero.id);
      const aValid = Number.isSafeInteger(av), bValid = Number.isSafeInteger(bv);
      if (!aValid || !bValid) return aValid === bValid ? a.index - b.index : aValid ? -1 : 1;
      return bv - av || a.index - b.index;
    }).map(item => item.hero);
    if (!allowed.has(key)) return heroes.slice();
    const sign = direction === 'asc' ? 1 : -1;
    return heroes.map((hero, index) => ({hero, index})).sort((a, b) => {
      const av = a.hero.sortMetrics?.[key] ?? a.hero.stats?.[key]?.value;
      const bv = b.hero.sortMetrics?.[key] ?? b.hero.stats?.[key]?.value;
      const aValid = typeof av === 'number' && Number.isFinite(av);
      const bValid = typeof bv === 'number' && Number.isFinite(bv);
      if (!aValid || !bValid) return aValid === bValid ? a.index - b.index : aValid ? -1 : 1;
      return (av - bv) * sign || a.index - b.index;
    }).map(item => item.hero);
  }
  function neighborId(items, selected, direction) {
    if (!items.length) return null;
    const index = items.findIndex(item => String(item.id) === String(selected));
    if (index < 0) return String(items[direction < 0 ? items.length - 1 : 0].id);
    return String(items[(index + (direction < 0 ? -1 : 1) + items.length) % items.length].id);
  }
  root.ShikiSort = { sortHeroes, neighborId };
  if (typeof module !== 'undefined' && module.exports) module.exports = root.ShikiSort;
})(typeof globalThis !== 'undefined' ? globalThis : this);
