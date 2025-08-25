'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useTheme } from '@/contexts/theme-context'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/hooks/use-toast'
import { 
  Settings,
  User,
  Bell,
  Shield,
  Palette,
  Zap,
  Clock,
  Globe,
  Download,
  Trash2,
  Save,
  RotateCcw
} from 'lucide-react'

interface UserSettings {
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

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { user, updateUser } = useAuth()
  const { toast } = useToast()
  const [isResetting, setIsResetting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [settings, setSettings] = useState<UserSettings>({
    profile: {
      name: user?.name || '',
      email: user?.email || ''
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
  })

  const [activeTab, setActiveTab] = useState('profile')

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

  const updateSettings = (section: keyof UserSettings, field: string, value: string | number | boolean) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }

  const handleSaveProfile = async () => {
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
      const response = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}`
        },
        body: JSON.stringify({
          name: settings.profile.name,
          email: settings.profile.email
        })
      })

      if (response.ok) {
        toast({
          title: "Profile Updated",
          description: "Your profile information has been saved successfully.",
        })
        // Update the user context with new data
        updateUser({
          name: settings.profile.name,
          email: settings.profile.email
        })
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile",
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
      "• All daily challenge progress\n\n" +
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
      console.error('Error resetting progress:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to reset progress",
        variant: "destructive"
      })
    } finally {
      setIsResetting(false)
    }
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'gamification', label: 'Gamification', icon: Zap },
    { id: 'focus', label: 'Focus', icon: Clock },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'privacy', label: 'Privacy', icon: Shield }
  ]

  return (
    <DashboardLayout title="Settings">
      <div className="space-y-6">
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
                <CardContent className="space-y-4">
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
                          onChange={(e) => updateSettings('notifications', key, e.target.checked)}
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
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Auto-start Breaks</label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Automatically start break timers</p>
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

            {/* Appearance Settings */}
            {activeTab === 'appearance' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-black dark:text-white">Appearance</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">Customize the look and feel of JobQuest</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Theme</label>
                    <select
                      value={theme}
                      onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'system')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-black dark:text-white"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="system">System</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color Scheme</label>
                    <div className="grid grid-cols-4 gap-2">
                      {['BLUE', 'GREEN', 'PURPLE', 'ORANGE'].map(color => (
                        <button
                          key={color}
                          onClick={() => updateSettings('appearance', 'colorScheme', color)}
                          className={`h-12 rounded-md flex items-center justify-center text-white font-medium cursor-pointer ${
                            color === 'BLUE' ? 'bg-blue-500' :
                            color === 'GREEN' ? 'bg-green-500' :
                            color === 'PURPLE' ? 'bg-purple-500' :
                            'bg-orange-500'
                          } ${settings.appearance.colorScheme === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Compact Mode</label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Reduce spacing for smaller screens</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.appearance.compactMode}
                        onChange={(e) => updateSettings('appearance', 'compactMode', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
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
            <div className="flex justify-end">
              <Button 
                className="w-32" 
                onClick={handleSaveProfile}
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