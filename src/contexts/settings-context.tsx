'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from './auth-context'

export interface UserSettings {
  profile: {
    name: string
    email: string
  }
  notifications: {
    missionReminders: boolean
    achievementUnlocks: boolean
    dailyChallenges: boolean
    jobApplicationFollowups: boolean
    learningsuggestions: boolean
    streakWarnings: boolean
    emailNotifications: boolean
  }
  gamification: {
    xpMultiplier: number
    difficultyPreference: 'EASY' | 'NORMAL' | 'HARD'
    showLevelProgress: boolean
    showStreakCounter: boolean
  }
  focus: {
    defaultMissionDuration: number
    pomodoroBreakDuration: number
    longBreakDuration: number
    autoStartBreaks: boolean
    strictMode: boolean
  }
  privacy: {
    profileVisibility: 'PUBLIC' | 'FRIENDS' | 'PRIVATE'
    shareProgress: boolean
    analyticsOptOut: boolean
  }
  appearance: {
    colorScheme: 'BLUE' | 'GREEN' | 'PURPLE' | 'ORANGE'
    compactMode: boolean
  }
}

interface SettingsContextType {
  settings: UserSettings
  updateSettings: (section: keyof UserSettings, field: string, value: any) => void
  saveSettings: () => Promise<boolean>
  loading: boolean
  error: string | null
}

const defaultSettings: UserSettings = {
  profile: {
    name: '',
    email: ''
  },
  notifications: {
    missionReminders: true,
    achievementUnlocks: true,
    dailyChallenges: true,
    jobApplicationFollowups: true,
    learningsuggestions: true,
    streakWarnings: true,
    emailNotifications: false
  },
  gamification: {
    xpMultiplier: 1.0,
    difficultyPreference: 'NORMAL',
    showLevelProgress: true,
    showStreakCounter: true
  },
  focus: {
    defaultMissionDuration: 25,
    pomodoroBreakDuration: 5,
    longBreakDuration: 15,
    autoStartBreaks: false,
    strictMode: true
  },
  privacy: {
    profileVisibility: 'PRIVATE',
    shareProgress: false,
    analyticsOptOut: false
  },
  appearance: {
    colorScheme: 'BLUE',
    compactMode: false
  }
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [settings, setSettings] = useState<UserSettings>(defaultSettings)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load settings when user changes
  useEffect(() => {
    if (user) {
      loadSettings()
    } else {
      setSettings(defaultSettings)
    }
  }, [user])

  const loadSettings = async () => {
    if (!user?.id) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/settings?userId=${user.id}`)
      const data = await response.json()

      if (data.success) {
        // Merge with defaults to ensure all fields exist
        setSettings({
          ...defaultSettings,
          ...data.settings,
          profile: {
            ...defaultSettings.profile,
            name: user.name || '',
            email: user.email || ''
          }
        })
      } else {
        setError(data.error || 'Failed to load settings')
      }
    } catch (err) {
      setError('Failed to load settings')
      console.error('Error loading settings:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateSettings = (section: keyof UserSettings, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }

  const saveSettings = async (): Promise<boolean> => {
    if (!user?.id) {
      setError('User must be logged in to save settings')
      return false
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}`
        },
        body: JSON.stringify({
          userId: user.id,
          settings: settings
        })
      })

      const data = await response.json()

      if (data.success) {
        return true
      } else {
        setError(data.error || 'Failed to save settings')
        return false
      }
    } catch (err) {
      setError('Failed to save settings')
      console.error('Error saving settings:', err)
      return false
    } finally {
      setLoading(false)
    }
  }

  return (
    <SettingsContext.Provider 
      value={{ 
        settings, 
        updateSettings, 
        saveSettings, 
        loading, 
        error 
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}