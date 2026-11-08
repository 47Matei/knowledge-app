'use strict';
/* OpenMind (proiectul „Cartoteca lui Matei") - aplicație de învățare cu repetiție spațiată (FSRS), quiz-uri, comparații și hărți. */

// ---------- utilitare ----------
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const el = html => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const DAY = 86400000;
const pad = n => String(n).padStart(2, '0');
const todayKey = (t = Date.now()) => { const d = new Date(t); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
const endOfToday = () => { const d = new Date(); d.setHours(23, 59, 59, 999); return d.getTime(); };
const fmt = n => Math.round(n).toLocaleString('ro-RO');
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = a => a[Math.floor(Math.random() * a.length)];
const hash = s => { let h = 2166136261; for (const ch of s) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const isEmoji = s => /\p{Extended_Pictographic}|\p{Regional_Indicator}/u.test(s || '');
const plural = (n, one, many) => n === 1 ? `1 ${one}` : `${fmt(n)} ${(n % 100 === 0 || n % 100 >= 20) ? 'de ' : ''}${many}`;

const ICON = {
  car: '<path d="M3 13l2-5a2 2 0 0 1 1.9-1.3h10.2A2 2 0 0 1 19 8l2 5v4a1 1 0 0 1-1 1h-1.2M3 13v4a1 1 0 0 0 1 1h1.2M3 13h18M8.8 18h6.4"/><circle cx="7" cy="18" r="1.8"/><circle cx="17" cy="18" r="1.8"/>',
  watch: '<circle cx="12" cy="12" r="5.5"/><path d="M9 6.8 9.6 3h4.8l.6 3.8M9 17.2l.6 3.8h4.8l.6-3.8M12 9.5V12l1.8 1.2"/>',
  people: '<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9.5" r="2.4"/><path d="M3.5 19c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5M14.6 14.2c.8-.4 1.6-.6 2.4-.6 2.2 0 3.8 1.5 4.3 4.4"/>',
  capital: '<path d="M3 21h18M5 21v-9M9.7 21v-9M14.3 21v-9M19 21v-9M2.5 9.5 12 4l9.5 5.5z"/>',
  globe: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.6 2.4 3.8 5.2 3.8 8.5s-1.2 6.1-3.8 8.5c-2.6-2.4-3.8-5.2-3.8-8.5s1.2-6.1 3.8-8.5z"/>',
  romania: '<path d="M12 21s-6.5-5.6-6.5-11.2a6.5 6.5 0 0 1 13 0C18.5 15.4 12 21 12 21z"/><circle cx="12" cy="9.8" r="2.3"/>',
  flag: '<path d="M5 21V3.5M5 4h12.5l-2.5 4 2.5 4H5"/>',
  plane: '<path d="M10.5 13.5 3 11l1.2-1.6 8 .6 4.5-5a1.9 1.9 0 0 1 2.8 2.7l-5 4.6.6 8L13.5 21l-2.5-7.4M7 17l-3 .5 1-2"/>',
  atom: '<circle cx="12" cy="12" r="1.4"/><ellipse cx="12" cy="12" rx="9" ry="3.6"/><ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(120 12 12)"/>',
  planet: '<circle cx="12" cy="12" r="5.5"/><path d="M6.6 10.4C3.4 12 2 13.6 2.6 14.7c.9 1.6 6 .6 11.3-2.4S22.4 6 21.4 4.5c-.5-.9-2.3-.9-4.7-.1"/>',
  crown: '<path d="M3 8.5 7.5 12 12 5l4.5 7L21 8.5 19 19H5z"/><path d="M5 22h14"/>',
  heart: '<path d="M12 20s-7.5-4.4-7.5-10A4.3 4.3 0 0 1 12 7.2 4.3 4.3 0 0 1 19.5 10c0 5.6-7.5 10-7.5 10z"/><path d="M3 12h4l1.5-2.5 2.5 5 1.5-2.5H21"/>',
  brain: '<path d="M9 18h6M10 21h4M12 3a6.2 6.2 0 0 0-4 11v2h8v-2a6.2 6.2 0 0 0-4-11z"/><path d="M12 8v4M10 10h4"/>',
  coin: '<circle cx="12" cy="12" r="8.5"/><path d="M14.8 9.4c-.3-1-1.4-1.7-2.8-1.7-1.6 0-2.8.8-2.8 2s1.2 1.7 2.8 2 2.9.9 2.9 2.2-1.3 2.1-2.9 2.1c-1.5 0-2.6-.7-2.9-1.8M12 6v1.7M12 16.3V18"/>',
  arch: '<path d="M3 21h18M5 21V11a7 7 0 0 1 14 0v10M9 21v-8.5a3 3 0 0 1 6 0V21M5 7.5h14"/>',
  book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5zM4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5"/><path d="M8 7h8M8 10.5h6"/>',
  back: '<path d="M15 5l-7 7 7 7"/>', chev: '<path d="M9 5l7 7-7 7"/>', close: '<path d="M6 6l12 12M18 6 6 18"/>',
  flame: '<path d="M12 22c-4 0-7-2.7-7-6.6 0-3.1 2.1-5 3.6-7 .4 1.5 1.3 2.6 2.4 3 0-3.6 1.6-6.6 4.5-9.4.2 3.4 3.5 5.9 3.5 10.6 0 4.1-3 9.4-7 9.4z"/>',
  bolt: '<path d="M13 2 4.5 13.5H11L10 22l8.5-11.5H12z"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3.2 2"/>',
  play: '<path d="M7 4.5v15l12-7.5z"/>', check: '<path d="M4.5 12.5l5 5L19.5 7"/>', x: '<path d="M6 6l12 12M18 6 6 18"/>',
  swap: '<path d="M7 4 3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7"/>', map: '<path d="M9 4 3 6.5v13.5L9 17.5l6 2.5 6-2.5V4l-6 2.5zM9 4v13.5M15 6.5V20"/>',
  test: '<path d="M9 4h6M10 4v5.5L5 19a1.4 1.4 0 0 0 1.2 2h11.6A1.4 1.4 0 0 0 19 19l-5-9.5V4"/><path d="M7.5 14.5h9"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>', medal: '<circle cx="12" cy="9" r="6"/><path d="M8.5 14 7 22l5-3 5 3-1.5-8"/>',
  bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5V16h8v-2.5A6 6 0 0 0 12 3z"/>', list: '<path d="M8 6h13M8 12h13M8 18h13M3.5 6h0M3.5 12h0M3.5 18h0"/>',
  spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/>',
  compass: '<circle cx="12" cy="12" r="8.5"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>', target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r=".8"/>',
  shuffle: '<path d="M3 7h3.5c2.5 0 3.8 1.5 5 5s2.5 5 5 5H21M3 17h3.5c1.3 0 2.2-.4 3-1.2M14.5 8.2c.8-.8 1.7-1.2 3-1.2H21M18 4l3 3-3 3M18 14l3 3-3 3"/>',
  pen: '<path d="M4 20h4L19.5 8.5a2.1 2.1 0 0 0-4-4L4 16z"/>',
  eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
  columns: '<path d="M3 21h18M4 18h16M5 18V9M9.7 18V9M14.3 18V9M19 18V9M3 9h18L12 3z"/>',
  grad: '<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c3 2.5 9 2.5 12 0v-5M22 9v6"/>',
  pin: '<path d="M9 3h6l-1 6 3.5 3.5V14h-11v-1.5L10 9z"/><path d="M12 14v7"/>',
  ai: '<rect x="6" y="6" width="12" height="12" rx="2.5"/><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3"/><path d="M12 8.8l.9 2.3 2.3.9-2.3.9-.9 2.3-.9-2.3-2.3-.9 2.3-.9z"/>',
  lock: '<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3M12 14.5v2.5"/>',
  chip: '<rect x="7" y="7" width="10" height="10" rx="1.5"/><rect x="10" y="10" width="4" height="4" rx=".5"/><path d="M10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4"/>',
  code: '<path d="M8.5 7 3.5 12l5 5M15.5 7l5 5-5 5M13.5 4.5l-3 15"/>',
  shield: '<path d="M12 3 4.5 6v5.5c0 4.6 3.2 8 7.5 9.5 4.3-1.5 7.5-4.9 7.5-9.5V6z"/><path d="m9 12 2 2 4-4"/>', search: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>',
};
const ic = (name, cls = '') => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[name] || ''}</svg>`;

// ---------- stare persistentă ----------
const KEY = 'cartoteca.v1';
const DEFAULTS = { name: 'Matei', goalMin: 30, newPerDay: 30, sessionSize: 20, notifyAt: '19:00', notify: true, showEn: true, theme: 'system' };
let S, storageOK = true;
function freshState() { return { v: 1, cards: {}, days: {}, xp: 0, streak: { cur: 0, best: 0, last: null, freezes: 1 }, badges: {}, conf: {}, quiz: { best: {} }, cotd: {}, settings: {}, created: Date.now() }; }
function normalize(s) {
  s.settings = { ...DEFAULTS, ...s.settings }; s.quiz = { best: {}, ...s.quiz }; s.cotd = s.cotd || {}; s.conf = s.conf || {}; s.badges = s.badges || {};
  s.streak = { cur: 0, best: 0, last: null, freezes: 1, ...s.streak }; s.days = s.days || {}; s.cards = s.cards || {};
  return s;
}
function load() {
  try { const raw = localStorage.getItem(KEY); S = raw ? JSON.parse(raw) : null; } catch (e) { storageOK = false; S = null; }
  if (!S || S.v !== 1) S = freshState();
  normalize(S);
}
let saveTimer;
function saveLocal() { try { localStorage.setItem(KEY, JSON.stringify(S)); storageOK = true; } catch (e) { storageOK = false; } }
function save() {
  S.metaAt = Date.now();
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveLocal, 120);
  scheduleCloud();
}

// ---------- salvare în cont (db) ----------
// Fiecare utilizator are subarborele lui privat: data/users/<id>/meta și câte un document per domeniu (deck-<id>).
const cloud = { status: 'local', note: 'start', col: null, synced: {}, timer: null, retry: null, chain: Promise.resolve(), lastSync: 0 };
const withTimeout = (p, ms) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej({ code: 'timeout' }), ms))]);
function docsFromState() {
  const decks = {};
  for (const [id, c] of Object.entries(S.cards)) (decks[c.k] = decks[c.k] || {})[id] = c;
  const { cards, ...rest } = S;
  const out = { meta: { state: rest } };
  for (const k of Object.keys(decks)) out['deck-' + k] = { cards: decks[k] };
  return out;
}
function mergeInto(L, R, rcards) {
  for (const [id, rc] of Object.entries(rcards || {})) { const lc = L.cards[id]; if (!lc || (rc.last || 0) > (lc.last || 0)) L.cards[id] = rc; }
  if (!R) return;
  L.xp = Math.max(L.xp || 0, R.xp || 0);
  for (const [k, rd] of Object.entries(R.days || {})) {
    const ld = L.days[k]; if (!ld) { L.days[k] = rd; continue; }
    for (const f of ['rev', 'xp', 'ms', 'ok', 'bad', 'nw']) ld[f] = Math.max(ld[f] || 0, rd[f] || 0);
    ld.nwBy = ld.nwBy || {}; for (const [kk, v] of Object.entries(rd.nwBy || {})) ld.nwBy[kk] = Math.max(ld.nwBy[kk] || 0, v);
    if (rd.frozen) ld.frozen = true;
  }
  const ls = L.streak, rs = R.streak || {};
  if ((rs.last || '') > (ls.last || '')) { ls.last = rs.last; ls.cur = rs.cur; } else if (rs.last && rs.last === ls.last) ls.cur = Math.max(ls.cur || 0, rs.cur || 0);
  ls.best = Math.max(ls.best || 0, rs.best || 0);
  if ((R.metaAt || 0) > (L.metaAt || 0) && rs.freezes !== undefined) ls.freezes = rs.freezes;
  for (const [k, d] of Object.entries(R.badges || {})) if (!L.badges[k] || d < L.badges[k]) L.badges[k] = d;
  for (const [k, n] of Object.entries(R.conf || {})) L.conf[k] = Math.max(L.conf[k] || 0, n);
  const lq = L.quiz, rq = R.quiz || {};
  for (const [k, n] of Object.entries(rq.best || {})) lq.best[k] = Math.max(lq.best[k] || 0, n);
  lq.perfect = lq.perfect || rq.perfect; lq.mapPerfect = lq.mapPerfect || rq.mapPerfect; lq.timedBest = Math.max(lq.timedBest || 0, rq.timedBest || 0);
  if (R.cotd && (R.cotd.date || '') > (L.cotd.date || '')) L.cotd = R.cotd;
  if ((R.settingsAt || 0) > (L.settingsAt || 0)) { L.settings = { ...L.settings, ...R.settings }; L.settingsAt = R.settingsAt; }
  L.intro = { ...(R.intro || {}), ...(L.intro || {}) }; L.placed = { ...(R.placed || {}), ...(L.placed || {}) };
  L.created = Math.min(L.created || Date.now(), R.created || Date.now());
  L.metaAt = Math.max(L.metaAt || 0, R.metaAt || 0);
}
function cloudError(e) {
  const code = e && e.code;
  if (code === 'invalid_argument') { cloud.status = 'readonly'; cloud.note = 'noperm'; }
  else if (code === 'quota_exceeded') { cloud.status = 'error'; cloud.note = 'quota'; }
  else if (['revoked', 'not_granted', 'capability_disabled', 'capability_removed'].includes(code)) { cloud.status = 'local'; cloud.note = 'nodb'; }
  else { cloud.status = 'error'; cloud.note = 'temp'; clearTimeout(cloud.retry); cloud.retry = setTimeout(() => { if (cloud.col) { cloud.status = 'cloud'; flushCloud(); } else initCloud(); }, 30000); }
  updateSyncUI();
}
// Salvarea în cont se face rar (cel mult o dată pe minut, plus la final de sesiune și când aplicația trece în fundal),
// ca notificarea „Saved" a aplicației Claude să nu apară după fiecare card. Local se salvează imediat, ca înainte.
const CLOUD_MIN_GAP = 60000;
function scheduleCloud() {
  if (!cloud.col || cloud.status === 'readonly' || cloud.status === 'syncing') return;
  if (cloud.timer) return;
  const wait = Math.max(2500, (cloud.lastFlush || 0) + CLOUD_MIN_GAP - Date.now());
  cloud.timer = setTimeout(() => { cloud.timer = null; flushCloud(); }, wait);
}
function flushCloudNow() { if (!cloud.col || cloud.status === 'readonly') return; clearTimeout(cloud.timer); cloud.timer = null; flushCloud(); }
function flushCloud() {
  cloud.lastFlush = Date.now();
  cloud.chain = cloud.chain.then(async () => {
    if (!cloud.col || cloud.status === 'readonly') return;
    const docs = docsFromState();
    for (const id of Object.keys(cloud.synced)) if (id.startsWith('deck-') && !docs[id]) docs[id] = { cards: {} };
    for (const [id, body] of Object.entries(docs)) {
      const j = JSON.stringify(body); if (cloud.synced[id] === j) continue;
      try { await withTimeout(cloud.col.doc(id).set({ ...body, updated: Date.now() }), 15000); cloud.synced[id] = j; cloud.status = 'cloud'; cloud.note = ''; cloud.lastSync = Date.now(); }
      catch (e) { cloudError(e); return; }
    }
    if (cloud.status === 'cloud') cloud.lastSync = cloud.lastSync || Date.now();
    updateSyncUI();
  }).catch(() => { });
  return cloud.chain;
}
async function initCloud() {
  const C = window.claude;
  if (!C || typeof C.use !== 'function') { cloud.status = 'local'; cloud.note = 'nodb'; updateSyncUI(); return; }
  let user = null, db = null;
  try { [user, db] = await Promise.all([C.use('user'), C.use('db')]); } catch (e) { }
  if (!db || !user) { cloud.status = 'local'; cloud.note = 'nodb'; updateSyncUI(); return; }
  const uid = await user.id();
  if (!uid) { cloud.status = 'local'; cloud.note = 'noid'; updateSyncUI(); return; }
  cloud.col = db.collection('data/users/' + uid); cloud.status = 'syncing'; updateSyncUI();
  try {
    const snap = await withTimeout(cloud.col.get(), 15000);
    let rmeta = null; const rcards = {};
    for (const d of snap.docs) {
      if (!d.exists) continue; const b = d.data() || {}; const { updated, ...body } = b;
      if (d.id === 'meta') rmeta = b.state; else if (d.id.startsWith('deck-')) Object.assign(rcards, b.cards || {});
      cloud.synced[d.id] = JSON.stringify(body);
    }
    const before = JSON.stringify(S);
    if (rmeta || Object.keys(rcards).length) { mergeInto(S, rmeta ? JSON.parse(JSON.stringify(rmeta)) : null, JSON.parse(JSON.stringify(rcards))); normalize(S); applyTheme(); saveLocal(); }
    cloud.status = 'cloud'; cloud.note = '';
    await flushCloud();
    if (JSON.stringify(S) !== before && ['home', 'stats', 'badges', 'settings', 'domain', 'dstats'].includes(view.name)) render();
  } catch (e) { cloudError(e); }
  updateSyncUI();
}
function syncText() {
  if (cloud.status === 'cloud') return { cls: 'ok', t: 'Progresul e salvat în contul tău Claude', s: cloud.lastSync ? `Ultima sincronizare: ${new Date(cloud.lastSync).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}. Îl regăsești pe orice dispozitiv pe care deschizi aplicația.` : 'Îl regăsești pe orice dispozitiv pe care deschizi aplicația.' };
  if (cloud.status === 'syncing') return { cls: 'close', t: 'Se sincronizează…', s: 'Aduc progresul din cont.' };
  if (cloud.status === 'readonly') return { cls: 'bad', t: 'Salvat doar pe acest dispozitiv', s: 'Contul tău nu are drept de salvare în această aplicație. Cere-i proprietarului să ți-o trimită prin invitație pe email, cu rol de Editor (fără link public). Până atunci, folosește exportul de mai jos.' };
  if (cloud.status === 'error') return { cls: 'close', t: cloud.note === 'quota' ? 'Spațiul de salvare din cont e plin' : 'Sincronizarea nu a mers acum', s: cloud.note === 'quota' ? 'Progresul rămâne salvat pe acest dispozitiv.' : 'Progresul e salvat pe acest dispozitiv. Reîncerc automat în 30 de secunde.' };
  return { cls: 'close', t: 'Salvat doar pe acest dispozitiv', s: cloud.note === 'noid' ? 'Autentifică-te în contul Claude ca să salvezi progresul în cont.' : 'Salvarea în cont funcționează când deschizi aplicația din contul tău Claude.' };
}
function touchSettings() { S.settingsAt = Date.now(); save(); }
// ---------- domenii fixate (pin) ----------
const MAX_PINS = 5;
function pins() { const ids = new Set(INDEX.domains.map(d => d.id)); return (Array.isArray(S.settings.pins) ? S.settings.pins : []).filter(id => ids.has(id)); }
function isPinned(id) { return pins().includes(id); }
function togglePin(id) {
  const p = pins();
  if (p.includes(id)) S.settings.pins = p.filter(x => x !== id);
  else { if (p.length >= MAX_PINS) { toast(`Poți fixa maximum ${MAX_PINS} domenii`, 'pin'); return false; } S.settings.pins = [...p, id]; }
  touchSettings(); return true;
}
function pinBtn(id, onChange) {
  const b = el(`<button type="button" class="pinbtn"></button>`);
  const upd = () => { const on = isPinned(id); b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); b.setAttribute('aria-label', on ? 'Anulează fixarea domeniului' : 'Fixează domeniul sus'); b.title = b.getAttribute('aria-label'); b.innerHTML = ic('pin'); };
  b.onclick = e => { e.stopPropagation(); if (togglePin(id)) { upd(); if (onChange) onChange(); } };
  upd(); return b;
}
function orderedDomains() { const p = pins(); return [...p.map(id => INDEX.domains.find(d => d.id === id)), ...INDEX.domains.filter(d => !p.includes(d.id))]; }
function updateSyncUI() {
  const box = document.getElementById('syncbox'); if (box) { const x = syncText(); box.className = 'verdict ' + x.cls; box.innerHTML = `<b>${esc(x.t)}</b><br><span style="font-weight:500">${esc(x.s)}</span>`; }
  const chip = document.getElementById('syncchip'); if (chip) chip.hidden = !(cloud.status === 'readonly');
}
function applyTheme() {
  const t = S.settings.theme;
  if (t === 'system') delete document.documentElement.dataset.theme; else document.documentElement.dataset.theme = t;
}

// ---------- aplicația instalată (PWA) și copia de siguranță ----------
// În artifactul Claude nu există manifest și nici service worker; acolo progresul se salvează în cont.
const IN_CLAUDE = !!window.claude;
const pwa = { prompt: null, installed: false };
const isStandalone = () => { try { return matchMedia('(display-mode: standalone)').matches || navigator.standalone === true; } catch (e) { return false; } };
function setupPWA() {
  if (IN_CLAUDE) return;
  const link = (rel, href) => { if (!document.querySelector(`link[rel="${rel}"]`)) { const l = document.createElement('link'); l.rel = rel; l.href = href; document.head.appendChild(l); } };
  link('manifest', 'manifest.webmanifest');
  link('apple-touch-icon', 'icons/apple-touch-icon.png');
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); pwa.prompt = e; if (view.name === 'settings') render(); });
  window.addEventListener('appinstalled', () => { pwa.prompt = null; pwa.installed = true; toast('Aplicația e pe ecranul principal', 'check'); if (view.name === 'settings') render(); });
  if ('serviceWorker' in navigator) { try { navigator.serviceWorker.register('sw.js').catch(() => { }); } catch (e) { } }
}
const BACKUP_EVERY = 30 * DAY;
function markExported() { S.lastExport = Date.now(); save(); }
// Memento lunar: în aplicația instalată (și în artifact doar dacă nu se poate salva în cont). „Mai târziu" amână încă o lună.
function backupDue(now = Date.now()) {
  if (IN_CLAUDE && cloud.status !== 'readonly') return false;
  const last = Math.max(S.lastExport || 0, S.backupNag || 0, S.created || 0);
  return now - last >= BACKUP_EVERY && Object.keys(S.cards).length > 0;
}
const fmtDate = t => new Date(t).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' });

// ---------- date ----------
let INDEX = null, WORLD = null, ROMANIA = null;
const DECKS = {};
const DEFAULT_PROMPT = { capitale: 'Care este capitala?', steaguri: 'Al cui este acest steag?', localizare: 'Ce țară este evidențiată pe hartă?', elemente: 'Ce element are acest simbol chimic?' };
const SUB_PROMPT = { 'Reședințe de județ': 'Care este reședința județului?', 'Pe hartă': 'Ce județ este evidențiat pe hartă?', 'Indicative auto': 'Al cărui județ este acest indicativ auto?', 'Râuri': 'Ce râu este evidențiat pe hartă?', 'Munți': 'În ce munți se află vârful marcat?', 'Orașe': 'Ce oraș este marcat pe hartă?' };
async function getJSON(u) { const r = await fetch(u); if (!r.ok) throw new Error('Nu am putut încărca ' + u); return r.json(); }
async function deck(id) {
  if (!DECKS[id]) {
    const d = await getJSON(`data/${id}.json`);
    d.meta = INDEX.domains.find(x => x.id === id);
    d.byId = {};
    d.cards.forEach((c, i) => { c.k = id; c.i = i; d.byId[c.id] = c; });
    d.subs = [...new Set(d.cards.map(c => c.sub))];
    d.pairs = d.pairs || [];
    DECKS[id] = d;
  }
  return DECKS[id];
}
const meta = id => INDEX.domains.find(d => d.id === id);
const promptOf = (c, d) => (d.prompts && d.prompts[c.sub]) || SUB_PROMPT[c.sub] || d.prompt || DEFAULT_PROMPT[d.id] || 'Care este răspunsul?';

// ---------- FSRS 4.5 (repetiție spațiată) ----------
const W = [0.4872, 1.4003, 3.7145, 13.8206, 5.1618, 1.2298, 0.8975, 0.031, 1.6474, 0.1367, 1.0461, 2.1072, 0.0793, 0.3246, 1.587, 0.2272, 2.8755];
const DECAY = -0.5, FACTOR = 19 / 81;
// Setări repetiție - toate într-un singur loc
const SRS = {
  WRONG_DELAY_MIN: 60,   // „Greșit": cardul revine după cel puțin atâtea minute
  WRONG_GAP_CARDS: 10,   // ...și, în aceeași sesiune, doar după cel puțin atâtea alte carduri
  WRONG_MAX_REQUEUE: 1   // de câte ori poate reveni un card greșit în aceeași sesiune
};
// în sesiuni intră cardurile de repetat azi; cele greșite recent intră doar după ce le-a trecut pauza
const dueForSession = (st, eot) => st && (st.st === 1 ? st.due <= Date.now() : st.due <= eot);
const clampD = d => Math.min(10, Math.max(1, d));
const D0 = g => clampD(W[4] - (g - 3) * W[5]);
const retr = (t, s) => Math.pow(1 + FACTOR * t / s, DECAY);
function schedule(prev, g, now) {
  let s, d, lapses = prev ? prev.lapses || 0 : 0;
  if (!prev || !prev.s) { s = W[g - 1]; d = D0(g); }
  else {
    const t = Math.max(0, (now - prev.last) / DAY), r = retr(t, prev.s);
    d = clampD(W[7] * D0(4) + (1 - W[7]) * (prev.d - W[6] * (g - 3)));
    if (g === 1) {
      s = Math.min(prev.s, W[11] * Math.pow(prev.d, -W[12]) * (Math.pow(prev.s + 1, W[13]) - 1) * Math.exp(W[14] * (1 - r)));
      if (prev.st === 2) lapses++;
    } else {
      s = prev.s * (Math.exp(W[8]) * (11 - prev.d) * Math.pow(prev.s, -W[9]) * (Math.exp(W[10] * (1 - r)) - 1) * (g === 2 ? W[15] : 1) * (g === 4 ? W[16] : 1) + 1);
    }
  }
  s = Math.max(0.1, Math.min(s, 3650));
  let due, st;
  if (g === 1) { due = now + SRS.WRONG_DELAY_MIN * 60000; st = 1; }
  else { let ivl = Math.max(1, Math.round(s)); if (ivl > 3) ivl = Math.round(ivl * (0.95 + Math.random() * 0.1)); due = now + ivl * DAY; st = 2; }
  return { s: +s.toFixed(3), d: +d.toFixed(3), due, last: now, reps: (prev ? prev.reps || 0 : 0) + 1, lapses, st };
}
function ivlLabel(prev, g) {
  if (g === 1) return SRS.WRONG_DELAY_MIN >= 60 ? `${Math.round(SRS.WRONG_DELAY_MIN / 60)} ${SRS.WRONG_DELAY_MIN >= 120 ? 'ore' : 'oră'}` : `${SRS.WRONG_DELAY_MIN} min`;
  const n = schedule(prev, g, Date.now()); const days = Math.round((n.due - Date.now()) / DAY);
  return days < 31 ? `${days} z` : days < 365 ? `${Math.round(days / 30)} luni` : `${(days / 365).toFixed(1)} ani`;
}

// ---------- activitate zilnică, XP, serie ----------
function day(k = todayKey()) { return S.days[k] || (S.days[k] = { rev: 0, xp: 0, ms: 0, ok: 0, bad: 0, nw: 0, nwBy: {} }); }
let lastAct = 0;
function tick() { const now = Date.now(); day().ms += (lastAct && now - lastAct < 90000) ? now - lastAct : 8000; lastAct = now; }
function level(xp) { const n = Math.floor((Math.sqrt(1 + 8 * xp / 100) - 1) / 2) + 1; const base = 100 * (n - 1) * n / 2, next = 100 * n * (n + 1) / 2; return { n, into: xp - base, need: next - base }; }
function streakNow() { const k = todayKey(), y = todayKey(Date.now() - DAY); return (S.streak.last === k || S.streak.last === y) ? S.streak.cur : 0; }
const MAX_FREEZE = 2;
function touchStreak() {
  const k = todayKey(), d = day();
  if (S.streak.last === k) return;
  if (d.rev + d.ok + d.bad >= 10) {
    const y = todayKey(Date.now() - DAY);
    S.streak.cur = S.streak.last === y ? S.streak.cur + 1 : 1;
    S.streak.best = Math.max(S.streak.best, S.streak.cur); S.streak.last = k;
    toast(`Seria continuă: ${S.streak.cur} ${S.streak.cur === 1 ? 'zi' : 'zile'}`, 'flame');
    if (S.streak.cur % 7 === 0 && (S.streak.freezes || 0) < MAX_FREEZE) { S.streak.freezes = (S.streak.freezes || 0) + 1; toast('Ai câștigat o protecție de serie', 'shield'); }
  }
}
// Protecția de serie: zilele ratate sunt acoperite automat, cât timp ai protecții.
function reconcileStreak() {
  const st = S.streak; if (!st.last || !st.cur) return;
  const lastT = new Date(st.last + 'T12:00:00').getTime(), today = new Date(todayKey() + 'T12:00:00').getTime();
  const missed = Math.round((today - lastT) / DAY) - 1;
  if (missed <= 0) return;
  const f = st.freezes || 0;
  if (missed <= f) {
    for (let i = 1; i <= missed; i++) { const k = todayKey(lastT + i * DAY); const d = day(k); d.frozen = true; }
    st.freezes = f - missed; st.last = todayKey(today - DAY);
    toast(missed === 1 ? 'Protecția de serie ți-a salvat seria pentru ieri' : `Protecțiile de serie au acoperit ${missed} zile`, 'shield');
    save();
  }
}
let flyHost = null;
function addXP(n) {
  if (!n) return; S.xp += n; day().xp += n; touchStreak();
  if (flyHost && flyHost.isConnected) { const f = el(`<span class="xpfly">+${n} XP</span>`); flyHost.appendChild(f); setTimeout(() => f.remove(), 950); }
}
function recordConfusion(k, a, b) { if (!a || !b || a === b) return; const key = k + ':' + [a, b].sort().join('|'); S.conf[key] = (S.conf[key] || 0) + 1; }
const confList = () => Object.entries(S.conf).map(([key, n]) => { const i = key.indexOf(':'); const [a, b] = key.slice(i + 1).split('|'); return { k: key.slice(0, i), a, b, n }; });

// ---------- statistici pe domenii ----------
function deckStats() {
  const out = {}; const eot = endOfToday();
  INDEX.domains.forEach(d => out[d.id] = { seen: 0, learning: 0, mastered: 0, due: 0, prog: 0, count: d.count, pct: 0 });
  for (const c of Object.values(S.cards)) {
    const o = out[c.k]; if (!o) continue;
    o.seen++; o.prog += Math.min(1, c.s / 21);
    if (c.s >= 21) o.mastered++; else o.learning++;
    if (c.due <= eot) o.due++;
  }
  for (const o of Object.values(out)) o.pct = o.count ? Math.min(100, Math.floor(100 * o.prog / o.count)) : 0;
  return out;
}
function subStats(d, sub) {
  const cards = d.cards.filter(c => c.sub === sub); let prog = 0, seen = 0, due = 0; const eot = endOfToday();
  cards.forEach(c => { const s = S.cards[c.id]; if (s) { seen++; prog += Math.min(1, s.s / 21); if (s.due <= eot) due++; } });
  return { n: cards.length, seen, due, pct: cards.length ? Math.floor(100 * prog / cards.length) : 0 };
}

// ---------- insigne ----------
function goalStreak() {
  let n = 0; const goal = S.settings.goalMin * 60000;
  for (let i = 0; i < 400; i++) { const k = todayKey(Date.now() - i * DAY); const d = S.days[k]; if (d && d.ms >= goal) n++; else if (i > 0) break; }
  return n;
}
function badgeDefs(st) {
  const L = [];
  const totalRev = Object.values(S.days).reduce((a, d) => a + d.rev, 0);
  L.push({ id: 'primul', t: 'Primul pas', dsc: 'Primul card repetat', icon: 'spark', p: Math.min(1, totalRev), mc: '#3D7BD9' });
  [3, 7, 30, 100].forEach(n => L.push({ id: 'serie' + n, t: `Serie de ${n} zile`, dsc: `Învață ${n} zile la rând`, icon: 'flame', p: Math.min(1, S.streak.best / n), mc: '#E0702A' }));
  [1000, 5000, 20000, 50000].forEach(n => L.push({ id: 'xp' + n, t: `${fmt(n)} XP`, dsc: 'Adună puncte de experiență', icon: 'bolt', p: Math.min(1, S.xp / n), mc: '#B08A10' }));
  const maxMin = Math.max(0, ...Object.values(S.days).map(d => d.ms / 60000));
  L.push({ id: 'maraton', t: 'Maratonist', dsc: '45 de minute într-o singură zi', icon: 'clock', p: Math.min(1, maxMin / 45), mc: '#2E8B6E' });
  L.push({ id: 'obiectiv7', t: 'Consecvent', dsc: 'Obiectivul zilnic atins 7 zile la rând', icon: 'target', p: Math.min(1, goalStreak() / 7), mc: '#C0392F' });
  L.push({ id: 'perfect', t: 'Fără greșeală', dsc: 'Un test de 10 din 10', icon: 'check', p: S.quiz.perfect ? 1 : 0, mc: '#7B4FD0' });
  L.push({ id: 'fulger', t: 'Fulger', dsc: '20 de răspunsuri corecte la testul cronometrat', icon: 'bolt', p: Math.min(1, (S.quiz.timedBest || 0) / 20), mc: '#C9408F' });
  L.push({ id: 'cartograf', t: 'Cartograf', dsc: '10 din 10 la „Găsește pe hartă"', icon: 'map', p: S.quiz.mapPerfect ? 1 : 0, mc: '#1F8FA8' });
  const intros = Object.values(S.intro || {}).filter(x => x.done).length;
  L.push({ id: 'initiat', t: 'Inițiat', dsc: 'Termină o lecție de început', icon: 'grad', p: Math.min(1, intros), mc: '#5B6CD6' });
  L.push({ id: 'initiat5', t: 'Curios', dsc: 'Termină 5 lecții de început', icon: 'grad', p: Math.min(1, intros / 5), mc: '#3E8E6E' });
  const started = Object.values(st).filter(o => o.seen > 0).length;
  L.push({ id: 'explorator', t: 'Explorator', dsc: 'Începe 5 domenii', icon: 'compass', p: Math.min(1, started / 5), mc: '#2B8A9E' });
  L.push({ id: 'enciclopedist', t: 'Enciclopedist', dsc: `Începe toate cele ${INDEX.domains.length} domenii`, icon: 'book', p: started / INDEX.domains.length, mc: '#A0522D' });
  INDEX.domains.forEach(d => {
    [[25, 'Bronz', '#A86B3C'], [50, 'Argint', '#7F8C9D'], [75, 'Aur', '#C29A1E'], [100, 'Diamant', '#2E9CC0']].forEach(([n, lab, mc]) =>
      L.push({ id: `${d.id}-${n}`, t: lab, dsc: `${n}% stăpânit`, icon: d.icon, p: Math.min(1, st[d.id].pct / n), mc, dom: d.id }));
  });
  return L;
}
function checkBadges() {
  const st = deckStats();
  for (const b of badgeDefs(st)) if (b.p >= 1 && !S.badges[b.id]) { S.badges[b.id] = todayKey(); toast(`Insignă nouă: ${b.dom ? meta(b.dom).title + ' - ' : ''}${b.t}`, 'medal'); }
  save();
}

// ---------- toast ----------
let toastQ = [], toastBusy = false;
function toast(msg, icon = 'spark') { toastQ.push([msg, icon]); if (!toastBusy) nextToast(); }
function nextToast() {
  const it = toastQ.shift(); if (!it) { toastBusy = false; return; } toastBusy = true;
  const t = el(`<div class="toast" role="status">${ic(it[1])}<span>${esc(it[0])}</span></div>`); document.body.appendChild(t);
  setTimeout(() => { t.remove(); nextToast(); }, 2300);
}

// ---------- verificarea răspunsurilor scrise ----------
const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\(.*?\)/g, ' ').replace(/[^a-z0-9]+/g, ' ').trim();
function lev(a, b) {
  if (a === b) return 0; const m = a.length, n = b.length; if (!m) return n; if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) { const cur = [i]; for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); prev = cur; }
  return prev[n];
}
// Verificare tolerantă: componente obligatorii în orice ordine, variante „A/B", greșeli mici de scriere
// (proporțional cu lungimea cuvântului), ani exacți, sinonime (EN, alias-uri), protecție la confuzii (Austria/Australia).
const ANS_STOP = new Set('de din la si sau the of and a an in pe cu al ale lui grup grupul group gruppo motor motors company co inc ltd sa ag spa se azi'.split(' '));
const ANS_ALIAS = {
  'mercedes benz': ['mercedes', 'mb', 'mercedesbenz'], 'volkswagen': ['vw'], 'sua': ['usa', 'us', 'statele unite', 'statele unite ale americii', 'america', 'united states'],
  'marea britanie': ['regatul unit', 'uk', 'united kingdom', 'great britain', 'britania'], 'regatul unit': ['marea britanie', 'uk', 'united kingdom', 'great britain', 'britania'],
  'coreea de sud': ['south korea', 'coreea'], 'emiratele arabe unite': ['eau', 'uae', 'emirate'], 'republica ceha': ['cehia', 'czechia', 'czech republic'], 'cehia': ['republica ceha', 'czechia', 'czech republic'],
  'tag heuer': ['tagheuer', 'tag'], 'jaeger lecoultre': ['jlc', 'jaeger'], 'audemars piguet': ['ap', 'audemars'], 'patek philippe': ['patek'], 'a lange sohne': ['lange', 'a lange'], 'rolls royce': ['rolls', 'rr'], 'alfa romeo': ['alfa']
};
const tolFor = n => n <= 3 ? 0 : n <= 7 ? 1 : 2;
function dlev(a, b) { // distanță Damerau-Levenshtein (literă lipsă, în plus, schimbată sau inversată = 1)
  if (a === b) return 0; const m = a.length, n = b.length; if (!m) return n; if (!n) return m;
  const D = Array.from({ length: m + 1 }, (_, i) => { const r = new Array(n + 1).fill(0); r[0] = i; return r; }); for (let j = 0; j <= n; j++) D[0][j] = j;
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) {
    const cost = a[i - 1] === b[j - 1] ? 0 : 1; D[i][j] = Math.min(D[i - 1][j] + 1, D[i][j - 1] + 1, D[i - 1][j - 1] + cost);
    if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) D[i][j] = Math.min(D[i][j], D[i - 2][j - 2] + 1);
  }
  return D[m][n];
}
let COUNTRY_SYN = null; const VOCAB = {};
function countrySyn() {
  if (COUNTRY_SYN) return COUNTRY_SYN; const cd = DECKS.capitale; if (!cd) return {};
  COUNTRY_SYN = {}; for (const c of cd.cards) { const ro = norm(c.q), en = norm((c.en || '').split(' - ')[0]); if (ro && en && ro !== en) { (COUNTRY_SYN[ro] = COUNTRY_SYN[ro] || []).push(en); (COUNTRY_SYN[en] = COUNTRY_SYN[en] || []).push(ro); } }
  return COUNTRY_SYN;
}
function vocabFor(k) { // cuvintele „entităților" cunoscute: răspunsurile din domeniu + numele de țări
  const key = k || '_'; if (VOCAB[key] && VOCAB[key].n === (DECKS.capitale ? 1 : 0)) return VOCAB[key].w;
  const w = new Set(); const addS = x => norm(x).split(' ').forEach(t => { if (t.length >= 3 && !ANS_STOP.has(t)) w.add(t); });
  if (k && DECKS[k]) DECKS[k].cards.forEach(c => { addS(c.a); (c.alt || []).forEach(addS); });
  if (DECKS.capitale) DECKS.capitale.cards.forEach(c => { addS(c.q); addS((c.en || '').split(' - ')[0]); });
  if (DECKS.localizare) DECKS.localizare.cards.forEach(c => addS(c.a));
  VOCAB[key] = { w, n: DECKS.capitale ? 1 : 0 }; return w;
}
function splitSlash(p) { // „Franța/Elveția" -> 2 variante; „km/s" rămâne întreg
  const bits = p.split(/\s*\/\s*/); if (bits.length < 2) return [p];
  return bits.every(b => /[A-Za-zĂÂÎȘȚăâîșț]{3}/.test(b)) ? bits : [p];
}
// o componentă: listă de opțiuni (oricare e suficientă); o opțiune: listă de token-uri
function parseAnswer(text, deckId) {
  const raw = String(text || ''), noPar = raw.replace(/\(.*?\)/g, ' ');
  const parts = noPar.split(/\s+[-–]\s+|[;,]\s+|:\s+/).map(x => x.trim()).filter(Boolean);
  const comps = parts.map(p => {
    const opts = p.split(/\s+sau\s+/).flatMap(splitSlash).map(norm).filter(Boolean);
    const kind = /^\d[\d .]*$/.test(norm(p)) ? 'num' : /^[A-ZĂÂÎȘȚ0-9]/.test(p) ? 'name' : 'desc';
    return { opts, kind };
  }).filter(c => c.opts.length);
  const alt = deckId === 'vocabular' || comps.every(c => c.kind === 'desc');
  return { comps, any: alt, extra: norm(raw) };
}
function optAliases(o) { // forme echivalente ale unei opțiuni (fără cuvinte de umplutură, alias-uri, nume EN de țări)
  const core = o.split(' ').filter(t => !ANS_STOP.has(t)).join(' ');
  const out = new Set([o, core].filter(Boolean)); const syn = countrySyn();
  for (const x of [o, core]) { (ANS_ALIAS[x] || []).forEach(a => out.add(norm(a))); (syn[x] || []).forEach(a => out.add(a)); }
  return [...out];
}
function matchTok(inp, exp, vocab) { // 0 = exact, 1 = cu greșeli mici, -1 = nu se potrivește
  if (inp === exp) return 0;
  if (/\d/.test(exp) || /\d/.test(inp)) return -1;
  const dd = dlev(inp, exp); if (dd > tolFor(exp.length)) return -1;
  if (vocab.has(inp)) return -1; // e alt cuvânt valid (ex. „austria" când se cere „australia")
  for (const w of vocab) if (w !== exp && Math.abs(w.length - inp.length) <= 2 && dlev(inp, w) < dd) return -1;
  return 1;
}
function matchOpt(toks, used, opt, vocab) { // potrivește toate token-urile opțiunii, în orice ordine
  const ot = opt.split(' ').filter(t => t && !ANS_STOP.has(t)); if (!ot.length) return null;
  const take = new Set(); let fuzzy = false;
  for (const t of ot) {
    let best = -1, bi = -1;
    toks.forEach((x, i) => { if (used.has(i) || take.has(i)) return; const r = matchTok(x, t, vocab); if (r >= 0 && (best < 0 || r < best)) { best = r; bi = i; } });
    if (bi < 0) { // poate a scris lipit („mercedesbenz") sau separat
      if (ot.length < 2 && toks.length < 2) return null;
      const joined = ot.join(''); let hit = null;
      for (let i = 0; i < toks.length && !hit; i++) for (let L = ot.length > 1 ? 1 : 2; L <= 3 && i + L <= toks.length; L++) { const idx = [...Array(L).keys()].map(k => i + k); if (idx.some(j => used.has(j))) continue; const r = matchTok(idx.map(j => toks[j]).join(''), joined, vocab); if (r >= 0) { hit = { idx, r }; break; } }
      if (!hit) return null; hit.idx.forEach(j => take.add(j)); return { take, fuzzy: fuzzy || hit.r > 0 };
    }
    take.add(bi); if (best > 0) fuzzy = true;
  }
  return { take, fuzzy };
}
function matchParsed(toks, P, vocab) {
  const used = new Set(); let fuzzy = false, matched = 0;
  const comps = P.any ? P.comps : P.comps.filter(c => c.kind !== 'desc' || P.comps.every(x => x.kind === 'desc'));
  for (const comp of comps) {
    let got = null;
    for (const o of comp.opts) { for (const a of optAliases(o)) { got = matchOpt(toks, used, a, vocab); if (got) break; } if (got) break; }
    if (got) { got.take.forEach(i => used.add(i)); fuzzy = fuzzy || got.fuzzy; matched++; if (P.any) break; }
    else if (!P.any) return null;
  }
  if (!matched) return null;
  return { used, fuzzy };
}
function checkAnswerDetail(c, input) {
  const x = norm(input); if (!x) return null;
  const toks = x.split(' '), vocab = vocabFor(c.k);
  const forms = [c.a, ...(c.alt || [])];
  if (c.en && / - /.test(c.en) && norm(c.en.split(' - ')[0]) === norm(c.q)) { // varianta EN a răspunsului, doar dacă are aceleași componente
    const enA = c.en.split(' - ').slice(1).join(' - '), req = P => P.comps.filter(x => x.kind !== 'desc').length;
    if (req(parseAnswer(enA, c.k)) === req(parseAnswer(c.a, c.k))) forms.push(enA);
  }
  // cuvinte permise în plus: orice apare în răspuns sau în contextul cardului
  const ctx = new Set(norm([c.a, ...(c.alt || []), c.q, c.en, c.d, ...Object.values(c.f || {})].join(' ')).split(' '));
  const parsed = forms.map(f => parseAnswer(f, c.k));
  parsed.forEach(P => P.comps.forEach(cp => cp.opts.forEach(o => optAliases(o).forEach(a => a.split(' ').forEach(t => ctx.add(t))))));
  let best = null;
  for (const P of parsed) {
    const m = matchParsed(toks, P, vocab); if (!m) continue;
    const extra = toks.filter((t, i) => !m.used.has(i) && !ANS_STOP.has(t) && t.length > 2 && !ctx.has(t) && ![...ctx].some(w => w.length > 3 && matchTok(t, w, new Set()) >= 0));
    if (extra.length) continue; // a adăugat altceva (ex. altă țară) - nu acceptăm
    const r = m.fuzzy ? 'close' : 'ok'; if (!best || r === 'ok') best = r; if (r === 'ok') break;
  }
  if (best) return { r: best };
  // răspunsuri lungi, descriptive: comparație pe tot textul
  for (const f of forms) { const v = norm(f); if (v.length > 28) { const sim = 1 - dlev(x, v) / Math.max(x.length, v.length); if (sim >= 0.9) return { r: 'ok' }; if (sim >= 0.8) return { r: 'close' }; } }
  return { r: 'bad' };
}
function checkAnswer(c, input) { const d = checkAnswerDetail(c, input); return d ? d.r : null; }
const writable = c => norm(c.a).length <= 28 || (c.alt || []).some(a => norm(a).length <= 28);

// ---------- hărți ----------
const SVGNS = 'http://www.w3.org/2000/svg';
const cssq = s => String(s).replace(/["\\]/g, '\\$&');
const svgEl = (tag, attrs = {}) => { const n = document.createElementNS(SVGNS, tag); for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v); return n; };
const shortName = s => String(s || '').replace(/\s*\(.*?\)\s*/g, ' ').trim();
async function ensureMaps(kind) {
  if (kind === 'world' && !WORLD) WORLD = await getJSON('data/world.json');
  if (kind === 'romania' && !ROMANIA) ROMANIA = await getJSON('data/romania.json');
}
const isMapCard = c => !!(c && (c.map || c.romap || c.rl));
async function mapsFor(cards) {
  if (cards.some(c => c && c.map)) await ensureMaps('world');
  if (cards.some(c => c && (c.romap || c.rl))) { await ensureMaps('romania'); await loadCountyNames(); }
}
// --- șabloane SVG (construite o singură dată, apoi clonate) ---
let worldTpl = null, roTpl = null;
function worldSVG() {
  if (!worldTpl) {
    const w = WORLD; let s = `<svg class="mapsvg world" viewBox="0 0 ${w.w} ${w.h}" xmlns="${SVGNS}" role="img" aria-label="Harta lumii"><path class="sea" d="${w.sphere}"/><path class="other" d="${w.others}"/><g class="g-land">`;
    for (const [code, c] of Object.entries(w.countries)) if (c.d) s += `<path class="land k${c.k}" data-c="${code}" d="${c.d}"/>`;
    s += '</g><g class="g-dots">';
    for (const [code, c] of Object.entries(w.countries)) if (c.a < 8) s += `<circle class="dot k${c.k}" data-c="${code}" cx="${c.c[0]}" cy="${c.c[1]}" r="2"/>`;
    worldTpl = el(s + '</g><g class="g-fx"></g><g class="g-lbl"></g></svg>');
  }
  return worldTpl.cloneNode(true);
}
function roSVG() {
  if (!roTpl) {
    const r = ROMANIA; let s = `<svg class="mapsvg ro" viewBox="0 0 ${r.w} ${r.h}" xmlns="${SVGNS}" role="img" aria-label="Harta României"><rect class="sea" x="-2000" y="-2000" width="${r.w + 4000}" height="${r.h + 4000}"/>`;
    for (const c of r.ctx) s += `<path class="other" d="${c.d}"/>`;
    s += '<g class="g-land">';
    for (const [code, c] of Object.entries(r.counties)) s += `<path class="land k${c.k}" data-c="${code}" d="${c.d}"/>`;
    s += `</g><path class="roout" d="${r.outline}"/><g class="g-riv">`;
    for (const [name, rv] of Object.entries(r.rivers)) s += `<path class="riv ${name === 'Dunărea' ? 'big' : ''}" data-r="${esc(name)}" d="${rv.d}"/>`;
    s += '</g><g class="g-rivhit">';
    for (const [name, rv] of Object.entries(r.rivers)) s += `<path class="rivhit" data-c="r:${esc(name)}" d="${rv.d}"/>`;
    s += '</g><g class="g-pk">';
    for (const [name, p] of Object.entries(r.peaks)) s += `<path class="pk" data-c="p:${esc(name)}" d="M${p.p[0]},${p.p[1] - 6}l5.4,9h-10.8z"/>`;
    s += '</g><g class="g-ct">';
    for (const [name, p] of Object.entries(r.cities)) s += `<circle class="ct" data-c="c:${esc(name)}" cx="${p[0]}" cy="${p[1]}" r="3.2"/>`;
    roTpl = el(s + '</g><g class="g-fx"></g><g class="g-lbl"></g></svg>');
  }
  return roTpl.cloneNode(true);
}
// --- etichete fără suprapuneri, cu mărime constantă pe ecran ---
function pxScale(svg, vb) { const r = svg.getBoundingClientRect(); const w = r.width || 340, h = r.height || w * vb[3] / vb[2]; return Math.max(vb[2] / w, vb[3] / h); }
function drawLabels(svg, vb, items, px = 11.5) {
  const g = $('.g-lbl', svg); if (!g) return; g.replaceChildren();
  const k = pxScale(svg, vb), fs = px * k, placed = [];
  const fits = (x, y, w, h) => x >= vb[0] && y >= vb[1] && x + w <= vb[0] + vb[2] && y + h <= vb[1] + vb[3] && !placed.some(b => x < b[0] + b[2] && x + w > b[0] && y < b[1] + b[3] && y + h > b[1]);
  for (const it of items.slice().sort((a, b) => b.prio - a.prio)) {
    const f = fs * (it.scale || 1);
    for (const txt of [it.t, it.t2].filter(Boolean)) {
      const w = txt.length * f * 0.56 + f * 0.3, h = f * 1.15;
      const ax = it.anchor === 'start' ? it.x + f * 0.55 : it.x - w / 2, ay = it.y - h / 2 + (it.dy || 0) * f;
      if (!fits(ax, ay, w, h)) continue;
      placed.push([ax, ay, w, h]);
      const t = svgEl('text', { x: it.anchor === 'start' ? ax + f * 0.15 : it.x, y: ay + h * 0.78, 'font-size': f.toFixed(2), 'text-anchor': it.anchor || 'middle', class: 'lbl ' + (it.cls || '') });
      t.textContent = txt; g.appendChild(t); break;
    }
  }
}
// --- controlul zonei vizibile (zoom, deplasare, ciupire cu două degete) ---
function viewport(svg, full, onChange, aspect) {
  if (aspect) { full = full.slice(); const r = full[2] / full[3]; if (aspect < r) { const h = full[2] / aspect; full[1] -= (h - full[3]) / 2; full[3] = h; } else { const w = full[3] * aspect; full[0] -= (w - full[2]) / 2; full[2] = w; } svg.style.aspectRatio = String(aspect); svg.setAttribute('preserveAspectRatio', 'xMidYMid meet'); }
  const st = { vb: full.slice(), full };
  const minW = full[2] / 40;
  const clamp = () => { const v = st.vb; v[2] = Math.min(full[2] * 1.05, Math.max(minW, v[2])); v[3] = v[2] * full[3] / full[2]; v[0] = Math.min(Math.max(v[0], full[0] - v[2] * 0.3), full[0] + full[2] - v[2] * 0.7); v[1] = Math.min(Math.max(v[1], full[1] - v[3] * 0.3), full[1] + full[3] - v[3] * 0.7); };
  st.set = (v, silent) => { st.vb = v.slice(); if (st.vb[3] !== st.vb[2] * full[3] / full[2]) { const r = full[2] / full[3]; if (st.vb[2] / st.vb[3] < r) { const nw = st.vb[3] * r; st.vb[0] -= (nw - st.vb[2]) / 2; st.vb[2] = nw; } else { const nh = st.vb[2] / r; st.vb[1] -= (nh - st.vb[3]) / 2; st.vb[3] = nh; } } clamp(); apply(silent); };
  const apply = silent => {
    const v = st.vb; svg.setAttribute('viewBox', v.map(n => n.toFixed(1)).join(' '));
    const k = pxScale(svg, v);
    $$('.dot', svg).forEach(d => d.setAttribute('r', (4.2 * k).toFixed(2)));
    $$('.ct', svg).forEach(d => d.setAttribute('r', (d.classList.contains('hl') ? 6.5 : 4) * k));
    $$('.pk', svg).forEach(d => { const [x, y] = d.dataset.xy ? d.dataset.xy.split(',').map(Number) : (() => { const m = d.getAttribute('d').match(/M([\d.-]+),([\d.-]+)/); const xy = [+m[1], +m[2] + 6]; d.dataset.xy = xy.join(','); return xy; })(); const s = (d.classList.contains('hl') ? 11 : 7.5) * k; d.setAttribute('d', `M${x},${y - s}l${s * 0.9},${s * 1.5}h${-s * 1.8}z`); });
    $$('.ringhl', svg).forEach(d => d.setAttribute('r', (16 * k).toFixed(2)));
    if (!silent && onChange) onChange(st.vb);
  };
  st.zoom = (f, cx, cy) => { const v = st.vb; cx = cx ?? v[0] + v[2] / 2; cy = cy ?? v[1] + v[3] / 2; const nw = v[2] * f, nh = v[3] * f; st.vb = [cx - (cx - v[0]) * f, cy - (cy - v[1]) * f, nw, nh]; clamp(); apply(); };
  // gesturi: un deget = mutare, două degete = zoom (și mutare), atingere scurtă = selecție, dublă atingere = zoom
  const TAP_PX = 10, TAP_MS = 400, DBL_MS = 320;
  const pts = new Map(); let drag = null, pinch = null, lastTap = null, raf = 0;
  const toSvg = (cx, cy) => { const r = svg.getBoundingClientRect(); const v = st.vb; return [v[0] + (cx - r.left) / (r.width || 1) * v[2], v[1] + (cy - r.top) / (r.height || 1) * v[3]]; };
  const redraw = () => { if (raf) return; raf = requestAnimationFrame(() => { raf = 0; apply(); }); }; // etichetele se redesenează cel mult o dată pe cadru
  const startDrag = (x, y, target, moved) => { drag = { x, y, vb: st.vb.slice(), moved, target, t: Date.now(), x0: x, y0: y }; };
  const startPinch = () => { const [a, b] = [...pts.values()]; const r = svg.getBoundingClientRect(); const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2; pinch = { d: Math.max(10, Math.hypot(a[0] - b[0], a[1] - b[1])), vb: st.vb.slice(), c: toSvg(mx, my), r }; if (drag) drag.moved = true; };
  svg.addEventListener('pointerdown', e => {
    if (e.button > 0) return;
    pts.set(e.pointerId, [e.clientX, e.clientY]); try { svg.setPointerCapture(e.pointerId); } catch (x) { }
    if (pts.size === 1) startDrag(e.clientX, e.clientY, e.target, false); else if (pts.size === 2) startPinch();
    e.preventDefault();
  });
  svg.addEventListener('pointermove', e => {
    if (!pts.has(e.pointerId)) return; pts.set(e.pointerId, [e.clientX, e.clientY]); e.preventDefault();
    if (pinch && pts.size >= 2) {
      const [a, b] = [...pts.values()]; const d = Math.max(10, Math.hypot(a[0] - b[0], a[1] - b[1])); const f = pinch.d / d;
      const r = pinch.r, fx = ((a[0] + b[0]) / 2 - r.left) / (r.width || 1), fy = ((a[1] + b[1]) / 2 - r.top) / (r.height || 1);
      const w = pinch.vb[2] * f, h = pinch.vb[3] * f; st.vb = [pinch.c[0] - fx * w, pinch.c[1] - fy * h, w, h]; clamp(); apply(true); redraw(); return;
    }
    if (!drag) return; const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.moved && Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) > TAP_PX) drag.moved = true;
    if (drag.moved) { const k = st.vb[2] / (svg.getBoundingClientRect().width || 340); st.vb[0] = drag.vb[0] - dx * k; st.vb[1] = drag.vb[1] - dy * k; clamp(); apply(true); }
  });
  const end = e => {
    if (!pts.has(e.pointerId)) return; pts.delete(e.pointerId);
    if (pts.size === 1) { // a ridicat un deget după zoom: continuă mutarea de la poziția celuilalt deget, fără salt
      pinch = null; const [p] = [...pts.values()]; startDrag(p[0], p[1], null, true); apply(); return;
    }
    if (pts.size >= 2) { startPinch(); return; }
    pinch = null; const t = drag; drag = null; if (!t) return;
    if (t.moved) { apply(); return; }
    if (e.type === 'pointercancel' || Date.now() - t.t > TAP_MS) return;
    const now = Date.now();
    if (lastTap && now - lastTap.t < DBL_MS && Math.hypot(e.clientX - lastTap.x, e.clientY - lastTap.y) < 30) { // dublă atingere: zoom
      lastTap = null; const p = toSvg(e.clientX, e.clientY); st.zoom(0.5, p[0], p[1]); return;
    }
    lastTap = { t: now, x: e.clientX, y: e.clientY };
    if (st.onTap) st.onTap(t.target, e.clientX, e.clientY);
  };
  svg.addEventListener('pointerup', end); svg.addEventListener('pointercancel', end);
  svg.addEventListener('touchstart', e => { if (e.touches.length > 1) e.preventDefault(); }, { passive: false }); // nu lăsa pagina să facă zoom
  svg.addEventListener('touchmove', e => e.preventDefault(), { passive: false }); // nici scroll în timp ce muți harta
  svg.addEventListener('dblclick', e => e.preventDefault());
  svg.addEventListener('wheel', e => { e.preventDefault(); const p = toSvg(e.clientX, e.clientY); st.zoom(e.deltaY > 0 ? 1.2 : 0.83, p[0], p[1]); }, { passive: false });
  return st;
}
function zoomControls(wrap, vp, home) {
  const ctl = el(`<div class="mapctl"><button type="button" aria-label="Mărește">+</button><button type="button" aria-label="Micșorează">−</button><button type="button" aria-label="Revino la vederea inițială" class="rs">⟲</button></div>`);
  const [bi, bo, br] = $$('button', ctl);
  bi.onclick = e => { e.stopPropagation(); vp.zoom(0.6); };
  bo.onclick = e => { e.stopPropagation(); vp.zoom(1.6); };
  br.onclick = e => { e.stopPropagation(); vp.set(home()); };
  wrap.appendChild(ctl);
}
function focusBox(b, full, ratio, factor = 3.2, minW = 70) {
  let w = Math.max((b[2] - b[0]) * factor, minW), h = Math.max((b[3] - b[1]) * factor, minW / ratio);
  if (w / h < ratio) w = h * ratio; else h = w / ratio;
  const cx = (b[0] + b[2]) / 2, cy = (b[1] + b[3]) / 2;
  w = Math.min(w, full[2]); h = Math.min(h, full[3]);
  return [Math.min(Math.max(full[0], cx - w / 2), full[0] + full[2] - w), Math.min(Math.max(full[1], cy - h / 2), full[1] + full[3] - h), w, h];
}
// --- etichetele fiecărei hărți ---
function worldLabelItems(vb, { hide = [], show = null, k = 1, force = [] } = {}) {
  const out = [];
  for (const [code, c] of Object.entries(WORLD.countries)) {
    if (hide.includes(code) || (show && !show.includes(code))) continue;
    if (c.l[0] < vb[0] || c.l[0] > vb[0] + vb[2] || c.l[1] < vb[1] || c.l[1] > vb[1] + vb[3]) continue;
    if (c.a / (k * k) < 160 && !force.includes(code)) continue; // prea mic pe ecran la acest zoom
    out.push({ x: c.l[0], y: c.l[1], t: shortName(c.n), t2: code, prio: c.a + (show ? 1e6 : 0) });
  }
  return out;
}
function roLabelItems(layer, { hide = [], codes = false } = {}) {
  const r = ROMANIA, out = [];
  r.ctx.forEach(c => c.l && out.push({ x: c.l[0], y: c.l[1], t: c.n, prio: 5, cls: 'ctxl' }));
  out.push({ x: r.sea[0], y: r.sea[1], t: 'Marea Neagră', prio: 6, cls: 'seal' });
  if (layer === 'j') for (const [code, c] of Object.entries(r.counties)) { if (hide.includes(code) || !c.l) continue; const nm = ROMAP_NAMES[code] || code; out.push({ x: c.l[0], y: c.l[1], t: codes ? code : nm, t2: code, prio: 100 }); }
  if (layer === 'c') for (const [nm, p] of Object.entries(r.cities)) { if (hide.includes('c:' + nm)) continue; out.push({ x: p[0], y: p[1], t: nm, anchor: 'start', prio: nm === 'București' ? 300 : 100, scale: 0.92 }); }
  if (layer === 'r') for (const [nm, rv] of Object.entries(r.rivers)) { if (hide.includes('r:' + nm) || !rv.l) continue; out.push({ x: rv.l[0], y: rv.l[1], t: nm, prio: nm === 'Dunărea' ? 300 : 100, cls: 'rivl', scale: 0.92 }); }
  if (layer === 'p') for (const [nm, p] of Object.entries(r.peaks)) { if (hide.includes('p:' + nm)) continue; out.push({ x: p.p[0], y: p.p[1], t: `${nm} ${p.h}`, t2: nm, anchor: 'start', prio: p.h, scale: 0.9, cls: 'pkl' }); }
  return out;
}
let ROMAP_NAMES = {};
async function loadCountyNames() { if (Object.keys(ROMAP_NAMES).length) return; const d = await deck('judete'); d.cards.filter(c => c.romap).forEach(c => ROMAP_NAMES[c.romap] = c.a.replace(' (municipiu)', '')); }
// --- elementul de hartă de pe un card ---
function mark(svg, key, cls) {
  if (key.startsWith('r:')) $$(`.riv[data-r="${cssq(key.slice(2))}"]`, svg).forEach(p => p.classList.add(cls));
  $$(`[data-c="${cssq(key)}"]`, svg).forEach(p => p.classList.add(cls));
}
function ringAt(svg, x, y) { const g = $('.g-fx', svg); g.appendChild(svgEl('circle', { class: 'ringhl', cx: x, cy: y, r: 8 })); }
function mapCardEl(code) {
  const svg = worldSVG(); const c = WORLD.countries[code];
  mark(svg, code, 'hl');
  const wrap = el('<div class="mapwrap card-map"></div>'); wrap.appendChild(svg);
  const full = [0, 0, WORLD.w, WORLD.h], home = () => focusBox(c.b, full, 1.35);
  if (c.a < 40) ringAt(svg, c.c[0], c.c[1]);
  let revealed = false;
  const vp = viewport(svg, full, vb => drawLabels(svg, vb, worldLabelItems(vb, { hide: revealed ? [] : [code], force: revealed ? [code] : [], k: pxScale(svg, vb) }).map(i => i.t === shortName(c.n) && revealed ? { ...i, prio: 1e9, cls: 'tgt' } : i), 11), 1.35);
  zoomControls(wrap, vp, home);
  requestAnimationFrame(() => vp.set(home()));
  vp.set(home(), true);
  wrap.__reveal = () => { revealed = true; vp.set(vp.vb); };
  return wrap;
}
function roCardEl(key) {
  // key: cod de județ sau "r:/p:/c:" + nume
  const svg = roSVG(); const r = ROMANIA;
  const layer = /^[rpc]:/.test(key) ? key[0] : 'j';
  svg.dataset.layer = layer;
  mark(svg, key, 'hl');
  if (layer === 'p') { const p = r.peaks[key.slice(2)]; ringAt(svg, p.p[0], p.p[1]); }
  if (layer === 'c') { const p = r.cities[key.slice(2)]; ringAt(svg, p[0], p[1]); }
  const wrap = el('<div class="mapwrap card-map"></div>'); wrap.appendChild(svg);
  const full = [0, 0, r.w, r.h];
  let revealed = false;
  const items = () => {
    const base = roLabelItems('none');
    if (!revealed) return base;
    const nm = layer === 'j' ? (ROMAP_NAMES[key] || key) : key.slice(2);
    const pos = layer === 'j' ? r.counties[key].l : layer === 'r' ? r.rivers[nm].l : layer === 'p' ? r.peaks[nm].p : r.cities[nm];
    return [...base, { x: pos[0], y: pos[1], t: layer === 'p' ? `${nm} ${r.peaks[nm].h} m` : nm, prio: 1e9, cls: 'tgt', anchor: layer === 'p' || layer === 'c' ? 'start' : 'middle' }];
  };
  const vp = viewport(svg, full, vb => drawLabels(svg, vb, items(), 11));
  zoomControls(wrap, vp, () => full);
  requestAnimationFrame(() => vp.set(full));
  vp.set(full, true);
  wrap.__reveal = () => { revealed = true; vp.set(vp.vb); };
  return wrap;
}
function cardMapEl(c) { return c.map ? mapCardEl(c.map) : c.romap ? roCardEl(c.romap) : c.rl ? roCardEl(c.rl) : null; }
const revealMaps = root => $$('.mapwrap', root).forEach(w => w.__reveal && w.__reveal());

// ---------- randarea feței unui card ----------
const IMG_FRONT = ['Recunoaște stilul', 'Elemente arhitecturale'];
function imgEl(c, small) {
  if (!c.img) return null;
  const f = el(`<figure class="cimg ${small ? 'small' : ''}"><img ${c.img.p ? '' : `src="${esc(c.img.u || 'img/' + c.img.f)}"`} alt="${esc(imgLabel(c))}" loading="lazy" decoding="async"><figcaption>Foto: ${esc(c.img.by)} · ${esc(c.img.lic)} · <a href="${esc(c.img.page)}" target="_blank" rel="noopener">Wikimedia Commons</a></figcaption></figure>`);
  const im = $('img', f); im.onerror = () => f.remove();
  if (c.img.p) packImg(c.img.p, c.img.f).then(u => { if (u) im.src = u; else f.remove(); }, () => f.remove());
  return f;
}
// Pozele noi sunt grupate în câteva fișiere JSON (img/pack-*.json: {cheie: data URI}), ca aplicația să rămână sub limita de fișiere.
const PACKS = {};
function packImg(p, k) { if (!PACKS[p]) PACKS[p] = fetch('img/' + p + '.json').then(r => r.ok ? r.json() : {}).catch(() => { delete PACKS[p]; return {}; }); return PACKS[p].then(m => m[k] || null); }
function imgLabel(c) {
  if (['masini', 'ceasuri'].includes(c.k) && !/^(Românești|Electrice)/.test(c.sub)) return `${c.a} ${c.q}`;
  if (c.k === 'astronomie' || c.sub === 'Elemente arhitecturale' || c.sub === 'Arhitectură românească') return c.a;
  return c.q;
}
function frontEl(c, d) {
  const box = el('<div class="stack"></div>');
  box.appendChild(el(`<div class="prompt">${esc(promptOf(c, d))}</div>`));
  if (c.img && IMG_FRONT.includes(c.sub)) box.appendChild(imgEl(c));
  if (isMapCard(c)) box.appendChild(cardMapEl(c));
  else if (c.big) box.appendChild(el(`<div class="qbig ${isEmoji(c.q) ? 'emoji' : ''}">${esc(c.q)}</div>`));
  else box.appendChild(el(`<div class="row" style="align-items:flex-start">${c.flag ? `<span class="qflag" aria-hidden="true">${c.flag}</span>` : ''}<div class="qtext">${esc(c.q)}</div></div>`));
  return box;
}
// res: 'ok' (verde), 'bad' (roșu) sau gol (neutru, încă neevaluat)
function answerEl(c, d, noImg, res) {
  const box = el(`<div class="answer ${res === 'ok' || res === 'bad' ? res : ''}"></div>`);
  box.appendChild(el(`<div class="a">${esc(c.a)}</div>`));
  if (c.img && !noImg && !IMG_FRONT.includes(c.sub)) box.appendChild(imgEl(c));
  if (S.settings.showEn && c.en) box.appendChild(el(`<div class="en">EN · ${esc(c.en)}</div>`));
  if (c.d) box.appendChild(el(`<p>${esc(c.d)}</p>`));
  if (c.f && Object.keys(c.f).length) box.appendChild(el(`<dl class="facts">${Object.entries(c.f).map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl>`));
  if (c.m) box.appendChild(el(`<div class="mnemo">${ic('bulb')}<div><b>Truc de memorare.</b> ${esc(c.m)}</div></div>`));
  for (const p of d.pairs.filter(p => p[0] === c.id || p[1] === c.id).slice(0, 2)) {
    const o = d.byId[p[0] === c.id ? p[1] : p[0]]; if (!o) continue;
    box.appendChild(el(`<div class="confuse"><b>Nu confunda cu ${esc(o.q && !isEmoji(o.q) && o.q.length < 40 ? o.q : o.a)}.</b> ${esc(p[2])}</div>`));
  }
  return box;
}

// derulează lin astfel încât răspunsul să înceapă sub bara de sus; butoanele sunt fixate jos (sticky)
function revealScroll(node) {
  if (!node) return;
  requestAnimationFrame(() => { const r = node.getBoundingClientRect(), vh = window.innerHeight || 700; if (r.top > vh * 0.45 || r.top < 70) { try { window.scrollTo({ top: Math.max(0, window.scrollY + r.top - 76), behavior: 'smooth' }); } catch (e) { window.scrollTo(0, window.scrollY + r.top - 76); } } });
}
function markResult(card, res) { if (!card) return; card.classList.remove('ok', 'bad'); if (res) card.classList.add(res); const a = $('.answer', card); if (a) { a.classList.remove('ok', 'bad'); if (res) a.classList.add(res); } }

// ---------- navigare ----------
let view = { name: 'home' };
let timers = [];
const clearTimers = () => { timers.forEach(t => { clearInterval(t); clearTimeout(t); }); timers = []; };
function go(name, params = {}) { try { history.pushState({ n: name, p: params }, ''); } catch (e) { } view = { name, ...params }; render(); }
function back() { let ok = false; try { if (history.state && history.state.n !== 'home') { history.back(); ok = true; } } catch (e) { } if (!ok) { view = { name: 'home' }; render(); } }
window.addEventListener('popstate', e => { const s = e.state; view = s ? { name: s.n, ...s.p } : { name: 'home' }; render(); });
const app = () => $('#app');
const NAVMAP = { home: 'home', domain: 'home', learn: 'home', quiz: 'home', compare: 'home', cmp: 'home', map: 'home', browse: 'home', dstats: 'stats', stats: 'stats', badges: 'badges', settings: 'settings', cotd: 'home', mix: 'home', intro: 'home', place: 'home' };
async function render() {
  clearTimers(); flyHost = null;
  const v = view, root = app();
  $$('#nav button').forEach(b => b.classList.toggle('on', b.dataset.go === NAVMAP[v.name]));
  $('#nav').classList.toggle('hidden', ['learn', 'quiz', 'cotd', 'intro', 'place'].includes(v.name));
  try {
    const node = await (VIEWS[v.name] || VIEWS.home)(v);
    if (view !== v) return;
    root.replaceChildren(node); window.scrollTo(0, 0);
  } catch (e) {
    console.error(e);
    root.replaceChildren(el(`<div class="stack"><div class="topbar"><button class="iconbtn" data-act="home" aria-label="Acasă">${ic('back')}</button><h1>Ceva nu a mers</h1></div><div class="panel">${esc(e.message || e)}. Încearcă din nou.</div></div>`));
    $('[data-act=home]', root).onclick = () => go('home');
  }
}
function topbar(title, opts = {}) {
  const t = el(`<div class="topbar">${opts.noBack ? '' : `<button class="iconbtn" aria-label="Înapoi">${ic(opts.closeIcon ? 'close' : 'back')}</button>`}<h1>${esc(title)}</h1><div class="spacer"></div>${opts.right || ''}</div>`);
  if (!opts.noBack) $('.iconbtn', t).onclick = opts.onBack || back;
  return t;
}

// ---------- ecran: acasă ----------
function cotdPick() {
  const k = todayKey(); const doms = INDEX.domains;
  const d = doms[hash(k + 'd') % doms.length]; return { k: d.id, i: hash(k + 'c') % d.count };
}
function dueAll() { const eot = endOfToday(); return Object.values(S.cards).filter(c => c.due <= eot).length; }
const VIEWS = {};
VIEWS.home = async () => {
  const st = deckStats(), dd = day(), L = level(S.xp);
  const mins = Math.floor(dd.ms / 60000), goalP = Math.min(100, Math.round(100 * dd.ms / (S.settings.goalMin * 60000)));
  const hr = new Date().getHours(); const hi = hr < 11 ? 'Bună dimineața' : hr < 18 ? 'Salut' : 'Bună seara';
  const due = dueAll();
  const cp = cotdPick(); const cd = await deck(cp.k); const cc = cd.cards[cp.i]; const cdone = S.cotd.date === todayKey();
  await mapsFor([cc]);
  const root = el(`<div class="stack">
    <div class="topbar" style="padding-bottom:6px"><div style="min-width:0"><div class="label">${new Date().toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'long' })}</div><h1>${esc(hi)}, ${esc(S.settings.name)}</h1></div></div>
    <button class="note" id="syncchip" hidden style="text-align:left;border-color:var(--bad)"><b>Progresul se salvează doar pe acest dispozitiv.</b> Atinge pentru detalii.</button>
    ${backupDue() ? `<div class="note stack" id="backupnote" style="gap:8px;border-color:var(--warn)"><span><b>E timpul pentru o copie de siguranță.</b> Progresul tău e salvat doar pe acest telefon. ${S.lastExport ? `Ultimul export: ${esc(fmtDate(S.lastExport))}.` : 'Nu ai făcut încă niciun export.'}</span><div class="actions"><button class="btn primary" data-act="backup">Exportă acum</button><button class="btn" data-act="later">Mai târziu</button></div></div>` : ''}
    <div class="strip">
      <div class="chipstat"><span class="label">Serie</span><span class="v">${ic('flame', 'flame')}${streakNow()}<span class="frz" title="Protecții de serie">${ic('shield')}${S.streak.freezes || 0}</span></span></div>
      <div class="chipstat"><span class="label">Nivel ${L.n}</span><span class="v">${ic('bolt', 'bolt')}${fmt(S.xp)}</span></div>
      <div class="chipstat"><span class="label">Azi</span><span class="v"><i class="ring" style="--p:${goalP}"></i>${mins}<small style="font-family:var(--f-body);font-size:12px;color:var(--muted);font-weight:500">/${S.settings.goalMin} min</small></span></div>
    </div>
    <div class="duo">
      <button class="hero primary" data-act="quick"><span class="label">Sesiune rapidă</span><span class="big">5 minute</span><span style="font-size:13px;opacity:.8">${due ? `${plural(due, 'card de repetat', 'carduri de repetat')} în toate domeniile` : 'Carduri noi și repetări amestecate'}</span><span class="cta">${ic('play')}Pornește</span></button>
      <button class="hero" data-act="cotd" style="--h:${cd.meta.hue}"><span class="label">Cardul zilei · ${esc(cd.meta.title)}</span>${isMapCard(cc) ? `<span class="cotd-q">${esc(promptOf(cc, cd))}</span>` : `<span class="cotd-q ${cc.big ? 'bigq' : ''}">${cc.flag ? cc.flag + ' ' : ''}${esc(cc.q)}</span>`}<span class="cta">${cdone ? `${ic('check')}Rezolvat azi` : `${ic('chev')}Întoarce cardul`}</span></button>
    </div>
    <button class="mixbtn" data-act="mix"><span class="ic">${ic('shuffle')}</span><span class="t"><b>Amestec între domenii</b><small>Carduri din mai multe domenii, intercalate - memoria se întărește mai bine</small></span>${ic('chev', 'chev')}</button>
    <div class="sectionhead"><h2>Domenii</h2><span class="label">${INDEX.domains.length} domenii · ${fmt(INDEX.domains.reduce((a, d) => a + d.count, 0))} carduri</span></div>
    <div class="grid" id="grid"></div>
  </div>`);
  const grid = $('#grid', root);
  const drawGrid = () => {
    grid.replaceChildren();
    for (const d of orderedDomains()) {
      const o = st[d.id];
      const pill = o.due ? `<span class="pill due">${o.due} de repetat</span>` : o.seen ? (o.pct >= 100 ? '<span class="pill ok">stăpânit</span>' : '<span class="pill">la zi</span>') : '<span class="pill new">nou</span>';
      const w = el(`<div class="tilewrap ${isPinned(d.id) ? 'pinned' : ''}"><button class="tile" style="--h:${d.hue}" data-id="${d.id}"><span class="ic">${ic(d.icon)}</span><h3>${esc(d.title)}</h3><span class="sub">${esc(d.sub)}</span><span class="foot"><span class="bar"><i style="width:${o.pct}%"></i></span><span class="meta"><span class="num" style="font-size:13px">${o.pct}%</span>${pill}</span></span></button></div>`);
      $('.tile', w).onclick = () => go('domain', { id: d.id });
      w.appendChild(pinBtn(d.id, drawGrid));
      grid.appendChild(w);
    }
  };
  drawGrid();
  $('[data-act=quick]', root).onclick = () => go('learn', { mode: 'quick' });
  $('[data-act=cotd]', root).onclick = () => go('cotd');
  $('[data-act=mix]', root).onclick = () => go('mix');
  $('#syncchip', root).onclick = () => go('settings');
  const bn = $('#backupnote', root);
  if (bn) {
    $('[data-act=backup]', bn).onclick = () => go('settings', { exportNow: true });
    $('[data-act=later]', bn).onclick = () => { S.backupNag = Date.now(); save(); bn.remove(); toast('Îți amintesc din nou peste o lună', 'clock'); };
  }
  setTimeout(updateSyncUI, 0);
  return root;
};

// ---------- ecran: cardul zilei ----------
VIEWS.cotd = async () => {
  const cp = cotdPick(); const d = await deck(cp.k); const c = d.cards[cp.i];
  await mapsFor([c]);
  const root = el('<div></div>'); root.appendChild(topbar('Cardul zilei', { closeIcon: true }));
  const card = el(`<div class="card" style="--h:${d.meta.hue}"><div class="head"><span class="tag"></span><span class="label">${esc(d.meta.title)} · ${esc(c.sub)}</span></div><div class="body"></div></div>`);
  const body = $('.body', card); body.appendChild(frontEl(c, d)); root.appendChild(card);
  const ctl = el(`<div class="reveal"><button class="btn primary block">Întoarce cardul</button></div>`); root.appendChild(ctl);
  $('button', ctl).onclick = () => {
    body.appendChild(answerEl(c, d)); revealMaps(body);
    const done = S.cotd.date === todayKey();
    ctl.replaceChildren(el(done ? `<div class="note">Ai rezolvat deja cardul de azi. Mâine primești altul.</div>` : `<div class="actions"><button class="btn" data-g="1">${ic('x')}Nu știam</button><button class="btn primary" data-g="3">${ic('check')}Știam</button></div>`));
    $$('[data-g]', ctl).forEach(b => b.onclick = () => {
      const g = +b.dataset.g; markResult(card, g === 3 ? 'ok' : 'bad'); const prev = S.cards[c.id]; const n = schedule(prev, g, Date.now()); n.k = c.k; S.cards[c.id] = n;
      day().rev++; if (!prev) countNew(c.k); tick(); flyHost = card; addXP(g === 3 ? 15 : 5);
      S.cotd = { date: todayKey(), id: c.id, g }; save(); checkBadges();
      ctl.replaceChildren(el(`<div class="stack"><div class="note">${g === 3 ? 'Bravo! Cardul intră în repetiția spațiată.' : 'Îl vei revedea curând în repetiții.'}</div><button class="btn block" data-dom>${ic('chev')}Mergi la ${esc(d.meta.title)}</button></div>`));
      $('[data-dom]', ctl).onclick = () => go('domain', { id: d.id });
    });
  };
  return root;
};

// ---------- ecran: domeniu ----------
VIEWS.domain = async v => {
  const d = await deck(v.id), m = d.meta, st = deckStats()[v.id];
  if (!(S.intro && S.intro[v.id]) && st.seen === 0) { const L = await intro(v.id); if (L) return introOffer(d, L); }
  const newToday = newLeftFor(v.id);
  const fresh = d.cards.filter(c => !S.cards[c.id]).length;
  const root = el(`<div class="stack" style="--h:${m.hue}"></div>`);
  const tb = topbar(m.title); tb.appendChild(pinBtn(v.id)); root.appendChild(tb);
  root.appendChild(el(`<div class="panel domhead"><div class="bigring" style="--p:${st.pct};--h:${m.hue}"><span>${st.pct}%</span></div><div class="counts">
    <div><span class="num">${fmt(m.count - st.seen)}</span><small>noi</small></div>
    <div><span class="num">${fmt(st.learning)}</span><small>în învățare</small></div>
    <div><span class="num">${fmt(st.mastered)}</span><small>stăpânite</small></div>
    <div><span class="num" style="color:var(--warn)">${fmt(st.due)}</span><small>de repetat azi</small></div></div></div>`));
  const acts = el(`<div class="actions">
    <button class="action main" data-a="learn">${ic('play')}<b>Învață</b><span>${st.due ? `${st.due} repetări` : 'Nicio repetare'}${fresh ? ` · până la ${Math.min(fresh, Math.max(0, S.settings.sessionSize - st.due), newToday)} noi` : ''}</span></button>
    <button class="action" data-a="quiz">${ic('test')}<b>Testează</b><span>Grilă, scris, cronometrat, intrusul</span></button>
    <button class="action" data-a="compare">${ic('swap')}<b>Compară</b><span>Diferențe și confuzii frecvente</span></button>
    <button class="action" data-a="stats">${ic('chart')}<b>Statistici</b><span>Progres, puncte slabe</span></button>
    ${m.map ? `<button class="action" data-a="map">${ic('map')}<b>Hartă</b><span>Explorează și găsește pe hartă</span></button>` : ''}
    <button class="action" data-a="browse">${ic('list')}<b>Răsfoiește</b><span>Toate cele ${m.count} carduri</span></button>
  </div>`);
  root.appendChild(acts);
  $$('[data-a]', acts).forEach(b => b.onclick = () => {
    const a = b.dataset.a;
    if (a === 'learn') go('learn', { mode: 'domain', id: v.id });
    if (a === 'quiz') go('quiz', { id: v.id });
    if (a === 'compare') go('compare', { id: v.id });
    if (a === 'stats') go('dstats', { id: v.id });
    if (a === 'map') go('map', { id: v.id });
    if (a === 'browse') go('browse', { id: v.id });
  });
  root.appendChild(el(`<div class="sectionhead"><h2>Subcategorii</h2><span class="label">${d.subs.length}</span></div>`));
  const list = el('<div class="panel list" style="padding-block:4px"></div>');
  for (const sub of d.subs) {
    const ss = subStats(d, sub);
    const li = el(`<div class="li" style="flex-wrap:wrap"><div class="t"><b>${esc(sub)}</b><small>${ss.n} carduri · ${ss.pct}% stăpânit${ss.due ? ` · ${ss.due} de repetat` : ''}</small><div class="bar" style="margin-top:6px"><i style="width:${ss.pct}%"></i></div></div>
      <div class="row" style="gap:6px"><button class="iconbtn" data-s="learn" aria-label="Învață ${esc(sub)}">${ic('play')}</button><button class="iconbtn" data-s="quiz" aria-label="Testează ${esc(sub)}">${ic('test')}</button><button class="iconbtn" data-s="browse" aria-label="Răsfoiește ${esc(sub)}">${ic('list')}</button></div></div>`);
    $$('[data-s]', li).forEach(b => b.onclick = () => {
      const s = b.dataset.s;
      if (s === 'learn') go('learn', { mode: 'domain', id: v.id, sub });
      if (s === 'quiz') go('quiz', { id: v.id, sub });
      if (s === 'browse') go('browse', { id: v.id, sub });
    });
    list.appendChild(li);
  }
  root.appendChild(list);
  const extra = el(`<div class="row" style="flex-wrap:wrap;gap:8px"><button class="btn" data-x="intro">${ic('grad')}Reia introducerea</button><button class="btn" data-x="place">${ic('target')}Test de plasare</button></div>`);
  $('[data-x=intro]', extra).onclick = () => go('intro', { id: v.id });
  $('[data-x=place]', extra).onclick = () => go('place', { id: v.id });
  root.appendChild(extra);
  root.appendChild(el(`<p class="note">Sursa: ${esc(m.source)}</p>`));
  return root;
};

// ---------- sesiunea de învățare (flashcard) ----------
const newLeftFor = k => Math.max(0, S.settings.newPerDay - ((day().nwBy || {})[k] || 0));
function countNew(k) { const dd = day(); dd.nw++; dd.nwBy = dd.nwBy || {}; dd.nwBy[k] = (dd.nwBy[k] || 0) + 1; }
function interleave(rev, fresh) {
  const q = [], total = rev.length + fresh.length; let fi = 0, ri = 0;
  for (let k = 0; k < total; k++) {
    const target = fresh.length ? Math.round((fi + 0.5) * total / fresh.length - 0.5) : Infinity;
    if (fi < fresh.length && (k >= target || ri >= rev.length)) q.push(fresh[fi++]); else q.push(rev[ri++]);
  }
  return q;
}
function buildQueue(d, sub, extraNew = 0, practice = false) {
  const eot = endOfToday(); const size = S.settings.sessionSize;
  const cards = d.cards.filter(c => !sub || c.sub === sub);
  if (practice) return shuffle(cards.filter(c => S.cards[c.id]).sort((a, b) => S.cards[a.id].s - S.cards[b.id].s).slice(0, 10)).map(c => ({ k: c.k, id: c.id }));
  const due = cards.filter(c => dueForSession(S.cards[c.id], eot)).sort((a, b) => S.cards[a.id].due - S.cards[b.id].due).slice(0, size);
  const newLeft = newLeftFor(d.meta.id) + extraNew;
  const fresh = cards.filter(c => !S.cards[c.id]).slice(0, Math.min(newLeft, Math.max(extraNew, size - due.length)));
  return interleave(shuffle(due), fresh).map(c => ({ k: c.k, id: c.id }));
}
async function buildQuickQueue() {
  const eot = endOfToday();
  const dueIds = Object.entries(S.cards).filter(([, c]) => dueForSession(c, eot)).sort((a, b) => a[1].due - b[1].due).slice(0, 60);
  const ks = [...new Set(dueIds.map(([, c]) => c.k))].filter(k => meta(k));
  await Promise.all(ks.map(deck));
  let q = shuffle(dueIds.map(([id, c]) => ({ k: c.k, id })).filter(r => DECKS[r.k] && DECKS[r.k].byId[r.id]));
  if (q.length < 15) {
    const st = deckStats();
    let doms = INDEX.domains.filter(d => st[d.id].seen > 0 && st[d.id].seen < d.count).map(d => d.id);
    if (!doms.length) doms = shuffle(INDEX.domains.map(d => d.id)).slice(0, 3);
    await Promise.all(doms.map(deck));
    const left = Object.fromEntries(doms.map(k => [k, Math.max(2, newLeftFor(k))]));
    for (let round = 0; round < 15 && q.length < 15; round++)
      for (const k of doms) { if (q.length >= 15 || left[k] <= 0) continue; const c = DECKS[k].cards.find(c => !S.cards[c.id] && !q.some(r => r.id === c.id)); if (c) { q.push({ k, id: c.id }); left[k]--; } }
  }
  return q;
}
async function buildMixQueue(ks) {
  ks = ks.filter(k => meta(k)); await Promise.all(ks.map(deck));
  const eot = endOfToday(), size = S.settings.sessionSize;
  const per = ks.map(k => {
    const d = DECKS[k];
    const due = shuffle(d.cards.filter(c => dueForSession(S.cards[c.id], eot)));
    const fresh = d.cards.filter(c => !S.cards[c.id]).slice(0, newLeftFor(k));
    return interleave(due, fresh);
  });
  const q = [];
  for (let i = 0; q.length < size && per.some(l => l.length); i = (i + 1) % per.length) { const l = per[i]; if (l.length) q.push(l.shift()); }
  return q.map(c => ({ k: c.k, id: c.id }));
}
let sess = null;
VIEWS.learn = async v => {
  const fresh = !sess || sess.key !== JSON.stringify(v);
  if (fresh) {
    let queue, d = null;
    if (v.mode === 'quick') queue = await buildQuickQueue();
    else if (v.mode === 'mix') queue = await buildMixQueue(v.ks || []);
    else { d = await deck(v.id); queue = buildQueue(d, v.sub, v.extra || 0, v.practice); }
    sess = { key: JSON.stringify(v), v, queue, idx: 0, res: [0, 0, 0, 0, 0], xp0: S.xp, t0: Date.now(), requeued: {}, ends: v.mode === 'quick' ? Date.now() + 5 * 60000 : 0, done: false };
    lastAct = Date.now();
  }
  for (const r of sess.queue) await deck(r.k);
  await mapsFor(sess.queue.map(r => DECKS[r.k].byId[r.id]));
  return renderLearnBody();
};
const sessTitle = v => v.mode === 'quick' ? 'Sesiune rapidă' : v.mode === 'mix' ? 'Amestec' : (v.sub || meta(v.id).title);
function learnSummary() {
  setTimeout(flushCloudNow, 0);
  const v = sess.v, n = sess.res.slice(1).reduce((a, b) => a + b, 0), okp = n ? Math.round(100 * (sess.res[2] + sess.res[3] + sess.res[4]) / n) : 0;
  const root = el('<div class="stack"></div>');
  root.appendChild(topbar(sessTitle(v), { closeIcon: true, onBack: () => { sess = null; back(); } }));
  // ce ar urma dacă apasă „Continuă"
  let nextN = 0, freshLeft = 0, d = null;
  if (v.mode === 'domain') { d = DECKS[v.id]; nextN = buildQueue(d, v.sub).length; freshLeft = d.cards.filter(c => (!v.sub || c.sub === v.sub) && !S.cards[c.id]).length; }
  if (n) {
    root.appendChild(el(`<div class="panel result"><div class="label">Sesiune încheiată</div><div class="num">${n}</div><div class="muted">carduri · ${okp}% reținute · +${fmt(S.xp - sess.xp0)} XP · ${Math.max(1, Math.round((Date.now() - sess.t0) / 60000))} min</div>
      <div class="kv" style="margin-top:14px;text-align:left"><div class="pill" style="color:var(--bad)">Greșit: ${sess.res[1]}</div><div class="pill" style="color:var(--warn)">Greu: ${sess.res[2]}</div><div class="pill" style="color:var(--ok)">Bine: ${sess.res[3]}</div><div class="pill">Ușor: ${sess.res[4]}</div></div></div>`));
  }
  const where = v.sub ? `„${v.sub}"` : 'acest domeniu';
  if (v.mode === 'domain' && !nextN) {
    root.appendChild(el(`<div class="panel stack"><h2 style="font-size:17px">${n ? 'Ai terminat ce era programat azi' : 'Ești la zi aici'}</h2><p class="muted" style="margin:0">${freshLeft
      ? `Nu mai ai repetări azi în ${esc(where)} și ai atins limita de ${S.settings.newPerDay} carduri noi pe zi pentru acest domeniu (o poți schimba din Setări). Mai sunt ${freshLeft} carduri neînvățate - poți continua oricum.`
      : `Ai parcurs toate cardurile din ${esc(where)} și nu ai repetări programate azi. Următoarele repetări apar în zilele care vin.`}</p></div>`));
  }
  const btns = el('<div class="stack"></div>');
  if (v.mode === 'quick') btns.appendChild(el(`<button class="btn primary block" data-b="again">${ic('play')}Încă 5 minute</button>`));
  else if (v.mode === 'mix') btns.appendChild(el(`<button class="btn primary block" data-b="mix">${ic('shuffle')}Încă o rundă de amestec</button>`));
  else {
    if (nextN) btns.appendChild(el(`<button class="btn primary block" data-b="next">${ic('play')}Continuă cu următoarele ${nextN} carduri</button>`));
    else if (freshLeft) btns.appendChild(el(`<button class="btn primary block" data-b="extra">${ic('play')}Continuă oricum: ${Math.min(10, freshLeft)} carduri noi</button>`));
    if (nextN && freshLeft) btns.appendChild(el(`<button class="btn block" data-b="extra">${ic('spark')}Învață 10 carduri noi în plus</button>`));
    if (Object.keys(S.cards).some(id => d.byId[id] && (!v.sub || d.byId[id].sub === v.sub))) btns.appendChild(el(`<button class="btn block" data-b="practice">${ic('shuffle')}Exersează cardurile cele mai slabe</button>`));
    btns.appendChild(el(`<button class="btn block" data-b="quiz">${ic('test')}Testează-te acum</button>`));
  }
  btns.appendChild(el(`<button class="btn ghost block" data-b="home">Înapoi</button>`));
  root.appendChild(btns);
  const start = p => { sess = null; view = { name: 'learn', ...p }; try { history.replaceState({ n: 'learn', p }, ''); } catch (e) { } render(); };
  $$('[data-b]', btns).forEach(b => b.onclick = () => {
    const a = b.dataset.b;
    if (a === 'again') start({ mode: 'quick', t: Date.now() });
    if (a === 'mix') start({ mode: 'mix', ks: v.ks, t: Date.now() });
    if (a === 'next') start({ mode: 'domain', id: v.id, sub: v.sub, t: Date.now() });
    if (a === 'extra') start({ mode: 'domain', id: v.id, sub: v.sub, extra: 10, t: Date.now() });
    if (a === 'practice') start({ mode: 'domain', id: v.id, sub: v.sub, practice: true, t: Date.now() });
    if (a === 'quiz') { sess = null; go('quiz', { id: v.id, sub: v.sub }); }
    if (a === 'home') { sess = null; back(); }
  });
  checkBadges();
  return root;
}
function renderLearnBody() {
  const s = sess;
  if (s.idx >= s.queue.length || (s.ends && Date.now() > s.ends && s.idx > 0)) return learnSummary();
  const ref = s.queue[s.idx], d = DECKS[ref.k], c = d.byId[ref.id];
  const prev = S.cards[c.id];
  const total = s.queue.length, pct = Math.round(100 * s.idx / total);
  const root = el(`<div style="--h:${d.meta.hue}"></div>`);
  root.appendChild(topbar(sessTitle(s.v), { closeIcon: true, onBack: () => { sess = null; back(); }, right: s.ends ? `<span class="timer" id="tmr"></span>` : `<span class="label">${s.idx + 1}/${total}</span>` }));
  root.appendChild(el(`<div class="sessionbar"><div class="bar"><i style="width:${pct}%;background:hsl(var(--h) var(--tab-s) var(--tab-l))"></i></div>${prev ? `<span class="pill">repetare</span>` : `<span class="pill new">card nou</span>`}</div>`));
  const card = el(`<div class="card"><div class="head"><span class="tag"></span><span class="label">${esc(d.meta.title)} · ${esc(c.sub)}</span></div><div class="body"></div></div>`);
  flyHost = card;
  const body = $('.body', card); body.appendChild(frontEl(c, d));
  root.appendChild(card);
  const ctl = el('<div class="reveal stack"></div>');
  const typeBox = el(`<form class="typein"><input id="typed" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Scrie răspunsul (opțional)" aria-label="Răspunsul tău"><button class="btn primary" type="submit">Verifică</button></form>`);
  const showBtn = el(`<button class="btn block">Arată răspunsul</button>`);
  ctl.append(typeBox, showBtn); root.appendChild(ctl);
  const reveal = typed => {
    tick();
    const chk = typed ? checkAnswerDetail(c, typed) : null, verdict = chk ? chk.r : null;
    const res = verdict ? (verdict === 'bad' ? 'bad' : 'ok') : null;
    body.appendChild(answerEl(c, d, false, res)); revealMaps(body); markResult(card, res);
    const vtxt = { ok: 'Corect!', close: `Aproape: ai scris „${typed}", corect e „${c.a}"`, bad: `Ai scris „${typed}"` };
    const suggested = verdict === 'ok' ? 3 : verdict === 'close' ? 2 : verdict === 'bad' ? 1 : 0;
    ctl.replaceChildren();
    if (verdict) ctl.appendChild(el(`<div class="verdict ${res}">${esc(vtxt[verdict])}</div>`));
    const g = el(`<div class="stickyact"><div class="label" style="margin-bottom:6px">Cât de bine ai știut?</div><div class="grades">
      ${[[1, 'Greșit'], [2, 'Greu'], [3, 'Bine'], [4, 'Ușor']].map(([n, t]) => `<button class="grade g${n}" data-g="${n}" ${suggested === n ? 'style="outline:2px solid currentColor;outline-offset:1px"' : ''}>${t}<small>${ivlLabel(prev, n)}</small></button>`).join('')}</div></div>`);
    ctl.appendChild(g);
    $$('[data-g]', g).forEach(b => b.onclick = () => { const gg = +b.dataset.g; if (!res) markResult(card, gg === 1 ? 'bad' : 'ok'); rate(gg, c); });
    const first = $(`[data-g="${suggested || 3}"]`, g); first && first.focus({ preventScroll: true });
    revealScroll($('.answer', body));
  };
  typeBox.onsubmit = e => { e.preventDefault(); const t = $('#typed', typeBox).value.trim(); reveal(t || null); };
  showBtn.onclick = () => reveal(null);
  if (s.ends) {
    const tmr = $('#tmr', root); const upd = () => { const left = Math.max(0, s.ends - Date.now()); tmr.textContent = `${Math.floor(left / 60000)}:${pad(Math.floor(left / 1000) % 60)}`; tmr.classList.toggle('low', left < 30000); };
    upd(); timers.push(setInterval(upd, 500));
  }
  return root;
}
function rate(g, c) {
  const s = sess; const ref = s.queue[s.idx]; const prev = S.cards[c.id];
  const n = schedule(prev, g, Date.now()); n.k = c.k; S.cards[c.id] = n;
  const dd = day(); dd.rev++; if (!prev) countNew(c.k); if (g === 1) dd.bad++; else dd.ok++;
  tick(); addXP([0, 2, 5, 8, 10][g] + (prev ? 0 : 3)); s.res[g]++;
  // un card greșit revine în sesiune doar dacă mai urmează cel puțin WRONG_GAP_CARDS alte carduri; altfel îl vede la următoarea sesiune
  if (g === 1 && (s.requeued[c.id] || 0) < SRS.WRONG_MAX_REQUEUE && s.queue.length - (s.idx + 1) >= SRS.WRONG_GAP_CARDS) { s.requeued[c.id] = (s.requeued[c.id] || 0) + 1; s.queue.splice(s.idx + 1 + SRS.WRONG_GAP_CARDS, 0, ref); }
  s.idx++; save();
  if (s.idx % 5 === 0) checkBadges();
  setTimeout(() => { if (view.name === 'learn' && sess === s) { const node = renderLearnBody(); app().replaceChildren(node); window.scrollTo(0, 0); } }, 350);
}

