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
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    // Initialize notification support check (but don't request permission yet)
    checkNotificationSupport();
    
    // Show popup after 15 seconds
    const timer = setTimeout(() => {
      setShouldShow(true);
    }, 15000);
    
    return () => clearTimeout(timer);
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
    setShouldShow(false);
    setShowSuccess(false);
    setShowDeniedHelp(false);
    setIsDismissed(true);
    localStorage.setItem('push-notification-dismissed', Date.now().toString());
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
  
  // Don't show until timer completes (for floating variant)
  if (variant === 'floating' && !shouldShow && !showDeniedHelp) {
    return null;
  }

  // Show help dialog when permission is denied
  if (showDeniedHelp || permission === 'denied') {
    return (
      <div className={cn(
        "fixed bottom-6 right-6 z-50 max-w-sm animate-in slide-in-from-bottom-4 fade-in duration-500",
        className
      )}>
        <div className="bg-background border border-border shadow-lg rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-amber-50 dark:bg-amber-950/30 border-b border-amber-100 dark:border-amber-900 px-4 py-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-amber-600 dark:text-amber-500" />
                <h3 className="text-sm font-semibold text-foreground">Permission Blocked</h3>
              </div>
              <button 
                onClick={handleDismiss}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-4">
            <p className="text-xs text-muted-foreground mb-3">
              Notifications were previously blocked. To enable them:
            </p>
            <ol className="text-xs text-muted-foreground space-y-1.5 mb-4 list-decimal list-inside">
              <li>Click the <strong>lock icon</strong> in the address bar</li>
              <li>Find <strong>&quot;Notifications&quot;</strong></li>
              <li>Change to <strong>&quot;Allow&quot;</strong></li>
              <li>Refresh the page</li>
            </ol>
            <Button 
              variant="outline"
              onClick={handleDismiss}
              size="sm"
              className="w-full"
            >
              Got it
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Floating prompt (bottom-right corner) - shows as a minimalistic card
  if (variant === 'floating') {
    return (
      <div className={cn(
        "fixed bottom-6 right-6 z-50 max-w-sm animate-in slide-in-from-bottom-4 fade-in duration-500",
        className
      )}>
        {showSuccess ? (
          <div className="bg-background border border-border shadow-lg rounded-lg px-4 py-3">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-500">
              <Check className="w-4 h-4" />
              <span className="text-sm font-medium">Subscribed successfully!</span>
            </div>
          </div>
        ) : (
          <div className="bg-background border border-border shadow-lg rounded-lg overflow-hidden">
            <div className="p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bell className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-1">Stay Updated</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Get notified when new articles are published
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleDismiss}
                  className="text-muted-foreground hover:text-foreground transition-colors p-1"
                  aria-label="Dismiss"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <Button 
                onClick={subscribe}
                disabled={isLoading}
                size="sm"
                className="w-full h-9 text-sm"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                    Subscribing...
                  </span>
                ) : (
                  'Notify me about updates'
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Banner variant (top of page) - minimalistic banner
  if (variant === 'banner') {
    return (
      <div className={cn(
        "bg-muted/50 border-b border-border px-4 py-2.5",
        className
      )}>
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Bell className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-foreground">
              Subscribe to get notified about new posts
            </span>
          </div>
          <div className="flex items-center gap-2">
            {showSuccess ? (
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-500 text-xs font-medium">
                <Check className="w-3.5 h-3.5" />
                Subscribed!
              </div>
            ) : (
              <>
                <Button 
                  size="sm"
                  onClick={subscribe}
                  disabled={isLoading}
                  className="h-7 text-xs"
                >
                  {isLoading ? 'Subscribing...' : 'Subscribe'}
                </Button>
                <button 
                  onClick={handleDismiss}
                  className="text-muted-foreground hover:text-foreground p-1"
                  aria-label="Dismiss"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Inline variant (default) - minimalistic card
  return (
    <div className={cn(
      "flex items-center gap-4 p-4 rounded-lg bg-muted/50 border border-border",
      className
    )}>
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Bell className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-foreground mb-0.5">Stay in the loop</h4>
        <p className="text-xs text-muted-foreground">
          Get notified when new articles are published
        </p>
      </div>
      {showSuccess ? (
        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-500 text-sm font-medium">
          <Check className="w-4 h-4" />
          Subscribed!
        </div>
      ) : (
        <Button 
          onClick={subscribe}
          disabled={isLoading}
          size="sm"
        >
          {isLoading ? 'Subscribing...' : 'Subscribe'}
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
