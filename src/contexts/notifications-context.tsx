'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { notificationService, NotificationType, NOTIFICATION_TYPES } from '@/lib/notifications'
import { useAuth } from './auth-context'

interface NotificationPreferences {
  missionReminders: boolean
  achievementUnlocks: boolean
  dailyChallenges: boolean
  jobApplicationFollowups: boolean
  learningsuggestions: boolean
  streakWarnings: boolean
  emailNotifications: boolean
}

interface NotificationsContextType {
  preferences: NotificationPreferences
  permission: NotificationPermission
  isEnabled: boolean
  updatePreference: (key: keyof NotificationPreferences, value: boolean) => void
  requestPermission: () => Promise<boolean>
  canShowNotification: (type: NotificationType) => boolean
  showNotification: (type: NotificationType, data: any) => Promise<void>
}

const defaultPreferences: NotificationPreferences = {
  missionReminders: true,
  achievementUnlocks: true,
  dailyChallenges: true,
  jobApplicationFollowups: true,
  learningsuggestions: true,
  streakWarnings: true,
  emailNotifications: false
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined)

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isEnabled, setIsEnabled] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const currentPermission = notificationService.getPermission()
      setPermission(currentPermission)
      setIsEnabled(notificationService.isEnabled())
    }
  }, [])

  // Load user preferences when user changes
  useEffect(() => {
    if (user) {
      loadNotificationPreferences()
    }
  }, [user])

  const loadNotificationPreferences = async () => {
    if (!user?.id) return
    
    try {
      const response = await fetch(`/api/settings?userId=${user.id}`)
      const data = await response.json()
      
      if (data.success && data.settings?.notifications) {
        setPreferences(data.settings.notifications)
      }
    } catch (error) {
      console.error('Error loading notification preferences:', error)
    }
  }

  const updatePreference = async (key: keyof NotificationPreferences, value: boolean) => {
    const newPreferences = { ...preferences, [key]: value }
    setPreferences(newPreferences)
    
    // Save to database if user is logged in
    if (user?.id) {
      try {
        await fetch('/api/settings', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            settings: {
              notifications: newPreferences
            }
          })
        })
      } catch (error) {
        console.error('Error saving notification preferences:', error)
      }
    }
  }

  const requestPermission = async (): Promise<boolean> => {
    const granted = await notificationService.requestPermission()
    setPermission(notificationService.getPermission())
    setIsEnabled(notificationService.isEnabled())
    return granted
  }

  const canShowNotification = (type: NotificationType): boolean => {
    return isEnabled && preferences[type]
  }

  const showNotification = async (type: NotificationType, data: any): Promise<void> => {
    if (!canShowNotification(type)) return

    switch (type) {
      case NOTIFICATION_TYPES.MISSION_REMINDERS:
        await notificationService.showMissionReminder(data.missionName)
        break
      case NOTIFICATION_TYPES.ACHIEVEMENT_UNLOCKS:
        await notificationService.showAchievementUnlock(data.name, data.xpReward)
        break
      case NOTIFICATION_TYPES.DAILY_CHALLENGES:
        await notificationService.showDailyChallenge(data.challengeName)
        break
      case NOTIFICATION_TYPES.JOB_APPLICATION_FOLLOWUPS:
        await notificationService.showJobApplicationFollowup(data.companyName)
        break
      case NOTIFICATION_TYPES.LEARNING_SUGGESTIONS:
        await notificationService.showLearningsuggestion(data.suggestion)
        break
      case NOTIFICATION_TYPES.STREAK_WARNINGS:
        await notificationService.showStreakWarning(data.currentStreak)
        break
    }
  }

  return (
    <NotificationsContext.Provider value={{
      preferences,
      permission,
      isEnabled,
      updatePreference,
      requestPermission,
      canShowNotification,
      showNotification
    }}>
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationsContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider')
  }
  return context
}