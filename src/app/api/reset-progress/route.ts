import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = authHeader.replace('Bearer ', '')
    
    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Reset all user progress in a transaction
    await prisma.$transaction(async (tx) => {
      // Reset user gamification data
      await tx.user.update({
        where: { id: userId },
        data: {
          xp: 0,
          level: 1,
          totalXp: 0,
          currentStreak: 0,
          longestStreak: 0,
          lastActiveDate: null
        }
      })

      // Delete all user missions
      await tx.mission.deleteMany({
        where: { userId }
      })

      // Delete all user achievements
      await tx.userAchievement.deleteMany({
        where: { userId }
      })

      // Delete all job applications
      await tx.jobApplication.deleteMany({
        where: { userId }
      })

      // Delete all notebook entries
      await tx.notebookEntry.deleteMany({
        where: { userId }
      })

      // Delete all learning progress
      await tx.learningProgress.deleteMany({
        where: { userId }
      })

      // Delete all daily challenge progress
      await tx.dailyChallengeProgress.deleteMany({
        where: { userId }
      })
    })

    return NextResponse.json({
      success: true,
      message: 'Progress reset successfully'
    })

  } catch (error) {
    console.error('Error resetting progress:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
