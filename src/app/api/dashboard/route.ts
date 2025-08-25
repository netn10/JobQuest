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

    // Combine all activity dates for calendar (using Israel time)
    const activeDates = new Set<string>()
    
    allMissions.forEach(mission => {
      if (mission.completedAt) {
        const date = new Date(mission.completedAt)
        // Convert to Israel time (UTC+3)
        const israelDate = new Date(date.getTime() + (3 * 60 * 60 * 1000))
        const dateStr = israelDate.toISOString().split('T')[0]
        activeDates.add(dateStr)
        console.log('Added mission date to active dates (Israel time):', dateStr)
      }
    })
    
    allApplications.forEach(app => {
      const date = new Date(app.appliedDate)
      // Convert to Israel time (UTC+3)
      const israelDate = new Date(date.getTime() + (3 * 60 * 60 * 1000))
      const dateStr = israelDate.toISOString().split('T')[0]
      activeDates.add(dateStr)
      console.log('Added application date to active dates (Israel time):', dateStr)
    })
    
    // Get today's date in Israel time
    const now = new Date()
    const israelTime = new Date(now.getTime() + (3 * 60 * 60 * 1000))
    const todayIsrael = israelTime.toISOString().split('T')[0]
    
    console.log('All active dates (Israel time):', Array.from(activeDates))
    console.log('Today\'s date (Israel time):', todayIsrael)

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

    // Get all activities for calendar and recent activity
    const allActivities = [
      ...user.missions.map((mission: any) => ({
        type: 'mission',
        title: `Completed ${mission.title}`,
        description: `Earned ${mission.xpReward} XP`,
        timestamp: mission.completedAt || mission.createdAt,
        icon: 'target'
      })),
      ...user.achievements.map((ua: any) => ({
        type: 'achievement',
        title: `Unlocked "${ua.achievement.name}"`,
        description: `Earned ${ua.achievement.xpReward} XP`,
        timestamp: ua.unlockedAt,
        icon: 'trophy'
      })),
      ...user.jobApplications.map((app: any) => ({
        type: 'application',
        title: `Applied to ${app.role} at ${app.company}`,
        description: app.status,
        timestamp: app.appliedDate,
        icon: 'briefcase'
      }))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    
    const recentActivity = allActivities.slice(0, 5)

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
