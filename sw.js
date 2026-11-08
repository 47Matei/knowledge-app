/* Service worker for the installed app (GitHub Pages / localhost). Never registered inside the Claude artifact.
   - app shell (index.html, app.js, manifest, icons): network first, cached copy when offline;
   - data/index.json: network first (it decides which content version is current);
   - other data/*.json and img/*: stale-while-revalidate;
   - Google Fonts: cache first.
   Bump VERSION when the list of shell files changes; old caches are deleted on activate. */
const VERSION = 'v1';
const SHELL = `cartoteca-shell-${VERSION}`, DATA = `cartoteca-data-${VERSION}`, FONTS = `cartoteca-fonts-${VERSION}`;
const SHELL_FILES = ['./', 'index.html', 'app.js', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png', 'icons/apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(SHELL).then(c => c.addAll(SHELL_FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  const keep = [SHELL, DATA, FONTS];
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('cartoteca-') && !keep.includes(k)).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

async function networkFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const res = await fetch(req);
    if (res.ok) cache.put(req, res.clone());
    return res;
  } catch (err) {
    const hit = await cache.match(req, { ignoreSearch: true });
    if (hit) return hit;
    if (req.mode === 'navigate') { const shell = await cache.match('index.html'); if (shell) return shell; }
    throw err;
  }
}
async function staleWhileRevalidate(e, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(e.request);
  const fresh = fetch(e.request).then(res => { if (res.ok) cache.put(e.request, res.clone()); return res; });
  if (hit) { e.waitUntil(fresh.catch(() => { })); return hit; }
  return fresh;
}
async function cacheFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok || res.type === 'opaque') cache.put(req, res.clone());
  return res;
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === self.location.origin) {
    const p = url.pathname.slice(new URL(self.registration.scope).pathname.length);
    if (p === 'data/index.json') return e.respondWith(networkFirst(req, DATA));
    if (p.startsWith('data/') || p.startsWith('img/')) return e.respondWith(staleWhileRevalidate(e, DATA));
    return e.respondWith(networkFirst(req, SHELL));
  }
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') return e.respondWith(cacheFirst(req, FONTS));
});
