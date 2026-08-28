// Service worker intentionally disabled in RESET V1.
// Unregister any previously installed worker and clear old caches.
self.addEventListener('install',event=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(k=>caches.delete(k)))).then(()=>self.registration.unregister()).then(()=>self.clients.matchAll({type:'window'})).then(clients=>clients.forEach(c=>c.navigate(c.url)))));
self.addEventListener('fetch',event=>event.respondWith(fetch(event.request)));
