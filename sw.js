// GST Billing System - Enhanced Service Worker v2
// PWA Score Optimized

const CACHE_VERSION = 'v2';
const CACHE_NAME = `gst-billing-${CACHE_VERSION}`;

// Core static assets (required for offline functionality)
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    '/icons/maskable-icon-192x192.png',
    '/icons/maskable-icon-512x512.png'
];

// External resources to cache
const EXTERNAL_ASSETS = [
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
];

// Offline fallback page
const OFFLINE_PAGE = '/index.html';

// ============================================
// INSTALL EVENT - Pre-cache static assets
// ============================================
self.addEventListener('install', (event) => {
    console.log('[SW] Installing service worker v2...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Pre-caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                // Cache external assets separately (don't fail install if unavailable)
                return caches.open(CACHE_NAME).then((cache) => {
                    return Promise.allSettled(
                        EXTERNAL_ASSETS.map(url => cache.add(url))
                    );
                });
            })
            .then(() => self.skipWaiting())
    );
});

// ============================================
// ACTIVATE EVENT - Clean up old caches
// ============================================
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating service worker v2...');
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((name) => name.startsWith('gst-billing-') && name !== CACHE_NAME)
                        .map((name) => {
                            console.log('[SW] Deleting old cache:', name);
                            return caches.delete(name);
                        })
                );
            })
            .then(() => self.clients.claim())
    );
});

// ============================================
// FETCH EVENT - Network-first with cache fallback
// ============================================
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;

    // Skip chrome-extension and other non-http requests
    if (!event.request.url.startsWith('http')) return;

    // Handle navigation requests differently
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .catch(() => caches.match(OFFLINE_PAGE))
        );
        return;
    }

    // For other requests: Cache-first, network fallback
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    // Update cache in background (stale-while-revalidate)
                    event.waitUntil(updateCache(event.request));
                    return cachedResponse;
                }

                // Fetch from network and cache
                return fetch(event.request)
                    .then((networkResponse) => {
                        if (shouldCache(event.request, networkResponse)) {
                            const responseClone = networkResponse.clone();
                            caches.open(CACHE_NAME)
                                .then((cache) => cache.put(event.request, responseClone));
                        }
                        return networkResponse;
                    })
                    .catch(() => {
                        // Return offline response
                        return new Response('Offline', {
                            status: 503,
                            statusText: 'Service Unavailable',
                            headers: { 'Content-Type': 'text/plain' }
                        });
                    });
            })
    );
});

// Helper: Update cache in background
async function updateCache(request) {
    try {
        const response = await fetch(request);
        if (shouldCache(request, response)) {
            const cache = await caches.open(CACHE_NAME);
            await cache.put(request, response);
        }
    } catch (error) {
        // Network failed, that's ok
    }
}

// Helper: Check if response should be cached
function shouldCache(request, response) {
    return response &&
        response.status === 200 &&
        (response.type === 'basic' || response.type === 'cors');
}

// ============================================
// MESSAGE EVENT - Handle app messages
// ============================================
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: CACHE_VERSION });
    }
});

// ============================================
// PERIODIC SYNC - Background data refresh
// ============================================
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'update-cache') {
        event.waitUntil(
            caches.open(CACHE_NAME).then((cache) => {
                return cache.addAll(STATIC_ASSETS);
            })
        );
    }
});

// ============================================
// PUSH NOTIFICATIONS (Ready for future use)
// ============================================
self.addEventListener('push', (event) => {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body || 'New notification',
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-72x72.png',
            vibrate: [100, 50, 100],
            data: {
                dateOfArrival: Date.now(),
                primaryKey: 1
            }
        };
        event.waitUntil(
            self.registration.showNotification(data.title || 'GST Billing', options)
        );
    }
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow('/')
    );
});

// ============================================
// BACKGROUND SYNC (For offline invoice saving)
// ============================================
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-invoices') {
        event.waitUntil(syncInvoices());
    }
});

async function syncInvoices() {
    // Future: Sync offline invoices to server
    console.log('[SW] Background sync triggered');
}

console.log('[SW] Service Worker v2 loaded');
