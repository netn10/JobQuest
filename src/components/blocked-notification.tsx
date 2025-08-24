'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { X, AlertTriangle } from 'lucide-react'

export function BlockedNotification() {
  const [isVisible, setIsVisible] = useState(false)
  const [blockedInfo, setBlockedInfo] = useState<{ type: string; site: string } | null>(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    const blocked = searchParams.get('blocked')
    const type = searchParams.get('type')
    const site = searchParams.get('site')

    if (blocked === 'true' && type && site) {
      setBlockedInfo({ type, site })
      setIsVisible(true)
      
      // Auto-hide after 10 seconds
      const timer = setTimeout(() => {
        setIsVisible(false)
      }, 10000)

      return () => clearTimeout(timer)
    }
  }, [searchParams])

  if (!isVisible || !blockedInfo) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 shadow-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
              Access Blocked
            </h3>
            <div className="mt-2 text-sm text-red-700 dark:text-red-300">
              <p>
                {blockedInfo.type === 'website' ? 'Website' : 'Application'} "{blockedInfo.site}" is blocked during your focus session.
              </p>
            </div>
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={() => setIsVisible(false)}
              className="inline-flex text-red-400 hover:text-red-600 dark:hover:text-red-300 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
