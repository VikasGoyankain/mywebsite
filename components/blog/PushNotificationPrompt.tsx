'use client';

import { useState, useEffect } from 'react';
import { Bell, X, Sparkles, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PushNotificationPromptProps {
  className?: string;
  variant?: 'banner' | 'floating' | 'inline';
}

export function PushNotificationPrompt({ 
  className, 
  variant = 'floating' 
}: PushNotificationPromptProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | 'default'>('default');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Show notification prompt after 10 seconds
    const timer = setTimeout(() => {
      initializeNotifications();
    }, 10000);
    
    return () => clearTimeout(timer);
  }, []);

  const initializeNotifications = async () => {
    // Check if notifications are supported
    if (typeof window === 'undefined') return;
    
    const notificationSupported = 'Notification' in window;
    
    console.log('Push notification support check:', { notificationSupported });
    
    if (!notificationSupported) {
      console.log('Notifications not supported in this browser');
      setIsReady(true);
      return;
    }
    
    setIsSupported(true);
    setPermission(Notification.permission);
    
    // Check if user dismissed the prompt before
    const dismissed = localStorage.getItem('push-notification-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      // Re-show after 7 days
      if (Date.now() - dismissedTime < 7 * 24 * 60 * 60 * 1000) {
        setIsDismissed(true);
      }
    }
    
    // Check if already subscribed (only if service worker is supported)
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      } catch (error) {
        console.log('Could not check subscription status:', error);
      }
    }
    
    setIsReady(true);
  };

  const subscribe = async () => {
    setIsLoading(true);
    try {
      // Request notification permission
      const perm = await Notification.requestPermission();
      setPermission(perm);
      
      if (perm !== 'granted') {
        console.log('Notification permission not granted:', perm);
        setIsLoading(false);
        return;
      }

      // Wait for service worker
      const registration = await navigator.serviceWorker.ready;
      console.log('Service worker ready');

      // Get VAPID public key from env
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      
      if (!vapidPublicKey) {
        console.error('VAPID public key not configured');
        setIsLoading(false);
        return;
      }

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
      });

      console.log('Push subscription created:', subscription);

      // Convert subscription to JSON for sending to server
      const subscriptionJSON = subscription.toJSON();
      console.log('Sending subscription to server:', subscriptionJSON);

      // Send subscription to server
      const response = await fetch('/api/subscribers/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: subscriptionJSON }),
      });

      const data = await response.json();
      console.log('Server response:', data);

      if (response.ok) {
        setIsSubscribed(true);
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
        }, 3000);
      } else {
        console.error('Failed to save subscription:', data);
      }
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('push-notification-dismissed', Date.now().toString());
    setIsDismissed(true);
  };

  // Debug log
  useEffect(() => {
    if (isReady) {
      console.log('PushNotificationPrompt state:', { isReady, isSupported, isDismissed, permission, isSubscribed });
    }
  }, [isReady, isSupported, isDismissed, permission, isSubscribed]);

  // Don't render until ready
  if (!isReady) {
    return null;
  }

  // Don't render if not supported, dismissed, denied, or already subscribed
  if (!isSupported || isDismissed || permission === 'denied' || isSubscribed) {
    return null;
  }

  // Floating prompt (bottom-right corner)
  if (variant === 'floating') {
    return (
      <div className={cn(
        "fixed bottom-6 right-6 z-50 max-w-sm animate-in slide-in-from-bottom-4 fade-in duration-500",
        className
      )}>
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          {/* Gradient header */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-5 py-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Stay Updated</h3>
                  <p className="text-sm text-white/80">Get notified on new posts</p>
                </div>
              </div>
              <button 
                onClick={handleDismiss}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="px-5 py-4">
            <p className="text-sm text-muted-foreground mb-4">
              Be the first to read new articles, legal insights, and research updates. 
              <span className="text-foreground font-medium"> One tap to enable.</span>
            </p>
            
            {showSuccess ? (
              <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg px-4 py-3">
                <Check className="w-5 h-5" />
                <span className="font-medium">You&apos;re all set!</span>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button 
                  onClick={subscribe}
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Enabling...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Enable Notifications
                    </span>
                  )}
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={handleDismiss}
                  className="text-muted-foreground"
                >
                  Later
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Banner variant (top of page)
  if (variant === 'banner') {
    return (
      <div className={cn(
        "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white px-4 py-3",
        className
      )}>
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5" />
            <span className="text-sm font-medium">
              Never miss an update! Enable push notifications to stay informed.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              size="sm"
              onClick={subscribe}
              disabled={isLoading}
              className="bg-white text-indigo-600 hover:bg-gray-100"
            >
              {isLoading ? 'Enabling...' : 'Enable'}
            </Button>
            <button 
              onClick={handleDismiss}
              className="text-white/60 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Inline variant (default)
  return (
    <div className={cn(
      "flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-100 dark:border-blue-900",
      className
    )}>
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
        <Bell className="w-6 h-6 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-foreground">Get Notified</h4>
        <p className="text-sm text-muted-foreground">
          Receive alerts when new content is published
        </p>
      </div>
      <Button 
        onClick={subscribe}
        disabled={isLoading}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
      >
        {isLoading ? 'Enabling...' : 'Enable'}
      </Button>
    </div>
  );
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray.buffer as ArrayBuffer;
}
