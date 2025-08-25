'use client'

import { useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
// import { Trophy, Zap } from 'lucide-react' // Removed unused imports
import { useAuth } from '@/contexts/auth-context'

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

  useEffect(() => {
    if (!user) return

    // Set up the global listener
    setAchievementListener((achievements: Achievement[]) => {
      achievements.forEach((achievement) => {
        toast({
          title: "🏆 Achievement Unlocked!",
          description: `${achievement.name} - ${achievement.description} (+${achievement.xpReward} XP)`,
          variant: 'success',
          duration: 5000,
        })
      })
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
