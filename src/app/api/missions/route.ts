import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { checkAndUnlockAchievements } from '@/lib/achievements'
import { updateUserStreak } from '@/lib/utils'
import { logMissionStarted, logMissionCompleted } from '@/lib/activity-logger'

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

    const missions = await prisma.mission.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20
    })

    return NextResponse.json({
      success: true,
      missions
    })
  } catch (error) {
    console.error('Error fetching missions:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch missions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, title, description, type, duration, blockedApps, blockedWebsites, autoStart } = body

    if (!userId || !title || !type || !duration) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const xpReward = Math.max(10, Math.floor(duration / 2))

    const mission = await prisma.mission.create({
      data: {
        title,
        description,
        type,
        duration,
        xpReward,
        userId,
        status: autoStart ? 'IN_PROGRESS' : 'PENDING',
        startedAt: autoStart ? new Date() : null,
        blockedApps: blockedApps ? JSON.stringify(blockedApps) : null,
        blockedWebsites: blockedWebsites ? JSON.stringify(blockedWebsites) : null
      }
    })

    // Log mission start if auto-started
    if (autoStart) {
      try {
        await logMissionStarted(userId, title, mission.id)
      } catch (error) {
        console.error('Error logging mission start activity:', error)
      }
    }

    return NextResponse.json({
      success: true,
      mission
    })
  } catch (error) {
    console.error('Error creating mission:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create mission' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { missionId, status, completedAt, xpReward, elapsedTime } = body

    if (!missionId || !status) {
      return NextResponse.json(
        { success: false, error: 'Mission ID and status required' },
        { status: 400 }
      )
    }

    // Get the current mission to calculate elapsed time if needed
    const currentMission = await prisma.mission.findUnique({
      where: { id: missionId }
    })

    if (!currentMission) {
      return NextResponse.json(
        { success: false, error: 'Mission not found' },
        { status: 404 }
      )
    }

    let updateData: any = {
      status,
      xpReward: xpReward !== undefined ? xpReward : undefined
    }

    // Handle status transitions
    if (status === 'IN_PROGRESS') {
      // Starting or resuming mission
      if (!currentMission.startedAt) {
        // First time starting
        updateData.startedAt = new Date()
      }
      // Don't update startedAt if resuming from pause - keep elapsed time
    } else if (status === 'PENDING') {
      // Pausing mission - calculate elapsed time
      if (currentMission.startedAt && currentMission.status === 'IN_PROGRESS') {
        const sessionTime = Math.floor((Date.now() - new Date(currentMission.startedAt).getTime()) / 1000)
        updateData.elapsedTime = (currentMission.elapsedTime || 0) + sessionTime
      } else if (elapsedTime !== undefined) {
        updateData.elapsedTime = elapsedTime
      }
    } else if (status === 'COMPLETED') {
      // Completing mission
      updateData.completedAt = new Date()
      if (currentMission.startedAt && currentMission.status === 'IN_PROGRESS') {
        const sessionTime = Math.floor((Date.now() - new Date(currentMission.startedAt).getTime()) / 1000)
        updateData.elapsedTime = (currentMission.elapsedTime || 0) + sessionTime
      } else if (elapsedTime !== undefined) {
        updateData.elapsedTime = elapsedTime
      }
    }

    const mission = await prisma.mission.update({
      where: { id: missionId },
      data: updateData
    })

    let achievementResult = null

    // Award XP and update streak if mission completed
    if (status === 'COMPLETED') {
      const xpToAward = xpReward !== undefined ? xpReward : mission.xpReward
      
      // Log mission completion
      try {
        await logMissionCompleted(mission.userId, mission.title, mission.id, xpToAward)
      } catch (error) {
        console.error('Error logging mission completion activity:', error)
      }
      
      // Update user XP and streak
      await Promise.all([
        prisma.user.update({
          where: { id: mission.userId },
          data: {
            xp: { increment: xpToAward },
            totalXp: { increment: xpToAward }
          }
        }),
        updateUserStreak(mission.userId, prisma)
      ])

      // Check for achievement unlocks after mission completion
      try {
        achievementResult = await checkAndUnlockAchievements(mission.userId)
        if (achievementResult.newlyUnlockedAchievements.length > 0) {
          console.log(`Unlocked ${achievementResult.newlyUnlockedAchievements.length} achievements for user ${mission.userId}`)
        }
      } catch (error) {
        console.error('Error checking achievements after mission completion:', error)
      }
    } else if (status === 'IN_PROGRESS') {
      // Log mission start if just started
      try {
        await logMissionStarted(mission.userId, mission.title, mission.id)
      } catch (error) {
        console.error('Error logging mission start activity:', error)
      }
    }

    return NextResponse.json({
      success: true,
      mission,
      newlyUnlockedAchievements: achievementResult?.newlyUnlockedAchievements || []
    })
  } catch (error) {
    console.error('Error updating mission:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update mission' },
      { status: 500 }
    )
  }
}