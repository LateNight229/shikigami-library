/* Hạt nhân thử nghiệm. Không chứa luật game; chỉ chạy fixture giả lập. */
(function (root) {
  const MAX_ACTIONS = 500;
  function seededRandom(seed) {
    let state = seed >>> 0;
    return () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state / 4294967296; };
  }
  function validateFixture(team) {
    if (!Array.isArray(team) || team.length !== 5) throw Error('Fixture cần đúng 5 nhân vật.');
    for (const unit of team) {
      if (!unit || !['hp','atk','speed','crit','critDamage'].every(key => Number.isFinite(unit[key]) && unit[key] >= 0) || unit.hp === 0 || unit.speed === 0) throw Error('Chỉ số fixture không hợp lệ.');
    }
  }
  function runFixture(red, blue, random, maxActions = MAX_ACTIONS) {
    validateFixture(red); validateFixture(blue);
    if (typeof random !== 'function' || !Number.isInteger(maxActions) || maxActions < 1) throw Error('Cấu hình không hợp lệ.');
    const teams = [red, blue].map(team => team.map(unit => ({...unit, hpNow: unit.hp, gauge: 0})));
    for (let turn = 0; turn < maxActions; turn++) {
      const alive = teams.flatMap((team, side) => team.filter(unit => unit.hpNow > 0).map(unit => ({unit, side})));
      const next = Math.min(...alive.map(({unit}) => (1-unit.gauge)/unit.speed));
      for (const {unit} of alive) unit.gauge += next * unit.speed;
      const ready = alive.filter(({unit}) => unit.gauge >= 1-1e-10);
      const actor = ready[Math.floor(random()*ready.length)];
      actor.unit.gauge = Math.max(0, actor.unit.gauge-1);
      const targets = teams[1-actor.side].filter(unit => unit.hpNow > 0);
      const target = targets[Math.floor(random()*targets.length)];
      const critical = random() < Math.min(actor.unit.crit,100)/100;
      target.hpNow -= actor.unit.atk * (critical ? actor.unit.critDamage/100 : 1);
      if (teams[1-actor.side].every(unit => unit.hpNow <= 0)) return actor.side === 0 ? 'red' : 'blue';
    }
    return 'unresolved';
  }
  function simulateFixture(red, blue, count = 100, seed = 1, maxActions = MAX_ACTIONS) {
    if (!Number.isInteger(count) || count < 1 || count > 10000 || !Number.isInteger(seed)) throw Error('Số trận hoặc seed không hợp lệ.');
    const random = seededRandom(seed), results = {red:0, blue:0, unresolved:0};
    for (let i = 0; i < count; i++) results[runFixture(red,blue,random,maxActions)]++;
    return results;
  }
  function validateGameTeams(red, blue) {
    const errors = [];
    for (const [side, team] of [['Đỏ', red], ['Xanh', blue]]) {
      if (!Array.isArray(team) || team.length !== 5) { errors.push(`Đội ${side}: cần đúng 5 ô.`); continue; }
      team.forEach((unit, index) => {
        const label = `Đội ${side}, ô ${index + 1}`;
        if (!unit || typeof unit.id !== 'string' || !/^\d+$/.test(unit.id)) { errors.push(`${label}: chưa chọn thức thần.`); return; }
        for (const key of ['hp','atk','def','speed','crit','critDamage','effectHit','effectRes']) {
          const value = unit.stats?.[key];
          if (value === '' || value == null || !Number.isFinite(Number(value)) || Number(value) < 0 || (['hp','speed'].includes(key) && Number(value) === 0)) errors.push(`${label}: chỉ số ${key} chưa hợp lệ.`);
        }
        if (unit.mode && !['single','aoe'].includes(unit.mode)) errors.push(`${label}: kiểu tấn công không hợp lệ.`);
      });
    }
    return {ok:errors.length === 0, errors};
  }
  function simulateApproximate(red, blue, count = 100, seed = 1, maxActions = MAX_ACTIONS) {
    const report = validateGameTeams(red, blue);
    if (!report.ok) throw Error(report.errors.join(' '));
    if (!Number.isInteger(count) || count < 1 || count > 10000 || !Number.isInteger(seed) || !Number.isInteger(maxActions) || maxActions < 1) throw Error('Cấu hình không hợp lệ.');
    const random = seededRandom(seed), results = {red:0, blue:0, unresolved:0};
    for (let battle = 0; battle < count; battle++) {
      const teams = [red, blue].map(team => team.map(u => ({...u, stats:Object.fromEntries(Object.entries(u.stats).map(([k,v]) => [k,Number(v)])), hpNow:Number(u.stats.hp), gauge:0})));
      let winner = 'unresolved';
      for (let action = 0; action < maxActions; action++) {
        const alive = teams.flatMap((team,side) => team.filter(u => u.hpNow > 0).map(unit => ({unit,side})));
        const time = Math.min(...alive.map(({unit}) => (1-unit.gauge)/unit.stats.speed));
        alive.forEach(({unit}) => unit.gauge += time*unit.stats.speed);
        const ready = alive.filter(({unit}) => unit.gauge >= 1-1e-10);
        const actor = ready[Math.floor(random()*ready.length)];
        actor.unit.gauge = Math.max(0,actor.unit.gauge-1);
        const enemies = teams[1-actor.side].filter(u => u.hpNow > 0);
        const targets = actor.unit.mode === 'aoe' ? enemies : [enemies[Math.floor(random()*enemies.length)]];
        for (const target of targets) {
          const critical = random() < Math.min(actor.unit.stats.crit,100)/100;
          const coefficient = actor.unit.mode === 'aoe' ? 0.6 : 1;
          target.hpNow -= actor.unit.stats.atk * coefficient * (300/(300+target.stats.def)) * (critical ? actor.unit.stats.critDamage/100 : 1);
        }
        if (teams[1-actor.side].every(u => u.hpNow <= 0)) { winner = actor.side === 0 ? 'red' : 'blue'; break; }
      }
      results[winner]++;
    }
    return results;
  }
  const api = {seededRandom, runFixture, simulateFixture, validateGameTeams, simulateApproximate};
  root.MatchEngine = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
