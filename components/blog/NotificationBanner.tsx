"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, X, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'blog-notification-preference';
const DISMISSED_KEY = 'blog-notification-dismissed';

export function NotificationBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | 'default'>('default');

  useEffect(() => {
    // Check if notifications are supported
    if (!('Notification' in window)) return;
    
    // Check current permission status
    setPermission(Notification.permission);
    
    // Don't show if already granted or denied
    if (Notification.permission !== 'default') return;
    
    // Check if user dismissed the banner
    const dismissed = localStorage.getItem(DISMISSED_KEY);
    if (dismissed) {
      const dismissedDate = new Date(dismissed);
      const daysSinceDismissed = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
      // Show again after 7 days
      if (daysSinceDismissed < 7) return;
    }

    // Show banner after a thoughtful delay (user has engaged with content)
    const timer = setTimeout(() => {
      setIsAnimating(true);
      setTimeout(() => setIsVisible(true), 50);
    }, 15000); // 15 seconds

    return () => clearTimeout(timer);
  }, []);

  const handleEnable = async () => {
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        localStorage.setItem(STORAGE_KEY, 'enabled');
        // Register for push notifications
        registerPushSubscription();
        // Show success feedback
        new Notification('Notifications enabled', {
          body: 'You\'ll receive updates when new posts are published.',
          icon: '/icons/icon-192x192.png',
        });
      }
      
      handleDismiss();
    } catch (error) {
      console.error('Notification permission error:', error);
      handleDismiss();
    }
  };

  const registerPushSubscription = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        
        // Check if push manager is available
        if (!registration.pushManager) return;
        
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        });
        
        // Send subscription to server
        await fetch('/api/subscribers/push', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscription }),
        });
      }
    } catch (error) {
      console.error('Push subscription error:', error);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setIsAnimating(false);
    localStorage.setItem(DISMISSED_KEY, new Date().toISOString());
  };

  const handleMaybeLater = () => {
    handleDismiss();
  };

  if (!isAnimating || permission !== 'default') return null;

  return (
    <div 
      className={cn(
        "fixed bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50",
        "transition-all duration-500 ease-out",
        isVisible 
          ? "opacity-100 translate-y-0" 
          : "opacity-0 translate-y-4"
      )}
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Subtle gradient accent */}
        <div className="h-1 bg-gradient-to-r from-blue-500/80 via-purple-500/80 to-pink-500/80" />
        
        <div className="p-6">
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Content */}
          <div className="flex gap-4">
            {/* Icon */}
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                <Bell className="w-5 h-5 text-blue-600" />
              </div>
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-foreground mb-1 flex items-center gap-2">
                Stay in the loop
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Get notified when I publish new thoughts — no spam, just occasional updates worth your time.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-5">
            <Button
              onClick={handleEnable}
              className="flex-1 bg-foreground hover:bg-foreground/90 text-background h-10 rounded-xl font-medium"
            >
              Enable notifications
            </Button>
            <Button
              onClick={handleMaybeLater}
              variant="ghost"
              className="text-muted-foreground hover:text-foreground h-10 px-4"
            >
              Maybe later
            </Button>
          </div>

          {/* Trust signal */}
          <p className="text-xs text-muted-foreground/60 text-center mt-4">
            You can disable notifications anytime in your browser settings
          </p>
        </div>
      </div>
    </div>
  );
}
