const cacheVersion = 'v02-01-2026-23:56';
const cacheName = `my-cache-${cacheVersion}`;
const dynamicCache = `my-dynamic-cache-${cacheVersion}`;

const limitCacheSize = (name, size) => {
    caches.open(name).then((cache) => {
        cache.keys().then((keys) => {
            if (keys.length > size) {
                cache.delete(keys[0]).then(limitCacheSize(name, size));
            }
        });
    });
};

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(cacheName).then((cache) => {
            return cache
                .addAll([
                    '/',
                    '/index.html',
                    '/fallback.html',
                    '/style.css',
                    '/index-21-03-2024-4.js',
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
                ])
                .catch((error) => {
                    console.error('Caching failed:', error);
                });
        })
    );
});

self.addEventListener('activate', (evt) => {
    evt.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    return caches.delete(cacheName);
                })
            );
        })
    );
});

self.addEventListener('fetch', (evt) => {
    evt.respondWith(
        caches
            .match(evt.request)
            .then((response) => {
                return (
                    response ||
                    fetch(evt.request).then((fetchRes) => {
                        return caches.open(dynamicCache).then((cache) => {
                            cache.put(evt.request.url, fetchRes.clone());
                            limitCacheSize(dynamicCache, 50);
                            return fetchRes;
                        });
                    })
                );
            })
            .catch(() => {
                if (evt.request.indexOf('.html') > -1) {
                    return caches.match('/fallback.html');
                }
            })
    );
});
