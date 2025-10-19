// hooks/useAdminNotifications.js
import { useState, useEffect, useCallback } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};


// IMPORTANT: Get your VAPID key from Firebase Console
// Go to: Project Settings > Cloud Messaging > Web Push certificates
const VAPID_KEY =process.env.FIREBASE_VAPID_KEY;
// Initialize Firebase (only once)
let app;
let messaging;

if (typeof window !== 'undefined') {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
    messaging = getMessaging(app);
    console.log('✅ Firebase initialized successfully');
  } catch (error) {
    console.error('❌ Firebase initialization error:', error);
  }
}

export const useAdminNotifications = (apiService) => {
  const [fcmToken, setFcmToken] = useState(null);
  const [notification, setNotification] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState('default');
  const [isInitialized, setIsInitialized] = useState(false);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    try {
      console.log('🔔 Requesting notification permission...');
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);
      
      if (permission === 'granted') {
        console.log('✅ Notification permission granted');
        return true;
      } else {
        console.log('❌ Notification permission denied');
        return false;
      }
    } catch (error) {
      console.error('❌ Error requesting permission:', error);
      return false;
    }
  }, []);

const registerServiceWorker = useCallback(async () => {
  if (!('serviceWorker' in navigator)) {
    console.error('❌ Service workers not supported');
    return null;
  }

  const maxRetries = 3;
  let attempts = 0;

  while (attempts < maxRetries) {
    try {
      console.log(`📝 Registering service worker (Attempt ${attempts + 1})...`);

      // Unregister existing service workers
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        if (registration.active?.scriptURL.includes('firebase-messaging-sw.js')) {
          console.log('🔄 Unregistering old service worker:', registration.scope);
          await registration.unregister();
        }
      }

      // Register new service worker
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
        scope: '/'
      });

      console.log('✅ Service Worker registered:', registration.scope);

      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;
      console.log('✅ Service Worker is ready');

      return registration;
    } catch (error) {
      console.error(`❌ Service Worker registration error (Attempt ${attempts + 1}):`, error);
      attempts++;
      if (attempts === maxRetries) {
        console.error('❌ Max retries reached for service worker registration');
        return null;
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  return null;
}, []);

  // Get FCM token
  const getFCMToken = useCallback(async () => {
    if (!messaging) {
      console.error('❌ Messaging not initialized');
      return null;
    }

    try {
      console.log('🔑 Getting FCM token...');
      
      const currentToken = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: await navigator.serviceWorker.ready
      });

      if (currentToken) {
        console.log('✅ FCM Token obtained:', currentToken.substring(0, 20) + '...');
        setFcmToken(currentToken);
        
        // Register token with backend
        if (apiService) {
          try {
            const response = await apiService.request('/auth/fcm-token', {
              method: 'POST',
              body: JSON.stringify({
                fcmToken: currentToken,
                deviceId: 'admin-web-' + Date.now(),
                platform: 'web',
                deviceType: 'admin-dashboard'
              })
            });
            console.log('✅ FCM token registered with backend:', response);
          } catch (error) {
            console.error('❌ Error registering token with backend:', error);
          }
        }
        
        return currentToken;
      } else {
        console.error('❌ No FCM token available');
        return null;
      }
    } catch (error) {
      console.error('❌ Error getting FCM token:', error);
      
      // Detailed error logging
      if (error.code === 'messaging/permission-blocked') {
        console.error('Permission blocked by user');
      } else if (error.code === 'messaging/vapid-key-unavailable') {
        console.error('VAPID key not configured');
      }
      
      return null;
    }
  }, [apiService]);

const initializeNotifications = useCallback(async () => {
  if (typeof window === 'undefined' || !messaging) {
    console.error('❌ Cannot initialize: window or messaging unavailable');
    return;
  }

  if (isInitialized) {
    console.log('ℹ️ Notifications already initialized');
    return;
  }

  try {
    console.log('🚀 Starting notification initialization...');

    // Step 1: Register service worker
    const registration = await registerServiceWorker();
    if (!registration) {
      console.error('❌ Service worker registration failed');
      return;
    }

    // Step 2: Check existing permission
    const currentPermission = Notification.permission;
    setPermissionStatus(currentPermission);
    console.log('📋 Current permission:', currentPermission);

    // Step 3: Request permission if needed
    let hasPermission = currentPermission === 'granted';
    if (currentPermission === 'default') {
      hasPermission = await requestPermission();
    }

    // Step 4: Get FCM token if permission granted
    if (hasPermission) {
      const token = await getFCMToken();
      if (token) {
        setIsInitialized(true);
        console.log('✅ Notification initialization complete');
      } else {
        console.warn('⚠️ Failed to obtain FCM token');
      }
    } else {
      console.log('⚠️ Notification permission not granted');
    }
  } catch (error) {
    console.error('❌ Error initializing notifications:', error);
  }
}, [isInitialized, registerServiceWorker, requestPermission, getFCMToken]);
  // Listen for foreground messages
  useEffect(() => {
    if (!messaging || !isInitialized) return;

    console.log('👂 Setting up foreground message listener...');

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('📨 Foreground message received:', payload);
      
      const notificationData = {
        title: payload.notification?.title || 'New Notification',
        body: payload.notification?.body || '',
        data: payload.data,
        timestamp: new Date()
      };
      
      setNotification(notificationData);

      // Show browser notification
      if (Notification.permission === 'granted') {
        const notif = new Notification(notificationData.title, {
          body: notificationData.body,
          icon: '/icons/notification-icon.png',
          badge: '/icons/badge-icon.png',
          tag: payload.data?.type || 'notification',
          data: payload.data,
          requireInteraction: true
        });

        notif.onclick = () => {
          console.log('Notification clicked');
          window.focus();
          notif.close();
        };
      }

      // Play notification sound
      try {
        const audio = new Audio('/sounds/notification.mp3');
        audio.volume = 0.5;
        audio.play().catch(e => console.log('Could not play sound:', e));
      } catch (e) {
        console.log('Audio error:', e);
      }
    });

    return () => {
      console.log('🔌 Cleaning up message listener');
      unsubscribe();
    };
  }, [isInitialized]);

  // Clear notification
  const clearNotification = useCallback(() => {
    setNotification(null);
  }, []);

  // Delete FCM token
  const deleteFCMToken = useCallback(async () => {
    if (apiService && fcmToken) {
      try {
        await apiService.request('/auth/fcm-token', {
          method: 'DELETE',
          body: JSON.stringify({
            fcmToken: fcmToken
          })
        });
        setFcmToken(null);
        console.log('✅ FCM token deleted from backend');
      } catch (error) {
        console.error('❌ Error deleting FCM token:', error);
      }
    }
  }, [apiService, fcmToken]);

  // Debug info
  useEffect(() => {
    console.log('📊 Notification Status:', {
      isInitialized,
      hasToken: !!fcmToken,
      permission: permissionStatus,
      hasNotification: !!notification
    });
  }, [isInitialized, fcmToken, permissionStatus, notification]);

  return {
    fcmToken,
    notification,
    permissionStatus,
    isInitialized,
    initializeNotifications,
    requestPermission,
    clearNotification,
    deleteFCMToken
  };
};

export default useAdminNotifications;