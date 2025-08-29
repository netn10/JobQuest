'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useFocusSession } from '@/contexts/focus-session-context'

interface FocusBlockerProps {
  isActive: boolean
  blockedWebsites: string[]
  blockedApps: string[]
  onBlockedAccess: (type: 'website' | 'app', name: string) => void
  missionDuration?: number
  missionTitle?: string
  missionStatus?: 'IN_PROGRESS' | 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
  timeRemaining?: number
  onResume?: () => void
  onPause?: () => void
  onStop?: () => void
  missionId?: string
}

export function FocusBlocker({ 
  isActive, 
  blockedWebsites, 
  blockedApps, 
  onBlockedAccess,
  missionDuration,
  missionTitle,
  missionStatus,
  timeRemaining,
  onResume,
  onPause,
  onStop,
  missionId
}: FocusBlockerProps) {
  const [currentUrl, setCurrentUrl] = useState<string>('')
  const [sessionStartTime, setSessionStartTime] = useState<number>(0)
  const router = useRouter()
  const pathname = usePathname()
  const { setFocusSession, clearFocusSession } = useFocusSession()

  // Check if we should show the persistent banner
  const shouldShowBanner = missionId && (missionStatus === 'IN_PROGRESS' || missionStatus === 'PENDING')

  // Update focus session context
  useEffect(() => {
    if (shouldShowBanner && missionTitle) {
      setFocusSession({
        isActive: true,
        missionId,
        missionTitle,
        missionStatus,
        timeRemaining,
        missionDuration
      })
    } else {
      clearFocusSession()
    }
  }, [shouldShowBanner, missionId, missionTitle, missionStatus, timeRemaining, missionDuration, setFocusSession, clearFocusSession])

  useEffect(() => {
    if (!isActive) {
      setCurrentUrl('')
      setSessionStartTime(0)
      return
    }

    // Set session start time when focus session becomes active (only if not already set)
    setSessionStartTime(prev => prev === 0 ? Date.now() : prev)

    // Check current URL
    const checkCurrentUrl = () => {
      if (typeof window !== 'undefined') {
        const url = window.location.hostname
        setCurrentUrl(url)
        
        // Check if current website is blocked
        const isBlocked = blockedWebsites.some(site => {
          const cleanSite = site.replace(/^https?:\/\//, '').replace(/^www\./, '')
          const cleanUrl = url.replace(/^www\./, '')
          return cleanUrl.includes(cleanSite) || cleanSite.includes(cleanUrl)
        })

        if (isBlocked) {
          onBlockedAccess('website', url)
          // Redirect to dashboard with warning
          router.push('/dashboard?blocked=true&type=website&site=' + encodeURIComponent(url))
        }
      }
    }

    // Check URL on mount and when blocked sites change
    checkCurrentUrl()

    // Set up interval to check for blocked sites
    const interval = setInterval(checkCurrentUrl, 1000)

    // Listen for navigation events
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (typeof window !== 'undefined') {
        const url = window.location.hostname
        const isBlocked = blockedWebsites.some(site => {
          const cleanSite = site.replace(/^https?:\/\//, '').replace(/^www\./, '')
          const cleanUrl = url.replace(/^www\./, '')
          return cleanUrl.includes(cleanSite) || cleanSite.includes(cleanUrl)
        })

        if (isBlocked) {
          e.preventDefault()
          e.returnValue = 'This site is blocked during your focus session. Please complete your mission first.'
          return 'This site is blocked during your focus session. Please complete your mission first.'
        }
      }
    }

    // Listen for popstate (back/forward navigation)
    const handlePopState = () => {
      setTimeout(checkCurrentUrl, 100)
    }

    // Listen for hash changes
    const handleHashChange = () => {
      setTimeout(checkCurrentUrl, 100)
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('popstate', handlePopState)
    window.addEventListener('hashchange', handleHashChange)

    return () => {
      clearInterval(interval)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('popstate', handlePopState)
      window.removeEventListener('hashchange', handleHashChange)
    }
  }, [isActive, blockedWebsites, blockedApps, onBlockedAccess, router, shouldShowBanner])



  // Persistent Focus Session Banner - REMOVED
  // The banner that appeared at the top when missions start has been removed

  // Show blocking overlay if on a blocked site
  if (isActive && currentUrl) {
    const isBlocked = blockedWebsites.some(site => {
      const cleanSite = site.replace(/^https?:\/\//, '').replace(/^www\./, '')
      const cleanUrl = currentUrl.replace(/^www\./, '')
      return cleanUrl.includes(cleanSite) || cleanSite.includes(cleanUrl)
    })

    if (isBlocked) {
      const formatTime = (minutes: number) => {
        const hours = Math.floor(minutes / 60)
        const mins = Math.floor(minutes % 60)
        return `${hours}:${mins.toString().padStart(2, '0')}`
      }

      const progress = missionDuration ? Math.max(0, Math.min(100, ((missionDuration - (timeRemaining || 0) / 60) / missionDuration) * 100)) : 0

      return (
        <div className="fixed inset-0 bg-gradient-to-br from-red-600 to-red-800 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-2xl max-w-md mx-4 text-center border border-red-200 dark:border-red-700">
            <div className="text-red-500 mb-4">
              <svg className="w-16 h-16 mx-auto animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">Site Blocked</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              This website is blocked during your focus session. Please complete your mission first.
            </p>
            
            {missionTitle && (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Active Mission: {missionTitle}
                </p>
              </div>
            )}
            
            {timeRemaining !== undefined && timeRemaining > 0 && (
              <div className="mb-4">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                  ⏰ {formatTime(timeRemaining / 60)} remaining
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-1000" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {Math.round(progress)}% complete
                </p>
              </div>
            )}
            
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 cursor-pointer"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      )
    }
  }

  return null
}
