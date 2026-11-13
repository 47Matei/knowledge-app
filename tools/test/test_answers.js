// Teste unitare pentru verificarea tolerantă a răspunsurilor scrise.
// Run from the repo root: node tools/test/test_answers.js
const fs = require('fs'), path = require('path');
const { JSDOM } = require('jsdom');
const ROOT = process.argv[2] || path.resolve(__dirname, '..', '..');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8').replace('<script src="app.js"></script>', '').replace(/^[\s\S]*?<body>/, '').replace(/<\/body>[\s\S]*$/, '');
const dom = new JSDOM(`<!doctype html><html><head></head><body>${html}</body></html>`, { url: 'https://example.test/', runScripts: 'outside-only', pretendToBeVisual: true });
const w = dom.window;
w.fetch = async u => { const p = path.join(ROOT, u); if (!fs.existsSync(p)) return { ok: false }; const txt = fs.readFileSync(p, 'utf8'); return { ok: true, json: async () => JSON.parse(txt) }; };
w.scrollTo = () => { }; w.HTMLElement.prototype.focus = function () { };
w.eval(fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8') + '\n;window.__T={checkAnswer,checkAnswerDetail,deck,DECKS};');
const T = w.__T;
let pass = 0, fail = 0, ok_partial;
const card = (k, q) => T.DECKS[k].cards.find(c => c.q === q);
function expect(name, c, input, want) {
  const got = T.checkAnswer(c, input);
  const ok = Array.isArray(want) ? want.includes(got) : got === want;
  if (ok) pass++; else { fail++; console.log(`FAIL ${name}: „${input}" -> ${got} (aștept ${want}) | răspuns: ${c.a}`); }
}
(async () => {
  await new Promise(r => setTimeout(r, 300));
  for (const k of ['capitale', 'ceasuri', 'masini', 'monumente', 'vocabular', 'localizare']) await T.deck(k);
  const breguet = card('ceasuri', 'Breguet'), merc = card('masini', 'Mercedes-Benz'), vw = card('masini', 'Volkswagen');
  const austria = { k: 'localizare', a: 'Australia', alt: ['Australia'] };
  // 1. ordine liberă și variante „A/B"
  expect('ordine inversă + ambele țări', breguet, 'Elveția Franța 1775', 'ok');
  expect('o singură variantă', breguet, 'Franța 1775', 'ok');
  expect('cealaltă variantă', breguet, 'Elvetia, 1775', 'ok');
  expect('ordine an-țară', breguet, '1775 Franta', 'ok');
  // 2. normalizare: diacritice, punctuație, majuscule
  expect('fără diacritice', breguet, 'franta / elvetia - 1775', 'ok');
  expect('diacritice cu sedilă', breguet, 'Elveţia Franţa 1775', 'ok');
  expect('spații multiple', breguet, '  ELVEȚIA    1775  ', 'ok');
  // 3. anul (sau alt număr) lipsă ori greșit nu mai respinge răspunsul, dacă restul e corect (Ciprian, 13 noiembrie 2026)
  expect('an greșit', breguet, 'Franța 1776', 'close');
  expect('lipsește anul', breguet, 'Franța', 'close');
  const rolex = card('ceasuri', 'Rolex');
  expect('Rolex: elveția fără an', rolex, 'elveția', 'close');
  expect('Rolex: elvatia (o literă greșită), fără an', rolex, 'elvatia', 'close');
  expect('Rolex: elvetia 1905', rolex, 'elvetia 1905', 'ok');
  expect('Rolex: elveia, o literă omisă', rolex, 'elveia', 'close');
  expect('Rolex: an greșit', rolex, 'Elveția 1950', 'close');
  expect('Rolex: altă țară', rolex, 'Germania', 'bad');
  expect('Rolex: doar anul', rolex, '1905', 'bad');
  ok_partial = T.checkAnswerDetail(rolex, 'Elveția').partial === true && !T.checkAnswerDetail(rolex, 'Elveția 1905').partial;
  if (ok_partial) pass++; else { fail++; console.log('FAIL partial flag'); }
  // 4. greșeli de scriere
  expect('o literă inversată', breguet, 'Frnața 1775', 'close');
  expect('o literă lipsă (8+)', merc, 'Germnia Mercedes-Benz', 'close');
  expect('două greșeli la cuvânt lung', vw, 'Germaina Volksvagen', 'close');
  expect('două greșeli la cuvânt de 6 litere', breguet, 'Frnzta 1775', 'close');
  expect('prea multe greșeli', breguet, 'Frnzza 1775', 'bad');
  // 5. componente obligatorii + alias-uri
  expect('alias Mercedes', merc, 'Germania Mercedes', 'ok');
  expect('alias MB', merc, 'Germania MB', 'ok');
  expect('scris lipit', merc, 'germania mercedesbenz', 'ok');
  expect('fără „Group"', merc, 'Germania, Mercedes Benz', 'ok');
  // la „Țara de origine și grupul" ajunge țara (Ciprian, 13 noiembrie 2026)
  expect('marcă: doar țara, fără grup', merc, 'Germania', 'close');
  const alfa = card('masini', 'Alfa Romeo'), ferrari = card('masini', 'Ferrari');
  expect('Alfa Romeo: Italia', alfa, 'Italia', 'close');
  expect('Alfa Romeo: italia mic', alfa, 'italia', 'close');
  expect('Alfa Romeo: Itaila (litere inversate)', alfa, 'Itaila', 'close');
  expect('Alfa Romeo: Itala (literă lipsă)', alfa, 'Itala', 'close');
  expect('Alfa Romeo: complet', alfa, 'Italia - Stellantis', 'ok');
  expect('Alfa Romeo: complet cu greșeli', alfa, 'Itlia Stelantis', 'close');
  expect('Alfa Romeo: doar grupul', alfa, 'Stellantis', 'bad');
  expect('Alfa Romeo: altă țară', alfa, 'Franța', 'bad');
  expect('Ferrari: Italia', ferrari, 'Italia', 'ok');
  if (T.checkAnswerDetail(alfa, 'Italia').partial === true) pass++; else { fail++; console.log('FAIL partial Alfa'); }
  expect('nume EN al țării', merc, 'Germany Mercedes-Benz Group', 'ok');
  expect('alias VW', vw, 'Germania VW', 'ok');
  // 6. fără false pozitive
  expect('Austria nu e Australia', austria, 'Austria', 'bad');
  expect('Australia exact', austria, 'australia', 'ok');
  expect('Australia cu greșeală', austria, 'Austrlia', 'close');
  expect('țară în plus', breguet, 'Franța Germania 1775', 'bad');
  // 7. capitale și sinonime EN
  const viena = card('capitale', 'Austria');
  expect('capitală RO', viena, 'Viena', 'ok');
  expect('capitală EN', viena, 'Vienna', 'ok');
  expect('capitală cu greșeală', viena, 'Vina', 'close');
  // 8. vocabular: oricare sinonim din listă
  const voc = T.DECKS.vocabular.cards.find(c => /, /.test(c.a) && !/\(/.test(c.a));
  expect('vocabular primul sinonim', voc, voc.a.split(', ')[0], 'ok');
  expect('vocabular al doilea sinonim', voc, voc.a.split(', ')[1], 'ok');
  // 9. monumente: oraș + țară
  const ateneu = T.DECKS.monumente.cards.find(c => c.a === 'București, România');
  expect('oraș și țară', ateneu, 'Bucuresti Romania', 'ok');
  expect('doar orașul', ateneu, 'București', 'bad');
  expect('ordine inversă', ateneu, 'România, București', 'ok');
  expect('gol', ateneu, '   ', null);
  // 10. regresie: fiecare card trebuie să accepte propriul răspuns (și alternativele) scris exact
  const idx = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/index.json'), 'utf8'));
  let self = 0, selfBad = [];
  for (const dm of idx.domains) { const d = await T.deck(dm.id); for (const c of d.cards) for (const a of [c.a, ...(c.alt || [])].filter(Boolean)) { self++; const r = T.checkAnswer(c, a); if (r !== 'ok') selfBad.push(`${dm.id}: „${a}" -> ${r}`); } }
  if (selfBad.length) { fail += selfBad.length; console.log('Răspunsuri proprii respinse:', selfBad.slice(0, 15)); } else pass++;
  console.log(`regresie: ${self} răspunsuri proprii verificate`);
  console.log(`teste răspunsuri: ${pass} trecute, ${fail} picate`);
  process.exit(fail ? 1 : 0);
})();
