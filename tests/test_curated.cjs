const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = process.argv[2] || process.cwd();
const snapshot = JSON.parse(fs.readFileSync(path.join(root, 'curated/yysrank-top20.json'), 'utf8'));
const catalog = JSON.parse(fs.readFileSync(path.join(root, 'data/shikigami-catalog.json'), 'utf8'));
const ids = new Set(catalog.heroes.map(h => String(h.id)));
assert.equal(snapshot.teams.length, 20);
assert.equal(new Set(snapshot.teams.map(t => t.id)).size, 20);
assert.equal(snapshot.source.url, 'https://yysrank.win/query/team');
snapshot.teams.forEach((t, i) => {
  assert.equal(t.rank, i + 1);
  assert.ok(t.picks >= 100 && t.winRate >= 0 && t.winRate <= 100);
  assert.equal(t.slots.length, 10);
  assert.ok(t.slots.slice(0, 5).every(id => ids.has(id)));
  assert.ok(t.slots.slice(5).every(id => id === null));
  if (i) assert.ok(snapshot.teams[i - 1].winRate >= t.winRate);
});
console.log('20 ranked teams and catalog IDs verified');
