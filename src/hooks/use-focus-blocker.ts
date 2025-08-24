'use client'

import { useEffect, useState, useCallback } from 'react'

interface UseFocusBlockerProps {
  blockedWebsites: string[]
  blockedApps: string[]
  duration?: number
}

export function useFocusBlocker({ blockedWebsites, blockedApps, duration }: UseFocusBlockerProps) {
  const [isActive, setIsActive] = useState(false)
  const [serviceWorker, setServiceWorker] = useState<ServiceWorker | null>(null)

  // Register service worker
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/focus-blocker.js')
        .then((registration) => {
          console.log('Focus blocker service worker registered:', registration)
          
          // Get the active service worker
          if (registration.active) {
            setServiceWorker(registration.active)
          }
          
          // Listen for service worker updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'activated') {
                  setServiceWorker(newWorker)
                }
              })
            }
          })
        })
        .catch((error) => {
          console.error('Failed to register focus blocker service worker:', error)
        })
    }
  }, [])

  // Start focus session
  const startFocusSession = useCallback(() => {
    if (serviceWorker) {
      serviceWorker.postMessage({
        type: 'FOCUS_START',
        blockedWebsites,
        blockedApps,
        duration
      })
      setIsActive(true)
      console.log('Focus session started with blocking:', { blockedWebsites, blockedApps, duration })
    }
  }, [serviceWorker, blockedWebsites, blockedApps, duration])

  // Stop focus session
  const stopFocusSession = useCallback(() => {
    if (serviceWorker) {
      serviceWorker.postMessage({
        type: 'FOCUS_STOP'
      })
      setIsActive(false)
      console.log('Focus session stopped')
    }
  }, [serviceWorker])

  // Update blocked sites/apps
  const updateBlockedItems = useCallback(() => {
    if (serviceWorker && isActive) {
      serviceWorker.postMessage({
        type: 'FOCUS_START',
        blockedWebsites,
        blockedApps,
        duration
      })
    }
  }, [serviceWorker, isActive, blockedWebsites, blockedApps, duration])

  // Update when blocked items change
  useEffect(() => {
    updateBlockedItems()
  }, [updateBlockedItems])

  return {
    isActive,
    startFocusSession,
    stopFocusSession,
    updateBlockedItems
  }
}
