// UI test: tapping the answer field must not scroll the page. On the phone the keyboard shrinks the screen and the
// browser scrolls towards the field; the app cancels that scroll and keeps the page where it was (question visible).
// Simulation: tap the field, shrink the viewport to 430 px (keyboard), let the browser scroll the field into view,
// then check that the page is back at the same position.
// Start a server first (repo root): python3 -m http.server 8765   then: node tools/test/ui_keyboard_test.js
const { chromium, devices } = require('playwright');
const BASE = process.env.BASE_URL || 'http://localhost:8765/';
const sleep = ms => new Promise(r => setTimeout(r, ms));
let pass = 0, fail = 0; const ok = (name, cond, info = '') => { if (cond) pass++; else fail++; console.log(`${cond ? 'OK  ' : 'FAIL'} ${name}${info ? ' - ' + info : ''}`); };
async function keyboard(p, sel) {
  const before = await p.evaluate(() => Math.round(scrollY));
  await p.tap(sel);                                                     // touch, like on the phone
  await p.setViewportSize({ width: 412, height: 430 });                 // keyboard opens
  await p.evaluate(sel => document.querySelector(sel).scrollIntoView({ block: 'end' }), sel);   // the browser scrolls to the field
  await sleep(250);
  await p.evaluate(sel => document.querySelector(sel).scrollIntoView({ block: 'center' }), sel); // and again while the keyboard animates
  await sleep(500);
  return p.evaluate(({ sel, before }) => {
    const q = document.querySelector('.card .body').firstElementChild.getBoundingClientRect(), bar = document.querySelector('.topbar').getBoundingClientRect();
    return { before, after: Math.round(scrollY), qTop: Math.round(q.top), barBottom: Math.round(bar.bottom), focused: document.activeElement === document.querySelector(sel) };
  }, { sel, before });
}
(async () => {
  const b = await chromium.launch(); const errs = [];
  const open = async deck => {
    const ctx = await b.newContext({ ...devices['Pixel 7'], serviceWorkers: 'block' }); const p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message));
    await p.goto(BASE); await p.waitForSelector('.tile');
    if (deck === 'quick') { await p.click('[data-act="quick"]'); return { ctx, p }; }
    await p.click(`.tile[data-id="${deck}"]`); await sleep(500);
    if (await p.$('text=Sari peste')) { await p.click('text=Sari peste'); await sleep(300); }
    return { ctx, p };
  };
  for (const deck of ['capitale', 'ai', 'steaguri', 'localizare', 'quick']) {
    const { ctx, p } = await open(deck);
    if (deck !== 'quick') await p.click('[data-a="learn"]');
    await p.waitForSelector('#typed'); await sleep(300);
    const r = await keyboard(p, '#typed');
    ok(`tastatură, învățare (${deck}): pagina nu coboară`, r.focused && Math.abs(r.after - r.before) <= 1, JSON.stringify(r));
    ok(`tastatură, învățare (${deck}): întrebarea se vede`, r.qTop >= r.barBottom - 2, `qTop ${r.qTop}, bara ${r.barBottom}`);
    await p.setViewportSize({ width: 412, height: 839 });
    await p.fill('#typed', 'x'); await p.click('.typein button'); await sleep(700);
    ok(`după „Verifică" (${deck}): apar butoanele de evaluare`, !!(await p.$('[data-g="1"]')));
    await ctx.close();
  }
  {
    const { ctx, p } = await open('capitale');
    await p.click('[data-a="quiz"]'); await sleep(500); await p.click('text=Răspuns scris'); await p.waitForSelector('#ans'); await sleep(300);
    const r = await keyboard(p, '#ans');
    ok('tastatură, test cu răspuns scris: pagina nu coboară', r.focused && Math.abs(r.after - r.before) <= 1, JSON.stringify(r));
    await ctx.close();
  }
  ok('fără erori JS', !errs.length, errs.slice(0, 3).join(' | '));
  await b.close();
  console.log(`UI tastatură: ${pass} OK, ${fail} FAIL`); process.exit(fail ? 1 : 0);
})();
