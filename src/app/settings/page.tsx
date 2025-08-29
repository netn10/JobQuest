'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/hooks/use-toast'
import { useNotifications } from '@/contexts/notifications-context'
import { notificationService } from '@/lib/notifications'
import { 
  Settings,
  User,
  Bell,
  Shield,
  Zap,
  Clock,
  Globe,
  Download,
  Trash2,
  Save,
  RotateCcw,
  Bot,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react'

interface UserSettings {
  profile: {
    name: string
    email: string
    timezone: string
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
  ai: {
    openaiApiKey: string
    enableAiFeatures: boolean
  }
}

export default function SettingsPage() {
  const { user, updateUser } = useAuth()
  const { toast } = useToast()
  const { 
    preferences: notificationPreferences, 
    permission: notificationPermission, 
    updatePreference: updateNotificationPreference,
    requestPermission: requestNotificationPermission 
  } = useNotifications()
  const [isResetting, setIsResetting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isTestingApiKey, setIsTestingApiKey] = useState(false)
  const [isRequestingPermission, setIsRequestingPermission] = useState(false)
  const [settings, setSettings] = useState<UserSettings>({
    profile: {
      name: user?.name || '',
      email: user?.email || '',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    },
    notifications: notificationPreferences,
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
    },
    ai: {
      openaiApiKey: '',
      enableAiFeatures: false
    }
  })

  const [activeTab, setActiveTab] = useState('profile')

  // Sync notification preferences from context
  useEffect(() => {
    setSettings(prev => ({
      ...prev,
      notifications: notificationPreferences
    }))
  }, [notificationPreferences])

  // Update settings when user data is available
  useEffect(() => {
    if (user) {
      setSettings(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          name: user.name || '',
          email: user.email || ''
        }
      }))
    }
  }, [user])

  // Load settings from API
  useEffect(() => {
    const loadSettings = async () => {
      if (!user) return
      
      try {
        const response = await fetch(`/api/settings?userId=${user.id}`)
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.settings) {
            setSettings(data.settings)
          }
        }
      } catch (error) {
        // Error loading settings
      }
    }

    loadSettings()
  }, [user])

  const updateSettings = async (section: keyof UserSettings, field: string, value: string | number | boolean) => {
    if (section === 'notifications' && typeof field === 'string') {
      // Update notification preference through context
      await updateNotificationPreference(field as keyof typeof notificationPreferences, value as boolean)
    }
    
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }

  const handleSaveSettings = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to save changes",
        variant: "destructive"
      })
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          settings
        })
      })

      if (response.ok) {
        toast({
          title: "Settings Saved",
          description: "Your settings have been saved successfully.",
        })
        // Update the user context with new profile data
        updateUser({
          name: settings.profile.name,
          email: settings.profile.email
        })
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save settings')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save settings",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleResetProgress = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to reset progress",
        variant: "destructive"
      })
      return
    }

    const confirmed = window.confirm(
      "Are you sure you want to reset all your progress? This will permanently delete:\n\n" +
      "• All XP and levels\n" +
      "• All missions and achievements\n" +
      "• All job applications\n" +
      "• All notebook entries\n" +
      "• All learning progress\n" +
      "• All daily challenge progress\n" +
      "• All activity history and calendar data\n\n" +
      "This action cannot be undone!"
    )

    if (!confirmed) return

    setIsResetting(true)
    try {
      const response = await fetch('/api/reset-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}`
        }
      })

      if (response.ok) {
        toast({
          title: "Progress Reset",
          description: "All your progress has been reset successfully. You can now start fresh!",
        })
        // Refresh the page to reflect the changes
        window.location.reload()
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to reset progress')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to reset progress",
        variant: "destructive"
      })
    } finally {
      setIsResetting(false)
    }
  }

  const handleRequestNotificationPermission = async () => {
    setIsRequestingPermission(true)
    try {
      const granted = await requestNotificationPermission()
      
      if (granted) {
        toast({
          title: "Notifications Enabled",
          description: "You'll now receive browser notifications based on your preferences.",
        })
        
        // Test notification
        await notificationService.show({
          title: "JobQuest Notifications",
          body: "Notifications are now working! 🎉",
          tag: 'test-notification'
        })
      } else {
        toast({
          title: "Notifications Denied",
          description: "You can enable notifications in your browser settings later.",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to request notification permission",
        variant: "destructive"
      })
    } finally {
      setIsRequestingPermission(false)
    }
  }

  const testNotification = async () => {
    if (notificationPermission !== 'granted') {
      toast({
        title: "Notifications Not Enabled",
        description: "Please enable notifications first",
        variant: "destructive"
      })
      return
    }

    await notificationService.show({
      title: "JobQuest Test Notification",
      body: "This is a test notification. Notifications are working! 🚀",
      tag: 'test-notification'
    })
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'gamification', label: 'Gamification', icon: Zap },
    { id: 'focus', label: 'Focus', icon: Clock },
    { id: 'ai', label: 'AI Features', icon: Bot },
    { id: 'privacy', label: 'Privacy', icon: Shield }
  ]

  return (
    <DashboardLayout title="Settings">
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Settings
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Customize your JobQuest experience and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <Card className="lg:col-span-1">
            <CardContent className="p-4">
              <nav className="space-y-1">
                {tabs.map(tab => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                        activeTab === tab.id
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{tab.label}</span>
                    </button>
                  )
                })}
              </nav>
            </CardContent>
          </Card>

          {/* Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Profile Settings */}
            {activeTab === 'profile' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-black dark:text-white">Profile Information</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">Update your personal information and preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name</label>
                      <Input
                        value={settings.profile.name}
                        onChange={(e) => updateSettings('profile', 'name', e.target.value)}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                      <Input
                        type="email"
                        value={settings.profile.email}
                        onChange={(e) => updateSettings('profile', 'email', e.target.value)}
                        placeholder="Enter your email address"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Timezone</label>
                    <select
                      value={settings.profile.timezone}
                      onChange={(e) => updateSettings('profile', 'timezone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-black dark:text-white"
                    >
                      {Intl.supportedValuesOf('timeZone').map(timezone => (
                        <option key={timezone} value={timezone}>
                          {timezone.replace(/_/g, ' ')} ({new Date().toLocaleString('en-US', { timeZone: timezone, timeZoneName: 'short' })})
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      This affects how dates and times are displayed throughout the application
                    </p>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    <p>Your profile information is used to personalize your JobQuest experience.</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-black dark:text-white">Notification Preferences</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">Choose what notifications you want to receive</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Browser Notification Permission */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          {notificationPermission === 'granted' && (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          )}
                          {notificationPermission === 'denied' && (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                          {notificationPermission === 'default' && (
                            <AlertCircle className="h-5 w-5 text-yellow-500" />
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                            Browser Notifications
                          </h4>
                          <p className="text-xs text-blue-700 dark:text-blue-300">
                            {notificationPermission === 'granted' && 'Notifications are enabled'}
                            {notificationPermission === 'denied' && 'Notifications are blocked. Enable in browser settings.'}
                            {notificationPermission === 'default' && 'Click to enable browser notifications'}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {notificationPermission === 'default' && (
                          <Button
                            onClick={handleRequestNotificationPermission}
                            disabled={isRequestingPermission}
                            size="sm"
                          >
                            {isRequestingPermission ? 'Requesting...' : 'Enable'}
                          </Button>
                        )}
                        {notificationPermission === 'granted' && (
                          <Button
                            onClick={testNotification}
                            variant="outline"
                            size="sm"
                          >
                            Test
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  {Object.entries(settings.notifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {key === 'missionReminders' && 'Get reminders to start focus missions'}
                          {key === 'achievementUnlocks' && 'Celebrate when you unlock achievements'}
                          {key === 'dailyChallenges' && 'Daily challenge reminders and updates'}
                          {key === 'jobApplicationFollowups' && 'Follow-up reminders for applications'}
                          {key === 'learningsuggestions' && 'Personalized learning recommendations'}
                          {key === 'streakWarnings' && 'Warnings when your streak is at risk'}
                          {key === 'emailNotifications' && 'Receive notifications via email'}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={async (e) => await updateSettings('notifications', key, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Gamification Settings */}
            {activeTab === 'gamification' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-black dark:text-white">Gamification Settings</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">Customize your XP and achievement preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">XP Multiplier</label>
                    <select
                      value={settings.gamification.xpMultiplier}
                      onChange={(e) => updateSettings('gamification', 'xpMultiplier', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-black dark:text-white"
                    >
                      <option value={0.5}>0.5x (Casual)</option>
                      <option value={1.0}>1.0x (Normal)</option>
                      <option value={1.5}>1.5x (Ambitious)</option>
                      <option value={2.0}>2.0x (Hardcore)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Difficulty Preference</label>
                    <select
                      value={settings.gamification.difficultyPreference}
                      onChange={(e) => updateSettings('gamification', 'difficultyPreference', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-black dark:text-white"
                    >
                      <option value="EASY">Easy</option>
                      <option value="NORMAL">Normal</option>
                      <option value="HARD">Hard</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Show Level Progress</label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Display XP progress in the header</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.gamification.showLevelProgress}
                        onChange={(e) => updateSettings('gamification', 'showLevelProgress', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Show Streak Counter</label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Display current streak in the header</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.gamification.showStreakCounter}
                        onChange={(e) => updateSettings('gamification', 'showStreakCounter', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Focus Settings */}
            {activeTab === 'focus' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-black dark:text-white">Focus Mission Settings</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">Configure your focus session preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Default Mission Duration (minutes)
                    </label>
                    <Input
                      type="number"
                      min="5"
                      max="180"
                      value={settings.focus.defaultMissionDuration}
                      onChange={(e) => updateSettings('focus', 'defaultMissionDuration', parseInt(e.target.value))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Pomodoro Break Duration (minutes)
                    </label>
                    <Input
                      type="number"
                      min="1"
                      max="30"
                      value={settings.focus.pomodoroBreakDuration}
                      onChange={(e) => updateSettings('focus', 'pomodoroBreakDuration', parseInt(e.target.value))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Long Break Duration (minutes)
                    </label>
                    <Input
                      type="number"
                      min="5"
                      max="60"
                      value={settings.focus.longBreakDuration}
                      onChange={(e) => updateSettings('focus', 'longBreakDuration', parseInt(e.target.value))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Auto-start Timer</label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Automatically start focus timers when created</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.focus.autoStartBreaks}
                        onChange={(e) => updateSettings('focus', 'autoStartBreaks', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Strict Mode</label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Prevent early mission termination</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.focus.strictMode}
                        onChange={(e) => updateSettings('focus', 'strictMode', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* AI Settings */}
            {activeTab === 'ai' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-black dark:text-white">AI Features</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">Configure AI-powered features using your OpenAI API key</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable AI Features</label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Use AI for learning recommendations, job insights, and motivational messages</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.ai.enableAiFeatures}
                        onChange={(e) => updateSettings('ai', 'enableAiFeatures', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  {settings.ai.enableAiFeatures && (
                    <div className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span>AI features are enabled</span>
                    </div>
                  )}
                  
                  {settings.ai.enableAiFeatures && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        OpenAI API Key
                      </label>
                      <Input
                        type="password"
                        value={settings.ai.openaiApiKey}
                        onChange={(e) => updateSettings('ai', 'openaiApiKey', e.target.value)}
                        placeholder="sk-..."
                        className={`font-mono text-sm ${
                          settings.ai.openaiApiKey && !settings.ai.openaiApiKey.startsWith('sk-') 
                            ? 'border-red-500 focus:border-red-500' 
                            : ''
                        }`}
                      />
                      {settings.ai.openaiApiKey && !settings.ai.openaiApiKey.startsWith('sk-') && (
                        <p className="text-xs text-red-500 mt-1">
                          API key should start with "sk-"
                        </p>
                      )}
                      <div className="flex items-center space-x-2 mt-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Your API key is stored securely and only used for AI features. Get your key from{' '}
                          <a 
                            href="https://platform.openai.com/api-keys" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            OpenAI Platform
                          </a>
                        </p>
                        {settings.ai.openaiApiKey && settings.ai.openaiApiKey.startsWith('sk-') && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              setIsTestingApiKey(true)
                              try {
                                const response = await fetch('/api/test-openai', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ apiKey: settings.ai.openaiApiKey })
                                })
                                const result = await response.json()
                                if (result.success) {
                                  toast({
                                    title: "API Key Valid",
                                    description: "Your OpenAI API key is working correctly!",
                                  })
                                } else {
                                  toast({
                                    title: "API Key Invalid",
                                    description: result.error || "Failed to validate API key",
                                    variant: "destructive"
                                  })
                                }
                              } catch (error) {
                                toast({
                                  title: "Test Failed",
                                  description: "Could not test API key. Please try again.",
                                  variant: "destructive"
                                })
                              } finally {
                                setIsTestingApiKey(false)
                              }
                            }}
                            disabled={isTestingApiKey}
                            className="text-xs"
                          >
                            {isTestingApiKey ? 'Testing...' : 'Test Key'}
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">AI Features Include:</h4>
                    <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                      <li>• Personalized learning recommendations based on your skills and goals</li>
                      <li>• Job application analysis and insights</li>
                      <li>• Motivational messages and encouragement</li>
                      <li>• Smart content suggestions for your notebook</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}


            {/* Privacy Settings */}
            {activeTab === 'privacy' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-black dark:text-white">Privacy & Data</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">Control your privacy and data sharing preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Profile Visibility</label>
                    <select
                      value={settings.privacy.profileVisibility}
                      onChange={(e) => updateSettings('privacy', 'profileVisibility', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-black dark:text-white"
                    >
                      <option value="PUBLIC">Public</option>
                      <option value="FRIENDS">Friends Only</option>
                      <option value="PRIVATE">Private</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Share Progress</label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Allow others to see your achievements</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.privacy.shareProgress}
                        onChange={(e) => updateSettings('privacy', 'shareProgress', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Opt out of Analytics</label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Disable usage analytics collection</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.privacy.analyticsOptOut}
                        onChange={(e) => updateSettings('privacy', 'analyticsOptOut', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="border-t pt-4 space-y-3">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Data Management</h4>
                    <div className="flex space-x-3">
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export Data
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleResetProgress}
                        disabled={isResetting}
                        className="text-red-600 border-red-600 hover:bg-red-50 dark:text-red-400 dark:border-red-400 dark:hover:bg-red-900/20"
                      >
                        <RotateCcw className={`h-4 w-4 mr-2 ${isResetting ? 'animate-spin' : ''}`} />
                        {isResetting ? 'Resetting...' : 'Reset Progress'}
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Save Button */}
            <div className="flex justify-center">
              <Button 
                className="w-32" 
                onClick={handleSaveSettings}
                disabled={isSaving}
              >
                <Save className={`h-4 w-4 mr-2 ${isSaving ? 'animate-spin' : ''}`} />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}