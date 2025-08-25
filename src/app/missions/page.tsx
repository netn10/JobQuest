'use client'

import { useState, useEffect, useCallback } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Target, Play, Pause, Square, Clock, Zap, Shield, Settings } from 'lucide-react'
import { FocusBlocker } from '@/components/focus-blocker'
import { BreakTimer } from '@/components/break-timer'
import { useFocusBlocker } from '@/hooks/use-focus-blocker'
import { useAuth } from '@/contexts/auth-context'
import { useSettings } from '@/contexts/settings-context'
import { showAchievementNotifications } from '@/components/achievement-notification'
import { useToast } from '@/hooks/use-toast'

type MissionStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
type MissionType = 'FOCUS' | 'LEARNING' | 'JOB_SEARCH' | 'CUSTOM'

interface Mission {
  id: string
  title: string
  description: string | null
  type: MissionType
  duration: number | null
  xpReward: number
  status: MissionStatus
  startedAt: Date | null
  completedAt: Date | null
  createdAt: Date
  updatedAt: Date
  userId: string
  blockedApps: string | null
  blockedWebsites: string | null
  timeRemaining?: number
}

export default function MissionsPage() {
  const { user } = useAuth()
  const { settings } = useSettings()
  const { toast } = useToast()
  const [missions, setMissions] = useState<Mission[]>([])
  const [loading, setLoading] = useState(true)
  const [settingsLoading, setSettingsLoading] = useState(false)
  const [focusSettings, setFocusSettings] = useState<{
    blockedWebsites: string[]
    blockedApps: string[]
  }>({ blockedWebsites: [], blockedApps: [] })
  const [breakState, setBreakState] = useState<{
    active: boolean
    type: 'short' | 'long'
    completedPomodoros: number
  }>({ active: false, type: 'short', completedPomodoros: 0 })

  const [customDuration, setCustomDuration] = useState('')
  const [customTitle, setCustomTitle] = useState('')
  const [newWebsite, setNewWebsite] = useState('')
  const [newApp, setNewApp] = useState('')

  // Calculate active mission
  const activeMission = missions.find(m => m.status === 'IN_PROGRESS')

  // Initialize focus blocker
  const { isActive: focusBlockerActive, startFocusSession, stopFocusSession } = useFocusBlocker({
    blockedWebsites: focusSettings.blockedWebsites,
    blockedApps: focusSettings.blockedApps,
    duration: activeMission?.duration || undefined
  })

  // Stable callback for blocked access
  const handleBlockedAccess = useCallback((type: 'website' | 'app', name: string) => {
    console.log(`Blocked ${type}: ${name}`)
  }, [])

  const fetchMissions = useCallback(async () => {
    if (!user?.id) return
    
    try {
      const response = await fetch(`/api/missions?userId=${user.id}`)
      const data = await response.json()
      if (data.success) {
        setMissions(data.missions)
      } else {
        console.error('Failed to fetch missions:', data.error)
      }
    } catch (error) {
      console.error('Error fetching missions:', error)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  // Fetch missions and focus settings from API
  useEffect(() => {
    fetchMissions()
    fetchFocusSettings()
  }, [fetchMissions])

  // Timer for active mission
  useEffect(() => {
    if (activeMission) {
      // Immediately update the timer for the current active mission if it's in progress
      if (activeMission.status === 'IN_PROGRESS' && activeMission.startedAt) {
        const updateTimer = () => {
          setMissions(prevMissions => 
            prevMissions.map(mission => {
              if (mission.id === activeMission.id && mission.status === 'IN_PROGRESS') {
                const startTime = new Date(mission.startedAt!).getTime()
                const currentTime = Date.now()
                const elapsedSeconds = Math.floor((currentTime - startTime) / 1000)
                const totalSeconds = (mission.duration || 0) * 60
                const remainingSeconds = Math.max(0, totalSeconds - elapsedSeconds)
                
                return {
                  ...mission,
                  timeRemaining: remainingSeconds
                }
              }
              return mission
            })
          )
        }
        
        // Update immediately
        updateTimer()
      }
      
      const interval = setInterval(async () => {
        setMissions(prevMissions => 
          prevMissions.map(mission => {
            if (mission.id === activeMission.id && mission.status === 'IN_PROGRESS') {
              const startTime = new Date(mission.startedAt!).getTime()
              const currentTime = Date.now()
              const elapsedSeconds = Math.floor((currentTime - startTime) / 1000)
              const totalSeconds = (mission.duration || 0) * 60
              const remainingSeconds = Math.max(0, totalSeconds - elapsedSeconds)
              
              // Auto-complete mission if time is up
              if (remainingSeconds === 0 && mission.status === 'IN_PROGRESS') {
                // Auto-complete the mission
                fetch('/api/missions', {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ missionId: mission.id, status: 'COMPLETED' })
                }).then(() => {
                  fetchMissions() // Refresh missions
                  stopFocusSession() // Stop focus blocking
                  
                  // Handle auto-start breaks
                  if (settings.focus.autoStartBreaks) {
                    const newCompletedPomodoros = breakState.completedPomodoros + 1
                    const isLongBreak = newCompletedPomodoros % 4 === 0
                    
                    setBreakState({
                      active: true,
                      type: isLongBreak ? 'long' : 'short',
                      completedPomodoros: newCompletedPomodoros
                    })
                  }
                })
              }
              
              return {
                ...mission,
                timeRemaining: remainingSeconds
              }
            }
            return mission
          })
        )
      }, 1000) // Update every second

      return () => clearInterval(interval)
    }
  }, [activeMission, fetchMissions, stopFocusSession, settings.focus.autoStartBreaks, breakState.completedPomodoros])

  const fetchFocusSettings = async () => {
    if (!user?.id) return
    
    try {
      const response = await fetch(`/api/focus-settings?userId=${user.id}`)
      const data = await response.json()
      if (data.success) {
        setFocusSettings(data.focusSettings)
      }
    } catch (error) {
      console.error('Error fetching focus settings:', error)
    }
  }

  const updateFocusSettings = async (newSettings: { blockedWebsites: string[], blockedApps: string[] }) => {
    setSettingsLoading(true)
    try {
      const response = await fetch('/api/focus-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          focusSettings: newSettings
        })
      })
      
      const data = await response.json()
      if (data.success) {
        setFocusSettings(newSettings)
      } else {
        console.error('Failed to update focus settings:', data.error)
      }
    } catch (error) {
      console.error('Error updating focus settings:', error)
    } finally {
      setSettingsLoading(false)
    }
  }

  const removeBlockedWebsite = (website: string) => {
    const newSettings = {
      ...focusSettings,
      blockedWebsites: focusSettings.blockedWebsites.filter(site => site !== website)
    }
    updateFocusSettings(newSettings)
  }

  const removeBlockedApp = (app: string) => {
    const newSettings = {
      ...focusSettings,
      blockedApps: focusSettings.blockedApps.filter(a => a !== app)
    }
    updateFocusSettings(newSettings)
  }

  const addBlockedWebsite = () => {
    const website = newWebsite.trim().toLowerCase()
    if (website && !focusSettings.blockedWebsites.some(site => site.toLowerCase() === website)) {
      // Remove protocol if present
      const cleanWebsite = website.replace(/^https?:\/\//, '').replace(/^www\./, '')
      const newSettings = {
        ...focusSettings,
        blockedWebsites: [...focusSettings.blockedWebsites, cleanWebsite]
      }
      updateFocusSettings(newSettings)
      setNewWebsite('')
    }
  }

  const addBlockedApp = () => {
    const app = newApp.trim()
    if (app && !focusSettings.blockedApps.some(a => a.toLowerCase() === app.toLowerCase())) {
      const newSettings = {
        ...focusSettings,
        blockedApps: [...focusSettings.blockedApps, app]
      }
      updateFocusSettings(newSettings)
      setNewApp('')
    }
  }

  const handleMissionAction = async (missionId: string, action: 'start' | 'pause' | 'stop') => {
    let status: MissionStatus
    let xpReward = 0
    
    // Strict mode check - prevent early termination
    if ((action === 'pause' || action === 'stop') && settings.focus.strictMode) {
      const mission = missions.find(m => m.id === missionId)
      if (mission && mission.status === 'IN_PROGRESS' && mission.timeRemaining !== undefined && mission.timeRemaining > 0) {
        if (!window.confirm(
          'Strict Mode is enabled. Are you sure you want to end this mission early? ' +
          'This may result in reduced XP and could break your focus streak.'
        )) {
          return // User cancelled, don't proceed
        }
      }
    }
    
    // Calculate partial XP for early completion
    if (action === 'stop') {
      const mission = missions.find(m => m.id === missionId)
      if (mission && mission.status === 'IN_PROGRESS' && mission.timeRemaining !== undefined) {
        const totalSeconds = (mission.duration || 0) * 60
        const completedSeconds = totalSeconds - mission.timeRemaining
        const completionPercentage = Math.min(100, (completedSeconds / totalSeconds) * 100)
        xpReward = Math.floor((mission.xpReward || 0) * (completionPercentage / 100))
      }
    }
    
    switch (action) {
      case 'start':
        status = 'IN_PROGRESS'
        break
      case 'pause':
        status = 'PENDING'
        break
      case 'stop':
        status = 'COMPLETED'
        break
      default:
        return
    }

    try {
      const response = await fetch('/api/missions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          missionId, 
          status,
          xpReward: action === 'stop' ? xpReward : undefined
        })
      })
      
      const data = await response.json()
      if (data.success) {
        await fetchMissions() // Refresh missions
        
        // Show achievement notifications if any were unlocked
        if (data.newlyUnlockedAchievements && data.newlyUnlockedAchievements.length > 0) {
          showAchievementNotifications(data.newlyUnlockedAchievements)
        }
        
        // Handle focus blocking
        if (action === 'start') {
          startFocusSession()
        } else if (action === 'pause' || action === 'stop') {
          stopFocusSession()
          
          // Handle auto-start breaks for manual completion
          if (action === 'stop' && settings.focus.autoStartBreaks) {
            const mission = missions.find(m => m.id === missionId)
            if (mission && mission.timeRemaining !== undefined) {
              const totalSeconds = (mission.duration || 0) * 60
              const completedSeconds = totalSeconds - mission.timeRemaining
              const completionPercentage = (completedSeconds / totalSeconds) * 100
              
              // Only start break if mission was completed > 80%
              if (completionPercentage >= 80) {
                const newCompletedPomodoros = breakState.completedPomodoros + 1
                const isLongBreak = newCompletedPomodoros % 4 === 0
                
                setBreakState({
                  active: true,
                  type: isLongBreak ? 'long' : 'short',
                  completedPomodoros: newCompletedPomodoros
                })
              }
            }
          }
        }
      } else {
        console.error('Failed to update mission:', data.error)
      }
    } catch (error) {
      console.error('Error updating mission:', error)
    }
  }

  const createCustomMission = async () => {
    if (customTitle && customDuration) {
      const duration = parseInt(customDuration)
      
      try {
        const response = await fetch('/api/missions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user?.id,
            title: customTitle,
            description: `Custom focus session for ${duration} minutes`,
            type: 'CUSTOM',
            duration,
            autoStart: true // Signal to auto-start the mission
          })
        })
        
        const data = await response.json()
        if (data.success) {
          setCustomTitle('')
          setCustomDuration('')
          await fetchMissions() // Refresh missions
          
          // Show success toast
          toast({
            title: "Mission Created!",
            description: `${customTitle} (${duration} minutes) has been started.`,
            variant: "success"
          })
          
          // Start focus session immediately
          startFocusSession()
        } else {
          console.error('Failed to create mission:', data.error)
          toast({
            title: "Failed to Create Mission",
            description: data.error || "An error occurred while creating the mission.",
            variant: "destructive"
          })
        }
      } catch (error) {
        console.error('Error creating mission:', error)
      }
    }
  }

  const getStatusColor = (status: MissionStatus) => {
    switch (status) {
      case 'IN_PROGRESS': return 'text-green-800 bg-green-100 dark:bg-green-900/30 dark:text-green-300'
      case 'COMPLETED': return 'text-blue-800 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300'
      case 'FAILED': return 'text-red-800 bg-red-100 dark:bg-red-900/30 dark:text-red-300'
      case 'CANCELLED': return 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-300'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-300'
    }
  }

  const getCurrentXpReward = (mission: Mission) => {
    if (mission.status !== 'IN_PROGRESS' || mission.timeRemaining === undefined || !mission.duration) {
      return mission.xpReward
    }
    
    const totalSeconds = mission.duration * 60
    const completedSeconds = totalSeconds - mission.timeRemaining
    const completionPercentage = Math.min(100, (completedSeconds / totalSeconds) * 100)
    return Math.floor((mission.xpReward || 0) * (completionPercentage / 100))
  }

  const handleBreakComplete = () => {
    setBreakState(prev => ({ ...prev, active: false }))
  }

  const handleBreakSkip = () => {
    setBreakState(prev => ({ ...prev, active: false }))
  }

  const handleBreakStart = () => {
    // Break timer handles its own state
  }

  if (!user) {
    return (
      <DashboardLayout title="Focus Missions">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <p className="text-foreground">Please log in to access missions.</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (loading) {
    return (
      <DashboardLayout title="Focus Missions">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-foreground">Loading missions...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Focus Missions">
      <FocusBlocker
        isActive={focusBlockerActive}
        blockedWebsites={focusSettings.blockedWebsites}
        blockedApps={focusSettings.blockedApps}
        missionDuration={activeMission?.duration || undefined}
        missionTitle={activeMission?.title}
        onBlockedAccess={handleBlockedAccess}
      />
      
      <BreakTimer
        isActive={breakState.active}
        duration={breakState.type === 'long' ? settings.focus.longBreakDuration : settings.focus.pomodoroBreakDuration}
        type={breakState.type}
        onComplete={handleBreakComplete}
        onSkip={handleBreakSkip}
        onStart={handleBreakStart}
        autoStart={settings.focus.autoStartBreaks}
      />
      <div className="space-y-6">
        {/* Active Mission Timer */}
        {activeMission && (
          <Card className="border-green-300 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-500 dark:bg-green-600 rounded-full flex items-center justify-center">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-green-800 dark:text-green-200">{activeMission.title}</CardTitle>
                    <CardDescription className="text-green-600 dark:text-green-400">
                      {activeMission.duration} minutes total
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleMissionAction(activeMission.id, 'pause')}
                    className={settings.focus.strictMode ? 'border-yellow-500 text-yellow-600 hover:bg-yellow-50' : ''}
                    title={settings.focus.strictMode ? 'Strict mode enabled - confirm to pause' : 'Pause mission'}
                  >
                    <Pause className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleMissionAction(activeMission.id, 'stop')}
                    className={settings.focus.strictMode ? 'border-red-500 text-red-600 hover:bg-red-50' : ''}
                    title={settings.focus.strictMode ? 'Strict mode enabled - confirm to end early' : 'End mission'}
                  >
                    <Square className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="w-full bg-green-200 dark:bg-green-800/50 rounded-full h-3 mb-4">
                <div 
                  className="bg-green-500 dark:bg-green-400 h-3 rounded-full transition-all duration-1000" 
                  style={{ 
                    width: activeMission.duration && activeMission.timeRemaining !== undefined
                      ? `${Math.max(0, 100 - (activeMission.timeRemaining / (activeMission.duration * 60) * 100))}%`
                      : '0%'
                  }}
                ></div>
              </div>
              <div className="text-center mb-4">
                <div className="text-2xl font-bold text-green-800 dark:text-green-200">
                  {activeMission.timeRemaining !== undefined
                    ? `${Math.floor(activeMission.timeRemaining / 60)}:${(activeMission.timeRemaining % 60).toString().padStart(2, '0')}`
                    : activeMission.duration ? `${activeMission.duration}:00` : '0:00'
                  }
                </div>
                <div className="text-sm text-green-600 dark:text-green-400">
                  {activeMission.timeRemaining !== undefined && activeMission.duration
                    ? `${Math.floor((activeMission.duration * 60 - activeMission.timeRemaining) / 60)}/${activeMission.duration} minutes completed`
                    : 'Timer ready to start'
                  }
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-3">
                  <span className="text-green-700 dark:text-green-300">
                    <Shield className="h-4 w-4 inline mr-1" />
                    Distractions blocked
                  </span>
                  {settings.focus.strictMode && (
                    <span className="text-amber-600 dark:text-amber-400 text-xs bg-amber-100 dark:bg-amber-900/30 px-2 py-1 rounded">
                      Strict Mode
                    </span>
                  )}
                </div>
                <span className="font-medium text-green-800 dark:text-green-200">
                  +{getCurrentXpReward(activeMission)} out of {activeMission.xpReward} XP {activeMission.status === 'IN_PROGRESS' ? 'so far' : 'on completion'}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Start Templates */}
        <Card>
          <CardHeader>
                          <CardTitle className="text-foreground">Quick Start Templates</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">Choose from pre-defined focus sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="h-20 flex-col space-y-2"
                onClick={async () => {
                  try {
                    const response = await fetch('/api/missions', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        userId: user?.id,
                        title: 'Pomodoro Focus',
                        description: 'Pomodoro focus session for 25 minutes',
                        type: 'FOCUS',
                        duration: 25,
                        autoStart: true
                      })
                    })
                    const data = await response.json()
                    if (data.success) {
                      await fetchMissions()
                      toast({
                        title: "Mission Created!",
                        description: "Pomodoro Focus (25 minutes) has been started.",
                        variant: "success"
                      })
                      startFocusSession()
                    } else {
                      toast({
                        title: "Failed to Create Mission",
                        description: data.error || "An error occurred while creating the mission.",
                        variant: "destructive"
                      })
                    }
                  } catch (error) {
                    console.error('Error creating mission:', error)
                    toast({
                      title: "Failed to Create Mission",
                      description: "An error occurred while creating the mission.",
                      variant: "destructive"
                    })
                  }
                }}
              >
                <Clock className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium text-foreground">Pomodoro</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">25 minutes</div>
                </div>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col space-y-2"
                onClick={async () => {
                  try {
                    const response = await fetch('/api/missions', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        userId: user?.id,
                        title: 'Deep Work Session',
                        description: 'Deep work session for 50 minutes',
                        type: 'FOCUS',
                        duration: 50,
                        autoStart: true
                      })
                    })
                    const data = await response.json()
                    if (data.success) {
                      await fetchMissions()
                      toast({
                        title: "Mission Created!",
                        description: "Deep Work Session (50 minutes) has been started.",
                        variant: "success"
                      })
                      startFocusSession()
                    } else {
                      toast({
                        title: "Failed to Create Mission",
                        description: data.error || "An error occurred while creating the mission.",
                        variant: "destructive"
                      })
                    }
                  } catch (error) {
                    console.error('Error creating mission:', error)
                    toast({
                      title: "Failed to Create Mission",
                      description: "An error occurred while creating the mission.",
                      variant: "destructive"
                    })
                  }
                }}
              >
                <Target className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium text-foreground">Deep Work</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">50 minutes</div>
                </div>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col space-y-2"
                onClick={async () => {
                  try {
                    const response = await fetch('/api/missions', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        userId: user?.id,
                        title: 'Extended Focus',
                        description: 'Extended focus session for 90 minutes',
                        type: 'FOCUS',
                        duration: 90,
                        autoStart: true
                      })
                    })
                    const data = await response.json()
                    if (data.success) {
                      await fetchMissions()
                      toast({
                        title: "Mission Created!",
                        description: "Extended Focus (90 minutes) has been started.",
                        variant: "success"
                      })
                      startFocusSession()
                    } else {
                      toast({
                        title: "Failed to Create Mission",
                        description: data.error || "An error occurred while creating the mission.",
                        variant: "destructive"
                      })
                    }
                  } catch (error) {
                    console.error('Error creating mission:', error)
                    toast({
                      title: "Failed to Create Mission",
                      description: "An error occurred while creating the mission.",
                      variant: "destructive"
                    })
                  }
                }}
              >
                <Zap className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium text-foreground">Extended</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">90 minutes</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Create Custom Mission */}
        <Card>
          <CardHeader>
                          <CardTitle className="text-foreground">Create Custom Mission</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">Set up a personalized focus session</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="Mission title"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
              />
              <Input
                type="number"
                placeholder="Duration (minutes)"
                value={customDuration}
                onChange={(e) => setCustomDuration(e.target.value)}
                min="5"
                max="180"
              />
              <Button 
                onClick={createCustomMission} 
                className="w-full md:w-auto"
                disabled={!customTitle.trim() || !customDuration || parseInt(customDuration) < 5}
              >
                <Target className="h-4 w-4 mr-2" />
                Create Mission
              </Button>
            </div>
            {(!customTitle.trim() || !customDuration || parseInt(customDuration) < 5) && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Please enter a mission title and duration (minimum 5 minutes)
              </p>
            )}
          </CardContent>
        </Card>

        {/* Mission Queue */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {missions.map((mission) => (
            <Card key={mission.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-foreground">{mission.title}</CardTitle>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(mission.status)}`}>
                    {mission.status}
                  </span>
                </div>
                <CardDescription className="text-gray-600 dark:text-gray-400">{mission.description || 'No description'}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{mission.duration || 0} minutes</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      <span>{mission.xpReward} XP</span>
                    </div>
                  </div>
                  
                  {mission.status === 'PENDING' && (
                    <Button 
                      className="w-full" 
                      onClick={() => handleMissionAction(mission.id, 'start')}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Mission
                    </Button>
                  )}
                  
                  {mission.status === 'IN_PROGRESS' && (
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => handleMissionAction(mission.id, 'pause')}
                      >
                        <Pause className="h-4 w-4 mr-2" />
                        Pause
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => handleMissionAction(mission.id, 'stop')}
                      >
                        <Square className="h-4 w-4 mr-2" />
                        End
                      </Button>
                    </div>
                  )}
                  
                  {mission.status === 'COMPLETED' && (
                    <div className="text-center text-green-600 dark:text-green-400 font-medium">
                      ✅ Mission Completed!
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Focus Settings */}
        <Card>
          <CardHeader>
                          <CardTitle className="flex items-center space-x-2 text-foreground">
              <Settings className="h-5 w-5" />
              <span>Focus Settings</span>
              {settingsLoading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              )}
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">Configure what gets blocked during focus sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3 text-foreground">Blocked Websites</h4>
                <div className="space-y-2">
                  {focusSettings.blockedWebsites.map((site) => (
                    <div key={site} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <span className="text-sm text-foreground">{site}</span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => removeBlockedWebsite(site)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Enter website (e.g., facebook.com)"
                      value={newWebsite}
                      onChange={(e) => setNewWebsite(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addBlockedWebsite()}
                      className="flex-1"
                    />
                    <Button 
                      variant="outline" 
                      onClick={addBlockedWebsite}
                      disabled={!newWebsite.trim()}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-3 text-foreground">Blocked Applications</h4>
                <div className="space-y-2">
                  {focusSettings.blockedApps.map((app) => (
                    <div key={app} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <span className="text-sm text-foreground">{app}</span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => removeBlockedApp(app)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Enter application name (e.g., Slack)"
                      value={newApp}
                      onChange={(e) => setNewApp(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addBlockedApp()}
                      className="flex-1"
                    />
                    <Button 
                      variant="outline" 
                      onClick={addBlockedApp}
                      disabled={!newApp.trim()}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}