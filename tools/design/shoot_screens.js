// Screenshots of the main screens in light and dark (design/out/screens-*.jpg), to review the design on every view.
// Start a server first (repo root): python3 -m http.server 8765   then: NODE_PATH=tools/node_modules node tools/design/shoot_screens.js
const { chromium, devices } = require('playwright');
const sharp = require('sharp'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..'), BASE = process.env.BASE_URL || 'http://localhost:8765/';
const OUT = path.join(ROOT, 'design', 'out'); fs.mkdirSync(OUT, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const skipIntro = async p => { if (await p.$('text=Sari peste')) { await p.click('text=Sari peste'); await sleep(400); } };
const SCREENS = [
  ['Acasă', async p => { }],
  ['Domeniu', async p => { await p.click('.tile[data-id="capitale"]'); await sleep(500); await skipIntro(p); }],
  ['Card', async p => { await p.click('.tile[data-id="capitale"]'); await sleep(500); await skipIntro(p); await p.click('[data-a="learn"]'); await p.waitForSelector('#typed'); await p.fill('#typed', 'Zzyzx'); await p.click('.typein button'); await sleep(800); await p.evaluate(() => scrollTo(0, 0)); }],
  ['Test', async p => { await p.click('.tile[data-id="capitale"]'); await sleep(500); await skipIntro(p); await p.click('[data-a="quiz"]'); await sleep(600); const b = await p.$('.opts button, .opt, [data-opt]'); if (b) { await b.click(); await sleep(600); } await p.evaluate(() => scrollTo(0, 0)); }],
  ['Statistici', async p => { await p.click('#nav [data-go="stats"]'); await sleep(600); }],
  ['Insigne', async p => { await p.click('#nav [data-go="badges"]'); await sleep(500); }],
  ['Setări', async p => { await p.click('#nav [data-go="settings"]'); await sleep(500); }],
];
(async () => {
  const browser = await chromium.launch();
  for (const scheme of ['light', 'dark']) {
    const files = [];
    for (const [name, act] of SCREENS) {
      const ctx = await browser.newContext({ ...devices['Pixel 7'], colorScheme: scheme, serviceWorkers: 'block' });
      const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(e.message));
      await page.goto(BASE); await page.waitForSelector('.tile'); await sleep(900);
      try { await act(page); } catch (e) { console.log('!', name, e.message.split('\n')[0]); }
      const f = path.join(OUT, `screen-${scheme}-${files.length + 1}.png`); await page.screenshot({ path: f }); files.push([name, f]);
      if (errs.length) console.log('JS errors on', name, errs);
      await ctx.close();
    }
    const W = 330, H = 715, GAP = 14, TITLE = 46, comps = [];
    for (let i = 0; i < files.length; i++) {
      comps.push({ input: await sharp(files[i][1]).resize(W, H, { fit: 'cover', position: 'top' }).png().toBuffer(), left: GAP + i * (W + GAP), top: TITLE });
      comps.push({ input: Buffer.from(`<svg width="${W}" height="${TITLE}"><text x="4" y="32" font-family="Helvetica, Arial" font-size="22" font-weight="700" fill="${scheme === 'dark' ? '#eee' : '#111'}">${files[i][0]}</text></svg>`), left: GAP + i * (W + GAP), top: 0 });
    }
    await sharp({ create: { width: files.length * (W + GAP) + GAP, height: H + TITLE + GAP, channels: 4, background: scheme === 'dark' ? '#000' : '#fff' } }).composite(comps).jpeg({ quality: 82 }).toFile(path.join(OUT, `ecrane-${scheme}.jpg`));
    console.log('ok', scheme);
  }
  await browser.close();
})();
