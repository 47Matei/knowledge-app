// Static checks for the installed-app (PWA) files: run from the repo root with  node tools/test/test_pwa.js
// manifest fields and icons, every service-worker shell file exists, and the worker is only registered outside Claude.
const fs = require('fs'), path = require('path');
const ROOT = process.argv[2] || path.resolve(__dirname, '..', '..');
let pass = 0, fail = 0;
const ok = (name, cond, info = '') => { cond ? pass++ : fail++; console.log(`${cond ? 'OK  ' : 'FAIL'} ${name}${info ? ' - ' + info : ''}`); };
const pngSize = f => { const b = fs.readFileSync(f); return b.toString('ascii', 1, 4) === 'PNG' ? [b.readUInt32BE(16), b.readUInt32BE(20)] : null; };
const m = JSON.parse(fs.readFileSync(path.join(ROOT, 'manifest.webmanifest'), 'utf8'));
ok('manifest: nume', m.name === 'OpenMind' && !!m.short_name, m.name);
ok('manifest: standalone, start_url relativ', m.display === 'standalone' && m.start_url && !/^(\/|https?:)/.test(m.start_url), `${m.display} ${m.start_url}`);
ok('manifest: culori', /^#[0-9A-Fa-f]{6}$/.test(m.theme_color) && /^#[0-9A-Fa-f]{6}$/.test(m.background_color));
for (const want of ['192x192', '512x512']) ok(`manifest: iconiță ${want}`, m.icons.some(i => i.sizes === want && (i.purpose || 'any').includes('any')));
ok('manifest: iconiță maskable', m.icons.some(i => (i.purpose || '').includes('maskable')));
for (const i of m.icons) {
  const f = path.join(ROOT, i.src), sz = fs.existsSync(f) && pngSize(f);
  ok(`iconiță există și are mărimea corectă: ${i.src}`, !!sz && `${sz[0]}x${sz[1]}` === i.sizes, sz ? sz.join('x') : 'lipsește');
}
const sw = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
const shell = JSON.parse((sw.match(/SHELL_FILES = (\[[^\]]*\])/) || [, '[]'])[1].replace(/'/g, '"'));
ok('sw: lista de fișiere ale aplicației', shell.includes('index.html') && shell.includes('app.js') && shell.includes('manifest.webmanifest'), shell.join(', '));
const missing = shell.filter(f => f !== './' && !fs.existsSync(path.join(ROOT, f)));
ok('sw: toate fișierele din cache există', !missing.length, missing.join(', '));
ok('sw: cache cu versiune', /const VERSION = '[^']+'/.test(sw));
const app = fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8'), html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const setup = (app.match(/function setupPWA\(\) \{([\s\S]*?)\n\}/) || [, ''])[1];
ok('sw: înregistrat doar în afara Claude', /if \(IN_CLAUDE\) return;/.test(setup.split('\n')[1] || '') && /serviceWorker\.register\('sw\.js'\)/.test(setup) && /try \{/.test(setup));
ok('index.html nu leagă direct manifestul (artifactul nu îl are)', !/rel=["']?manifest/.test(html) && !/sw\.js/.test(html));
console.log(`teste PWA: ${pass} trecute, ${fail} picate`);
process.exit(fail ? 1 : 0);
