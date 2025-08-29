'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from './auth-context'
import { NotificationItem } from '@/components/notification-center'

interface NotificationStoreContextType {
  notifications: NotificationItem[]
  unreadCount: number
  addNotification: (notification: Omit<NotificationItem, 'id' | 'timestamp'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  deleteNotification: (id: string) => void
  clearAll: () => void
}

const NotificationStoreContext = createContext<NotificationStoreContextType | undefined>(undefined)

export function NotificationStoreProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<NotificationItem[]>([])

  // Clear notifications when user changes
  useEffect(() => {
    if (user) {
      // Start with empty notifications - real notifications will be added through the system
      setNotifications([])
    } else {
      setNotifications([])
    }
  }, [user])

  const unreadCount = notifications.filter(n => !n.read).length

  const addNotification = (notification: Omit<NotificationItem, 'id' | 'timestamp'>) => {
    const newNotification: NotificationItem = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
    }
    
    setNotifications(prev => [newNotification, ...prev])
    
    // If the notification is unread, trigger a browser notification if enabled
    if (!notification.read) {
      // This will be handled by the notification service
      console.log('New notification added:', newNotification)
    }
  }

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    )
  }

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const clearAll = () => {
    setNotifications([])
  }

  return (
    <NotificationStoreContext.Provider value={{
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      clearAll
    }}>
      {children}
    </NotificationStoreContext.Provider>
  )
}

export function useNotificationStore() {
  const context = useContext(NotificationStoreContext)
  if (context === undefined) {
    throw new Error('useNotificationStore must be used within a NotificationStoreProvider')
  }
  return context
}

// Helper functions to add specific notification types
export function useNotificationHelpers() {
  const { addNotification } = useNotificationStore()

  return {
    addAchievementNotification: (name: string, description: string, xpReward: number) => {
      addNotification({
        type: 'achievement',
        title: 'Achievement Unlocked!',
        message: `${name} - ${description} (+${xpReward} XP)`,
        read: false,
        actionUrl: '/achievements'
      })
    },

    addMissionNotification: (missionName: string, type: 'started' | 'completed' | 'failed') => {
      const titles = {
        started: 'Mission Started',
        completed: 'Mission Completed!',
        failed: 'Mission Failed'
      }
      const messages = {
        started: `Focus mission "${missionName}" has begun`,
        completed: `Successfully completed "${missionName}" mission`,
        failed: `Mission "${missionName}" was not completed`
      }

      addNotification({
        type: 'mission',
        title: titles[type],
        message: messages[type],
        read: false,
        actionUrl: '/missions'
      })
    },

    addStreakNotification: (streakCount: number, type: 'warning' | 'milestone') => {
      if (type === 'warning') {
        addNotification({
          type: 'streak',
          title: 'Streak Warning!',
          message: `Your ${streakCount}-day streak is at risk. Complete a mission to keep it alive!`,
          read: false,
          actionUrl: '/missions'
        })
      } else {
        addNotification({
          type: 'streak',
          title: 'Streak Milestone!',
          message: `Congratulations on your ${streakCount}-day streak! Keep it up!`,
          read: false,
          actionUrl: '/activities'
        })
      }
    },

    addJobApplicationNotification: (companyName: string, type: 'reminder' | 'update') => {
      if (type === 'reminder') {
        addNotification({
          type: 'job_application',
          title: 'Follow-up Reminder',
          message: `Time to follow up on your application at ${companyName}`,
          read: false,
          actionUrl: '/jobs'
        })
      } else {
        addNotification({
          type: 'job_application',
          title: 'Application Update',
          message: `Your application at ${companyName} has been updated`,
          read: false,
          actionUrl: '/jobs'
        })
      }
    },

    addLearningNotification: (suggestion: string) => {
      addNotification({
        type: 'learning',
        title: 'Learning Suggestion',
        message: suggestion,
        read: false,
        actionUrl: '/learning'
      })
    },

    addDailyChallengeNotification: (challengeName: string) => {
      addNotification({
        type: 'daily_challenge',
        title: 'New Daily Challenge',
        message: `${challengeName} - Available until midnight`,
        read: false,
        actionUrl: '/dashboard'
      })
    }
  }
}