// ---------- quiz ----------
function distractors(d, c, n = 3) {
  const seen = new Set([norm(c.a)]), out = [];
  const pairIds = d.pairs.filter(p => p[0] === c.id || p[1] === c.id).map(p => p[0] === c.id ? p[1] : p[0]);
  const confIds = confList().filter(x => x.k === d.meta.id && (x.a === c.id || x.b === c.id)).map(x => x.a === c.id ? x.b : x.a);
  const tryAdd = x => { if (x && out.length < n && !seen.has(norm(x.a)) && x.a) { out.push(x); seen.add(norm(x.a)); } };
  shuffle([...pairIds, ...confIds]).slice(0, 2).forEach(id => tryAdd(d.byId[id]));
  shuffle(d.cards.filter(x => x.sub === c.sub)).forEach(tryAdd);
  shuffle(d.cards).forEach(tryAdd);
  return out;
}
function intrusGroups(d) {
  const cfg = d.meta.intrus; if (!cfg) return null;
  const ns = s => String(s || '').replace(/ \((II|III)\)$/, '').replace(/^(Alte|Alți|Alt) /, '').toLowerCase();
  const skip = cfg.skip.map(ns);
  const label = {};
  const key = c => { if (cfg.by !== 'sub') return cfg.by === 'a' ? c.a : (c.f || {})[cfg.by.slice(2)]; const k = ns(c.sub); if (!label[k] || label[k].length > c.sub.length) label[k] = c.sub.replace(/ \((II|III)\)$/, ''); return k; };
  const g = {};
  d.cards.forEach(c => { if (skip.includes(ns(c.sub))) return; if (itemText(c, cfg).length > 70) return; const k = key(c); if (k) (g[k] = g[k] || []).push(c); });
  const keys = Object.keys(g).filter(k => g[k].length >= 3);
  return keys.length >= 2 ? { g, keys, cfg, label } : null;
}
const itemText = (c, cfg) => cfg.item === 'q' ? (c.q || c.a) : cfg.item === 'a' ? c.a : cfg.item === 'qa' ? `${c.q} · ${c.a}` : (c.q && c.q.length <= 40 ? c.q : c.a);
// Grupuri de modele cu poză pe marcă (ceasuri, mașini). Intră în testul cu imagine doar mărcile cu cel puțin MIN_MODELS modele cu poză;
// supercarurile au un prag mai mic (MIN_MODELS_SUPER), cu tot atâtea variante de răspuns câte modele are marca (maximum 4).
const MIN_MODELS = 4, MIN_MODELS_SUPER = 3, SUPER_SUB = 'Mărci de supercaruri și electrice';
function modelGroups(d) {
  if (!['ceasuri', 'masini'].includes(d.meta.id)) return null;
  if (d._mg) return d._mg;
  const brands = new Set(d.cards.filter(c => /^(Mărci|Alte mărci|Mărci )/.test(c.sub)).map(c => norm(c.q)));
  const brandOf = c => norm(c.a);
  const byBrand = {};
  for (const c of d.cards) if (c.img && brands.has(brandOf(c))) (byBrand[brandOf(c)] = byBrand[brandOf(c)] || []).push(c);
  const superB = new Set(d.cards.filter(c => c.sub === SUPER_SUB).map(c => norm(c.q)));
  const ok = new Set(); for (const [b, cs] of Object.entries(byBrand)) if (new Set(cs.map(c => norm(c.q))).size >= (superB.has(b) ? MIN_MODELS_SUPER : MIN_MODELS)) cs.forEach(c => ok.add(c.id));
  return (d._mg = { byBrand, ok, brandOf });
}
function makeQuestion(mode, d, pool, used) {
  if (mode === 'img') {
    const mg = modelGroups(d);
    if (mg) { // ceasuri/mașini: „Ce model este?", variantele sunt modele ale ACELEIAȘI mărci (logo-ul nu mai ajută)
      const avail = pool.filter(c => mg.ok.has(c.id) && !used.has(c.id)); if (!avail.length) return null;
      const c = pick(avail); used.add(c.id); const b = mg.brandOf(c);
      const seen = new Set([norm(c.q)]), opts = [{ c, t: c.q }];
      for (const x of shuffle(mg.byBrand[b])) { if (opts.length >= 4) break; if (!seen.has(norm(x.q))) { seen.add(norm(x.q)); opts.push({ c: x, t: x.q }); } }
      return { mode, c, opts: shuffle(opts), correct: c.q, brand: b };
    }
    const avail = pool.filter(c => c.img && !used.has(c.id)); if (!avail.length) return null;
    const c = pick(avail); used.add(c.id);
    const lab = imgLabel(c), seen = new Set([lab]), opts = [{ c, t: lab }];
    for (const x of shuffle(d.cards.filter(x => x.img && x.sub === c.sub)).concat(shuffle(d.cards.filter(x => x.img)))) { const l = imgLabel(x); if (opts.length >= 4) break; if (!seen.has(l)) { seen.add(l); opts.push({ c: x, t: l }); } }
    return { mode, c, opts: shuffle(opts), correct: lab };
  }
  if (mode === 'intrus') {
    const ig = intrusGroups(d); if (!ig) return null;
    for (let tries = 0; tries < 30; tries++) {
      const X = pick(ig.keys), Y = pick(ig.keys.filter(k => k !== X));
      const three = shuffle(ig.g[X]).slice(0, 3), odd = pick(ig.g[Y]);
      const texts = [...three, odd].map(c => itemText(c, ig.cfg));
      if (new Set(texts).size < 4) continue;
      return { mode, c: odd, group: ig.label[X] || X, oddGroup: ig.label[Y] || Y, opts: shuffle([...three, odd].map(c => ({ c, t: itemText(c, ig.cfg) }))), correct: itemText(odd, ig.cfg) };
    }
    return null;
  }
  const avail = pool.filter(c => !used.has(c.id) && (mode !== 'write' || writable(c)));
  if (!avail.length) return null;
  // prioritizează cardurile văzute dar slabe, apoi restul
  const weighted = avail.map(c => ({ c, w: S.cards[c.id] ? 1 + Math.max(0, 10 - S.cards[c.id].s) + 3 * (S.cards[c.id].lapses || 0) : 2 }));
  let r = Math.random() * weighted.reduce((a, x) => a + x.w, 0), c = weighted[0].c;
  for (const x of weighted) { r -= x.w; if (r <= 0) { c = x.c; break; } }
  used.add(c.id);
  if (mode === 'write') return { mode, c };
  const ds = distractors(d, c, 3);
  return { mode, c, opts: shuffle([c, ...ds].map(x => ({ c: x, t: x.a }))), correct: c.a };
}
let qz = null;
VIEWS.quiz = async v => {
  const d = await deck(v.id);
  await mapsFor(d.cards);
  if (!v.mode) return quizSetup(d, v);
  if (!qz || qz.key !== JSON.stringify(v)) {
    const pool = d.cards.filter(c => !v.sub || c.sub === v.sub);
    const pairPool = v.pair ? v.pair.map(id => d.byId[id]) : null;
    qz = { key: JSON.stringify(v), v, d, pool, pairPool, used: new Set(), n: 0, score: 0, total: v.mode === 'timed' ? Infinity : (v.pair ? 6 : 10), wrong: [], q: null, answered: false, xp0: S.xp, ends: v.mode === 'timed' ? Date.now() + 60000 : 0, over: false };
    nextQuestion();
  }
  return renderQuiz();
};
function quizSetup(d, v) {
  const root = el(`<div class="stack" style="--h:${d.meta.hue}"></div>`);
  root.appendChild(topbar(`Testează · ${v.sub || d.meta.title}`));
  const ig = intrusGroups(d); const best = S.quiz.best || {};
  const nWrite = d.cards.filter(c => (!v.sub || c.sub === v.sub) && writable(c)).length;
  const modes = [
    ['mc', 'test', 'Alegere multiplă', '10 întrebări, 4 variante', true],
    ['write', 'pen', 'Răspuns scris', '10 întrebări, scrii tu răspunsul', nWrite >= 4],
    ['timed', 'clock', 'Cronometrat', 'Câte poți în 60 de secunde?', true],
    ['intrus', 'target', 'Găsește intrusul', ig ? '3 au ceva în comun, 1 nu' : 'Indisponibil pentru acest domeniu', !!ig && !v.sub],
  ];
  const mgq = modelGroups(d);
  const nImg = d.cards.filter(c => c.img && (!mgq || mgq.ok.has(c.id)) && (!v.sub || c.sub === v.sub)).length;
  if (nImg >= 8) modes.push(['img', 'eye', 'Recunoaște după imagine', `${nImg} imagini - ${mgq ? 'ce model este?' : 'ce vezi în poză?'}`, true]);
  const grid = el('<div class="modes"></div>');
  modes.forEach(([id, icon, t, s, ok]) => {
    const b = el(`<button class="action ${id === 'mc' ? 'main' : ''}" ${ok ? '' : 'disabled style="opacity:.45"'}>${ic(icon)}<b>${t}</b><span>${esc(s)}</span>${best[d.meta.id + ':' + id] ? `<span class="pill" style="align-self:flex-start;margin-top:4px">record: ${best[d.meta.id + ':' + id]}</span>` : ''}</button>`);
    if (ok) b.onclick = () => go('quiz', { id: v.id, sub: v.sub, mode: id, t: Date.now() });
    grid.appendChild(b);
  });
  root.appendChild(grid);
  root.appendChild(el(`<p class="note">Testele îți arată ce știi cu adevărat. Răspunsurile greșite sunt notate ca „confuzii" și apar în secțiunea Compară; cardurile greșite revin mai repede la repetiție.</p>`));
  return root;
}
function nextQuestion() {
  const z = qz;
  if (z.n >= z.total || (z.ends && Date.now() > z.ends)) { z.over = true; return; }
  if (z.pairPool) {
    const c = pick(z.pairPool);
    z.q = { mode: 'mc', c, opts: shuffle(z.pairPool.map(x => ({ c: x, t: x.a }))), correct: c.a };
  } else {
    let mode = z.v.mode === 'timed' ? 'mc' : z.v.mode;
    if (z.used.size >= z.pool.length) z.used.clear();
    z.q = makeQuestion(mode, z.d, z.pool, z.used);
    if (!z.q) { z.over = true; return; }
  }
  z.answered = false; z.n++;
}
function finishQuiz() {
  setTimeout(flushCloudNow, 0);
  const z = qz, v = z.v, key = z.d.meta.id + ':' + v.mode;
  if (!z.saved) {
    z.saved = true;
    if (!v.pair) S.quiz.best[key] = Math.max(S.quiz.best[key] || 0, z.score);
    if (v.mode === 'timed') S.quiz.timedBest = Math.max(S.quiz.timedBest || 0, z.score);
    if (v.mode !== 'timed' && !v.pair && z.score === z.total && z.total >= 10) { S.quiz.perfect = true; addXP(50); toast('Test perfect! +50 XP', 'medal'); }
    save(); checkBadges();
  }
  const root = el(`<div class="stack" style="--h:${z.d.meta.hue}"></div>`);
  root.appendChild(topbar('Rezultat', { closeIcon: true, onBack: () => { qz = null; back(); } }));
  const totalTxt = v.mode === 'timed' ? 'corecte în 60 de secunde' : `din ${z.total}`;
  root.appendChild(el(`<div class="panel result"><div class="label">${esc({ mc: 'Alegere multiplă', write: 'Răspuns scris', timed: 'Cronometrat', intrus: 'Găsește intrusul', img: 'Recunoaște după imagine' }[v.mode] || 'Test')}${v.pair ? ' · pereche' : ''}</div><div class="num">${z.score}</div><div class="muted">${totalTxt} · +${fmt(S.xp - z.xp0)} XP${!v.pair && S.quiz.best[key] === z.score && z.score > 0 ? ' · record personal' : ''}</div></div>`));
  if (z.wrong.length) {
    const p = el(`<div class="panel stack"><h2 style="font-size:16px">De revăzut</h2><div class="list"></div></div>`);
    const list = $('.list', p);
    z.wrong.slice(0, 12).forEach(w => {
      const li = el(`<div class="li"><div class="t"><b>${esc(shortLabel(w.c))}</b><small>Corect: ${esc(w.correct)}${w.chosen ? ` · ai ales: ${esc(w.chosen)}` : ''}</small></div>${w.other ? `<button class="iconbtn" aria-label="Compară">${ic('swap')}</button>` : ''}</div>`);
      if (w.other) $('button', li).onclick = () => go('cmp', { id: z.d.meta.id, a: w.c.id, b: w.other });
      list.appendChild(li);
    });
    root.appendChild(p);
  }
  const btns = el(`<div class="stack"><button class="btn primary block" data-b="again">${ic('play')}Încă o dată</button><button class="btn block" data-b="other">Alt tip de test</button><button class="btn ghost block" data-b="back">Înapoi la domeniu</button></div>`);
  $('[data-b=again]', btns).onclick = () => { qz = null; const p = { ...v, t: Date.now() }; view = { name: 'quiz', ...p }; try { history.replaceState({ n: 'quiz', p }, ''); } catch (e) { } render(); };
  $('[data-b=other]', btns).onclick = () => { qz = null; const p = { id: v.id, sub: v.sub }; view = { name: 'quiz', ...p }; try { history.replaceState({ n: 'quiz', p }, ''); } catch (e) { } render(); };
  $('[data-b=back]', btns).onclick = () => { qz = null; go('domain', { id: v.id }); };
  root.appendChild(btns);
  return root;
}
function renderQuiz() {
  const z = qz; if (z.over) return finishQuiz();
  const q = z.q, d = z.d, c = q.c, v = z.v;
  const root = el(`<div style="--h:${d.meta.hue}"></div>`);
  root.appendChild(topbar(v.pair ? 'Test pe pereche' : ({ mc: 'Alegere multiplă', write: 'Răspuns scris', timed: 'Cronometrat', intrus: 'Găsește intrusul', img: 'Recunoaște după imagine' }[v.mode]), { closeIcon: true, onBack: () => { qz = null; back(); }, right: z.ends ? `<span class="timer" id="tmr">60</span>` : `<span class="label">${z.n}/${z.total}</span>` }));
  root.appendChild(el(`<div class="sessionbar"><div class="bar"><i style="width:${z.ends ? 100 : Math.round(100 * (z.n - 1) / z.total)}%;background:hsl(var(--h) var(--tab-s) var(--tab-l))" id="qbar"></i></div><span class="pill ok">${z.score} corecte</span></div>`));
  const card = el(`<div class="card" style="min-height:0"><div class="head"><span class="tag"></span><span class="label">${esc(d.meta.title)}${q.mode === 'intrus' ? '' : ' · ' + esc(c.sub)}</span></div><div class="body"></div></div>`);
  flyHost = card;
  const body = $('.body', card);
  if (q.mode === 'img') { const b = el(`<div class="stack"><div class="prompt">${q.brand ? `Ce model ${esc(c.a)} este?` : 'Ce vezi în imagine?'}</div></div>`); const f = imgEl(c); $('figcaption', f).hidden = true; b.appendChild(f); body.appendChild(b); }
  else if (q.mode === 'intrus') body.appendChild(el(`<div class="stack"><div class="prompt">Trei au ceva în comun:</div><div class="qtext">«${esc(q.group.charAt(0).toUpperCase() + q.group.slice(1))}»</div><div class="muted">Care este intrusul?</div></div>`));
  else body.appendChild(frontEl(c, d));
  root.appendChild(card);
  const ctl = el('<div class="reveal stack"></div>'); root.appendChild(ctl);
  const emojiOpts = d.meta.id === 'steaguri' && q.mode === 'intrus';
  const finish = (ok, chosenCard, chosenText) => {
    z.answered = true; tick();
    const dd = day(); if (ok) { dd.ok++; z.score++; } else dd.bad++;
    const xp = ok ? (v.mode === 'timed' ? 5 : q.mode === 'write' ? 15 : 10) : 0; addXP(xp);
    if (!ok) {
      z.wrong.push({ c, correct: q.correct, chosen: chosenText, other: chosenCard && chosenCard.id !== c.id ? chosenCard.id : null });
      if (chosenCard && chosenCard.id !== c.id) recordConfusion(d.meta.id, c.id, chosenCard.id);
      const st = S.cards[c.id]; if (st) st.due = Math.min(st.due, Date.now());
    }
    save();
    const delay = v.mode === 'timed' ? (ok ? 350 : 900) : null;
    if (delay) { timers.push(setTimeout(() => { nextQuestion(); app().replaceChildren(renderQuiz()); }, delay)); return; }
    const res = ok ? 'ok' : 'bad';
    if (q.mode === 'intrus') body.appendChild(el(`<div class="answer ${res}"><div class="a">${esc(q.correct)}</div><p>Aparține de «${esc(q.oddGroup)}», nu de «${esc(q.group)}».</p></div>`));
    else { if (q.mode === 'img') { $$('figcaption', body).forEach(x => x.hidden = false); body.appendChild(answerEl(c, d, true, res)); } else body.appendChild(answerEl(c, d, false, res)); revealMaps(body); }
    markResult(card, res);
    const nbw = el(`<div class="stickyact"><button class="btn primary block">${z.n >= z.total ? 'Vezi rezultatul' : 'Următoarea'}</button></div>`), nb = $('button', nbw);
    nb.onclick = () => { nextQuestion(); app().replaceChildren(renderQuiz()); window.scrollTo(0, 0); };
    ctl.appendChild(nbw); nb.focus({ preventScroll: true });
    revealScroll($('.answer', body));
  };
  if (q.mode === 'write') {
    const f = el(`<form class="stack"><div class="typein"><input id="ans" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Scrie răspunsul" aria-label="Răspunsul tău"><button class="btn primary" type="submit">Verifică</button></div><button type="button" class="btn ghost" data-skip>Nu știu</button></form>`);
    ctl.appendChild(f);
    f.onsubmit = e => {
      e.preventDefault(); if (z.answered) return; const t = $('#ans', f).value.trim(); if (!t) return;
      const r = checkAnswer(c, t); f.remove();
      ctl.appendChild(el(`<div class="verdict ${r === 'bad' ? 'bad' : 'ok'}">${r === 'ok' ? 'Corect!' : r === 'close' ? `Aproape: ai scris „${esc(t)}", corect e „${esc(c.a)}" - îl punctăm` : `Greșit: ai scris „${esc(t)}"`}</div>`));
      finish(r !== 'bad', null, r === 'bad' ? t : null);
    };
    $('[data-skip]', f).onclick = () => { if (z.answered) return; f.remove(); finish(false, null, null); };
    setTimeout(() => { const i = $('#ans', f); i && i.focus(); }, 50);
  } else {
    const opts = el('<div class="opts"></div>');
    q.opts.forEach((o, i) => {
      const b = el(`<button class="opt ${emojiOpts ? 'emoji' : ''}"><span class="k">${'ABCD'[i] || ''}</span><span>${esc(o.t)}</span></button>`);
      b.onclick = () => {
        if (z.answered) return;
        const ok = o.t === q.correct;
        $$('.opt', opts).forEach((x, j) => { if (q.opts[j].t === q.correct) x.classList.add('ok'); });
        if (!ok) b.classList.add('bad');
        finish(ok, o.c, o.t);
      };
      opts.appendChild(b);
    });
    ctl.appendChild(opts);
  }
  if (z.ends) {
    const tmr = $('#tmr', root), bar = $('#qbar', root);
    const upd = () => { const left = Math.max(0, z.ends - Date.now()); tmr.textContent = Math.ceil(left / 1000); tmr.classList.toggle('low', left < 10000); bar.style.width = (left / 600) + '%'; if (!left) { clearTimers(); z.over = true; app().replaceChildren(renderQuiz()); } };
    upd(); timers.push(setInterval(upd, 200));
  }
  return root;
}

// ---------- compară ----------
function shortLabel(c) { return isMapCard(c) ? c.a : (c.q && !isEmoji(c.q) ? (c.q.length > 48 ? c.q.slice(0, 45) + '…' : c.q) : `${c.q} ${c.a}`); }
VIEWS.compare = async v => {
  const d = await deck(v.id);
  const root = el(`<div class="stack" style="--h:${d.meta.hue}"></div>`);
  root.appendChild(topbar(`Compară · ${d.meta.title}`));
  const mine = confList().filter(x => x.k === v.id && d.byId[x.a] && d.byId[x.b]).sort((a, b) => b.n - a.n).slice(0, 10).map(x => [[x.a, x.b], x.n]);
  if (mine.length) {
    const p = el(`<div class="panel stack"><div><h2 style="font-size:16px">Confuziile tale</h2><small class="muted">Perechi pe care le-ai încurcat la teste</small></div><div class="list"></div></div>`);
    mine.forEach(([[a, b], n]) => { const li = el(`<button class="li"><div class="t"><b>${esc(shortLabel(d.byId[a]))} ↔ ${esc(shortLabel(d.byId[b]))}</b><small>încurcate de ${n} ${n === 1 ? 'dată' : 'ori'}</small></div>${ic('chev', 'chev')}</button>`); li.onclick = () => go('cmp', { id: v.id, a, b }); $('.list', p).appendChild(li); });
    root.appendChild(p);
  }
  if (d.pairs.length) {
    const p = el(`<div class="panel stack"><div><h2 style="font-size:16px">Confuzii frecvente</h2><small class="muted">Perechi care se încurcă des, cu trucul de deosebire</small></div><div class="list"></div></div>`);
    d.pairs.forEach(([a, b]) => { if (!d.byId[a] || !d.byId[b]) return; const li = el(`<button class="li"><div class="t"><b>${esc(shortLabel(d.byId[a]))} ↔ ${esc(shortLabel(d.byId[b]))}</b></div>${ic('chev', 'chev')}</button>`); li.onclick = () => go('cmp', { id: v.id, a, b }); $('.list', p).appendChild(li); });
    root.appendChild(p);
  }
  const picker = el(`<div class="panel stack"><div><h2 style="font-size:16px">Compară oricare două</h2><small class="muted">Caută și alege două carduri</small></div><input class="search" id="cmpq" placeholder="Caută…" autocomplete="off"><div class="row" id="chosen" style="flex-wrap:wrap"></div><div class="list" id="res" style="max-height:320px;overflow:auto"></div><button class="btn primary block" id="go" disabled>${ic('swap')}Compară</button></div>`);
  const chosen = [];
  const draw = () => {
    const q = norm($('#cmpq', picker).value);
    const res = $('#res', picker); res.replaceChildren();
    d.cards.filter(c => !q || norm(c.q + ' ' + c.a).includes(q)).slice(0, 40).forEach(c => {
      const li = el(`<button class="li"><div class="t"><b>${esc(shortLabel(c))}</b><small>${esc(c.a)}</small></div>${chosen.includes(c.id) ? ic('check', 'chev') : ''}</button>`);
      li.onclick = () => { const i = chosen.indexOf(c.id); if (i >= 0) chosen.splice(i, 1); else { if (chosen.length >= 2) chosen.shift(); chosen.push(c.id); } draw(); };
      res.appendChild(li);
    });
    $('#chosen', picker).replaceChildren(...chosen.map(id => el(`<span class="pill new">${esc(shortLabel(d.byId[id]))}</span>`)));
    $('#go', picker).disabled = chosen.length !== 2;
  };
  $('#cmpq', picker).oninput = draw; $('#go', picker).onclick = () => go('cmp', { id: v.id, a: chosen[0], b: chosen[1] });
  draw(); root.appendChild(picker);
  return root;
};
VIEWS.cmp = async v => {
  const d = await deck(v.id); const A = d.byId[v.a], B = d.byId[v.b];
  await mapsFor([A, B]);
  const root = el(`<div class="stack" style="--h:${d.meta.hue}"></div>`);
  root.appendChild(topbar('Diferențe'));
  const col = c => {
    const x = el(`<div class="cmpcol"></div>`);
    if (isMapCard(c)) { const m = cardMapEl(c); m.__reveal(); x.appendChild(m); }
    else x.appendChild(el(`<div class="q ${isEmoji(c.q) ? 'emoji' : ''}">${c.flag ? c.flag + ' ' : ''}${esc(c.q)}</div>`));
    x.appendChild(el(`<div class="a">${esc(c.a)}</div>`));
    if (c.d) x.appendChild(el(`<div style="font-size:13px">${esc(c.d)}</div>`));
    return x;
  };
  const cols = el('<div class="cmp"></div>'); cols.append(col(A), col(B)); root.appendChild(cols);
  const pair = d.pairs.find(p => (p[0] === A.id && p[1] === B.id) || (p[0] === B.id && p[1] === A.id));
  if (pair) root.appendChild(el(`<div class="tip">${ic('bulb')}<div><b>Cum le deosebești.</b> ${esc(pair[2])}</div></div>`));
  const keys = [...new Set([...Object.keys(A.f || {}), ...Object.keys(B.f || {})])];
  if (keys.length) {
    const rows = el(`<div class="cmprows"></div>`);
    keys.forEach(k => { const a = (A.f || {})[k] || '-', b = (B.f || {})[k] || '-'; rows.appendChild(el(`<div class="cmprow ${a !== b ? 'diff' : ''}"><div class="k">${esc(k)}</div><div>${esc(a)}</div><div>${esc(b)}</div></div>`)); });
    root.appendChild(el('<div class="label">Atribute · diferențele sunt evidențiate</div>')); root.appendChild(rows);
  }
  const t = el(`<button class="btn primary block">${ic('target')}Testează-mă pe perechea asta</button>`);
  t.onclick = () => go('quiz', { id: v.id, mode: 'mc', pair: [A.id, B.id], t: Date.now() });
  root.appendChild(t);
  return root;
};

// ---------- răsfoiește ----------
VIEWS.browse = async v => {
  const d = await deck(v.id);
  await mapsFor(d.cards);
  const root = el(`<div class="stack" style="--h:${d.meta.hue}"></div>`);
  root.appendChild(topbar(v.sub || d.meta.title));
  const search = el(`<input class="search" placeholder="Caută în ${esc(v.sub || d.meta.title)}…" autocomplete="off" aria-label="Caută">`);
  const list = el('<div class="panel list" style="padding-block:4px"></div>');
  root.append(search, list);
  const cards = d.cards.filter(c => !v.sub || c.sub === v.sub);
  const draw = () => {
    const q = norm(search.value); list.replaceChildren();
    const shown = cards.filter(c => !q || norm(`${c.q} ${c.a} ${c.en || ''}`).includes(q)).slice(0, 250);
    shown.forEach(c => {
      const s = S.cards[c.id];
      const li = el(`<div><button class="li"><div class="t"><b>${c.flag ? c.flag + ' ' : ''}${esc(shortLabel(c))}</b><small>${esc(c.a)}</small></div>${s ? `<span class="pill ${s.s >= 21 ? 'ok' : ''}">${s.s >= 21 ? 'stăpânit' : 'în învățare'}</span>` : ''}${ic('chev', 'chev')}</button></div>`);
      let open = false;
      $('button', li).onclick = () => { open = !open; if (open) { const box = el('<div style="padding:4px 2px 14px" class="stack"></div>'); if (isMapCard(c)) { const m = cardMapEl(c); box.appendChild(m); m.__reveal(); } box.appendChild(answerEl(c, d)); li.appendChild(box); } else li.lastElementChild.remove(); };
      list.appendChild(li);
    });
    if (!shown.length) list.appendChild(el('<div class="li muted">Nimic găsit.</div>'));
  };
  search.oninput = draw; draw();
  return root;
};

// ---------- hartă interactivă ----------
const RO_LAYERS = [['j', 'Județe'], ['c', 'Orașe'], ['r', 'Râuri'], ['p', 'Munți']];
VIEWS.map = async v => {
  const d = await deck(v.id); const kind = d.meta.map; await ensureMaps(kind);
  const isWorld = kind === 'world';
  if (!isWorld) await loadCountyNames();
  const capDeck = isWorld ? await deck('capitale') : null;
  const jd = isWorld ? null : await deck('judete');
  const root = el(`<div class="stack" style="--h:${d.meta.hue}"></div>`);
  root.appendChild(topbar(`Hartă · ${d.meta.title}`));
  let region = v.region || (isWorld ? 'Europa' : null), layer = v.layer || 'j', mode = 'explore', game = null;
  const labelsOn = () => S.settings.mapLabels !== false;
  // --- elemente de interfață ---
  const tabs = el(`<div class="tabs" role="tablist"></div>`);
  const tools = el(`<div class="row" style="gap:8px"><div class="seg" style="flex:1"><button data-m="explore" class="on">Explorează</button><button data-m="find">Găsește</button><button data-m="write">Scrie</button></div><button class="btn" id="lbl" style="min-height:40px;padding:8px 12px" aria-pressed="${labelsOn()}">${ic('pen')}<span>Nume</span></button></div>`);
  const status = el(`<div class="panel mapstatus"></div>`);
  const wrap = el(`<div class="mapwrap big"></div>`);
  const svg = isWorld ? worldSVG() : roSVG(); svg.classList.add('interactive'); wrap.appendChild(svg);
  root.append(tabs, tools, wrap, status);
  // --- ce elemente sunt jucabile pe stratul curent ---
  const items = () => {
    if (isWorld) return Object.keys(WORLD.countries).filter(code => { const c = capDeck.cards.find(x => x.iso === code); return c && (region === 'Toată lumea' || c.sub === region); });
    if (layer === 'j') return Object.keys(ROMANIA.counties);
    if (layer === 'c') return Object.keys(ROMANIA.cities).map(n => 'c:' + n);
    if (layer === 'r') return Object.keys(ROMANIA.rivers).filter(n => jd.cards.some(c => c.rl === 'r:' + n)).map(n => 'r:' + n);
    return Object.keys(ROMANIA.peaks).map(n => 'p:' + n);
  };
  const nameOf = key => {
    if (isWorld) { const c = capDeck.cards.find(x => x.iso === key); return c ? c.q : key; }
    if (/^[rpc]:/.test(key)) return key.slice(2);
    return ROMAP_NAMES[key] || key;
  };
  const cardOf = key => {
    if (isWorld) return { c: capDeck.cards.find(x => x.iso === key), d: capDeck };
    const c = /^[rpc]:/.test(key) ? jd.cards.find(x => x.rl === key) : jd.cards.find(x => x.jud === key && x.sub === 'Reședințe de județ');
    return { c, d: jd };
  };
  const promptWord = () => isWorld ? 'țara' : { j: 'județul', c: 'orașul', r: 'râul', p: 'vârful' }[layer];
  // --- etichete ---
  const labelItems = vb => {
    const hideTarget = game && game.list[game.i] ? [game.list[game.i]] : [];
    if (isWorld) {
      if (mode === 'explore' && labelsOn()) return worldLabelItems(vb, { k: pxScale(svg, vb) });
      return [];
    }
    if (mode === 'explore' && labelsOn()) return roLabelItems(layer);
    return roLabelItems('none', { hide: hideTarget });
  };
  const full = isWorld ? [0, 0, WORLD.w, WORLD.h] : [0, 0, ROMANIA.w, ROMANIA.h];
  const narrow = (window.innerWidth || 400) < 640;
  const vp = viewport(svg, full, vb => drawLabels(svg, vb, labelItems(vb), 11.5), narrow ? (isWorld ? 0.95 : 1.05) : 1.5);
  zoomControls(wrap, vp, () => regionBox());
  const regionBox = () => {
    if (!isWorld || region === 'Toată lumea') return vp.full.slice();
    const b = WORLD.regions[region]; return focusBox(b, vp.full, vp.full[2] / vp.full[3], 1.2, 20); // margine, ca țările de la marginea regiunii să nu stea sub butoanele de zoom
  };
  const clearMarks = () => { $$('.ok,.bad,.sel,.hl,.blink', svg).forEach(p => p.classList.remove('ok', 'bad', 'sel', 'hl', 'blink')); $$('.g-fx .ringhl', svg).forEach(x => x.remove()); };
  const showInfo = key => {
    const { c, d: dd } = cardOf(key);
    const box = el('<div class="stack"></div>');
    box.appendChild(el(`<div class="row" style="align-items:flex-start">${c && c.flag ? `<span class="qflag">${c.flag}</span>` : ''}<div style="font-weight:700;font-size:18px">${esc(nameOf(key))}</div></div>`));
    if (c) { const a = answerEl(c, dd); a.style.borderTop = '0'; a.style.paddingTop = '0'; $('.a', a).remove(); box.appendChild(a); }
    status.replaceChildren(box);
  };
  const idle = () => status.replaceChildren(el(`<div class="muted">Atinge ${isWorld ? 'o țară' : { j: 'un județ', c: 'un oraș', r: 'un râu', p: 'un vârf' }[layer]} pentru detalii. Mărește cu butoanele sau cu două degete.</div>`));
  // --- atingeri ---
  // țările mici (Luxemburg, Malta, Vatican...) și orașele/vârfurile au o zonă de atingere mărită: cel mai apropiat punct în rază de 16 px
  const smallHit = (x, y) => {
    let best = null, bd = 16;
    for (const n of $$('.dot,.ct,.pk', svg)) { if (!n.dataset.c || n.getClientRects().length === 0 || getComputedStyle(n).display === 'none') continue; const r = n.getBoundingClientRect(); const dd = Math.hypot(r.left + r.width / 2 - x, r.top + r.height / 2 - y); if (dd < bd) { bd = dd; best = n; } }
    return best;
  };
  vp.onTap = (target, x, y) => {
    if (x != null) { const near = smallHit(x, y); if (near && (!target || !target.dataset || !target.dataset.c || !target.classList.contains('dot'))) target = near; }
    const key = target && target.dataset ? target.dataset.c : null; if (!key) return;
    if (!isWorld && layer !== 'j' && !key.startsWith(layer + ':')) return;
    if (!isWorld && layer === 'j' && /^[rpc]:/.test(key)) return;
    if (mode === 'explore') { clearMarks(); mark(svg, key, 'sel'); showInfo(key); return; }
    if (mode === 'find' && game && !game.lock) onFind(key);
  };
  // --- modul „Găsește", cu ajutor progresiv ---
  function startGame() {
    game = { list: shuffle(items()).slice(0, 10), i: 0, score: 0, tries: 0, lock: false, first: 0 };
    clearMarks(); vp.set(regionBox()); askNext();
  }
  function onFind(key) {
    const tgt = game.list[game.i];
    if (key === tgt) {
      mark(svg, key, 'ok'); const pts = game.tries === 0 ? 10 : 5; game.score++; if (game.tries === 0) game.first++;
      day().ok++; addXP(pts); tick(); save();
      status.replaceChildren(el(`<div class="verdict ok">Corect: ${esc(nameOf(key))}${game.tries >= 99 ? ' (cu ajutor)' : game.tries ? ` (din ${game.tries + 1} încercări)` : ''}</div>`));
      game.lock = true; timers.push(setTimeout(() => { game.lock = false; game.i++; game.tries = 0; clearMarks(); askNext(); }, 800));
      return;
    }
    game.tries++; mark(svg, key, 'bad'); day().bad++; tick();
    const pre = isWorld ? 'loc-' : { j: 'jud-map-', c: 'jud-city-', r: 'jud-riv-', p: 'jud-pk-' }[layer];
    const idOf = k => { const c = isWorld ? d.cards.find(x => x.iso === k) : cardOf(k).c; return c && c.id; };
    if (!isWorld && layer === 'j') { const a = 'jud-map-' + tgt.toLowerCase(), b = 'jud-map-' + key.toLowerCase(); recordConfusion(jd.meta.id, a, b); }
    else { const a = idOf(tgt), b = idOf(key); if (a && b) recordConfusion((isWorld ? d : jd).meta.id, a, b); }
    save();
    if (game.tries >= 1) { // greșit: roșu unde a atins, iar ținta corectă clipește (și e adusă în vedere)
      mark(svg, tgt, 'blink');
      if (isWorld && WORLD.countries[tgt]) {
        const c = WORLD.countries[tgt], v = vp.vb, inView = c.c[0] > v[0] && c.c[0] < v[0] + v[2] && c.c[1] > v[1] && c.c[1] < v[1] + v[3];
        if (!inView) vp.set(regionBox()); if (c.a < 40) { $$('.ringhl', svg).forEach(x => x.remove()); ringAt(svg, c.c[0], c.c[1]); vp.set(vp.vb); }
      }
      status.replaceChildren(el(`<div class="verdict bad">Ai atins ${esc(nameOf(key))}. Uite unde este ${esc(nameOf(tgt))}: atinge locul care clipește ca să continui.</div>`));
      game.tries = 99; // următoarea atingere corectă trece mai departe, fără puncte suplimentare
      return;
    }
    timers.push(setTimeout(() => $$('.bad', svg).forEach(p => p.classList.remove('bad')), 900));
    status.replaceChildren(el(`<div class="row"><div class="spacer"><div class="verdict bad" style="padding:6px 10px">Acolo e ${esc(nameOf(key))}</div><div class="maptarget" style="margin-top:6px">Caută ${esc(promptWord())}: ${esc(nameOf(tgt))}</div></div><span class="pill">încercarea ${game.tries + 1}/3</span></div>`));
  }
  function askNext() {
    if (!game) return;
    if (game.i >= game.list.length) return finishGame();
    status.replaceChildren(el(`<div class="row"><div class="spacer"><div class="label">Atinge pe hartă · ${game.i + 1}/${game.list.length}</div><div class="maptarget">${esc(nameOf(game.list[game.i]))}</div></div><span class="pill ok">${game.score} găsite</span></div>`));
  }
  function finishGame() {
    const perfect = game.first === game.list.length && game.list.length >= 10;
    if (perfect) { S.quiz.mapPerfect = true; addXP(50); }
    save(); checkBadges();
    status.replaceChildren(el(`<div class="stack"><div style="font-weight:700;font-size:17px">${game.first} din ${game.list.length} din prima încercare${perfect ? ' · perfect!' : ''}</div><button class="btn primary">${ic('play')}Încă o rundă</button></div>`));
    $('button', status).onclick = mode === 'write' ? startWrite : startGame;
  }
  // --- modul „Scrie numele" ---
  function startWrite() {
    game = { list: shuffle(items()).slice(0, 10), i: 0, score: 0, first: 0, tries: 0 };
    nextWrite();
  }
  function nextWrite() {
    clearMarks();
    if (game.i >= game.list.length) return finishGame();
    const key = game.list[game.i]; mark(svg, key, 'hl');
    // încadrează ținta
    if (isWorld) { const c = WORLD.countries[key]; vp.set(focusBox(c.b, vp.full, vp.full[2] / vp.full[3], 4, 60)); } else vp.set(vp.full);
    $$('.g-fx', svg).forEach(g => g.replaceChildren());
    if (isWorld && WORLD.countries[key].a < 40) ringAt(svg, WORLD.countries[key].c[0], WORLD.countries[key].c[1]);
    if (!isWorld && (layer === 'c' || layer === 'p')) { const p = layer === 'c' ? ROMANIA.cities[key.slice(2)] : ROMANIA.peaks[key.slice(2)].p; ringAt(svg, p[0], p[1]); }
    vp.set(vp.vb);
    const f = el(`<form class="stack"><div class="label">Cum se numește ${esc(promptWord())} evidențiat${['țara'].includes(promptWord()) ? 'ă' : ''}? · ${game.i + 1}/${game.list.length}</div><div class="typein"><input id="mapans" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Scrie numele" aria-label="Numele"><button class="btn primary" type="submit">Verifică</button></div><button type="button" class="btn ghost" data-skip>Nu știu</button></form>`);
    status.replaceChildren(f);
    const solve = (t) => {
      const name = nameOf(key); const fake = { k: isWorld ? 'localizare' : 'judete', a: name, alt: isWorld ? [(capDeck.cards.find(x => x.iso === key) || {}).en?.split(' - ')[0]].filter(Boolean) : [] };
      const r = t ? checkAnswer(fake, t) : 'bad';
      if (r !== 'bad') { game.score++; game.first++; day().ok++; addXP(15); mark(svg, key, 'ok'); } else { day().bad++; }
      tick(); save();
      status.replaceChildren(el(`<div class="stack"><div class="verdict ${r === 'bad' ? 'bad' : 'ok'}">${r === 'ok' ? 'Corect' : r === 'close' ? `Aproape: ai scris „${esc(t)}", corect e` : 'Răspuns corect'}: ${esc(name)}</div><button class="btn primary">${game.i + 1 >= game.list.length ? 'Vezi rezultatul' : 'Următorul'}</button></div>`));
      $('button', status).onclick = () => { game.i++; nextWrite(); };
    };
    f.onsubmit = e => { e.preventDefault(); const t = $('#mapans', f).value.trim(); if (t) solve(t); };
    $('[data-skip]', f).onclick = () => solve('');
  }
  // --- comutatoare ---
  const setMode = m => {
    mode = m; game = null; clearMarks(); $$('.g-fx', svg).forEach(g => g.replaceChildren());
    $$('[data-m]', tools).forEach(x => x.classList.toggle('on', x.dataset.m === m));
    $('#lbl', tools).hidden = m !== 'explore';
    if (m === 'find') startGame(); else if (m === 'write') startWrite(); else { vp.set(regionBox()); idle(); }
  };
  $$('[data-m]', tools).forEach(b => b.onclick = () => setMode(b.dataset.m));
  const lblBtn = $('#lbl', tools);
  const syncLbl = () => { lblBtn.setAttribute('aria-pressed', labelsOn()); lblBtn.classList.toggle('primary', labelsOn()); };
  lblBtn.onclick = () => { S.settings.mapLabels = !labelsOn(); touchSettings(); syncLbl(); vp.set(vp.vb); };
  syncLbl();
  const tabList = isWorld ? ['Toată lumea', ...Object.keys(WORLD.regions)] : RO_LAYERS.map(x => x[1]);
  tabList.forEach((t, i) => {
    const b = el(`<button role="tab">${esc(t)}</button>`);
    b.onclick = () => {
      if (isWorld) region = t; else { layer = RO_LAYERS[i][0]; svg.dataset.layer = layer; }
      $$('button', tabs).forEach(x => x.classList.toggle('on', x === b));
      setMode(mode);
    };
    if ((isWorld && t === region) || (!isWorld && RO_LAYERS[i][0] === layer)) b.classList.add('on');
    tabs.appendChild(b);
  });
  if (!isWorld) svg.dataset.layer = layer;
  vp.set(regionBox(), true);
  requestAnimationFrame(() => vp.set(regionBox()));
  idle();
  return root;
};

// ---------- lecția de început ----------
let INTRO = null;
async function intro(k) { if (!INTRO) INTRO = await getJSON('data/intro.json'); return INTRO[k]; }
function introOffer(d, L) {
  const m = d.meta;
  const root = el(`<div class="stack" style="--h:${m.hue}"></div>`);
  root.appendChild(topbar(m.title));
  root.appendChild(el(`<div class="panel stack introhero"><span class="ic big" style="--h:${m.hue}">${ic(m.icon)}</span><div class="label">Prima dată aici</div><h2 style="font-size:22px">Introducere în ${esc(m.title)}</h2><p style="margin:0">${esc(L.hook)}</p>
    <div class="muted" style="font-size:13px">${L.slides.length} ecrane scurte · un joc de potrivire · un mini-test · aproximativ 5 minute</div></div>`));
  const b = el(`<div class="stack"><button class="btn primary block" data-b="go">${ic('play')}Începe lecția</button><button class="btn block" data-b="place">${ic('target')}Știu deja ceva - dă-mi testul de plasare</button><button class="btn ghost block" data-b="skip">Sari peste</button></div>`);
  root.appendChild(b);
  const mark = st => { S.intro = S.intro || {}; S.intro[m.id] = { [st]: todayKey() }; save(); };
  $('[data-b=go]', b).onclick = () => go('intro', { id: m.id });
  $('[data-b=place]', b).onclick = () => { mark('skipped'); go('place', { id: m.id }); };
  $('[data-b=skip]', b).onclick = () => { mark('skipped'); render(); };
  return root;
}
VIEWS.intro = async v => {
  const d = await deck(v.id), m = d.meta, L = await intro(v.id);
  const terms = L.slides.flatMap(s => s.terms);
  const steps = [...L.slides.map((s, i) => ({ t: 'slide', s, i })), { t: 'match' }, { t: 'quiz' }, { t: 'done' }];
  let i = 0, quizScore = 0;
  const root = el(`<div style="--h:${m.hue}"></div>`);
  const body = el('<div class="stack"></div>');
  root.append(topbar(`Introducere · ${m.title}`, { closeIcon: true, right: '<span class="label" id="stp"></span>' }), el('<div class="sessionbar"><div class="bar"><i id="ibar" style="background:hsl(var(--h) var(--tab-s) var(--tab-l))"></i></div></div>'), body);
  const next = () => { i++; draw(); };
  function draw() {
    const st = steps[i]; window.scrollTo(0, 0);
    $('#stp', root).textContent = `${Math.min(i + 1, steps.length - 1)}/${steps.length - 1}`;
    $('#ibar', root).style.width = Math.round(100 * i / (steps.length - 1)) + '%';
    body.replaceChildren();
    if (st.t === 'slide') {
      const c = el(`<div class="card"><div class="head"><span class="tag"></span><span class="label">${st.i + 1} din ${L.slides.length}</span></div><div class="body"><h2 style="font-size:20px">${esc(st.s.h)}</h2><p style="margin:0">${esc(st.s.p)}</p><dl class="terms">${st.s.terms.map(([a, b]) => `<dt>${esc(a)}</dt><dd>${esc(b)}</dd>`).join('')}</dl></div></div>`);
      const b = el(`<button class="btn primary block reveal">${i === L.slides.length - 1 ? 'Joc: potrivește perechile' : 'Mai departe'}</button>`);
      b.onclick = next; body.append(c, b); tick();
    } else if (st.t === 'match') {
      const pairs = shuffle(terms).slice(0, 6);
      const left = shuffle(pairs), right = shuffle(pairs);
      let sel = null, left2 = pairs.length;
      const g = el(`<div class="stack"><div><h2 style="font-size:18px">Potrivește perechile</h2><p class="muted" style="margin:0;font-size:13px">Atinge un termen, apoi explicația lui.</p></div><div class="match"><div class="mcol" id="ml"></div><div class="mcol" id="mr"></div></div></div>`);
      left.forEach(([a, b]) => { const x = el(`<button class="mitem term">${esc(a)}</button>`); x.dataset.k = a; x.onclick = () => { if (x.disabled) return; $$('.mitem.term', g).forEach(y => y.classList.remove('on')); x.classList.add('on'); sel = x; }; $('#ml', g).appendChild(x); });
      right.forEach(([a, b]) => { const x = el(`<button class="mitem">${esc(b)}</button>`); x.dataset.k = a; x.onclick = () => {
        if (!sel || x.disabled) return;
        if (sel.dataset.k === x.dataset.k) { [sel, x].forEach(y => { y.classList.remove('on'); y.classList.add('done'); y.disabled = true; }); sel = null; left2--; addXP(2); tick(); if (!left2) setTimeout(next, 600); }
        else { x.classList.add('bad'); sel.classList.add('bad'); const s0 = sel; setTimeout(() => { x.classList.remove('bad'); s0.classList.remove('bad'); }, 500); }
      }; $('#mr', g).appendChild(x); });
      body.appendChild(g);
    } else if (st.t === 'quiz') {
      const qs = shuffle(terms).slice(0, Math.min(5, terms.length)); let qi = 0;
      const ask = () => {
        if (qi >= qs.length) return next();
        const [a, b] = qs[qi];
        const opts = shuffle([a, ...shuffle(terms.filter(x => x[0] !== a)).slice(0, 3).map(x => x[0])]);
        body.replaceChildren(el(`<div class="card" style="min-height:0"><div class="head"><span class="tag"></span><span class="label">Mini-test · ${qi + 1}/${qs.length}</span></div><div class="body"><div class="prompt">Ce termen se potrivește?</div><div class="qtext" style="font-size:19px">${esc(b)}</div></div></div>`));
        const o = el('<div class="opts reveal"></div>');
        opts.forEach(x => { const btn = el(`<button class="opt">${esc(x)}</button>`); btn.onclick = () => {
          if (o.dataset.done) return; o.dataset.done = 1; tick();
          $$('.opt', o).forEach(y => { if (y.textContent === a) y.classList.add('ok'); });
          if (x === a) { quizScore++; addXP(4); } else btn.classList.add('bad');
          const nb = el(`<button class="btn primary block" style="margin-top:10px">${qi + 1 >= qs.length ? 'Gata' : 'Următoarea'}</button>`); nb.onclick = () => { qi++; ask(); }; o.after(nb);
        }; o.appendChild(btn); });
        body.appendChild(o);
      };
      ask();
    } else {
      S.intro = S.intro || {}; const first = !(S.intro[m.id] && S.intro[m.id].done); S.intro[m.id] = { done: todayKey(), score: quizScore }; if (first) addXP(30); save(); checkBadges();
      const placed = S.placed && S.placed[m.id];
      body.appendChild(el(`<div class="panel result"><div class="medal-big" style="--h:${m.hue}">${ic('grad')}</div><div class="label">Introducere terminată</div><h2 style="font-size:22px;margin-top:6px">Ai făcut primul pas în ${esc(m.title)}</h2><div class="muted" style="margin-top:6px">Mini-test: ${quizScore} din ${Math.min(5, terms.length)}${first ? ' · +30 XP bonus' : ''}</div></div>`));
      const b = el(`<div class="stack">${placed ? '' : `<button class="btn primary block" data-b="place">${ic('target')}Test de plasare (2-3 minute)</button><p class="muted" style="margin:0;font-size:13px;text-align:center">Marchează ce știi deja, ca să nu pierzi timp cu cardurile ușoare.</p>`}<button class="btn ${placed ? 'primary' : ''} block" data-b="learn">${ic('play')}Începe să înveți</button><button class="btn ghost block" data-b="dom">Mergi la domeniu</button></div>`);
      if (!placed) $('[data-b=place]', b).onclick = () => go('place', { id: m.id });
      $('[data-b=learn]', b).onclick = () => go('learn', { mode: 'domain', id: m.id, t: Date.now() });
      $('[data-b=dom]', b).onclick = () => go('domain', { id: m.id });
      body.appendChild(b);
    }
  }
  draw();
  return root;
};

// ---------- testul de plasare ----------
VIEWS.place = async v => {
  const d = await deck(v.id), m = d.meta;
  await mapsFor(d.cards);
  const bySub = {}; d.cards.filter(c => !S.cards[c.id]).forEach(c => (bySub[c.sub] = bySub[c.sub] || []).push(c));
  const subs = Object.keys(bySub).filter(s => bySub[s].length >= 3);
  const N = Math.min(20, subs.length * 3);
  const qs = []; const pools = Object.fromEntries(subs.map(s => [s, shuffle(bySub[s])]));
  for (let r = 0; qs.length < N && r < 6; r++) for (const s of shuffle(subs)) { if (qs.length >= N) break; const c = pools[s].shift(); if (c) qs.push(c); }
  const res = {}; let qi = 0, okN = 0;
  const root = el(`<div style="--h:${m.hue}"></div>`);
  const body = el('<div class="stack"></div>');
  root.append(topbar(`Test de plasare · ${m.title}`, { closeIcon: true, right: '<span class="label" id="pq"></span>' }), el('<div class="sessionbar"><div class="bar"><i id="pbar" style="background:hsl(var(--h) var(--tab-s) var(--tab-l))"></i></div><span class="pill ok" id="pok">0 știute</span></div>'), body);
  const markKnown = c => { const now = Date.now(); const n = schedule(null, 4, now); n.due = now + Math.round((7 + Math.random() * 23) * DAY); n.k = c.k; S.cards[c.id] = n; };
  function ask() {
    $('#pq', root).textContent = `${Math.min(qi + 1, qs.length)}/${qs.length}`; $('#pbar', root).style.width = Math.round(100 * qi / Math.max(1, qs.length)) + '%';
    if (qi >= qs.length) return finish();
    const c = qs[qi]; const ds = distractors(d, c, 3); const opts = shuffle([c, ...ds]);
    const card = el(`<div class="card" style="min-height:0"><div class="head"><span class="tag"></span><span class="label">${esc(c.sub)}</span></div><div class="body"></div></div>`);
    $('.body', card).appendChild(frontEl(c, d));
    const o = el('<div class="opts reveal"></div>');
    opts.forEach(x => { const btn = el(`<button class="opt">${esc(x.a)}</button>`); btn.onclick = () => {
      if (o.dataset.done) return; o.dataset.done = 1; tick();
      const ok = x.id === c.id; (res[c.sub] = res[c.sub] || { n: 0, ok: 0 }).n++;
      $$('.opt', o).forEach((y, j) => { if (opts[j].id === c.id) y.classList.add('ok'); });
      if (ok) { res[c.sub].ok++; okN++; markKnown(c); addXP(3); $('#pok', root).textContent = `${okN} știute`; } else btn.classList.add('bad');
      save(); setTimeout(() => { qi++; ask(); }, ok ? 450 : 1100);
    }; o.appendChild(btn); });
    const dk = el(`<button class="btn ghost block" style="margin-top:8px">Nu știu</button>`);
    dk.onclick = () => { if (o.dataset.done) return; o.dataset.done = 1; (res[c.sub] = res[c.sub] || { n: 0, ok: 0 }).n++; qi++; ask(); };
    body.replaceChildren(card, o, dk); window.scrollTo(0, 0);
  }
  function finish() {
    S.placed = S.placed || {}; S.placed[m.id] = todayKey(); save(); checkBadges();
    const strong = Object.entries(res).filter(([s, r]) => r.n >= 2 && r.ok === r.n).map(([s]) => s);
    body.replaceChildren(el(`<div class="panel result"><div class="label">Test de plasare</div><div class="num">${okN}<span style="font-size:22px;color:var(--muted)">/${qs.length}</span></div><div class="muted">${okN ? `${okN} carduri marcate ca știute - le vei revedea abia peste 1-4 săptămâni` : 'Pornești de la zero - perfect, totul e nou'}</div></div>`));
    if (strong.length) {
      const p = el(`<div class="panel stack"><div><h2 style="font-size:16px">Ai răspuns perfect la aceste subcategorii</h2><small class="muted">Bifează-le pe cele pe care chiar le știi bine. Cardurile lor nu vor mai apărea ca noi.</small></div><div class="list"></div><button class="btn primary block" id="apply" disabled>Marchează ca știute</button></div>`);
      strong.forEach(s => { const rest = d.cards.filter(c => c.sub === s && !S.cards[c.id]).length; if (!rest) return; const li = el(`<label class="li switch"><span><b>${esc(s)}</b><br><small class="muted">încă ${rest} carduri</small></span><input type="checkbox" data-s="${esc(s)}"></label>`); $('.list', p).appendChild(li); });
      const ap = $('#apply', p);
      p.addEventListener('change', () => { ap.disabled = !$$('input:checked', p).length; });
      ap.onclick = () => { let n = 0; $$('input:checked', p).forEach(x => d.cards.filter(c => c.sub === x.dataset.s && !S.cards[c.id]).forEach(c => { markKnown(c); n++; })); save(); toast(`${n} carduri marcate ca știute`, 'check'); p.remove(); };
      if ($('.list', p).children.length) body.appendChild(p);
    }
    const b = el(`<div class="stack"><button class="btn primary block" data-b="learn">${ic('play')}Începe să înveți</button><button class="btn ghost block" data-b="dom">Mergi la domeniu</button></div>`);
    $('[data-b=learn]', b).onclick = () => go('learn', { mode: 'domain', id: m.id, t: Date.now() });
    $('[data-b=dom]', b).onclick = () => go('domain', { id: m.id });
    body.appendChild(b);
  }
  if (!qs.length) { body.appendChild(el('<div class="panel">Ai început deja aproape toate cardurile din acest domeniu - testul de plasare nu mai e necesar.</div>')); return root; }
  ask();
  return root;
};

// ---------- amestec între domenii ----------
VIEWS.mix = async () => {
  const st = deckStats();
  const started = INDEX.domains.filter(d => st[d.id].seen > 0).map(d => d.id);
  let sel = new Set((S.settings.mixKs || []).filter(k => meta(k)));
  if (!sel.size) sel = new Set(started.length >= 2 ? started : INDEX.domains.slice(0, 4).map(d => d.id));
  const root = el('<div class="stack"></div>');
  root.appendChild(topbar('Amestec'));
  root.appendChild(el(`<p class="muted" style="margin:0">Alege domeniile. Cardurile de repetat și cele noi se intercalează, câte unul din fiecare domeniu.</p>`));
  const grid = el('<div class="chips"></div>');
  const startBtn = el(`<button class="btn primary block">${ic('play')}Pornește amestecul</button>`);
  const draw = () => {
    grid.replaceChildren(...INDEX.domains.map(d => { const b = el(`<button class="chip ${sel.has(d.id) ? 'on' : ''}" style="--h:${d.hue}" aria-pressed="${sel.has(d.id)}">${ic(d.icon)}<span>${esc(d.title)}</span>${st[d.id].due ? `<small>${st[d.id].due}</small>` : ''}</button>`); b.onclick = () => { sel.has(d.id) ? sel.delete(d.id) : sel.add(d.id); draw(); }; return b; }));
    startBtn.disabled = sel.size < 2; startBtn.lastChild.textContent = sel.size < 2 ? 'Alege cel puțin 2 domenii' : `Pornește amestecul (${sel.size} domenii)`;
  };
  draw();
  root.append(grid, startBtn);
  startBtn.onclick = () => { S.settings.mixKs = [...sel]; touchSettings(); go('learn', { mode: 'mix', ks: [...sel], t: Date.now() }); };
  return root;
};

// ---------- prognoza de reținere ----------
function retention(filterK) {
  const now = Date.now(); let nowSum = 0, futSum = 0, seen = 0;
  for (const c of Object.values(S.cards)) {
    if (filterK && c.k !== filterK) continue; if (!c.s || !c.last) continue;
    const t = Math.max(0, (now - c.last) / DAY); seen++;
    nowSum += retr(t, c.s); futSum += retr(t + 30, c.s);
  }
  return { seen, now: nowSum, in30: futSum };
}
function retentionPanel(filterK, total) {
  const r = retention(filterK);
  if (!r.seen) return el(`<div class="panel stack"><h2 style="font-size:16px">Prognoză de reținere</h2><p class="muted" style="margin:0;font-size:13px">Apare după primele carduri învățate. Îți arată cât îți amintești acum și cât ai uita în 30 de zile fără repetare.</p></div>`);
  const pNow = Math.round(100 * r.now / total), p30 = Math.round(100 * r.in30 / total);
  return el(`<div class="panel stack"><div><h2 style="font-size:16px">Prognoză de reținere</h2><small class="muted">Estimare din algoritmul de repetiție, pentru ${filterK ? 'acest domeniu' : 'toate domeniile'}</small></div>
    <div class="ret"><div class="retrow"><span>Știi acum</span><span class="bar"><i style="width:${pNow}%;background:var(--ok)"></i></span><b class="num">${pNow}%</b></div>
    <div class="retrow"><span>Peste 30 de zile, fără repetare</span><span class="bar"><i style="width:${p30}%;background:var(--warn)"></i></span><b class="num">${p30}%</b></div></div>
    <p class="muted" style="margin:0;font-size:13px">Adică aproximativ ${fmt(r.now)} din ${fmt(total)} carduri acum și ${fmt(r.in30)} peste o lună. Repetările zilnice țin cifra de jos aproape de cea de sus.</p></div>`);
}

// ---------- calendar de activitate ----------
function activityCalendar(weeks = 18) {
  const today = new Date(todayKey() + 'T12:00:00'); const dow = (today.getDay() + 6) % 7; // luni = 0
  const start = today.getTime() - (dow + (weeks - 1) * 7) * DAY;
  const cs = 13, gap = 3, left = 22, top = 16, W = left + weeks * (cs + gap), H = top + 7 * (cs + gap);
  const goal = S.settings.goalMin * 60000; let s = `<svg class="cal" viewBox="0 0 ${W} ${H}" role="img" aria-label="Calendarul activității pe ultimele ${weeks} săptămâni">`;
  ['L', '', 'M', '', 'V', '', 'D'].forEach((l, i) => { if (l) s += `<text x="0" y="${top + i * (cs + gap) + cs - 2}">${l}</text>`; });
  let lastMonth = -1;
  for (let w = 0; w < weeks; w++) for (let d = 0; d < 7; d++) {
    const t = start + (w * 7 + d) * DAY; if (t > today.getTime()) continue;
    const k = todayKey(t), dd = S.days[k], ms = dd ? dd.ms : 0;
    const m = new Date(t).getMonth(); if (d === 0 && m !== lastMonth) { s += `<text x="${left + w * (cs + gap)}" y="10">${new Date(t).toLocaleDateString('ro-RO', { month: 'short' }).replace('.', '')}</text>`; lastMonth = m; }
    const lvl = dd && dd.frozen && !ms ? 'f' : !ms ? 0 : ms < goal * 0.25 ? 1 : ms < goal * 0.6 ? 2 : ms < goal ? 3 : 4;
    const mins = Math.round(ms / 60000);
    s += `<rect class="c${lvl}${k === todayKey() ? ' today' : ''}" x="${left + w * (cs + gap)}" y="${top + d * (cs + gap)}" width="${cs}" height="${cs}" rx="3"><title>${new Date(t).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long' })}: ${lvl === 'f' ? 'zi protejată' : mins + ' min'}</title></rect>`;
  }
  return s + '</svg>';
}

// ---------- statistici ----------
function barChart(values, labels, opts = {}) {
  const W = 320, H = 130, pl = 24, pb = 18, pt = 8, n = values.length, max = Math.max(opts.goal || 0, ...values, 1);
  const nice = max <= 10 ? Math.ceil(max) : Math.ceil(max / 5) * 5;
  const bw = (W - pl) / n; const y = v => pt + (H - pt - pb) * (1 - v / nice);
  let s = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(opts.aria || 'Grafic')}">`;
  [0, nice / 2, nice].forEach(t => { s += `<line class="g" x1="${pl}" x2="${W}" y1="${y(t)}" y2="${y(t)}"/><text x="${pl - 4}" y="${y(t) + 3}" text-anchor="end">${Math.round(t)}</text>`; });
  values.forEach((v, i) => { const h = Math.max(v > 0 ? 1.5 : 0, (H - pt - pb) - (y(v) - pt)); s += `<rect class="b ${i === n - 1 && opts.todayLast ? 'today' : ''}" x="${(pl + i * bw + bw * 0.18).toFixed(1)}" y="${(H - pb - h).toFixed(1)}" width="${(bw * 0.64).toFixed(1)}" height="${h.toFixed(1)}" rx="1.5"><title>${esc(labels[i])}: ${v}</title></rect>`; });
  if (opts.goal) s += `<line class="goal" x1="${pl}" x2="${W}" y1="${y(opts.goal)}" y2="${y(opts.goal)}"/>`;
  labels.forEach((l, i) => { if (opts.every && i % opts.every && i !== n - 1) return; s += `<text x="${(pl + i * bw + bw / 2).toFixed(1)}" y="${H - 5}" text-anchor="middle">${esc(l)}</text>`; });
  return s + '</svg>';
}
async function weakCards(filterK) {
  const list = Object.entries(S.cards).filter(([, c]) => (!filterK || c.k === filterK) && (c.lapses > 0 || c.s < 2)).sort((a, b) => (b[1].lapses - a[1].lapses) || (a[1].s - b[1].s)).slice(0, 8);
  await Promise.all([...new Set(list.map(([, c]) => c.k))].map(deck));
  return list.map(([id, c]) => ({ st: c, c: DECKS[c.k] && DECKS[c.k].byId[id] })).filter(x => x.c);
}
VIEWS.stats = async () => {
  const st = deckStats(); const L = level(S.xp);
  const keys = Array.from({ length: 30 }, (_, i) => todayKey(Date.now() - (29 - i) * DAY));
  const mins = keys.map(k => Math.round(((S.days[k] || {}).ms || 0) / 60000));
  const labels = keys.map(k => k.slice(8));
  const tot = Object.values(S.days).reduce((a, d) => ({ rev: a.rev + d.rev, ok: a.ok + d.ok, bad: a.bad + d.bad, ms: a.ms + d.ms }), { rev: 0, ok: 0, bad: 0, ms: 0 });
  const seen = Object.keys(S.cards).length, mastered = Object.values(S.cards).filter(c => c.s >= 21).length;
  const root = el('<div class="stack"></div>');
  root.appendChild(topbar('Statistici', { noBack: true }));
  root.appendChild(el(`<div class="strip">
    <div class="chipstat"><span class="label">Serie</span><span class="v">${ic('flame', 'flame')}${streakNow()}<span class="frz">${ic('shield')}${S.streak.freezes || 0}</span></span><small class="muted">record ${S.streak.best}</small></div>
    <div class="chipstat"><span class="label">Nivel ${L.n}</span><span class="v">${ic('bolt', 'bolt')}${fmt(S.xp)}</span><span class="bar" style="--h:45"><i style="width:${Math.round(100 * L.into / L.need)}%"></i></span></div>
    <div class="chipstat"><span class="label">Timp total</span><span class="v">${Math.round(tot.ms / 3600000 * 10) / 10}<small style="font-size:12px;font-family:var(--f-body);color:var(--muted)">ore</small></span></div></div>`));
  const totalCards = INDEX.domains.reduce((a, d) => a + d.count, 0);
  root.appendChild(el(`<div class="panel stack"><div class="row"><h2 style="font-size:16px">Calendar de activitate</h2><div class="spacer"></div><span class="label">ultimele 18 săptămâni</span></div><div class="calwrap">${activityCalendar(18)}</div>
    <div class="callegend"><span>mai puțin</span><i class="c0"></i><i class="c1"></i><i class="c2"></i><i class="c3"></i><i class="c4"></i><span>obiectiv atins</span><i class="cf"></i><span>zi protejată</span></div>
    <div class="note" style="display:flex;gap:8px;align-items:flex-start">${ic('shield')}<span>Ai <b>${S.streak.freezes || 0}</b> ${(S.streak.freezes || 0) === 1 ? 'protecție' : 'protecții'} de serie (maximum ${MAX_FREEZE}). Dacă ratezi o zi, o protecție îți păstrează seria automat. Primești una nouă la fiecare 7 zile de serie.</span></div></div>`));
  root.appendChild(retentionPanel(null, totalCards));
  root.appendChild(el(`<div class="panel stack"><div class="row"><h2 style="font-size:16px">Minute pe zi</h2><div class="spacer"></div><span class="label">ultimele 30 de zile · linia = obiectiv</span></div>${barChart(mins, labels, { goal: S.settings.goalMin, todayLast: true, every: 5, aria: 'Minute de studiu pe zi în ultimele 30 de zile' })}</div>`));
  root.appendChild(el(`<div class="kv">
    <div class="chipstat"><span class="label">Carduri începute</span><span class="v">${fmt(seen)}</span></div>
    <div class="chipstat"><span class="label">Stăpânite (21+ zile)</span><span class="v">${fmt(mastered)}</span></div>
    <div class="chipstat"><span class="label">Răspunsuri</span><span class="v">${fmt(tot.ok + tot.bad)}</span></div>
    <div class="chipstat"><span class="label">Rată de reușită</span><span class="v">${tot.ok + tot.bad ? Math.round(100 * tot.ok / (tot.ok + tot.bad)) : 0}%</span></div></div>`));
  const dl = el(`<div class="panel stack"><h2 style="font-size:16px">Progres pe domenii</h2><div class="list"></div></div>`);
  INDEX.domains.slice().sort((a, b) => st[b.id].pct - st[a.id].pct || st[b.id].seen - st[a.id].seen).forEach(d => {
    const o = st[d.id]; const li = el(`<button class="li" style="--h:${d.hue}"><div class="t"><b>${esc(d.title)}</b><small>${o.seen}/${d.count} începute · ${o.mastered} stăpânite${o.due ? ` · ${o.due} de repetat` : ''}</small><div class="bar" style="margin-top:6px"><i style="width:${o.pct}%"></i></div></div><span class="num" style="font-size:14px">${o.pct}%</span></button>`);
    li.onclick = () => go('dstats', { id: d.id }); $('.list', dl).appendChild(li);
  });
  root.appendChild(dl);
  const weak = await weakCards();
  const wp = el(`<div class="panel stack"><div><h2 style="font-size:16px">Puncte slabe</h2><small class="muted">Cardurile greșite cel mai des</small></div><div class="list"></div></div>`);
  if (!weak.length) $('.list', wp).appendChild(el('<div class="muted" style="font-size:13px">Încă nimic aici. Pe măsură ce înveți, aici apar cardurile care îți dau bătăi de cap.</div>'));
  weak.forEach(({ c, st: s }) => { const li = el(`<button class="li"><div class="t"><b>${c.flag ? c.flag + ' ' : ''}${esc(shortLabel(c))}</b><small>${esc(meta(c.k).title)} · ${esc(c.a)} · greșit de ${s.lapses} ori</small></div>${ic('chev', 'chev')}</button>`); li.onclick = () => go('browse', { id: c.k, sub: c.sub }); $('.list', wp).appendChild(li); });
  root.appendChild(wp);
  const conf = confList().sort((a, b) => b.n - a.n).slice(0, 6);
  if (conf.length) {
    await Promise.all([...new Set(conf.map(x => x.k))].filter(k => meta(k)).map(deck));
    const cp = el(`<div class="panel stack"><div><h2 style="font-size:16px">Confuzii frecvente</h2><small class="muted">Perechi pe care le-ai încurcat</small></div><div class="list"></div></div>`);
    for (const { k, a, b, n } of conf) {
      const d = DECKS[k]; if (!d || !d.byId[a] || !d.byId[b]) continue;
      const li = el(`<button class="li"><div class="t"><b>${esc(shortLabel(d.byId[a]))} ↔ ${esc(shortLabel(d.byId[b]))}</b><small>${esc(d.meta.title)} · ${n} ${n === 1 ? 'dată' : 'ori'}</small></div>${ic('chev', 'chev')}</button>`);
      li.onclick = () => go('cmp', { id: d.meta.id, a, b }); $('.list', cp).appendChild(li);
    }
    if ($('.list', cp).children.length) root.appendChild(cp);
  }
  return root;
};
VIEWS.dstats = async v => {
  const d = await deck(v.id), m = d.meta, st = deckStats()[v.id];
  const root = el(`<div class="stack" style="--h:${m.hue}"></div>`);
  root.appendChild(topbar(`Statistici · ${m.title}`));
  root.appendChild(el(`<div class="panel domhead"><div class="bigring" style="--p:${st.pct};--h:${m.hue}"><span>${st.pct}%</span></div><div class="counts">
    <div><span class="num">${fmt(m.count - st.seen)}</span><small>noi</small></div><div><span class="num">${fmt(st.learning)}</span><small>în învățare</small></div>
    <div><span class="num">${fmt(st.mastered)}</span><small>stăpânite</small></div><div><span class="num">${fmt(st.due)}</span><small>de repetat azi</small></div></div></div>`));
  const fc = Array.from({ length: 7 }, (_, i) => { const end = endOfToday() + i * DAY, start = i ? end - DAY : 0; return d.cards.filter(c => { const s = S.cards[c.id]; return s && s.due <= end && s.due > start; }).length; });
  const fl = Array.from({ length: 7 }, (_, i) => i === 0 ? 'azi' : new Date(Date.now() + i * DAY).toLocaleDateString('ro-RO', { weekday: 'short' }).slice(0, 3));
  root.appendChild(retentionPanel(v.id, m.count));
  root.appendChild(el(`<div class="panel stack"><div class="row"><h2 style="font-size:16px">Repetări în următoarele 7 zile</h2></div>${barChart(fc, fl, { aria: 'Repetări programate în următoarele 7 zile' })}</div>`));
  const sl = el(`<div class="panel stack"><h2 style="font-size:16px">Pe subcategorii</h2><div class="list"></div></div>`);
  d.subs.forEach(sub => { const ss = subStats(d, sub); $('.list', sl).appendChild(el(`<div class="li"><div class="t"><b>${esc(sub)}</b><small>${ss.seen}/${ss.n} începute</small><div class="bar" style="margin-top:6px"><i style="width:${ss.pct}%"></i></div></div><span class="num" style="font-size:14px">${ss.pct}%</span></div>`)); });
  root.appendChild(sl);
  const best = Object.entries(S.quiz.best || {}).filter(([k]) => k.startsWith(m.id + ':'));
  if (best.length) root.appendChild(el(`<div class="panel stack"><h2 style="font-size:16px">Recorduri la teste</h2><div class="row" style="flex-wrap:wrap">${best.map(([k, n]) => `<span class="pill">${esc({ mc: 'Grilă', write: 'Scris', timed: 'Cronometrat', intrus: 'Intrusul' }[k.split(':')[1]])}: ${n}</span>`).join('')}</div></div>`));
  const weak = await weakCards(v.id);
  if (weak.length) {
    const wp = el(`<div class="panel stack"><h2 style="font-size:16px">Puncte slabe</h2><div class="list"></div></div>`);
    weak.forEach(({ c, st: s }) => $('.list', wp).appendChild(el(`<div class="li"><div class="t"><b>${c.flag ? c.flag + ' ' : ''}${esc(shortLabel(c))}</b><small>${esc(c.a)} · greșit de ${s.lapses} ori</small></div></div>`)));
    root.appendChild(wp);
  }
  const doms = badgeDefs(deckStats()).filter(b => b.dom === m.id);
  root.appendChild(el(`<div class="panel stack"><h2 style="font-size:16px">Insignele domeniului</h2><div class="badges">${doms.map(badgeHTML).join('')}</div></div>`));
  return root;
};

// ---------- insigne ----------
function badgeHTML(b) {
  const on = !!S.badges[b.id];
  return `<div class="badge ${on ? 'on' : ''}" style="--mc:${b.mc}"><div class="medal">${ic(b.icon)}</div><b>${esc(b.t)}</b><small>${esc(b.dsc)}</small>${on ? `<small>${esc(S.badges[b.id])}</small>` : `<span class="bar" style="--h:45"><i style="width:${Math.round(b.p * 100)}%"></i></span>`}</div>`;
}
VIEWS.badges = async () => {
  checkBadges();
  const all = badgeDefs(deckStats());
  const gen = all.filter(b => !b.dom), earned = all.filter(b => S.badges[b.id]).length;
  const root = el('<div class="stack"></div>');
  root.appendChild(topbar('Insigne', { noBack: true, right: `<span class="pill ok">${earned}/${all.length}</span>` }));
  root.appendChild(el(`<div class="badges">${gen.map(badgeHTML).join('')}</div>`));
  root.appendChild(el('<div class="sectionhead"><h2>Stăpânirea domeniilor</h2><span class="label">bronz · argint · aur · diamant</span></div>'));
  const dst = deckStats();
  for (const d of INDEX.domains) {
    const bs = all.filter(b => b.dom === d.id);
    root.appendChild(el(`<div class="panel stack" style="--h:${d.hue}"><div class="row"><span style="width:10px;height:10px;border-radius:3px;background:hsl(var(--h) var(--tab-s) var(--tab-l))"></span><b>${esc(d.title)}</b><div class="spacer"></div><span class="label">${dst[d.id].pct}%</span></div><div class="badges" style="grid-template-columns:repeat(4,minmax(0,1fr))">${bs.map(badgeHTML).join('')}</div></div>`));
  }
  return root;
};

// ---------- setări ----------
VIEWS.settings = async (v = {}) => {
  const s = S.settings;
  const root = el('<div class="stack"></div>');
  root.appendChild(topbar('Setări', { noBack: true }));
  const segField = (key, label, opts, help) => {
    const f = el(`<div class="field"><label>${esc(label)}</label><div class="seg">${opts.map(([v, t]) => `<button data-v="${v}" class="${String(s[key]) === String(v) ? 'on' : ''}">${esc(t)}</button>`).join('')}</div>${help ? `<small>${esc(help)}</small>` : ''}</div>`);
    $$('button', f).forEach(b => b.onclick = () => { s[key] = isNaN(+b.dataset.v) ? b.dataset.v : +b.dataset.v; $$('button', f).forEach(x => x.classList.toggle('on', x === b)); if (key === 'theme') applyTheme(); touchSettings(); });
    return f;
  };
  const p1 = el('<div class="panel stack"></div>');
  const nameF = el(`<div class="field"><label for="nm">Numele tău</label><input id="nm" value="${esc(s.name)}" maxlength="24" autocomplete="off"></div>`);
  $('input', nameF).oninput = e => { s.name = e.target.value.trim() || 'Matei'; touchSettings(); };
  p1.append(nameF,
    segField('goalMin', 'Obiectiv zilnic', [[15, '15 min'], [30, '30 min'], [45, '45 min'], [60, '60 min']], 'Timpul activ de studiu pe care vrei să-l atingi în fiecare zi.'),
    segField('newPerDay', 'Carduri noi pe zi, în fiecare domeniu', [[10, '10'], [20, '20'], [30, '30'], [50, '50']], 'Câte carduri noi intră zilnic în repetiție, separat pentru fiecare domeniu. Mai multe înseamnă și mai multe repetări în zilele următoare.'),
    segField('sessionSize', 'Mărimea unei sesiuni', [[10, '10'], [20, '20'], [30, '30']]),
    segField('theme', 'Temă', [['system', 'Ca telefonul'], ['light', 'Luminoasă'], ['dark', 'Întunecată']]));
  const en = el(`<label class="switch"><span><b>Arată termenii în engleză</b><br><small class="muted">Pe spatele cardului, ca „EN · …"</small></span><input type="checkbox" id="en" ${s.showEn ? 'checked' : ''}></label>`);
  $('input', en).onchange = e => { s.showEn = e.target.checked; touchSettings(); };
  p1.appendChild(en);
  root.appendChild(p1);
  const p2 = el(`<div class="panel stack"><h2 style="font-size:16px">Reamintire zilnică</h2>
    <label class="switch"><span><b>Notificare</b><br><small class="muted">Te anunță dacă n-ai învățat încă azi</small></span><input type="checkbox" id="nt" ${s.notify ? 'checked' : ''}></label>
    <div class="field"><label for="nat">Ora</label><input type="time" id="nat" value="${esc(s.notifyAt)}"></div>
    <p class="note" style="margin:0">Ora se salvează acum. Notificările pe telefon vor veni într-o versiune viitoare a aplicației.</p></div>`);
  $('#nt', p2).onchange = e => { s.notify = e.target.checked; touchSettings(); };
  $('#nat', p2).onchange = e => { s.notifyAt = e.target.value || '19:00'; touchSettings(); };
  root.appendChild(p2);
  const p3 = el(`<div class="panel stack"><h2 style="font-size:16px">Datele tale</h2>
    <p class="muted" style="margin:0;font-size:13px">${IN_CLAUDE ? 'Progresul se salvează în contul tău Claude și, ca rezervă, pe acest dispozitiv. Exportul e o copie de siguranță în plus.' : 'Progresul se salvează doar pe acest telefon. Fă un export cel puțin o dată pe lună și păstrează textul într-un loc sigur (de exemplu, un mesaj către tine).'}</p>
    ${IN_CLAUDE ? '<div id="syncbox"></div><button class="btn" id="syncnow">Sincronizează acum</button>' : ''}
    <p class="muted" id="lastexp" style="margin:0;font-size:13px">${S.lastExport ? `Ultimul export: ${esc(fmtDate(S.lastExport))}.` : 'Nu ai făcut încă niciun export.'}</p>
    ${storageOK ? '' : '<div class="verdict bad">Salvarea locală nu e disponibilă în acest browser. Folosește salvarea în cont sau exportul.</div>'}
    <div class="actions"><button class="btn" id="exp">Exportă</button><button class="btn" id="imp">Importă</button></div>
    <div id="io" class="stack"></div></div>`);
  const io = $('#io', p3);
  $('#exp', p3).onclick = () => {
    markExported(); $('#lastexp', p3).textContent = `Ultimul export: ${fmtDate(S.lastExport)}.`;
    const txt = JSON.stringify(S);
    io.replaceChildren(el(`<div class="field"><label for="expt">Copiază textul și păstrează-l (de ex. într-un mesaj către tine)</label><textarea id="expt" readonly>${esc(txt)}</textarea><button class="btn primary" id="cp">Copiază</button></div>`));
    $('#cp', io).onclick = async () => { const ta = $('#expt', io); try { await navigator.clipboard.writeText(ta.value); toast('Copiat', 'check'); } catch (e) { ta.focus(); ta.select(); toast('Selectat - apasă lung și alege Copiază', 'check'); } };
  };
  $('#imp', p3).onclick = () => {
    io.replaceChildren(el(`<div class="field"><label for="impt">Lipește aici textul exportat sau alege fișierul</label><textarea id="impt" placeholder='{"v":1, ...}'></textarea><input type="file" id="impf" accept=".json,.txt,application/json,text/plain"><button class="btn primary" id="doimp">Importă progresul</button><small>Importul înlocuiește progresul de pe acest telefon.</small></div>`));
    $('#impf', io).onchange = e => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => { $('#impt', io).value = r.result; }; r.readAsText(f); };
    $('#doimp', io).onclick = () => {
      try { const o = JSON.parse($('#impt', io).value); if (!o || o.v !== 1 || typeof o.cards !== 'object') throw new Error('format'); S = normalize(o); S.settingsAt = Date.now(); save(); flushCloud(); applyTheme(); toast('Progres importat', 'check'); render(); }
      catch (e) { io.prepend(el('<div class="verdict bad">Textul nu pare un export valid al aplicației. Verifică dacă l-ai copiat complet.</div>')); }
    };
  };
  if (IN_CLAUDE) $('#syncnow', p3).onclick = async () => { if (cloud.col && cloud.status !== 'readonly') { cloud.status = 'cloud'; await flushCloud(); toast('Sincronizat', 'check'); } else await initCloud(); updateSyncUI(); };
  if (!IN_CLAUDE && !isStandalone() && !pwa.installed) {
    const pi = el(`<div class="panel stack" id="install"><h2 style="font-size:16px">Pune aplicația pe ecranul principal</h2>
      <p class="muted" style="margin:0;font-size:13px">O deschizi apoi ca pe orice aplicație, pe tot ecranul, și merge și fără internet pentru domeniile deja deschise.</p>
      ${pwa.prompt ? '<button class="btn primary" id="doinstall">Instalează aplicația</button>' : ''}
      <ol style="margin:0;padding-left:20px;font-size:13px"><li>Deschide pagina în <b>Chrome</b>.</li><li>Apasă meniul <b>⋮</b> din dreapta sus.</li><li>Alege <b>„Adaugă pe ecranul de pornire"</b> (sau „Instalează aplicația").</li><li>Confirmă cu <b>Adaugă</b>.</li></ol></div>`);
    if (pwa.prompt) $('#doinstall', pi).onclick = async () => { const p = pwa.prompt; pwa.prompt = null; try { p.prompt(); await p.userChoice; } catch (e) { } render(); };
    root.appendChild(pi);
  }
  root.appendChild(p3);
  if (v.exportNow) setTimeout(() => { $('#exp', p3).click(); p3.scrollIntoView({ block: 'start' }); }, 0);
  if (IN_CLAUDE) setTimeout(updateSyncUI, 0);
  const p4 = el(`<div class="panel stack"><h2 style="font-size:16px">Resetare</h2><button class="btn" id="rst">Șterge tot progresul</button><div id="rc"></div></div>`);
  $('#rst', p4).onclick = () => {
    $('#rc', p4).replaceChildren(el(`<div class="confirm"><b>Sigur? Se șterg toate cardurile învățate, XP-ul, seria și insignele.</b><div class="actions"><button class="btn" id="no">Renunță</button><button class="btn accent" id="yes">Da, șterge</button></div></div>`));
    $('#no', p4).onclick = () => $('#rc', p4).replaceChildren();
    $('#yes', p4).onclick = () => { const keep = S.settings; S = freshState(); S.settings = keep; S.settingsAt = Date.now(); save(); flushCloud(); toast('Progres șters', 'check'); render(); };
  };
  root.appendChild(p4);
  root.appendChild(el(`<div class="panel stack"><h2 style="font-size:16px">Despre conținut</h2><div class="list">${INDEX.domains.map(d => `<div class="li"><div class="t"><b>${esc(d.title)} · ${d.count} carduri</b><small>${esc(d.source)}</small></div></div>`).join('')}</div><p class="note" style="margin:0">Repetiția spațiată folosește algoritmul FSRS 4.5 (Free Spaced Repetition Scheduler). Versiunea conținutului: ${esc(INDEX.built)}.</p></div>`));
  return root;
};

// ---------- tastatura: întrebarea rămâne vizibilă când scrii răspunsul ----------
// Pe telefon, când apare tastatura, browserul derulează pagina ca să arate câmpul și împinge întrebarea sub bara de sus.
// Cât timp câmpul are focus: cardul se strânge (html.typing) și așezăm pagina cu întrebarea sub bară și câmpul deasupra tastaturii.
const TYPE_FIELDS = '#typed, #ans, #mapans';
function fitTyping(input) {
  if (document.activeElement !== input) return;
  const card = $('#app .card'); if (!card) return;
  const bar = $('#app .topbar'), barH = bar ? bar.getBoundingClientRect().bottom : 0;
  const vv = window.visualViewport, viewBottom = vv ? vv.offsetTop + vv.height : innerHeight;
  let dy = card.getBoundingClientRect().top - barH - 6;                      // întrebarea imediat sub bară
  const over = input.getBoundingClientRect().bottom - dy - (viewBottom - 8);   // câmpul trebuie să rămână deasupra tastaturii
  if (over > 0) dy += over;
  if (Math.abs(dy) > 2) window.scrollBy(0, dy);
}
let typingOff = null;
document.addEventListener('focusin', e => {
  const input = e.target.closest && e.target.closest(TYPE_FIELDS); if (!input) return;
  clearTimeout(typingOff); document.documentElement.classList.add('typing');
  const fit = () => fitTyping(input);
  [0, 120, 320, 650].forEach(ms => setTimeout(fit, ms));
  if (window.visualViewport && !input._fitBound) { input._fitBound = true; visualViewport.addEventListener('resize', fit); input.addEventListener('focusout', () => visualViewport.removeEventListener('resize', fit), { once: true }); }
});
document.addEventListener('focusout', e => {
  if (!(e.target.closest && e.target.closest(TYPE_FIELDS))) return;
  // întârziere mică: dacă apeși „Verifică", butonul nu se mută sub deget
  typingOff = setTimeout(() => document.documentElement.classList.remove('typing'), 300);
});

// ---------- pornire ----------
$$('#nav button').forEach(b => b.onclick = () => { sess = null; qz = null; go(b.dataset.go); });
window.addEventListener('pagehide', () => { saveLocal(); flushCloudNow(); });
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') { saveLocal(); flushCloudNow(); } else { lastAct = 0; reconcileStreak(); } });
(async function start() {
  load(); applyTheme(); reconcileStreak(); setupPWA();
  try { history.replaceState({ n: 'home', p: {} }, ''); } catch (e) { }
  try { INDEX = await getJSON('data/index.json'); }
  catch (e) { app().replaceChildren(el(`<div class="panel" style="margin-top:20px">Nu am putut încărca datele aplicației. Verifică conexiunea și reîncarcă pagina.</div>`)); return; }
  await render();
  initCloud();
  deck('capitale').catch(() => { }); // pentru sinonimele de țări la răspunsurile scrise
})();
