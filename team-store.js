(function (root) {
  const KEY = 'heian.teams.v1', LEGACY = 'heian.team.v1';
  function validSlots(slots) { return Array.isArray(slots) && slots.length === 10 && slots.every(x => x === null || (typeof x === 'string' && /^\d+$/.test(x))); }
  function read(storage) {
    const raw = storage.getItem(KEY);
    if (raw !== null) {
      const value = JSON.parse(raw);
      if (value.version !== 1 || !Array.isArray(value.teams) || !value.teams.every(t => typeof t.id === 'string' && typeof t.name === 'string' && validSlots(t.slots) && (t.souls === undefined || TeamSoulStore.validBuilds(t.souls)))) throw Error('Dữ liệu đội đã lưu không hợp lệ');
      return value.teams;
    }
    const old = storage.getItem(LEGACY);
    if (!old) return [];
    const value = JSON.parse(old);
    if (!Array.isArray(value.slots) || ![5,10].includes(value.slots.length)) throw Error('Dữ liệu đội cũ không hợp lệ');
    const slots = [...value.slots, ...Array(10-value.slots.length).fill(null)];
    if (!validSlots(slots)) throw Error('Dữ liệu đội cũ không hợp lệ');
    if (!slots.some(Boolean)) return [];
    const now = new Date().toISOString(), teams = [{id:'legacy-team',name:'Đội trước đây',note:'',category:'',createdAt:now,updatedAt:now,slots}];
    storage.setItem(KEY, JSON.stringify({version:1,teams}));
    return teams;
  }
  function write(storage, teams) { storage.setItem(KEY, JSON.stringify({version:1,teams})); }
  function swap(slots, from, to) { const copy = slots.slice(); [copy[from], copy[to]] = [copy[to], copy[from]]; return copy; }
  function select(selected, index) { return selected.includes(index) ? selected.filter(x => x !== index) : [...selected, index].slice(-2); }
  root.TeamStore = {KEY, LEGACY, read, write, validSlots, swap, select};
  if (typeof module !== 'undefined' && module.exports) module.exports = root.TeamStore;
})(typeof globalThis !== 'undefined' ? globalThis : this);
