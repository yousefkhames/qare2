const CACHE = 'qare2-v2';
const FILES = ['assets/yk-logo.svg', './', 'index.html', 'style.css', 'lib.js', 'app.js', 'logo.svg', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png',
  'fonts/plex-400.ttf', 'fonts/plex-600.ttf', 'fonts/plex-700.ttf'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('qare2-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(fetch(e.request).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; })
    .catch(() => caches.match(e.request, { ignoreSearch: true }).then(m => m || caches.match('index.html'))));
});
