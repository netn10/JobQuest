import { NextRequest, NextResponse } from 'next/server'
import { serverKafka } from '@/lib/kafka-server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { status: 'error', message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { eventType, data } = await request.json()
    
    if (!eventType || !data) {
      return NextResponse.json(
        { status: 'error', message: 'Missing eventType or data' },
        { status: 400 }
      )
    }

    const userId = session.user.id

    // Route to appropriate producer method based on event type
    switch (eventType) {
      case 'mission.started':
        await serverKafka.publishMissionStarted(userId, data.missionId, data.missionName, data.missionType)
        break
      case 'mission.completed':
        await serverKafka.publishMissionCompleted(userId, data.missionId, data.missionName, data.missionType, data.duration, data.xpEarned)
        break
      case 'mission.failed':
        await serverKafka.publishMissionFailed(userId, data.missionId, data.missionName, data.missionType)
        break
      case 'job.applied':
        await serverKafka.publishJobApplied(userId, data.jobId, data.companyName, data.position)
        break
      case 'job.status.updated':
        await serverKafka.publishJobStatusUpdated(userId, data.jobId, data.companyName, data.position, data.newStatus, data.previousStatus)
        break
      case 'achievement.unlocked':
        await serverKafka.publishAchievementUnlocked(userId, data.achievementId, data.achievementName, data.xpAmount)
        break
      case 'level.up':
        await serverKafka.publishLevelUp(userId, data.newLevel, data.totalXp)
        break
      case 'xp.earned':
        await serverKafka.publishXpEarned(userId, data.xpAmount, data.totalXp)
        break
      case 'daily.challenge.completed':
        await serverKafka.publishDailyChallengeCompleted(userId, data.challengeId, data.challengeTitle, data.challengeDescription, data.xpReward)
        break
      case 'daily.challenge.available':
        await serverKafka.publishDailyChallengeAvailable(userId, data.challengeId, data.challengeTitle, data.challengeDescription)
        break
      case 'learning.started':
        await serverKafka.publishLearningStarted(userId, data.resourceId, data.resourceTitle, data.resourceType)
        break
      case 'learning.completed':
        await serverKafka.publishLearningCompleted(userId, data.resourceId, data.resourceTitle, data.resourceType, data.progress)
        break
      case 'notebook.entry.created':
        await serverKafka.publishNotebookEntryCreated(userId, data.entryId, data.title, data.tags, data.wordCount)
        break
      case 'notification.sent':
        await serverKafka.publishNotificationSent(userId, data.notificationId, data.notificationType, data.title, data.message)
        break
      case 'notification.read':
        await serverKafka.publishNotificationRead(userId, data.notificationId, data.notificationType, data.title, data.message)
        break
      default:
        return NextResponse.json(
          { status: 'error', message: `Unknown event type: ${eventType}` },
          { status: 400 }
        )
    }

    return NextResponse.json({
      status: 'success',
      message: `Event ${eventType} published successfully`,
      data: { eventType, userId, timestamp: new Date().toISOString() }
    })

  } catch (error) {
    console.error('Error publishing Kafka event:', error)
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Failed to publish event',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { status: 'error', message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Return available event types and their schemas
    const eventTypes = {
      'mission.started': {
        required: ['missionId', 'missionName', 'missionType'],
        description: 'Published when a user starts a mission'
      },
      'mission.completed': {
        required: ['missionId', 'missionName', 'missionType', 'duration', 'xpEarned'],
        description: 'Published when a user completes a mission'
      },
      'mission.failed': {
        required: ['missionId', 'missionName', 'missionType'],
        description: 'Published when a user fails a mission'
      },
      'job.applied': {
        required: ['jobId', 'companyName', 'position'],
        description: 'Published when a user applies to a job'
      },
      'job.status.updated': {
        required: ['jobId', 'companyName', 'position', 'newStatus', 'previousStatus'],
        description: 'Published when a job application status is updated'
      },
      'achievement.unlocked': {
        required: ['achievementId', 'achievementName', 'xpAmount'],
        description: 'Published when a user unlocks an achievement'
      },
      'level.up': {
        required: ['newLevel', 'totalXp'],
        description: 'Published when a user levels up'
      },
      'xp.earned': {
        required: ['xpAmount', 'totalXp'],
        description: 'Published when a user earns XP'
      },
      'daily.challenge.completed': {
        required: ['challengeId', 'challengeTitle', 'challengeDescription', 'xpReward'],
        description: 'Published when a user completes a daily challenge'
      },
      'daily.challenge.available': {
        required: ['challengeId', 'challengeTitle', 'challengeDescription'],
        description: 'Published when a new daily challenge becomes available'
      },
      'learning.started': {
        required: ['resourceId', 'resourceTitle', 'resourceType'],
        description: 'Published when a user starts a learning resource'
      },
      'learning.completed': {
        required: ['resourceId', 'resourceTitle', 'resourceType', 'progress'],
        description: 'Published when a user completes a learning resource'
      },
      'notebook.entry.created': {
        required: ['entryId', 'title', 'tags', 'wordCount'],
        description: 'Published when a user creates a notebook entry'
      },
      'notification.sent': {
        required: ['notificationId', 'notificationType', 'title', 'message'],
        description: 'Published when a notification is sent'
      },
      'notification.read': {
        required: ['notificationId', 'notificationType', 'title', 'message'],
        description: 'Published when a notification is read'
      }
    }

    return NextResponse.json({
      status: 'success',
      data: {
        eventTypes,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Error getting Kafka event types:', error)
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Failed to get event types',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
