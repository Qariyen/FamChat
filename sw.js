const CACHE = 'famchat-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  // network first for API (firebase) requests, cache fallback for static
  if (req.url.includes('/firestore.googleapis.com') || req.url.includes('gstatic.com')) {
    return; // let Firebase CDN handle network
  }
  e.respondWith(
    caches.match(req).then(r => r || fetch(req).then(res => {
      return caches.open(CACHE).then(cache => { cache.put(req, res.clone()); return res; });
    })).catch(() => caches.match('/index.html'))
  );
});
