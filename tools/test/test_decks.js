// Data integrity checks for every domain: run from the repo root with  node tools/test/test_decks.js
// Checks: index.json entries match deck files, unique card ids, required fields, no duplicate question+answer,
// every picture exists (img/<file> or a key inside img/pack-*.json), pairs point to real cards,
// and the artifact file limit (the Claude-hosted copy of the app accepts at most 512 files).
const fs = require('fs'), path = require('path');
const ROOT = process.argv[2] || path.resolve(__dirname, '..', '..');
const ICONS = (fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8').match(/const ICON = \{([\s\S]*?)\n\};/) || ['', ''])[1].match(/^\s*([a-z0-9]+):/gm).map(s => s.trim().slice(0, -1));
let pass = 0, fail = 0;
const ok = (name, cond, info = '') => { cond ? pass++ : fail++; if (!cond) console.log(`FAIL ${name}${info ? ' - ' + info : ''}`); };
const index = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/index.json')));
const packs = {};
const pack = p => packs[p] || (packs[p] = fs.existsSync(path.join(ROOT, 'img', p + '.json')) ? JSON.parse(fs.readFileSync(path.join(ROOT, 'img', p + '.json'))) : null);
const ids = new Set();
for (const dm of index.domains) {
  const where = `domain ${dm.id}`;
  ok(`${where}: title/sub/icon`, dm.title && dm.sub && dm.icon, JSON.stringify(dm).slice(0, 120));
  ok(`${where}: icon exists in app.js`, ICONS.includes(dm.icon), dm.icon);
  ok(`${where}: unique domain id`, !ids.has(dm.id)); ids.add(dm.id);
  const p = path.join(ROOT, 'data', dm.id + '.json');
  if (!fs.existsSync(p)) { ok(`${where}: data file exists`, false); continue; }
  const d = JSON.parse(fs.readFileSync(p));
  ok(`${where}: deck id matches`, d.id === dm.id, d.id);
  ok(`${where}: count matches`, dm.count === d.cards.length, `${dm.count} vs ${d.cards.length}`);
  const cid = new Set(), qa = new Set(), bad = [];
  for (const c of d.cards) {
    if (cid.has(c.id)) bad.push('duplicate id ' + c.id); cid.add(c.id);
    if (!c.id || !c.sub || (!c.q && !c.map && !c.romap && !c.rl && !c.flag) || !c.a) bad.push('missing field in ' + c.id);
    const k = (c.q || '') + '|' + c.a; if (c.q && qa.has(k.toLowerCase())) bad.push('duplicate card ' + k); qa.add(k.toLowerCase());
    if (c.img) {
      if (c.img.p) { const pk = pack(c.img.p); if (!pk || !pk[c.img.f]) bad.push(`missing packed picture ${c.img.p}/${c.img.f}`); }
      else if (!c.img.u && !fs.existsSync(path.join(ROOT, 'img', c.img.f))) bad.push('missing picture img/' + c.img.f);
      if (!c.img.lic || !c.img.page) bad.push('picture without license/source ' + c.id);
    }
  }
  for (const pr of d.pairs || []) if (!cid.has(pr[0]) || !cid.has(pr[1])) bad.push('pair to unknown card ' + pr.join(' / '));
  ok(`${where}: cards valid`, !bad.length, bad.slice(0, 6).join(' | '));
}
const count = dir => fs.readdirSync(dir, { withFileTypes: true }).reduce((n, e) => n + (e.isDirectory() ? count(path.join(dir, e.name)) : 1), 0);
const appFiles = 2 + count(path.join(ROOT, 'data')) + count(path.join(ROOT, 'img'));
ok('artifact file limit (index.html + app.js + data + img <= 512)', appFiles <= 512, String(appFiles));
console.log(`deck checks: ${pass} passed, ${fail} failed | ${index.domains.length} domains | app files: ${appFiles}/512`);
process.exit(fail ? 1 : 0);
