'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

/**
 * UpdateNotification Component
 * Shows a notification when a new version is available
 * Allows users to manually refresh to get the latest content
 */
export function UpdateNotification() {
  const [showUpdate, setShowUpdate] = useState(false)
  const [updateAvailable, setUpdateAvailable] = useState(false)

  useEffect(() => {
    // Check for version updates
    const checkVersion = async () => {
      try {
        // Fetch version info with cache busting
        const response = await fetch(`/version.json?t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
          },
        })

        if (response.ok) {
          const versionData = await response.json()
          const lastKnownVersion = localStorage.getItem('last-known-version')
          const currentVersion = versionData.timestamp.toString()

          if (lastKnownVersion && lastKnownVersion !== currentVersion) {
            setUpdateAvailable(true)
            setShowUpdate(true)
          }

          localStorage.setItem('last-known-version', currentVersion)
        }
      } catch (error) {
        console.log('Version check failed:', error)
      }
    }

    // Check on mount
    checkVersion()

    // Check every 10 minutes
    const interval = setInterval(checkVersion, 10 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  const handleUpdate = () => {
    // Clear service worker cache and reload
    if ('caches' in window) {
      caches.keys().then((names) => {
        names.forEach((name) => {
          caches.delete(name)
        })
      })
    }
    window.location.reload()
  }

  const handleDismiss = () => {
    setShowUpdate(false)
    // Show again in 1 hour
    setTimeout(() => {
      if (updateAvailable) {
        setShowUpdate(true)
      }
    }, 60 * 60 * 1000)
  }

  if (!showUpdate) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-in slide-in-from-bottom-5">
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 shadow-lg dark:border-blue-900 dark:bg-blue-950">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100">
              🎉 Update Available!
            </h3>
            <p className="mt-1 text-sm text-blue-800 dark:text-blue-200">
              A new version of the website is available. Refresh to get the latest features and improvements.
            </p>
            <div className="mt-3 flex gap-2">
              <Button
                onClick={handleUpdate}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Refresh Now
              </Button>
              <Button
                onClick={handleDismiss}
                size="sm"
                variant="outline"
                className="border-blue-300 text-blue-900 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-100 dark:hover:bg-blue-900"
              >
                Later
              </Button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
