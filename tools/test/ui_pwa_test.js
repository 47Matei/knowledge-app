// UI tests for the installed app (PWA) in Chromium, Pixel 7 emulation: service worker, offline start,
// install panel, monthly backup reminder, and that none of it runs inside the Claude artifact.
// Start a server first (repo root): python3 -m http.server 8765   then: node tools/test/ui_pwa_test.js
const { chromium, devices } = require('playwright');
const path = require('path'), fs = require('fs'); const SP = path.join(__dirname, 'out'); fs.mkdirSync(SP, { recursive: true });
const BASE = process.env.BASE_URL || 'http://localhost:8765/';
const sleep = ms => new Promise(r => setTimeout(r, ms));
let pass = 0, fail = 0; const ok = (name, cond, info = '') => { if (cond) pass++; else fail++; console.log(`${cond ? 'OK  ' : 'FAIL'} ${name}${info ? ' - ' + info : ''}`); };
const DAY = 86400000;
const seed = async (page, state) => { await page.goto(BASE + 'manifest.webmanifest'); await page.evaluate(v => localStorage.setItem('cartoteca.v1', v), state); await page.goto(BASE); await page.waitForSelector('.tile'); };
const oldState = (extra = {}) => JSON.stringify({ v: 1, cards: { 'capi-x': { k: 'capitale', st: 2, due: Date.now() + DAY, s: 3, d: 5, reps: 2, lapses: 0, last: Date.now() - DAY } }, days: {}, xp: 10, streak: { cur: 0, best: 1, last: null, freezes: 1 }, badges: {}, conf: {}, quiz: { best: {} }, cotd: {}, settings: {}, created: Date.now() - 40 * DAY, ...extra });
(async () => {
  const browser = await chromium.launch();
  const errs = [];
  const newPage = async (opts = {}) => { const ctx = await browser.newContext({ ...devices['Pixel 7'], ...opts }); const page = await ctx.newPage(); page.on('pageerror', e => errs.push(e.message)); return { ctx, page }; };

  // ---------- service worker și pornire fără internet ----------
  {
    const { ctx, page } = await newPage({ serviceWorkers: 'allow' });
    await page.goto(BASE); await page.waitForSelector('.tile');
    const man = await page.$eval('link[rel=manifest]', l => l.getAttribute('href')).catch(() => null);
    ok('manifestul e legat în afara Claude', man === 'manifest.webmanifest', man);
    const reg = await page.evaluate(() => Promise.race([navigator.serviceWorker.ready.then(r => !!r.active), new Promise(r => setTimeout(() => r(false), 8000))]));
    ok('service worker activ', reg);
    await page.reload(); await page.waitForSelector('.tile');
    await page.click('.tile[data-id="capitale"]'); await sleep(500);
    await ctx.setOffline(true);
    await page.goto(BASE).catch(() => { });
    const offlineOk = await page.waitForSelector('.tile', { timeout: 8000 }).then(() => true).catch(() => false);
    ok('pornește fără internet', offlineOk);
    await page.click('.tile[data-id="capitale"]').catch(() => { }); await sleep(600);
    const h1 = await page.$eval('h1', h => h.textContent).catch(() => '');
    ok('domeniu deja deschis merge fără internet', /capitale/i.test(h1) && !(await page.$('text=Ceva nu a mers')), h1);
    await ctx.setOffline(false); await ctx.close();
  }

  // ---------- setări: instalare și export ----------
  {
    const { ctx, page } = await newPage({ serviceWorkers: 'block' });
    await page.goto(BASE); await page.waitForSelector('.tile');
    await page.click('#nav [data-go="settings"]'); await sleep(300);
    ok('setări: ghid de instalare', await page.$('#install').then(Boolean) && /Adaugă pe ecranul de pornire/.test(await page.$eval('#install', n => n.textContent)));
    ok('setări: fără butonul de sincronizare în afara Claude', !(await page.$('#syncnow')));
    ok('setări: „Nu ai făcut încă niciun export"', /niciun export/.test(await page.$eval('#lastexp', n => n.textContent)));
    await page.click('#exp'); await sleep(200);
    const le = await page.evaluate(() => JSON.parse(localStorage.getItem('cartoteca.v1') || '{}').lastExport || 0);
    ok('exportul notează data', Date.now() - le < 60000 && /Ultimul export/.test(await page.$eval('#lastexp', n => n.textContent)));
    await page.screenshot({ path: SP + '/pwa_settings.png', fullPage: true });
    await ctx.close();
  }

  // ---------- memento lunar de backup ----------
  {
    const { ctx, page } = await newPage({ serviceWorkers: 'block' });
    await seed(page, oldState());
    ok('memento: apare după 30 de zile fără export', await page.$('#backupnote').then(Boolean));
    await page.screenshot({ path: SP + '/pwa_backup_note.png' });
    await page.click('#backupnote [data-act="later"]'); await sleep(200);
    await page.reload(); await page.waitForSelector('.tile');
    ok('memento: „Mai târziu" îl amână', !(await page.$('#backupnote')));
    await seed(page, oldState());
    await page.click('#backupnote [data-act="backup"]'); await sleep(400);
    ok('memento: „Exportă acum" deschide exportul', await page.$('#expt').then(Boolean));
    await page.click('#nav [data-go="home"]'); await sleep(300);
    ok('memento: dispare după export', !(await page.$('#backupnote')));
    await seed(page, oldState({ lastExport: Date.now() - 5 * DAY }));
    ok('memento: nu apare dacă exportul e recent', !(await page.$('#backupnote')));
    await ctx.close();
  }

  // ---------- în artifactul Claude: nimic din toate astea ----------
  {
    const { ctx, page } = await newPage({ serviceWorkers: 'allow' });
    await page.addInitScript(() => { window.claude = { use: async () => null }; });
    await seed(page, oldState()); await sleep(1500);
    ok('Claude: fără manifest', !(await page.$('link[rel=manifest]')));
    ok('Claude: fără service worker', (await page.evaluate(() => navigator.serviceWorker.getRegistrations().then(r => r.length))) === 0);
    ok('Claude: fără memento de backup', !(await page.$('#backupnote')));
    await page.click('#nav [data-go="settings"]'); await sleep(300);
    ok('Claude: fără ghid de instalare, cu sincronizare', !(await page.$('#install')) && !!(await page.$('#syncnow')));
    await ctx.close();
  }

  ok('fără erori JS', !errs.length, errs.slice(0, 3).join(' | '));
  await browser.close();
  console.log(`UI PWA: ${pass} OK, ${fail} FAIL`);
  process.exit(fail ? 1 : 0);
})();
