// Service Worker for Push Notifications
self.addEventListener('push', function(event) {
  console.log('Push notification received:', event);
  
  let notificationData = {
    title: 'HostelPro Notification',
    body: 'You have a new notification',
    icon: '/favicon.ico',
    badge: '/favicon.ico'
  };
  
  if (event.data) {
    try {
      const data = event.data.json();
      console.log('Push data:', data);
      
      notificationData = {
        title: data.title || notificationData.title,
        body: data.body || data.message || notificationData.body,
        icon: data.icon || notificationData.icon,
        badge: data.badge || notificationData.badge
      };
    } catch (error) {
      console.error('Error parsing push data:', error);
      notificationData.body = event.data.text() || notificationData.body;
    }
  }
  
  const options = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    tag: 'hostel-notification',
    requireInteraction: true,
    vibrate: [200, 100, 200],
    data: event.data ? (event.data.json ? event.data.json() : {}) : {},
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/favicon.ico'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  console.log('Notification clicked:', event);
  event.notification.close();
  
  if (event.action === 'dismiss') {
    return;
  }
  
  // Open or focus the app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(function(clientList) {
        // If app is already open, focus it
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url.includes(self.location.origin)) {
            return client.focus();
          }
        }
        // If app is not open, open it
        return clients.openWindow(self.location.origin);
      })
  );
});

// Handle notification close
self.addEventListener('notificationclose', function(event) {
  console.log('Notification closed:', event);
});

// Handle background sync for offline notifications
self.addEventListener('sync', function(event) {
  if (event.tag === 'background-sync') {
    console.log('Background sync triggered');
  }
});