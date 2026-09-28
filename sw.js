const CACHE='link-pwa-2.0-v1';
const SHELL=['./','./index.html','./styles.css','./app.js','./manifest.webmanifest','./assets/icon-180.png','./assets/icon-192.png','./assets/icon-512.png','./assets/verified-badge.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE&&k.startsWith('link-pwa')).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET')return;if(u.hostname.endsWith('.supabase.co')||u.hostname.includes('jsdelivr.net'))return;e.respondWith(fetch(e.request).then(r=>{if(r&&r.ok&&u.origin===location.origin){const cp=r.clone();caches.open(CACHE).then(c=>c.put(e.request,cp))}return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html'))))});
