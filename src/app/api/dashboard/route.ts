import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { checkAndUnlockAchievements } from '@/lib/achievements'

export async function GET(request: NextRequest) {
  try {
    // Get user ID from authorization header
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
      console.log('No authorization header provided')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const userId = authHeader.replace('Bearer ', '')
    console.log('Looking for user with ID:', userId)
    
    // Get user data with expanded includes
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        missions: {
          where: { status: 'IN_PROGRESS' },
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        jobApplications: {
          orderBy: { appliedDate: 'desc' },
          take: 10
        },
        achievements: {
          include: {
            achievement: true
          },
          orderBy: { unlockedAt: 'desc' },
          take: 5
        },
        dailyChallenges: {
          include: {
            challenge: true
          },
          where: {
            challenge: {
              date: {
                gte: new Date(new Date().setHours(0, 0, 0, 0))
              }
            }
          }
        },
        learningProgress: {
          include: {
            resource: true
          },
          orderBy: { id: 'desc' },
          take: 10
        },
        notebookEntries: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 50
        }
      }
    })

    // Get all completed missions and job applications for calendar
    const allMissions = await prisma.mission.findMany({
      where: { 
        userId,
        status: 'COMPLETED',
        completedAt: { not: null }
      },
      select: { completedAt: true }
    })

    const allApplications = await prisma.jobApplication.findMany({
      where: { userId },
      select: { appliedDate: true }
    })

    // Combine all activity dates for calendar (using user's timezone)
    const activeDates = new Set<string>()
    const userTimezone = user?.timezone || 'UTC'
    
    // Helper function to get date string in user's timezone
    const getDateInUserTimezone = (date: Date) => {
      if (userTimezone !== 'UTC') {
        const dateParts = date.toLocaleDateString('en-CA', { timeZone: userTimezone }).split('-')
        return `${dateParts[0]}-${dateParts[1]}-${dateParts[2]}`
      } else {
        return date.toISOString().split('T')[0]
      }
    }
    
    // Add dates from activities
    if (user && user.activities) {
      user.activities.forEach(activity => {
        const date = new Date(activity.createdAt)
        const dateStr = getDateInUserTimezone(date)
        activeDates.add(dateStr)
      })
    }
    
    // Also include legacy dates from missions and applications for backward compatibility
    allMissions.forEach(mission => {
      if (mission.completedAt) {
        const date = new Date(mission.completedAt)
        const dateStr = getDateInUserTimezone(date)
        activeDates.add(dateStr)
      }
    })
    
    allApplications.forEach(app => {
      const date = new Date(app.appliedDate)
      const dateStr = getDateInUserTimezone(date)
      activeDates.add(dateStr)
    })
    
    // Get today's date in user's timezone
    const now = new Date()
    let today: string
    
    if (userTimezone !== 'UTC') {
      const dateParts = now.toLocaleDateString('en-CA', { timeZone: userTimezone }).split('-')
      today = `${dateParts[0]}-${dateParts[1]}-${dateParts[2]}`
    } else {
      today = now.toISOString().split('T')[0]
    }
    
    console.log('All active dates:', Array.from(activeDates))
    console.log('Today\'s date:', today)
    console.log('User timezone:', userTimezone)

    // If user doesn't exist, return error
    if (!user) {
      console.log('User not found for ID:', userId)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    console.log('Found user:', { id: user.id, name: user.name, email: user.email, totalXp: user.totalXp })

    // Check for achievement unlocks
    try {
      const achievementResult = await checkAndUnlockAchievements(userId)
      if (achievementResult.newlyUnlockedAchievements.length > 0) {
        console.log(`Unlocked ${achievementResult.newlyUnlockedAchievements.length} achievements for user ${userId}`)
      }
    } catch (error) {
      console.error('Error checking achievements in dashboard:', error)
    }

    // Calculate XP needed for next level (simple formula: level * 100)
    const xpForNextLevel = user.level * 100
    const xpProgress = user.totalXp % 100

    // Process activities from the Activity model
    const allActivities = user.activities.map((activity: any) => {
      let icon = 'clock'
      
      // Map activity types to icons
      switch (activity.type) {
        case 'MISSION_STARTED':
        case 'MISSION_COMPLETED':
        case 'MISSION_FAILED':
          icon = 'target'
          break
        case 'JOB_APPLIED':
        case 'JOB_STATUS_UPDATED':
          icon = 'briefcase'
          break
        case 'NOTEBOOK_ENTRY_CREATED':
        case 'NOTEBOOK_ENTRY_UPDATED':
          icon = 'file'
          break
        case 'LEARNING_STARTED':
        case 'LEARNING_COMPLETED':
        case 'LEARNING_PROGRESS_UPDATED':
          icon = 'book'
          break
        case 'ACHIEVEMENT_UNLOCKED':
          icon = 'trophy'
          break
        case 'DAILY_CHALLENGE_COMPLETED':
          icon = 'zap'
          break
        case 'STREAK_MILESTONE':
        case 'XP_EARNED':
        case 'LEVEL_UP':
          icon = 'trending-up'
          break
      }
      
      return {
        type: activity.type.toLowerCase(),
        title: activity.title,
        description: activity.description,
        timestamp: activity.createdAt,
        icon,
        xpEarned: activity.xpEarned,
        metadata: activity.metadata ? JSON.parse(activity.metadata) : null
      }
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    
    const recentActivity = allActivities.slice(0, 10)

    // Get recent job applications with enhanced data
    const recentJobs = user.jobApplications.slice(0, 5).map((app: any) => ({
      id: app.id,
      role: app.role,
      company: app.company,
      status: app.status,
      appliedDate: app.appliedDate,
      location: app.location,
      salary: app.salary
    }))

    // Get recent learning activities
    const recentLearning = user.learningProgress.slice(0, 5).map((progress: any) => ({
      id: progress.id,
      title: progress.resource.title,
      source: progress.resource.source,
      type: progress.resource.type,
      status: progress.status,
      progress: progress.progress,
      timeSpent: progress.timeSpent
    }))

    // Get recent notebook entries
    const recentNotebookEntries = user.notebookEntries.slice(0, 5).map((entry: any) => ({
      id: entry.id,
      title: entry.title,
      content: entry.content,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt
    }))

    // Get upcoming interviews (mock data for now)
    const upcomingInterviews = user.jobApplications
      .filter((app: any) => app.status === 'INTERVIEW' || app.status === 'SCREENING')
      .slice(0, 3)
      .map((app: any) => ({
        id: app.id,
        role: app.role,
        company: app.company,
        type: app.status === 'INTERVIEW' ? 'Interview' : 'Screening',
        date: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: `${Math.floor(Math.random() * 12) + 9}:${Math.random() > 0.5 ? '00' : '30'}`
      }))

    // Calculate weekly progress (last 7 days)
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    
    const weeklyMissions = await prisma.mission.count({
      where: {
        userId,
        status: 'COMPLETED',
        completedAt: { gte: oneWeekAgo }
      }
    })

    const weeklyApplications = await prisma.jobApplication.count({
      where: {
        userId,
        appliedDate: { gte: oneWeekAgo }
      }
    })

    const weeklyLearningHours = user.learningProgress
      .filter((progress: any) => new Date(progress.id) >= oneWeekAgo) // Using id as a fallback since there's no updatedAt
      .reduce((total: number, progress: any) => total + (progress.timeSpent || 0), 0) / 60

    const weeklyNotebookEntries = await prisma.notebookEntry.count({
      where: {
        userId,
        createdAt: { gte: oneWeekAgo }
      }
    })

    return NextResponse.json({
      stats: {
        totalXp: user.totalXp,
        level: user.level,
        currentStreak: user.currentStreak,
        longestStreak: Number(user.longestStreak),
        applications: user.jobApplications.length,
        pendingResponses: user.jobApplications.filter((app: any) => app.status === 'APPLIED' || app.status === 'SCREENING').length,
        xpForNextLevel,
        xpProgress
      },
      activeMissions: user.missions,
      dailyChallenge: user.dailyChallenges[0] || null,
      recentActivity,
      allActivities,
      activeDates: Array.from(activeDates),
      recentJobs,
      recentLearning,
      recentNotebookEntries,
      upcomingInterviews,
      learningRecommendations: [], // TODO: Implement learning recommendations
      jobRecommendations: [], // TODO: Implement job recommendations
      weeklyProgress: {
        missionsCompleted: weeklyMissions,
        applicationsSubmitted: weeklyApplications,
        learningHours: Math.round(weeklyLearningHours * 10) / 10,
        notebookEntries: weeklyNotebookEntries
      }
    })

  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error')
    
    // Return fallback mock data with all zeros
    return NextResponse.json({
      stats: {
        totalXp: 0,
        level: 1,
        currentStreak: 0,
        longestStreak: 0,
        applications: 0,
        pendingResponses: 0,
        xpForNextLevel: 100,
        xpProgress: 0
      },
      activeMissions: [],
      dailyChallenge: null,
      recentActivity: [],
      allActivities: [],
      activeDates: [],
      recentJobs: [],
      recentLearning: [],
      recentNotebookEntries: [],
      upcomingInterviews: [],
      learningRecommendations: [],
      jobRecommendations: [],
      weeklyProgress: {
        missionsCompleted: 0,
        applicationsSubmitted: 0,
        learningHours: 0,
        notebookEntries: 0
      }
    })
  }
}
