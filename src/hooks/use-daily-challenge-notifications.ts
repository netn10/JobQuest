'use client'

import { useEffect, useState, useRef } from 'react'
import { useToast } from '@/hooks/use-toast'
import { useDailyChallengeNotifications } from '@/components/daily-challenge-notification'

interface ChallengeCompletion {
  title: string
  description: string
  xpReward: number
}

export function useDailyChallengeCompletionHandler() {
  const { toast } = useToast()
  const { addNotification } = useDailyChallengeNotifications()
  const [lastProcessedActivityId, setLastProcessedActivityId] = useState<string | null>(null)
  const lastProcessedActivityIdRef = useRef<string | null>(null)
  
  // Keep ref in sync with state
  useEffect(() => {
    lastProcessedActivityIdRef.current = lastProcessedActivityId
  }, [lastProcessedActivityId])

  const checkForChallengeCompletions = async () => {
    try {
      const response = await fetch('/api/activities/recent', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('userId') || ''}`
        }
      })
      
      if (!response.ok) return

      const activities = await response.json()
      
      // Find activities with challenge completion info that haven't been processed yet
      const completionActivities = activities.filter((activity: any) => {
        if (activity.id === lastProcessedActivityIdRef.current) return false
        
        try {
          const metadata = typeof activity.metadata === 'string' 
            ? JSON.parse(activity.metadata) 
            : activity.metadata
          return metadata?.challengeCompleted
        } catch {
          return false
        }
      })

      // Process each completion
      for (const activity of completionActivities) {
        try {
          const metadata = typeof activity.metadata === 'string' 
            ? JSON.parse(activity.metadata) 
            : activity.metadata
          
          const challengeCompletion = metadata.challengeCompleted as ChallengeCompletion
          
          if (challengeCompletion) {
            // Show notification popup
            addNotification({
              title: challengeCompletion.title,
              description: challengeCompletion.description,
              xpReward: challengeCompletion.xpReward
            })

            // Show toast
            toast({
              title: "🎉 Daily Challenge Completed!",
              description: `${challengeCompletion.title} - Earned ${challengeCompletion.xpReward} XP`,
              variant: "success",
              actionUrl: "/daily-challenges"
            })
          }
        } catch (error) {
          console.error('Error processing challenge completion:', error)
        }
      }

      // Update the last processed activity ID to avoid duplicates
      if (completionActivities.length > 0) {
        const newLastProcessedId = completionActivities[completionActivities.length - 1].id
        setLastProcessedActivityId(newLastProcessedId)
        lastProcessedActivityIdRef.current = newLastProcessedId
      }
      
    } catch (error) {
      console.error('Error checking for challenge completions:', error)
    }
  }

  // Check for completions on mount and when external events occur
  useEffect(() => {
    // Check immediately on mount only
    checkForChallengeCompletions()

    // Listen for custom activity logged events
    const handleActivityLogged = () => {
      setTimeout(checkForChallengeCompletions, 100) // Small delay to ensure DB is updated
    }

    // Listen for direct daily challenge completion events
    const handleDailyChallengeCompleted = (event: CustomEvent) => {
      const challengeData = event.detail
      
      // Show notification popup
      addNotification({
        title: challengeData.challengeTitle,
        description: challengeData.challengeDescription,
        xpReward: challengeData.xpAwarded
      })

      // Show toast
      toast({
        title: "🎉 Daily Challenge Completed!",
        description: `${challengeData.challengeTitle} - Earned ${challengeData.xpAwarded} XP`,
        variant: "success",
        duration: 5000
      })
    }

    window.addEventListener('activity-logged', handleActivityLogged)
    window.addEventListener('daily-challenge-completed', handleDailyChallengeCompleted as EventListener)
    
    // Fallback: check every 60 seconds as a backup in case events are missed
    const fallbackIntervalId = setInterval(checkForChallengeCompletions, 60000)
    
    return () => {
      window.removeEventListener('activity-logged', handleActivityLogged)
      window.removeEventListener('daily-challenge-completed', handleDailyChallengeCompleted as EventListener)
      clearInterval(fallbackIntervalId)
    }
  }, []) // Remove dependency on lastProcessedActivityId to prevent re-running

  return {
    checkForChallengeCompletions
  }
}