'use client'

import { useEffect } from 'react'
import { DailyChallengeNotification, useDailyChallengeNotifications } from '@/components/daily-challenge-notification'
import { useDailyChallengeCompletionHandler } from '@/hooks/use-daily-challenge-notifications'
import { useRouter } from 'next/navigation'

export function DailyChallengeProvider({ children }: { children: React.ReactNode }) {
  const { notifications, removeNotification } = useDailyChallengeNotifications()
  const { checkForChallengeCompletions } = useDailyChallengeCompletionHandler()
  const router = useRouter()

  // Initialize completion checking
  useEffect(() => {
    checkForChallengeCompletions()
  }, [])

  const handleViewDetails = () => {
    router.push('/daily-challenges')
  }

  return (
    <>
      {children}
      
      {/* Render daily challenge completion notifications */}
      <div className="fixed top-0 right-0 z-50 p-4 space-y-4 pointer-events-none">
        {notifications.map((notification) => (
          <div key={notification.id} className="pointer-events-auto">
            <DailyChallengeNotification
              challenge={notification.challenge}
              onClose={() => removeNotification(notification.id)}
              onViewDetails={handleViewDetails}
            />
          </div>
        ))}
      </div>
    </>
  )
}