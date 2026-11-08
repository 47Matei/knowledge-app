// Test „Ce model este?" (ceasuri, mașini): 4 variante distincte, toate din aceeași marcă, toate cu poză; mărcile sub 4 modele excluse.
const fs = require('fs'), path = require('path'); const { JSDOM } = require('jsdom');
const ROOT = process.argv[2] || path.resolve(__dirname, '..', '..');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8').replace('<script src="app.js"></script>', '').replace(/^[\s\S]*?<body>/, '').replace(/<\/body>[\s\S]*$/, '');
const dom = new JSDOM(`<!doctype html><html><head></head><body>${html}</body></html>`, { url: 'https://example.test/', runScripts: 'outside-only', pretendToBeVisual: true });
const w = dom.window;
w.fetch = async u => { const p = path.join(ROOT, u); if (!fs.existsSync(p)) return { ok: false }; const txt = fs.readFileSync(p, 'utf8'); return { ok: true, json: async () => JSON.parse(txt) }; };
w.scrollTo = () => { }; w.HTMLElement.prototype.focus = function () { };
w.eval(fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8') + '\n;window.__T={deck,makeQuestion,modelGroups,norm,SUPER_SUB};');
const T = w.__T; let pass = 0, fail = 0; const ok = (n, c, i = '') => { c ? pass++ : fail++; console.log(`${c ? 'OK  ' : 'FAIL'} ${n}${i ? ' - ' + i : ''}`); };
(async () => {
  await new Promise(r => setTimeout(r, 300));
  for (const k of ['ceasuri', 'masini']) {
    const d = await T.deck(k), mg = T.modelGroups(d);
    const sup = new Set(d.cards.filter(c => c.sub === T.SUPER_SUB).map(c => T.norm(c.q))), need = b => sup.has(b) ? 3 : 4;
    const nm = cs => new Set(cs.map(c => T.norm(c.q))).size;
    const small = Object.entries(mg.byBrand).filter(([b, cs]) => nm(cs) < need(b)).flatMap(([b, cs]) => cs.map(c => c.id));
    ok(`${k}: carduri eligibile`, mg.ok.size >= 40, `${mg.ok.size} carduri, ${Object.values(mg.byBrand).filter(cs => cs.length >= 4).length} mărci`);
    ok(`${k}: mărcile sub prag nu intră (4; supercar 3)`, small.every(id => !mg.ok.has(id)), `${small.length} carduri excluse`);
    let bad = [], seen = new Set();
    for (let r = 0; r < 60; r++) {
      const used = new Set();
      for (let i = 0; i < 300; i++) {
        const q = T.makeQuestion('img', d, d.cards, used); if (!q) break; seen.add(q.c.id);
        const t = q.opts.map(o => T.norm(o.t)), brands = new Set(q.opts.map(o => mg.brandOf(o.c)));
        const want = Math.min(4, nm(mg.byBrand[q.brand]));
        if (q.opts.length !== want || want < need(q.brand)) bad.push(`${q.c.q}: ${q.opts.length} variante`);
        else if (new Set(t).size !== want) bad.push(`${q.c.q}: variante duplicate ${t}`);
        else if (brands.size !== 1 || !brands.has(q.brand)) bad.push(`${q.c.q}: mărci amestecate`);
        else if (!q.opts.some(o => o.t === q.correct) || q.correct !== q.c.q) bad.push(`${q.c.q}: răspuns corect lipsă`);
        else if (!q.opts.every(o => o.c.img)) bad.push(`${q.c.q}: variantă fără poză`);
      }
    }
    if (k === 'masini') { const inS = [...sup].filter(b => mg.byBrand[b] && mg.ok.has(mg.byBrand[b][0].id)); ok('masini: supercaruri cu 3+ modele intră', inS.length >= 1, inS.join(', ')); }
    ok(`${k}: toate întrebările valide`, !bad.length, bad.slice(0, 5).join(' | '));
    ok(`${k}: fiecare card eligibil apare`, seen.size === mg.ok.size, `${seen.size}/${mg.ok.size}`);
    const packs = d.cards.filter(c => c.img && c.img.p);
    ok(`${k}: pozele din pachete există`, packs.every(c => { const f = path.join(ROOT, 'img', c.img.p + '.json'); return fs.existsSync(f) && JSON.parse(fs.readFileSync(f))[c.img.f]; }), `${packs.length} poze noi`);
  }
  console.log(`teste modele: ${pass} trecute, ${fail} picate`); process.exit(fail ? 1 : 0);
})();
