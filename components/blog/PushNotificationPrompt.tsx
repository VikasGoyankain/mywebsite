'use client';

import { useState, useEffect } from 'react';
import { Bell, X, Sparkles, Check, Settings } from 'lucide-react';
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
  const [showDeniedHelp, setShowDeniedHelp] = useState(false);

  useEffect(() => {
    // Initialize notification support check (but don't request permission yet)
    checkNotificationSupport();
  }, []);

  const checkNotificationSupport = async () => {
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
    const currentPermission = Notification.permission;
    setPermission(currentPermission);
    
    // Check if user dismissed the prompt before
    const dismissed = localStorage.getItem('push-notification-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      
      // If permission is default/granted and was dismissed due to denied, show again
      if (currentPermission !== 'denied') {
        // Permission changed from denied to allowed/default, clear dismissed state
        localStorage.removeItem('push-notification-dismissed');
        setIsDismissed(false);
      } else if (dismissedTime > sevenDaysAgo) {
        // Still denied and within 7 days
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
      // Check current permission status first
      const currentPermission = Notification.permission;
      console.log('Current notification permission:', currentPermission);
      
      // If already denied, show help
      if (currentPermission === 'denied') {
        setShowDeniedHelp(true);
        setIsLoading(false);
        return;
      }

      // Request notification permission
      console.log('Requesting notification permission...');
      const perm = await Notification.requestPermission();
      console.log('Permission result:', perm);
      setPermission(perm);
      
      if (perm === 'denied') {
        console.log('Notification permission denied by browser');
        setShowDeniedHelp(true);
        setIsLoading(false);
        return;
      }
      
      if (perm !== 'granted') {
        console.log('Notification permission not granted:', perm);
        setIsLoading(false);
        return;
      }

      // Permission granted - proceed with subscription
      console.log('Permission granted! Proceeding with push subscription...');

      // Wait for service worker
      const registration = await navigator.serviceWorker.ready;
      console.log('Service worker ready');

      // Get VAPID public key - use env or fallback to hardcoded value
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BLCfqp2lIZNfEzAE6ah8oRtHFouhnjDpaPsEfIqf_e0mFs25XTMuDIDzkLq8buY7Jp44zzT1Q3cupfd7Bss8EHE';
      
      console.log('Using VAPID key:', vapidPublicKey.substring(0, 20) + '...');
      
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
    setShowDeniedHelp(false);
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

  // Don't render if not supported, dismissed, or already subscribed
  if (!isSupported || isDismissed || isSubscribed) {
    return null;
  }

  // Don't render if permission is already granted (they're already subscribed)
  if (permission === 'granted' && isSubscribed) {
    return null;
  }

  // Show help dialog when permission is denied
  if (showDeniedHelp || permission === 'denied') {
    return (
      <div className={cn(
        "fixed bottom-6 right-6 z-50 max-w-sm animate-in slide-in-from-bottom-4 fade-in duration-500",
        className
      )}>
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Permission Blocked</h3>
                  <p className="text-sm text-white/80">Enable in browser settings</p>
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
              Notifications were previously blocked. To enable them:
            </p>
            <ol className="text-sm text-muted-foreground space-y-2 mb-4 list-decimal list-inside">
              <li>Click the <strong>lock icon 🔒</strong> in the address bar</li>
              <li>Find <strong>&quot;Notifications&quot;</strong></li>
              <li>Change from &quot;Block&quot; to <strong>&quot;Allow&quot;</strong></li>
              <li>Refresh the page</li>
            </ol>
            <Button 
              variant="outline"
              onClick={handleDismiss}
              className="w-full"
            >
              Got it
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Floating prompt (bottom-right corner) - shows as a button the user can click
  if (variant === 'floating') {
    return (
      <div className={cn(
        "fixed bottom-6 right-6 z-50",
        className
      )}>
        {showSuccess ? (
          <div className="bg-white dark:bg-gray-900 rounded-full shadow-2xl border border-gray-200 dark:border-gray-800 px-6 py-3 animate-in slide-in-from-bottom-4 fade-in duration-500">
            <div className="flex items-center gap-2 text-emerald-600">
              <Check className="w-5 h-5" />
              <span className="font-medium">Subscribed!</span>
            </div>
          </div>
        ) : (
          <Button 
            onClick={subscribe}
            disabled={isLoading}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-2xl rounded-full px-6 animate-in slide-in-from-bottom-4 fade-in duration-500"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Subscribing...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Notify me about updates
              </span>
            )}
          </Button>
        )}
      </div>
    );
  }

  // Banner variant (top of page) - shows as a subtle banner with call to action
  if (variant === 'banner') {
    return (
      <div className={cn(
        "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-b border-blue-100 dark:border-blue-900 px-4 py-3",
        className
      )}>
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-foreground">
              Want to stay updated? Subscribe to get notified about new posts
            </span>
          </div>
          <div className="flex items-center gap-2">
            {showSuccess ? (
              <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
                <Check className="w-4 h-4" />
                Subscribed!
              </div>
            ) : (
              <>
                <Button 
                  size="sm"
                  onClick={subscribe}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  {isLoading ? 'Subscribing...' : 'Subscribe to alerts'}
                </Button>
                <button 
                  onClick={handleDismiss}
                  className="text-muted-foreground hover:text-foreground p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </>
            )}
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
        <h4 className="font-semibold text-foreground">Stay in the loop</h4>
        <p className="text-sm text-muted-foreground">
          Get notified when new articles are published
        </p>
      </div>
      {showSuccess ? (
        <div className="flex items-center gap-2 text-emerald-600 font-medium">
          <Check className="w-5 h-5" />
          Subscribed!
        </div>
      ) : (
        <Button 
          onClick={subscribe}
          disabled={isLoading}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        >
          {isLoading ? 'Subscribing...' : 'Subscribe to alerts'}
        </Button>
      )}
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
