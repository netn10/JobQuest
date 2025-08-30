import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { checkAndUnlockAchievements } from '@/lib/achievements'

export async function GET(request: NextRequest) {
  // Get user ID from authorization header
  const authHeader = request.headers.get('authorization')
  
  try {
    if (!authHeader) {
      console.log('No authorization header provided')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const userId = authHeader.replace('Bearer ', '')
    console.log('Looking for user with ID:', userId)
    
    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        jobApplications: {
          where: {
            status: { in: ['APPLIED', 'SCREENING'] }
          }
        },
        notebookEntries: true,
        learningProgress: {
          where: {
            status: 'COMPLETED'
          }
        },
        achievements: {
          include: {
            achievement: true
          }
        }
      }
    })

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
      console.error('Error checking achievements in user stats:', error)
      // Don't fail the entire request if achievements check fails
    }

    // Calculate XP needed for next level (simple formula: level * 100)
    const xpForNextLevel = user.level * 100
    const xpProgress = user.totalXp % 100

    // Calculate additional stats
    const notebookEntries = user.notebookEntries.length
    const completedLearning = user.learningProgress.length
    const unlockedAchievements = user.achievements.length
    const totalLearningHours = user.learningProgress.reduce((total, progress) => total + (progress.timeSpent || 0), 0) / 60

    return NextResponse.json({
      totalXp: user.totalXp,
      level: user.level,
      currentStreak: user.currentStreak,
      longestStreak: Number(user.longestStreak),
      applications: user.jobApplications.length,
      pendingResponses: user.jobApplications.filter(app => app.status === 'APPLIED' || app.status === 'SCREENING').length,
      xpForNextLevel,
      xpProgress,
      notebookEntries,
      completedLearning,
      unlockedAchievements,
      totalLearningHours: Math.round(totalLearningHours * 10) / 10
    })

  } catch (error) {
    console.error('Error fetching user stats:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      userId: authHeader?.replace('Bearer ', '') || 'no userId'
    })
    
    // Return error response instead of fallback data
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
