importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyALsX8Rtzo8Wmx4Iv-o_teKxyM3AtD194M",
  authDomain: "hostelpro-notifications.firebaseapp.com",
  projectId: "hostelpro-notifications",
  storageBucket: "hostelpro-notifications.firebasestorage.app",
  messagingSenderId: "377369464961",
  appId: "1:377369464961:web:5c24894030e85b2f883d80"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification;
  const { type, priority } = payload.data;
  
  const options = {
    body,
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: type,
    requireInteraction: priority === 'critical',
    vibrate: getVibrationPattern(priority),
    actions: getNotificationActions(type),
    data: payload.data
  };

  self.registration.showNotification(title, options);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const { action } = event;
  const { type, entityId, action: dataAction } = event.notification.data;
  
  let url = '/';
  
  if (action === 'view' || !action) {
    switch (type) {
      case 'complaint': url = `/complaints/${entityId}`; break;
      case 'payment': url = '/payments'; break;
      case 'maintenance': url = '/maintenance'; break;
      case 'visitor': url = '/visitors'; break;
      case 'announcement': url = '/announcements'; break;
      case 'booking': url = '/bookings'; break;
      case 'emergency': url = '/emergency'; break;
    }
  }
  
  event.waitUntil(
    clients.openWindow(url)
  );
});

function getVibrationPattern(priority) {
  switch (priority) {
    case 'critical': return [200, 100, 200, 100, 200];
    case 'high': return [200, 100, 200];
    case 'medium': return [200];
    default: return [];
  }
}

function getNotificationActions(type) {
  switch (type) {
    case 'complaint':
      return [{ action: 'view', title: 'View' }];
    case 'payment':
      return [{ action: 'pay', title: 'Pay Now' }];
    case 'visitor':
      return [{ action: 'approve', title: 'Approve' }, { action: 'deny', title: 'Deny' }];
    case 'emergency':
      return [{ action: 'acknowledge', title: 'Acknowledge' }];
    default:
      return [{ action: 'view', title: 'View' }];
  }
}