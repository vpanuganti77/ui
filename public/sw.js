// Service Worker for Android Notifications
self.addEventListener('push', function(event) {
  console.log('Push event received:', event);
  
  const options = {
    body: event.data ? event.data.text() : 'New notification',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    requireInteraction: true,
    tag: 'pgflow-notification'
  };

  event.waitUntil(
    self.registration.showNotification('PGFlow Notification', options)
  );
});

self.addEventListener('notificationclick', function(event) {
  console.log('Notification clicked:', event);
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});

// Handle background sync
self.addEventListener('sync', function(event) {
  if (event.tag === 'background-sync') {
    console.log('Background sync triggered');
  }
});

console.log('Service Worker loaded successfully');