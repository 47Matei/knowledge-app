// UI test: with the phone keyboard open (simulated by a 430 px tall viewport), the question and the answer field
// must both stay visible - the page must not scroll the question away under the top bar.
// Start a server first (repo root): python3 -m http.server 8765   then: node tools/test/ui_keyboard_test.js
const { chromium, devices } = require('playwright');
const BASE = process.env.BASE_URL || 'http://localhost:8765/';
const sleep = ms => new Promise(r => setTimeout(r, ms));
let pass = 0, fail = 0; const ok = (name, cond, info = '') => { if (cond) pass++; else fail++; console.log(`${cond ? 'OK  ' : 'FAIL'} ${name}${info ? ' - ' + info : ''}`); };
const measure = (p, sel) => p.evaluate(sel => {
  const q = document.querySelector('.card .body').firstElementChild.getBoundingClientRect(), bar = document.querySelector('.topbar').getBoundingClientRect(), i = document.querySelector(sel).getBoundingClientRect();
  return { qTop: Math.round(q.top), barBottom: Math.round(bar.bottom), inputBottom: Math.round(i.bottom), vh: innerHeight };
}, sel);
const visible = r => r.qTop >= r.barBottom - 2 && r.inputBottom <= r.vh;
(async () => {
  const b = await chromium.launch(); const errs = [];
  const open = async deck => {
    const ctx = await b.newContext({ ...devices['Pixel 7'], serviceWorkers: 'block' }); const p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message));
    await p.goto(BASE); await p.waitForSelector('.tile'); await p.click(`.tile[data-id="${deck}"]`); await sleep(500);
    if (await p.$('text=Sari peste')) { await p.click('text=Sari peste'); await sleep(300); }
    return { ctx, p };
  };
  for (const deck of ['capitale', 'ai', 'steaguri']) {
    const { ctx, p } = await open(deck);
    await p.click('[data-a="learn"]'); await p.waitForSelector('#typed'); await sleep(300);
    await p.setViewportSize({ width: 412, height: 430 }); await p.click('#typed'); await sleep(800);
    const r = await measure(p, '#typed');
    ok(`tastatură deschisă, învățare (${deck}): întrebarea și câmpul se văd`, visible(r), JSON.stringify(r));
    ok(`tastatură deschisă, învățare (${deck}): cardul strâns`, await p.evaluate(() => document.documentElement.classList.contains('typing')));
    await p.fill('#typed', 'x'); await p.click('.typein button'); await sleep(700);
    ok(`după „Verifică" (${deck}): apar butoanele de evaluare`, !!(await p.$('[data-g="1"]')));
    await ctx.close();
  }
  {
    const { ctx, p } = await open('capitale');
    await p.click('[data-a="quiz"]'); await sleep(500); await p.click('text=Răspuns scris'); await p.waitForSelector('#ans'); await sleep(300);
    await p.setViewportSize({ width: 412, height: 430 }); await p.click('#ans'); await sleep(800);
    const r = await measure(p, '#ans');
    ok('tastatură deschisă, test cu răspuns scris: întrebarea și câmpul se văd', visible(r), JSON.stringify(r));
    await ctx.close();
  }
  ok('fără erori JS', !errs.length, errs.slice(0, 3).join(' | '));
  await b.close();
  console.log(`UI tastatură: ${pass} OK, ${fail} FAIL`); process.exit(fail ? 1 : 0);
})();
