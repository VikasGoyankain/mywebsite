// Service Worker for Push Notifications
// This file should be placed in public/sw.js

const CACHE_NAME = 'blog-cache-v2';

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installed');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
  event.waitUntil(clients.claim());
});

// Push notification event with enhanced formatting
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    
    // Enhanced notification options for better engagement
    const options = {
      body: data.body || 'New blog post available! Tap to read.',
      icon: data.icon || '/icons/icon-192x192.png',
      badge: data.badge || '/icons/icon-72x72.png',
      tag: data.tag || `blog-${Date.now()}`,
      renotify: true, // Vibrate even if there's an existing notification with the same tag
      data: {
        url: data.url || '/blog',
        dateOfArrival: Date.now(),
        primaryKey: data.id || Date.now(),
      },
      actions: [
        {
          action: 'read',
          title: '📖 Read Now',
          icon: '/icons/read-icon.png',
        },
        {
          action: 'later',
          title: '⏰ Later',
          icon: '/icons/later-icon.png',
        },
      ],
      vibrate: [200, 100, 200], // Attention-grabbing vibration pattern
      requireInteraction: true, // Keep notification visible until user interacts (desktop)
      silent: false,
      timestamp: Date.now(),
      // Rich notification image (if provided)
      ...(data.image && { image: data.image }),
    };

    event.waitUntil(
      self.registration.showNotification(data.title || '📝 New Blog Post', options)
    );
  } catch (error) {
    console.error('Error showing notification:', error);
    // Fallback to basic notification
    event.waitUntil(
      self.registration.showNotification('New Update Available', {
        body: 'Check out the latest content!',
        icon: '/icons/icon-192x192.png',
      })
    );
  }
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/blog';

  if (event.action === 'read') {
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(urlToOpen);
            return client.focus();
          }
        }
        // Open new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
    );
  } else if (event.action === 'later') {
    // User chose later, just close
    return;
  } else {
    // Default click behavior - open the URL
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(urlToOpen);
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
    );
  }
});

// Background sync for offline notification queuing
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-notifications') {
    event.waitUntil(syncNotifications());
  }
});

async function syncNotifications() {
  // Handle any queued notifications when back online
  console.log('Syncing notifications...');
}
