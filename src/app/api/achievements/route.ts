import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAchievementProgress } from '@/lib/achievements'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = authHeader.replace('Bearer ', '')
    
    // Get user data to calculate progress
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        missions: true,
        jobApplications: true,
        learningProgress: true,
        achievements: {
          include: {
            achievement: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get achievements with progress using the utility function
    const achievementsWithProgress = await getAchievementProgress(userId)

    // Calculate stats
    const totalAchievements = achievementsWithProgress.length
    const unlockedAchievements = achievementsWithProgress.filter(a => a.isUnlocked).length
    const totalXPFromAchievements = achievementsWithProgress
      .filter(a => a.isUnlocked)
      .reduce((total, a) => total + a.xpReward, 0)

    return NextResponse.json({
      achievements: achievementsWithProgress,
      stats: {
        totalAchievements,
        unlockedAchievements,
        completionRate: Math.round((unlockedAchievements / totalAchievements) * 100),
        totalXPFromAchievements
      }
    })

  } catch (error) {
    console.error('Error fetching achievements:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
