// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};


try {
  firebase.initializeApp(firebaseConfig);
  console.log('[firebase-messaging-sw.js] Firebase initialized successfully');
} catch (error) {
  console.error('[firebase-messaging-sw.js] Firebase initialization error:', error);
}

let messaging;
try {
  messaging = firebase.messaging();
  console.log('[firebase-messaging-sw.js] Messaging initialized successfully');
} catch (error) {
  console.error('[firebase-messaging-sw.js] Messaging initialization error:', error);
}

if (messaging) {
  messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message:', payload);
    const notificationTitle = payload.notification?.title || 'New Notification';
    const notificationOptions = {
      body: payload.notification?.body || 'You have a new notification',
      icon: '/icons/notification-icon.png',
      badge: '/icons/badge-icon.png',
      tag: payload.data?.type || 'notification',
      data: payload.data,
      requireInteraction: true,
      actions: [
        { action: 'view', title: 'View Details' },
        { action: 'dismiss', title: 'Dismiss' }
      ]
    };
    self.registration.showNotification(notificationTitle, notificationOptions);
  });
}

self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification clicked:', event);
  event.notification.close();

  if (event.action === 'view') {
    const data = event.notification.data;
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes('/admin') && 'focus' in client) {
            client.postMessage({
              type: 'NOTIFICATION_CLICK',
              data: {
                type: data?.type,
                orderId: data?.orderId
              }
            });
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/admin').then((client) => {
            if (client) {
              client.postMessage({
                type: 'NOTIFICATION_CLICK',
                data: {
                  type: data?.type,
                  orderId: data?.orderId
                }
              });
            }
          });
        }
      })
    );
  }
});