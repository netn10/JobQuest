import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { logAchievementUnlocked } from '@/lib/activity-logger'
import { createConsistentDailyChallenges, getUserDailyChallengeSettings } from '@/lib/daily-challenges'

export async function GET(request: NextRequest) {
  try {
    // Get user ID from authorization header
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const userId = authHeader.replace('Bearer ', '')
    
    // Get today's date in UTC
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    // Get or create today's challenges
    let dailyChallenges = await prisma.dailyChallenge.findMany({
      where: {
        date: {
          gte: today,
          lt: tomorrow
        }
      }
    })
    
    // If no challenges exist for today, create them
    if (dailyChallenges.length === 0) {
      dailyChallenges = await createConsistentDailyChallenges(today, userId)
    }
    
    // Get user's progress for all challenges
    const challengesWithProgress = []
    for (const dailyChallenge of dailyChallenges) {
      let userProgress = await prisma.dailyChallengeProgress.findUnique({
        where: {
          userId_challengeId: {
            userId,
            challengeId: dailyChallenge.id
          }
        }
      })
      
      // If no progress exists, create it
      if (!userProgress) {
        userProgress = await prisma.dailyChallengeProgress.create({
          data: {
            userId,
            challengeId: dailyChallenge.id,
            status: 'NOT_STARTED',
            progress: 0
          }
        })
      }
      
      // Calculate progress percentage
      const progressPercentage = calculateProgress(dailyChallenge, userProgress)
      
      challengesWithProgress.push({
        challenge: dailyChallenge,
        progress: userProgress,
        progressPercentage
      })
    }
    
    // Get recent challenges (last 7 days)
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    
    const recentChallenges = await prisma.dailyChallenge.findMany({
      where: {
        date: {
          gte: oneWeekAgo
        }
      },
      orderBy: {
        date: 'desc'
      },
      include: {
        progress: {
          where: {
            userId
          }
        }
      }
    })
    
    // Get challenge statistics
    const totalCompleted = await prisma.dailyChallengeProgress.count({
      where: {
        userId,
        status: 'COMPLETED'
      }
    })
    
    // Calculate total XP earned from completed challenges
    const completedChallenges = await prisma.dailyChallengeProgress.findMany({
      where: {
        userId,
        status: 'COMPLETED'
      },
      include: {
        challenge: true
      }
    })
    
    const totalXpEarned = completedChallenges.reduce((total, progress) => {
      return total + (progress.challenge.xpReward || 0)
    }, 0)
    
    // Get user's current streak and longest streak
    const userData = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        currentStreak: true,
        longestStreak: true
      }
    })
    
    return NextResponse.json({
      currentChallenges: challengesWithProgress,
      recentChallenges: recentChallenges.map(challenge => {
        const userProgress = challenge.progress[0]
        const progressPercentage = userProgress ? calculateProgress(challenge, userProgress) : 0
        return {
          challenge,
          progress: userProgress || { status: 'NOT_STARTED', progress: 0 },
          progressPercentage
        }
      }),
      stats: {
        totalCompleted,
        totalXpEarned: totalXpEarned,
        currentStreak: userData?.currentStreak || 0,
        longestStreak: Number(userData?.longestStreak || 0)
      }
    })
    
  } catch (error) {
    console.error('Error fetching daily challenge:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  // POST method no longer needed since challenges are automatically active
  return NextResponse.json({ message: 'Daily challenges are now automatically active' }, { status: 200 })
}



function calculateProgress(challenge: any, userProgress: any): number {
  try {
    const requirement = JSON.parse(challenge.requirement)
    
    switch (requirement.type) {
      case 'MISSIONS_COMPLETED':
        return Math.min((userProgress.progress / (requirement.count || 1)) * 100, 100)
      case 'LEARNING_RESOURCES':
        return Math.min((userProgress.progress / (requirement.count || 1)) * 100, 100)
      case 'JOB_APPLICATIONS':
        return Math.min((userProgress.progress / (requirement.count || 1)) * 100, 100)
      case 'STREAK_DAYS':
        return Math.min((userProgress.progress / (requirement.days || 1)) * 100, 100)
      case 'EARLY_FOCUS_SESSIONS':
      case 'LATE_FOCUS_SESSIONS':
      case 'WEEKEND_FOCUS_SESSIONS':
      case 'POMODORO_SESSIONS':
      case 'NOTEBOOK_ENTRIES':
        return Math.min((userProgress.progress / (requirement.count || 1)) * 100, 100)
      case 'LEARNING_CATEGORIES':
        return Math.min((userProgress.progress / (requirement.count || 1)) * 100, 100)
      default:
        return Math.min(userProgress.progress, 100)
    }
  } catch (error) {
    return Math.min(userProgress.progress, 100)
  }
}
