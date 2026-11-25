/* Worker thử nghiệm: chỉ nhận mẫu giả, không xử lý đội game. */
importScripts('match-engine.js');
self.onmessage = event => {
  const {type, seed, red, blue} = event.data || {};
  try {
    if (type === 'approximate') {
      self.postMessage({type:'approximate-result', result:MatchEngine.simulateApproximate(red, blue, 100, seed), seed});
      return;
    }
    if (type !== 'demo') throw Error('Chưa hỗ trợ mô phỏng đội game.');
    const unit = {hp:1000, atk:100, speed:100, crit:50, critDamage:200};
    const team = Array.from({length:5}, () => ({...unit}));
    const result = MatchEngine.simulateFixture(team, team, 100, seed);
    self.postMessage({type:'demo-result', result, seed});
  } catch (error) { self.postMessage({type:'error', message:String(error.message || error)}); }
};
