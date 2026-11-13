// Lungimea lecțiilor și testelor (25), repetarea cardurilor greșite și butonul „Continuă" (noiembrie 2026).
const fs = require('fs'), path = require('path'); const { JSDOM } = require('jsdom');
const ROOT = process.argv[2] || path.resolve(__dirname, '..', '..');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8').replace('<script src="app.js"></script>', '').replace(/^[\s\S]*?<body>/, '').replace(/<\/body>[\s\S]*$/, '');
const dom = new JSDOM(`<!doctype html><html><head></head><body>${html}</body></html>`, { url: 'https://example.test/', runScripts: 'outside-only', pretendToBeVisual: true });
const w = dom.window;
w.fetch = async u => { const p = path.join(ROOT, u); if (!fs.existsSync(p)) return { ok: false }; const txt = fs.readFileSync(p, 'utf8'); return { ok: true, json: async () => JSON.parse(txt) }; };
w.scrollTo = () => { }; w.HTMLElement.prototype.focus = function () { };
const src = fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8');
w.eval(src + '\n;window.__T={deck,buildQueue,requeuePos,quizLen,normalize,DEFAULTS,SRS,get S(){return S}};');
const T = w.__T; let pass = 0, fail = 0; const ok = (n, c, i = '') => { c ? pass++ : fail++; console.log(`${c ? 'OK  ' : 'FAIL'} ${n}${i ? ' - ' + i : ''}`); };
(async () => {
  await new Promise(r => setTimeout(r, 300));
  // lungimi implicite
  ok('lecție implicită: 25 de carduri', T.DEFAULTS.sessionSize === 25);
  ok('test implicit: 25 de întrebări', T.DEFAULTS.quizSize === 25);
  const old = T.normalize({ settings: { sessionSize: 20 } });
  ok('cine avea 20 trece o dată la 25', old.settings.sessionSize === 25 && old.settings.quizSize === 25);
  const again = T.normalize({ settings: { ...old.settings, sessionSize: 20 } });
  ok('după migrare, alegerea 20 din Setări rămâne', again.settings.sessionSize === 20);
  const d = await T.deck('ceasuri');
  T.S.cards = {}; T.S.settings.sessionSize = 25; T.S.settings.newPerDay = 30;
  ok('lecție pe domeniu: 25 de carduri noi', T.buildQueue(d).length === 25, `${T.buildQueue(d).length}`);
  ok('test pe domeniu mare: 25 de întrebări', T.quizLen('mc', d, d.cards) === 25);
  const small = d.cards.filter(c => c.sub === d.cards[0].sub).slice(0, 7);
  ok('test pe capitol mic: cât are capitolul', T.quizLen('mc', d, small) === 7);
  // repetarea cardurilor greșite
  ok('sesiune rapidă: cardul greșit nu revine', T.requeuePos('quick', 15, 0, 0) === -1);
  ok('amestec: cardul greșit nu revine', T.requeuePos('mix', 25, 0, 0) === -1);
  ok('lecție: cardul greșit revine la final', T.requeuePos('domain', 25, 3, 0) === 25);
  ok('lecție: nu revine dacă e aproape de final', T.requeuePos('domain', 25, 20, 0) === -1);
  ok('lecție: revine o singură dată', T.requeuePos('domain', 30, 0, 1) === -1);
  ok('greșit = 1 oră', T.SRS.WRONG_DELAY_MIN === 60);
  // texte
  ok('nu mai există „Încă o dată / Încă 5 minute / Încă o rundă"', !/Încă o dată|Încă 5 minute|Încă o rundă/.test(src));
  ok('butoanele de final spun „Continuă"', (src.match(/\}Continuă<\/button>/g) || []).length >= 4);
  console.log(`teste sesiuni: ${pass} trecute, ${fail} picate`); process.exit(fail ? 1 : 0);
})();
