// Compress the approved photos and attach them to their cards.
// Usage (repo root): node tools/images/pack_images.js work/targets.json [--files]
//   default: photos go into img/pack-<deck>-<n>.json (40 per file, {tag: data URI}); the card gets img {p, f, by, lic, page}.
//            Use this while the app is still also published as a Claude artifact (max 512 files there).
//   --files: photos go into img/<tag>.jpg and the card gets img {f, by, lic, page} (fine for GitHub Pages).
// Skips tags listed in work/exclude.txt, tags without a photo, and cards that already have a picture (unless REPLACE=1).
// Also appends the attributions to CREDITS.md.
const fs = require('fs'), path = require('path'), sharp = require('sharp');
const ROOT = path.resolve(__dirname, '..', '..'), TGT = process.argv[2], FILES = process.argv.includes('--files');
const WORK = path.dirname(path.resolve(TGT)), PACK_N = 40;
const meta = JSON.parse(fs.readFileSync(path.join(WORK, 'meta.json')));
const exPath = path.join(WORK, 'exclude.txt'), ex = new Set(fs.existsSync(exPath) ? fs.readFileSync(exPath, 'utf8').split(/\s+/).filter(Boolean) : []);
const targets = JSON.parse(fs.readFileSync(TGT)).filter(t => meta[t.tag] && meta[t.tag].f && !ex.has(t.tag));
(async () => {
  const byDeck = {}; for (const t of targets) (byDeck[t.deck] = byDeck[t.deck] || []).push(t);
  const credits = [];
  for (const [dk, list] of Object.entries(byDeck)) {
    const dp = path.join(ROOT, 'data', dk + '.json'), d = JSON.parse(fs.readFileSync(dp));
    const cards = Object.fromEntries(d.cards.map(c => [c.id, c]));
    const existing = fs.readdirSync(path.join(ROOT, 'img')).map(f => (f.match(new RegExp(`^pack-${dk}-(\\d+)\\.json$`)) || [])[1]).filter(Boolean).map(Number);
    let packNo = existing.length ? Math.max(...existing) + 1 : 1, pack = {}, n = 0, skipped = [], rows = [];
    const flush = () => { if (!Object.keys(pack).length) return; fs.writeFileSync(path.join(ROOT, 'img', `pack-${dk}-${packNo}.json`), JSON.stringify(pack)); packNo++; pack = {}; };
    for (const t of list) {
      const c = cards[t.card]; if (!c) { skipped.push(t.tag + ' (card not found)'); continue; }
      if (c.img && process.env.REPLACE !== '1') { skipped.push(t.tag + ' (card already has a picture)'); continue; }
      const v = meta[t.tag];
      const buf = await sharp(path.join(WORK, 'raw', v.f)).rotate().flatten({ background: '#ffffff' }).resize({ width: 500, height: 500, fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 72, mozjpeg: true }).toBuffer();
      const info = { by: String(v.by || 'autor necunoscut').replace(/\s+/g, ' ').slice(0, 80), lic: v.lic, page: v.page };
      if (FILES) { fs.writeFileSync(path.join(ROOT, 'img', t.tag + '.jpg'), buf); c.img = { f: t.tag + '.jpg', ...info }; }
      else { pack[t.tag] = 'data:image/jpeg;base64,' + buf.toString('base64'); c.img = { p: `pack-${dk}-${packNo}`, f: t.tag, ...info }; if (Object.keys(pack).length >= PACK_N) flush(); }
      rows.push(`| ${c.q.replace(/\|/g, '/')} | \`${FILES ? t.tag + '.jpg' : 'pack-' + dk + ' / ' + t.tag}\` | ${info.by.replace(/\|/g, '/')} | ${info.lic} | [Commons](${info.page}) |`); n++;
    }
    flush();
    if (rows.length) credits.push(`\n## ${dk} (adăugate ${new Date().toISOString().slice(0, 10)})\n\n| Card | Fișier | Autor | Licență | Sursă |\n|---|---|---|---|---|`, ...rows);
    fs.writeFileSync(dp, JSON.stringify(d));
    console.log(`${dk}: ${n} photos attached${skipped.length ? ', skipped: ' + skipped.join(', ') : ''}`);
  }
  if (credits.length) fs.appendFileSync(path.join(ROOT, 'CREDITS.md'), '\n' + credits.join('\n') + '\n');
  console.log('files in img/:', fs.readdirSync(path.join(ROOT, 'img')).length);
})();
