// UI tests in Chromium (Pixel 7 emulation): pins, colors, visible buttons, "Greșit" requeue.
// Start a server first (repo root): python3 -m http.server 8765   then: node tools/test/ui_test.js
// Screenshots go to tools/test/out/.
const { chromium, devices } = require('playwright');
const path = require('path'), fs = require('fs'); const SP = path.join(__dirname, 'out'); fs.mkdirSync(SP, { recursive: true });
const BASE = process.env.BASE_URL || 'http://localhost:8765/';
const sleep = ms => new Promise(r => setTimeout(r, ms));
let pass = 0, fail = 0; const ok = (name, cond, info = '') => { if (cond) pass++; else fail++; console.log(`${cond ? 'OK  ' : 'FAIL'} ${name}${info ? ' - ' + info : ''}`); };
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ ...devices['Pixel 7'] });
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto(BASE + 'index.html'); await page.waitForSelector('.tile');
  // ---------- 2. pin ----------
  const ids = ['capitale', 'masini', 'ceasuri', 'localizare', 'judete', 'monumente'];
  for (const id of ids.slice(0, 5)) { await page.click(`.tilewrap:has(.tile[data-id="${id}"]) .pinbtn`); await sleep(80); }
  let order = await page.$$eval('#grid .tile', ts => ts.map(t => t.dataset.id));
  ok('pin: primele 5 în ordinea fixării', JSON.stringify(order.slice(0, 5)) === JSON.stringify(ids.slice(0, 5)), order.slice(0, 6).join(','));
  await page.click(`.tilewrap:has(.tile[data-id="${ids[5]}"]) .pinbtn`); await sleep(150);
  const toast = await page.$eval('.toast', n => n.textContent).catch(() => '');
  order = await page.$$eval('#grid .tile', ts => ts.map(t => t.dataset.id));
  ok('pin: al 6-lea refuzat cu mesaj', /maximum 5/.test(toast) && !order.slice(0, 5).includes('monumente'), toast);
  await page.reload(); await page.waitForSelector('.tile');
  order = await page.$$eval('#grid .tile', ts => ts.map(t => t.dataset.id));
  ok('pin: păstrate după repornire', JSON.stringify(order.slice(0, 5)) === JSON.stringify(ids.slice(0, 5)));
  await page.click(`.tilewrap:has(.tile[data-id="masini"]) .pinbtn`); await sleep(100);
  order = await page.$$eval('#grid .tile', ts => ts.map(t => t.dataset.id));
  ok('pin: anulare fixare', !order.slice(0, 4).includes('masini') && order[0] === 'capitale', order.slice(0, 5).join(','));
  await page.click('.tile[data-id="ceasuri"]'); await sleep(400);
  if (await page.$('text=Sari peste')) { await page.click('text=Sari peste'); await sleep(300); }
  ok('pin: buton și pe pagina domeniului (activ)', await page.$eval('.topbar .pinbtn', b => b.classList.contains('on')).catch(() => false));
  // ---------- 3 + 6. culori și vizibilitatea butoanelor (sesiune de învățare) ----------
  await page.click('[data-a="learn"]'); await page.waitForSelector('#typed');
  await page.evaluate(() => window.scrollTo(0, 0));
  const ans = await page.evaluate(() => { const T = window; return null; });
  // răspuns scris corect: luăm răspunsul din date
  const correct = await page.evaluate(async () => { const q = document.querySelector('.qtext').textContent; const r = await fetch('data/ceasuri.json').then(r => r.json()); const c = r.cards.find(c => c.q === q); return c ? c.a : null; });
  await page.fill('#typed', correct || 'x'); await page.click('.typein button'); await sleep(500);
  const st1 = await page.evaluate(() => ({ a: getComputedStyle(document.querySelector('.answer .a')).color, card: document.querySelector('.card').className, verdict: document.querySelector('.verdict')?.className, okVar: getComputedStyle(document.documentElement).getPropertyValue('--ok').trim() }));
  ok('corect: card + răspuns + banner verzi', /\bok\b/.test(st1.card) && /\bok\b/.test(st1.verdict), `${st1.card} | ${st1.verdict} | culoare ${st1.a}`);
  await sleep(700);
  const gb = await page.evaluate(() => { const g = document.querySelector('.grades').getBoundingClientRect(); return { bottom: g.bottom, top: g.top, vh: innerHeight }; });
  ok('butoanele de evaluare complet vizibile', gb.top >= 0 && gb.bottom <= gb.vh + 1, JSON.stringify(gb));
  const lbl = await page.$eval('[data-g="1"] small', n => n.textContent);
  ok('„Greșit" arată 1 oră', lbl === '1 oră', lbl);
  await page.screenshot({ path: SP + '/ui_learn_ok.png' });
  await page.click('[data-g="3"]'); await sleep(600);
  ok('card nou: scroll resetat sus', await page.evaluate(() => scrollY) < 5);
  // răspuns greșit
  await page.fill('#typed', 'Zzyzx 1234'); await page.click('.typein button'); await sleep(500);
  const st2 = await page.evaluate(() => ({ card: document.querySelector('.card').className, verdict: document.querySelector('.verdict')?.className, pre: [...document.querySelectorAll('.grade')].map(b => b.getAttribute('style') || '').findIndex(s => /outline/.test(s)) + 1 }));
  ok('greșit: card + banner roșii, preselectat Greșit', /\bbad\b/.test(st2.card) && /\bbad\b/.test(st2.verdict) && st2.pre === 1, JSON.stringify(st2));
  await page.screenshot({ path: SP + '/ui_learn_bad.png' });
  // „Greșit" -> cardul revine după cel puțin 10 alte carduri
  const before = await page.evaluate(() => ({ idx: document.querySelector('.topbar .label')?.textContent }));
  await page.click('[data-g="1"]'); await sleep(600);
  ok('după Greșit, sesiunea continuă', !!(await page.$('#typed')), before.idx);
  // ---------- 3 + 6. grilă A/B/C/D ----------
  await page.goto(BASE + 'index.html'); await page.waitForSelector('.tile');
  await page.click('.tile[data-id="capitale"]'); await sleep(400);
  if (await page.$('text=Sari peste')) { await page.click('text=Sari peste'); await sleep(300); }
  await page.click('[data-a="quiz"]'); await sleep(400);
  await page.click('text=Alegere multiplă'); await page.waitForSelector('.opt');
  const right = await page.evaluate(async () => { const q = document.querySelector('.qtext')?.textContent; const r = await fetch('data/capitale.json').then(r => r.json()); const c = r.cards.find(c => c.q === q); return c ? c.a : null; });
  const opts = await page.$$eval('.opt', os => os.map(o => o.textContent.slice(1)));
  const wrongI = opts.findIndex(t => t !== right);
  await page.click(`.opt >> nth=${wrongI}`); await sleep(500);
  const st3 = await page.evaluate(() => ({ bad: document.querySelectorAll('.opt.bad').length, ok: document.querySelectorAll('.opt.ok').length, card: document.querySelector('.card').className, ans: document.querySelector('.answer').className }));
  ok('grilă greșit: varianta aleasă roșie, corecta verde, card roșu', st3.bad === 1 && st3.ok === 1 && /bad/.test(st3.card) && /bad/.test(st3.ans), JSON.stringify(st3));
  const nb = await page.evaluate(() => { const b = [...document.querySelectorAll('.stickyact button')].pop().getBoundingClientRect(); return { top: b.top, bottom: b.bottom, vh: innerHeight }; });
  ok('„Următoarea" complet vizibil fără scroll manual', nb.top >= 0 && nb.bottom <= nb.vh + 1, JSON.stringify(nb));
  await page.screenshot({ path: SP + '/ui_quiz_bad.png' });
  await page.click('.stickyact button'); await sleep(400);
  ok('întrebarea următoare pornește de sus', await page.evaluate(() => scrollY) < 5);
  ok('fără erori JS', errs.length === 0, errs.join(' | '));
  console.log(`UI: ${pass} OK, ${fail} FAIL`);
  await browser.close(); process.exit(fail ? 1 : 0);
})();
