'use client'

import { useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import { Trophy, Zap } from 'lucide-react'
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
          title: (
            <div className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <span>Achievement Unlocked!</span>
            </div>
          ),
          description: (
            <div className="space-y-1">
              <div className="font-semibold text-yellow-700 dark:text-yellow-300">
                {achievement.name}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {achievement.description}
              </div>
              <div className="flex items-center space-x-1 text-sm">
                <Zap className="h-4 w-4 text-yellow-500" />
                <span className="font-medium text-yellow-700 dark:text-yellow-300">
                  +{achievement.xpReward} XP
                </span>
              </div>
            </div>
          ),
          variant: 'success',
          duration: 5000,
        })
      })
    })

    return () => {
      setAchievementListener(null)
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
