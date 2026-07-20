const CACHE_NAME = "kidiclass-pwa-v2";
const OFFLINE_URLS = ["/", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(OFFLINE_URLS);
    }),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      );
    }),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET" || !request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    fetch(request).catch(() => {
      return caches.match(request).then((cachedResponse) => {
        return cachedResponse || caches.match("/");
      });
    }),
  );
});

self.addEventListener("push", (event) => {
  let payload = {};

  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = {
      title: "KidiClass",
      body: event.data ? event.data.text() : "Nouvelle notification",
    };
  }

  const title = payload.title || "KidiClass";
  const options = {
    body: payload.body || "",
    icon: payload.icon || "/icon-192.png?v=8",
    badge: payload.badge || "/icon-96.png?v=8",
    tag: payload.tag || "kidiclass-admin",
    data: {
      url: payload.url || "/admin/commandes",
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl =
    event.notification.data && event.notification.data.url
      ? event.notification.data.url
      : "/admin/commandes";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      const absoluteUrl = new URL(targetUrl, self.location.origin).href;

      for (const client of clients) {
        if (client.url === absoluteUrl && "focus" in client) {
          return client.focus();
        }
      }

      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    }),
  );
});
