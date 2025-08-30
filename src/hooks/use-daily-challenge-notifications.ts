'use client'

import { useEffect, useState } from 'react'
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
        if (activity.id === lastProcessedActivityId) return false
        
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
        setLastProcessedActivityId(completionActivities[completionActivities.length - 1].id)
      }
      
    } catch (error) {
      console.error('Error checking for challenge completions:', error)
    }
  }

  // Check for completions when activities are logged
  useEffect(() => {
    const intervalId = setInterval(checkForChallengeCompletions, 2000) // Check every 2 seconds
    return () => clearInterval(intervalId)
  }, [lastProcessedActivityId])

  return {
    checkForChallengeCompletions
  }
}