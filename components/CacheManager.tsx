'use client'

import { useEffect } from 'react'

/**
 * CacheManager Component
 * Handles automatic cache updates and service worker management
 * to ensure users always see the latest content
 */
export function CacheManager() {
  useEffect(() => {
    // Check if service worker is supported
    if ('serviceWorker' in navigator) {
      // Check for updates every 5 minutes
      const checkForUpdates = async () => {
        try {
          const registration = await navigator.serviceWorker.getRegistration()
          if (registration) {
            await registration.update()
            console.log('Service worker checked for updates')
          }
        } catch (error) {
          console.error('Error checking for service worker updates:', error)
        }
      }

      // Initial check
      checkForUpdates()

      // Periodic checks
      const interval = setInterval(checkForUpdates, 5 * 60 * 1000) // 5 minutes

      // Listen for service worker updates
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('New service worker activated, reloading page...')
        window.location.reload()
      })

      return () => clearInterval(interval)
    }

    // Clear cache storage periodically
    if ('caches' in window) {
      const clearOldCaches = async () => {
        const cacheNames = await caches.keys()
        const currentTime = Date.now()
        
        for (const cacheName of cacheNames) {
          // Remove caches older than 24 hours
          const cacheTime = parseInt(cacheName.split('-v')[1] || '0')
          if (currentTime - cacheTime > 24 * 60 * 60 * 1000) {
            await caches.delete(cacheName)
            console.log('Deleted old cache:', cacheName)
          }
        }
      }

      clearOldCaches()
    }

    // Force reload on visibility change if page was hidden for more than 30 minutes
    let hiddenTime = 0
    const handleVisibilityChange = () => {
      if (document.hidden) {
        hiddenTime = Date.now()
      } else if (hiddenTime > 0) {
        const timeHidden = Date.now() - hiddenTime
        // If page was hidden for more than 30 minutes, reload to get fresh content
        if (timeHidden > 30 * 60 * 1000) {
          console.log('Page was hidden for too long, reloading for fresh content...')
          window.location.reload()
        }
        hiddenTime = 0
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Check for updates on focus
    const handleFocus = () => {
      // Add a version check mechanism
      const lastVersion = localStorage.getItem('app-version')
      const currentVersion = Date.now().toString()
      
      if (lastVersion && Math.abs(parseInt(currentVersion) - parseInt(lastVersion)) > 60 * 60 * 1000) {
        // If more than 1 hour has passed, suggest refresh
        console.log('App version outdated, suggesting refresh...')
        // You can add a UI notification here if needed
      }
      
      localStorage.setItem('app-version', currentVersion)
    }

    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  return null
}
