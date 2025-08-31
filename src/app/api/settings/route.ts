import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true,
        name: true,
        email: true,
        timezone: true,
        focusSettings: true,
        notifications: true,
        notificationPreferences: true,
        longestStreak: true,
        openaiApiKey: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Parse stored settings or use defaults
    const focusSettings = user.focusSettings ? JSON.parse(user.focusSettings as string) : {
      blockedWebsites: ['facebook.com', 'twitter.com', 'youtube.com', 'reddit.com'],
      blockedApps: ['Slack', 'Discord', 'Steam']
    }

    // Parse notification preferences or use defaults
    const notificationPreferences = user.notificationPreferences ? JSON.parse(user.notificationPreferences as string) : {
      missionReminders: true,
      achievementUnlocks: true,
      dailyChallenges: true,
      jobApplicationFollowups: true,
      learningsuggestions: true,
      streakWarnings: true,
      emailNotifications: user.notifications || false
    }

    const settings = {
      profile: {
        name: user.name || '',
        email: user.email || '',
        timezone: user.timezone || 'UTC'
      },
      notifications: notificationPreferences,
      gamification: {
        xpMultiplier: 1.0,
        difficultyPreference: 'NORMAL' as const,
        showLevelProgress: true,
        showStreakCounter: true
      },
      focus: {
        defaultMissionDuration: focusSettings.defaultMissionDuration || 25,
        pomodoroBreakDuration: focusSettings.pomodoroBreakDuration || 5,
        longBreakDuration: focusSettings.longBreakDuration || 15,
        autoStartBreaks: focusSettings.autoStartBreaks || false,
        strictMode: focusSettings.strictMode !== undefined ? focusSettings.strictMode : true,
        blockedWebsites: focusSettings.blockedWebsites || [],
        blockedApps: focusSettings.blockedApps || []
      },
      privacy: {
        profileVisibility: 'PRIVATE' as const,
        shareProgress: false,
        analyticsOptOut: false
      },
      appearance: {
        colorScheme: 'BLUE' as const,
        compactMode: false
      },
      ai: {
        openaiApiKey: user.openaiApiKey || '',
        enableAiFeatures: !!user.openaiApiKey
      }
    }

    return NextResponse.json({
      success: true,
      settings
    })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, settings } = body

    if (!userId || !settings) {
      return NextResponse.json(
        { success: false, error: 'User ID and settings required' },
        { status: 400 }
      )
    }

    // Update user profile if provided
    const updateData: any = {}
    
    if (settings.profile) {
      if (settings.profile.name) updateData.name = settings.profile.name
      if (settings.profile.email) updateData.email = settings.profile.email
      if (settings.profile.timezone) updateData.timezone = settings.profile.timezone
    }

    if (settings.notifications) {
      // Store granular notification preferences as JSON
      updateData.notificationPreferences = JSON.stringify(settings.notifications)
      // Keep the legacy notifications field for backward compatibility
      updateData.notifications = settings.notifications.emailNotifications
    }

    // Store focus settings as JSON
    if (settings.focus) {
      const focusSettings = {
        defaultMissionDuration: settings.focus.defaultMissionDuration,
        pomodoroBreakDuration: settings.focus.pomodoroBreakDuration,
        longBreakDuration: settings.focus.longBreakDuration,
        autoStartBreaks: settings.focus.autoStartBreaks,
        strictMode: settings.focus.strictMode,
        blockedWebsites: settings.focus.blockedWebsites || [],
        blockedApps: settings.focus.blockedApps || []
      }
      updateData.focusSettings = JSON.stringify(focusSettings)
    }

    // Store AI settings
    if (settings.ai) {
      if (settings.ai.openaiApiKey !== undefined) {
        updateData.openaiApiKey = settings.ai.openaiApiKey
      }
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData
    })

    // Convert BigInt values to strings for JSON serialization
    const serializedUser = {
      ...user,
      longestStreak: user.longestStreak.toString()
    }

    return NextResponse.json({
      success: true,
      user: serializedUser
    })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}