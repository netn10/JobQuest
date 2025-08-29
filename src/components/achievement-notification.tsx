'use client'

import { useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import { notificationService } from '@/lib/notifications'
import { useAuth } from '@/contexts/auth-context'
import { useNotificationHelpers } from '@/contexts/notification-store-context'

interface Achievement {
  id: string
  name: string
  description: string
  xpReward: number
  category: string
}

// Global event listener for achievement notifications
let achievementListener: ((achievements: Achievement[]) => void) | null = null

export function setAchievementListener(listener: (achievements: Achievement[]) => void) {
  achievementListener = listener
}

export function AchievementNotification() {
  const { toast } = useToast()
  const { user } = useAuth()
  const { addAchievementNotification } = useNotificationHelpers()

  useEffect(() => {
    if (!user) return

    // Set up the global listener
    setAchievementListener(async (achievements: Achievement[]) => {
      for (const achievement of achievements) {
        // Add to notification store
        addAchievementNotification(achievement.name, achievement.description, achievement.xpReward)
        
        // Show toast notification
        toast({
          title: "🏆 Achievement Unlocked!",
          description: `${achievement.name} - ${achievement.description} (+${achievement.xpReward} XP)`,
          variant: 'success',
          duration: 5000,
          actionUrl: '/achievements'
        })
        
        // Show browser notification if enabled
        if (notificationService.isEnabled()) {
          await notificationService.showAchievementUnlock(
            `${achievement.name} - ${achievement.description}`,
            achievement.xpReward
          )
        }
      }
    })

    return () => {
      achievementListener = null
    }
  }, [user])

  return null // This component doesn't render anything visible
}

// Export function to trigger notifications from other parts of the app
export function showAchievementNotifications(achievements: Achievement[]) {
  if (achievementListener) {
    achievementListener(achievements)
  }
}
