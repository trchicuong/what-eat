import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

// Precache all assets
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// Take control of all pages immediately
self.skipWaiting();
clientsClaim();

// Network-first for API calls (Netlify functions)
registerRoute(
  ({ url }) => url.pathname.startsWith('/.netlify/functions/'),
  new StaleWhileRevalidate({
    cacheName: 'api-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 20,
        maxAgeSeconds: 60 * 60, // 1 hour
        purgeOnQuotaError: true,
      }),
    ],
  }),
);

// Cache only Nunito font (CSS and font files)
registerRoute(
  ({ url }) => url.origin === 'https://fonts.googleapis.com' && url.pathname.includes('Nunito'),
  new StaleWhileRevalidate({
    cacheName: 'nunito-font-stylesheets',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 3,
        maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
        purgeOnQuotaError: true,
      }),
    ],
  }),
);

// Cache only Nunito font files (exclude emoji fonts)
registerRoute(
  ({ url }) =>
    url.origin === 'https://fonts.gstatic.com' && url.pathname.toLowerCase().includes('nunito'),
  new CacheFirst({
    cacheName: 'nunito-font-files',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 5, // Only Nunito weights
        maxAgeSeconds: 60 * 60 * 24 * 90, // 90 days
        purgeOnQuotaError: true,
      }),
    ],
  }),
);

// Push notification handler
self.addEventListener('push', function (event) {
  const defaultData = {
    title: 'Hôm Nay Ăn Gì?',
    body: 'Đã đến giờ ăn rồi! Chọn món ngay nhé',
    icon: '/images/icon-192x192.png',
    badge: '/images/icon-192x192.png',
  };

  let notificationData = defaultData;

  if (event.data) {
    try {
      notificationData = { ...defaultData, ...event.data.json() };
    } catch (e) {
      // Use default data if parsing fails
    }
  }

  const options = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    vibrate: [200, 100, 200],
    tag: notificationData.tag || 'meal-reminder',
    requireInteraction: false,
    data: {
      url: notificationData.url || '/',
    },
  };

  event.waitUntil(self.registration.showNotification(notificationData.title, options));
});

// Notification click handler
self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      // Focus existing window if available
      for (const client of clientList) {
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }
      // Open new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    }),
  );
});
