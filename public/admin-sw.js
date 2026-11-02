// Service worker for the /admin app: shows push notifications and opens the dashboard on tap.
// It deliberately caches nothing, so private admin data never sits in a cache.

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: 'Sat Manav', body: event.data ? event.data.text() : '' };
  }
  const title = data.title || 'Sat Manav';
  event.waitUntil(
    self.registration.showNotification(title, {
      body: data.body || '',
      icon: '/admin-icon-192.png',
      badge: '/admin-badge.png',
      tag: data.tag || undefined,
      renotify: Boolean(data.tag),
      data: { url: data.url || '/admin' },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = new URL((event.notification.data && event.notification.data.url) || '/admin', self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(async (windows) => {
      for (const win of windows) {
        if (win.url.startsWith(self.location.origin + '/admin')) {
          await win.focus();
          return win.navigate(target);
        }
      }
      return self.clients.openWindow(target);
    }),
  );
});

// Some browsers rotate subscriptions; re-subscribe and tell the server.
self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil(
    (async () => {
      const res = await fetch('/api/admin/push', { credentials: 'same-origin' });
      if (!res.ok) return;
      const { publicKey } = await res.json();
      const key = Uint8Array.from(atob(publicKey.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (publicKey.length % 4)) % 4)), (c) => c.charCodeAt(0));
      const sub = await self.registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key });
      await fetch('/api/admin/push', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: sub.toJSON(), label: 'Renewed subscription' }),
      });
    })(),
  );
});
