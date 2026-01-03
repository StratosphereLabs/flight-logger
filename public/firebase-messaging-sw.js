importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts(
  'https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js',
);

firebase.initializeApp({
  apiKey: 'AIzaSyA3aNvnvseoAlldeZHPAcM09Bt8d5OuhbM',
  authDomain: 'flight-logger-278103.firebaseapp.com',
  projectId: 'flight-logger-278103',
  storageBucket: 'flight-logger-278103.appspot.com',
  messagingSenderId: '560106896800',
  appId: '1:560106896800:web:d7a78ab62ea916e95978c5',
  measurementId: 'G-H5G99GVXN0',
});

const messaging = firebase.messaging();
messaging.onBackgroundMessage(payload => {
  console.log(
    '[firebase-messaging-sw.js] Received background message ',
    payload,
  );

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    // Store the click URL in notification data for later retrieval
    data: {
      clickUrl: payload.data?.clickUrl || '/',
      ...payload.data,
    },
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click events
self.addEventListener('notificationclick', event => {
  console.log('[firebase-messaging-sw.js] Notification clicked:', event);

  // Close the notification
  event.notification.close();

  // Get the click URL from notification data
  const clickUrl = event.notification.data?.clickUrl || '/';

  // Navigate to the URL
  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then(windowClients => {
        // Check if there's already a window open with the app
        for (const client of windowClients) {
          // If we find an existing window, focus it and navigate
          if ('focus' in client && 'navigate' in client) {
            return client.focus().then(() => client.navigate(clickUrl));
          }
        }
        // Otherwise, open a new window
        if (clients.openWindow) {
          return clients.openWindow(clickUrl);
        }
      }),
  );
});
