/* Service worker : l'application s'ouvre même sans connexion (cours et polices en cache). */
const CACHE = 'cathy-v1';
const NOYAU = ['/', '/manifest.webmanifest', '/icons/icon-192.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(NOYAU)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;            // Supabase, vidéos, photos : toujours en direct
  if (req.mode === 'navigate' && !url.pathname.startsWith('/parcours/')) {
    // pages de l'application : réseau d'abord, sinon la version en cache
    e.respondWith(fetch(req).then(r => { const c = r.clone(); caches.open(CACHE).then(k => k.put('/', c)); return r; }).catch(() => caches.match('/')));
    return;
  }
  // fichiers (scripts, polices, cours) : cache d'abord, mise à jour en arrière-plan
  e.respondWith(caches.match(req).then(hit => {
    const net = fetch(req).then(r => { if (r.ok) { const c = r.clone(); caches.open(CACHE).then(k => k.put(req, c)); } return r; }).catch(() => hit);
    return hit || net;
  }));
});
