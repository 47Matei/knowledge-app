// Contact sheets for the visual audit: every downloaded photo labelled with the card it is meant for.
// Usage (repo root): node tools/images/audit_sheet.js work/targets.json   -> work/audit/sheet-<n>.jpg
// Open each sheet, look at every picture and add the tag of every wrong/unclear one to work/exclude.txt (one per line).
// Rule of the project: no picture is better than a wrong picture.
const fs = require('fs'), path = require('path'), sharp = require('sharp');
const TGT = process.argv[2], WORK = path.dirname(path.resolve(TGT));
const meta = JSON.parse(fs.readFileSync(path.join(WORK, 'meta.json'))), OUT = path.join(WORK, 'audit');
fs.mkdirSync(OUT, { recursive: true });
const items = JSON.parse(fs.readFileSync(TGT)).filter(t => meta[t.tag] && meta[t.tag].f);
const x = s => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;');
(async () => {
  const per = 24, cols = 4, W = 300, H = 200, L = 48;
  for (let s = 0; s * per < items.length; s++) {
    const part = items.slice(s * per, (s + 1) * per), comps = [];
    for (let i = 0; i < part.length; i++) {
      const t = part[i], v = meta[t.tag], X = (i % cols) * W, Y = Math.floor(i / cols) * (H + L);
      try { comps.push({ input: await sharp(path.join(WORK, 'raw', v.f)).resize(W - 6, H - 6, { fit: 'contain', background: '#eee' }).toBuffer(), left: X + 3, top: Y + 3 }); } catch (e) { }
      comps.push({ input: Buffer.from(`<svg width="${W}" height="${L}"><text x="4" y="13" font-size="12" font-weight="bold" font-family="sans-serif">${s * per + i}: ${x((t.label || t.q).slice(0, 40))}</text><text x="4" y="28" font-size="9" fill="#06c" font-family="sans-serif">${x(t.tag.slice(0, 52))}</text><text x="4" y="42" font-size="9" fill="#777" font-family="sans-serif">${x((v.title || '').slice(5, 60))}</text></svg>`), left: X, top: Y + H });
    }
    await sharp({ create: { width: cols * W, height: Math.ceil(part.length / cols) * (H + L), channels: 3, background: '#fff' } }).composite(comps).jpeg({ quality: 72 }).toFile(path.join(OUT, `sheet-${s}.jpg`));
  }
  console.log('sheets:', Math.ceil(items.length / per), '| photos:', items.length, '| folder:', OUT);
})();
