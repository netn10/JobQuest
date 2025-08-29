'use client'

export interface NotificationOptions {
  title: string
  body: string
  icon?: string
  tag?: string
  requireInteraction?: boolean
  actions?: { action: string; title: string }[]
}

class NotificationService {
  private permission: NotificationPermission = 'default'
  private enabled: boolean = false

  constructor() {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      this.permission = Notification.permission
      this.enabled = this.permission === 'granted'
    }
  }

  async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false
    }

    if (this.permission === 'granted') {
      this.enabled = true
      return true
    }

    if (this.permission === 'denied') {
      return false
    }

    try {
      const result = await Notification.requestPermission()
      this.permission = result
      this.enabled = result === 'granted'
      return this.enabled
    } catch (error) {
      return false
    }
  }

  async show(options: NotificationOptions): Promise<boolean> {
    if (!this.enabled) {
      return false
    }

    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/favicon.ico',
        tag: options.tag,
        requireInteraction: options.requireInteraction,
        badge: '/favicon.ico'
      })

      // Auto-close after 5 seconds unless requireInteraction is true
      if (!options.requireInteraction) {
        setTimeout(() => {
          notification.close()
        }, 5000)
      }

      return true
    } catch (error) {
      return false
    }
  }

  isEnabled(): boolean {
    return this.enabled
  }

  getPermission(): NotificationPermission {
    return this.permission
  }

  // Predefined notification types
  async showMissionReminder(missionName: string): Promise<boolean> {
    return this.show({
      title: 'JobQuest Mission Reminder',
      body: `Time to start your "${missionName}" mission!`,
      tag: 'mission-reminder',
      requireInteraction: false
    })
  }

  async showAchievementUnlock(achievementName: string, xpReward: number): Promise<boolean> {
    return this.show({
      title: '🏆 Achievement Unlocked!',
      body: `${achievementName} (+${xpReward} XP)`,
      tag: 'achievement-unlock',
      requireInteraction: false
    })
  }

  async showDailyChallenge(challengeName: string): Promise<boolean> {
    return this.show({
      title: '⚡ Daily Challenge Available',
      body: `New challenge: ${challengeName}`,
      tag: 'daily-challenge',
      requireInteraction: false
    })
  }

  async showJobApplicationFollowup(companyName: string): Promise<boolean> {
    return this.show({
      title: '📝 Job Application Follow-up',
      body: `Time to follow up on your application at ${companyName}`,
      tag: 'job-followup',
      requireInteraction: true
    })
  }

  async showLearningsuggestion(suggestion: string): Promise<boolean> {
    return this.show({
      title: '💡 Learning Suggestion',
      body: suggestion,
      tag: 'learning-suggestion',
      requireInteraction: false
    })
  }

  async showStreakWarning(currentStreak: number): Promise<boolean> {
    return this.show({
      title: '🔥 Streak Warning!',
      body: `Your ${currentStreak}-day streak is at risk. Complete a mission to keep it alive!`,
      tag: 'streak-warning',
      requireInteraction: true
    })
  }
}

// Export singleton instance
export const notificationService = new NotificationService()

// Export notification types for settings
export const NOTIFICATION_TYPES = {
  MISSION_REMINDERS: 'missionReminders',
  ACHIEVEMENT_UNLOCKS: 'achievementUnlocks',
  DAILY_CHALLENGES: 'dailyChallenges',
  JOB_APPLICATION_FOLLOWUPS: 'jobApplicationFollowups',
  LEARNING_SUGGESTIONS: 'learningsuggestions',
  STREAK_WARNINGS: 'streakWarnings'
} as const

export type NotificationType = typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES]