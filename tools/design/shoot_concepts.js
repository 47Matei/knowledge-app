// Screenshots of the design concepts (design/concepts/*.css) on the real app, phone size, plus a side-by-side sheet.
// Start a server first (repo root): python3 -m http.server 8765   then: NODE_PATH=tools/node_modules node tools/design/shoot_concepts.js
const { chromium, devices } = require('playwright');
const sharp = require('sharp'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..'), BASE = process.env.BASE_URL || 'http://localhost:8765/';
const OUT = path.join(ROOT, 'design', 'out'); fs.mkdirSync(OUT, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const concepts = [['0-actual', null], ...fs.readdirSync(path.join(ROOT, 'design', 'concepts')).filter(f => f.endsWith('.css')).sort().map(f => [f.replace('.css', ''), path.join(ROOT, 'design', 'concepts', f)])];
(async () => {
  const browser = await chromium.launch();
  const shots = {};
  const runs = [];
  for (const [name, css] of concepts) for (const scheme of ['light', 'dark']) runs.push([name, css, scheme]);
  for (const [cname, css, scheme] of runs) {
    const dark = scheme === 'dark', name = `${cname}-${scheme}`;
    const ctx = await browser.newContext({ ...devices['Pixel 7'], colorScheme: dark ? 'dark' : 'light', serviceWorkers: 'block' });
    const page = await ctx.newPage();
    if (css) { const src = fs.readFileSync(css, 'utf8'); await page.addInitScript(s => { document.addEventListener('DOMContentLoaded', () => { const st = document.createElement('style'); st.textContent = s; document.body.appendChild(st); }); }, src); }
    await page.goto(BASE); await page.waitForSelector('.tile'); await sleep(1200);
    const home = path.join(OUT, `${name}-1-acasa.png`); await page.screenshot({ path: home });
    await page.click('.tile[data-id="capitale"]'); await sleep(500);
    if (await page.$('text=Sari peste')) { await page.click('text=Sari peste'); await sleep(400); }
    const dom = path.join(OUT, `${name}-2-domeniu.png`); await page.screenshot({ path: dom });
    await page.click('[data-a="learn"]'); await page.waitForSelector('#typed'); await sleep(300);
    const q = await page.$eval('.qtext', n => n.textContent).catch(() => '');
    const a = await page.evaluate(async q => { const d = await fetch('data/capitale.json').then(r => r.json()); const c = d.cards.find(c => c.q === q); return c ? c.a : 'x'; }, q);
    await page.fill('#typed', a); await page.click('.typein button'); await sleep(900);
    await page.evaluate(() => window.scrollTo(0, 0)); await sleep(200);
    const card = path.join(OUT, `${name}-3-card.png`); await page.screenshot({ path: card });
    shots[name] = [home, dom, card];
    await ctx.close();
    console.log('ok', name);
  }
  await browser.close();
  // side-by-side sheets: one per screen and scheme, one column per concept
  const W = 360, H = 780, GAP = 16, TITLE = 54;
  const NAMES = { actual: 'Actual', plin: 'Plin', degrade: 'Degradeu', nuante: 'Nuanțe', delicat: 'Delicat' };
  const title = n => { const k = (n.match(/^[a-z0-9]+-(.*)-(light|dark)$/) || [, n])[1]; return NAMES[k] || k.replace(/-/g, ' '); };
  for (const scheme of ['light', 'dark']) for (let row = 0; row < 3; row++) {
    const names = Object.keys(shots).filter(n => n.endsWith('-' + scheme));
    const width = names.length * (W + GAP) + GAP, height = H + TITLE + GAP, comps = [];
    for (let i = 0; i < names.length; i++) {
      const img = await sharp(shots[names[i]][row]).resize(W, H, { fit: 'cover', position: 'top' }).png().toBuffer();
      comps.push({ input: img, left: GAP + i * (W + GAP), top: TITLE });
      comps.push({ input: Buffer.from(`<svg width="${W}" height="${TITLE}"><text x="4" y="36" font-family="Helvetica, Arial" font-size="24" font-weight="700" fill="${scheme === 'dark' ? '#eee' : '#111'}">${i ? i + ' · ' : ''}${title(names[i])}</text></svg>`), left: GAP + i * (W + GAP), top: 0 });
    }
    await sharp({ create: { width, height, channels: 4, background: scheme === 'dark' ? '#000000' : '#FFFFFF' } }).composite(comps).jpeg({ quality: 82 }).toFile(path.join(OUT, `comparatie-${scheme}-${row + 1}.jpg`));
  }
  console.log('sheets done');
})();
