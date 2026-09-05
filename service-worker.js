const STATIC_CACHE = 'kalendarche-static';
const DYNAMIC_CACHE = 'kalendarche-dynamic';
const DYNAMIC_CACHE_LIMIT = 50;
const CURRENT_CACHES = [STATIC_CACHE, DYNAMIC_CACHE];

const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/fallback.html',
    '/style.css',
    '/app.js',
    '/manifest.json',
    '/time-table/aytos-time.json',
    '/time-table/balchik-time.json',
    '/time-table/blagoevgrad-time.json',
    '/time-table/burgas-time.json',
    '/time-table/byala-time.json',
    '/time-table/dobrich-time.json',
    '/time-table/gornaoryahovitsa-time.json',
    '/time-table/gotzedelchev-time.json',
    '/time-table/harmanli-time.json',
    '/time-table/haskovo-time.json',
    '/time-table/isperih-time.json',
    '/time-table/kaolinovo-time.json',
    '/time-table/kardjali-time.json',
    '/time-table/karlovo-time.json',
    '/time-table/karnobat-time.json',
    '/time-table/kavarna-time.json',
    '/time-table/kneja-time.json',
    '/time-table/kotel-time.json',
    '/time-table/krumovgrad-time.json',
    '/time-table/kubrat-time.json',
    '/time-table/lovech-time.json',
    '/time-table/madan-time.json',
    '/time-table/montana-time.json',
    '/time-table/nikipol-time.json',
    '/time-table/novazagora-time.json',
    '/time-table/novipazar-time.json',
    '/time-table/pazardzhik-time.json',
    '/time-table/pleven-time.json',
    '/time-table/plovdiv-time.json',
    '/time-table/provadiya-time.json',
    '/time-table/razgrad-time.json',
    '/time-table/ruse-time.json',
    '/time-table/shumen-time.json',
    '/time-table/silistra-time.json',
    '/time-table/sitovo-time.json',
    '/time-table/sliven-time.json',
    '/time-table/smolyan-time.json',
    '/time-table/sofia-time.json',
    '/time-table/starazagora-time.json',
    '/time-table/svistov-time.json',
    '/time-table/targoviste-time.json',
    '/time-table/tvarditza-time.json',
    '/time-table/varna-time.json',
    '/time-table/velikipreslav-time.json',
    '/time-table/velikotarnovo-time.json',
    '/time-table/velingrad-time.json',
    '/time-table/yakoruda-time.json',
    '/time-table/yambol-time.json'
];

const trimCache = (name, maxItems) => {
    caches.open(name).then((cache) => {
        cache.keys().then((keys) => {
            if (keys.length > maxItems) {
                cache.delete(keys[0]).then(() => trimCache(name, maxItems));
            }
        });
    });
};

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches
            .open(STATIC_CACHE)
            .then((cache) => cache.addAll(STATIC_ASSETS))
            .catch((error) => console.error('Precaching failed:', error))
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((cacheNames) =>
                Promise.all(
                    cacheNames
                        .filter((name) => !CURRENT_CACHES.includes(name))
                        .map((name) => caches.delete(name))
                )
            )
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const { request } = event;

    if (request.method !== 'GET') {
        return;
    }

    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            const networkFetch = fetch(request)
                .then((networkResponse) => {
                    caches.open(DYNAMIC_CACHE).then((cache) => {
                        cache.put(request, networkResponse.clone());
                        trimCache(DYNAMIC_CACHE, DYNAMIC_CACHE_LIMIT);
                    });
                    return networkResponse;
                })
                .catch(() => {
                    if (request.headers.get('accept')?.includes('text/html')) {
                        return caches.match('/fallback.html');
                    }
                });

            return cachedResponse || networkFetch;
        })
    );
});
