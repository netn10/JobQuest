import { getProducer, getTopicForEventType, createEventId, JobQuestEvent, EVENT_TYPES } from './kafka'

export class KafkaProducerService {
  private static instance: KafkaProducerService
  private isConnected = false

  private constructor() {}

  public static getInstance(): KafkaProducerService {
    if (!KafkaProducerService.instance) {
      KafkaProducerService.instance = new KafkaProducerService()
    }
    return KafkaProducerService.instance
  }

  private async ensureConnected(): Promise<void> {
    if (!this.isConnected) {
      await getProducer()
      this.isConnected = true
    }
  }

  public async publishEvent(event: JobQuestEvent): Promise<void> {
    try {
      await this.ensureConnected()
      const producer = await getProducer()
      const topic = getTopicForEventType(event.type)
      
      await producer.send({
        topic,
        messages: [{
          key: event.userId,
          value: JSON.stringify(event),
          timestamp: event.timestamp
        }]
      })

      console.log(`Published event ${event.type} to topic ${topic} for user ${event.userId}`)
    } catch (error) {
      console.error('Failed to publish event:', error)
      throw error
    }
  }

  // Mission Events
  public async publishMissionStarted(userId: string, missionId: string, missionName: string, missionType: string): Promise<void> {
    const event: JobQuestEvent = {
      id: createEventId(),
      type: EVENT_TYPES.MISSION_STARTED,
      userId,
      timestamp: new Date().toISOString(),
      data: {
        missionId,
        missionName,
        missionType
      }
    }
    await this.publishEvent(event)
  }

  public async publishMissionCompleted(userId: string, missionId: string, missionName: string, missionType: string, duration: number, xpEarned: number): Promise<void> {
    const event: JobQuestEvent = {
      id: createEventId(),
      type: EVENT_TYPES.MISSION_COMPLETED,
      userId,
      timestamp: new Date().toISOString(),
      data: {
        missionId,
        missionName,
        missionType,
        duration,
        xpEarned
      }
    }
    await this.publishEvent(event)
  }

  public async publishMissionFailed(userId: string, missionId: string, missionName: string, missionType: string): Promise<void> {
    const event: JobQuestEvent = {
      id: createEventId(),
      type: EVENT_TYPES.MISSION_FAILED,
      userId,
      timestamp: new Date().toISOString(),
      data: {
        missionId,
        missionName,
        missionType
      }
    }
    await this.publishEvent(event)
  }

  // Job Application Events
  public async publishJobApplied(userId: string, jobId: string, companyName: string, position: string): Promise<void> {
    const event: JobQuestEvent = {
      id: createEventId(),
      type: EVENT_TYPES.JOB_APPLIED,
      userId,
      timestamp: new Date().toISOString(),
      data: {
        jobId,
        companyName,
        position,
        status: 'APPLIED'
      }
    }
    await this.publishEvent(event)
  }

  public async publishJobStatusUpdated(userId: string, jobId: string, companyName: string, position: string, newStatus: string, previousStatus: string): Promise<void> {
    const event: JobQuestEvent = {
      id: createEventId(),
      type: EVENT_TYPES.JOB_STATUS_UPDATED,
      userId,
      timestamp: new Date().toISOString(),
      data: {
        jobId,
        companyName,
        position,
        status: newStatus,
        previousStatus
      }
    }
    await this.publishEvent(event)
  }

  // Achievement Events
  public async publishAchievementUnlocked(userId: string, achievementId: string, achievementName: string, xpAmount: number): Promise<void> {
    const event: JobQuestEvent = {
      id: createEventId(),
      type: EVENT_TYPES.ACHIEVEMENT_UNLOCKED,
      userId,
      timestamp: new Date().toISOString(),
      data: {
        achievementId,
        achievementName,
        xpAmount
      }
    }
    await this.publishEvent(event)
  }

  public async publishLevelUp(userId: string, newLevel: number, totalXp: number): Promise<void> {
    const event: JobQuestEvent = {
      id: createEventId(),
      type: EVENT_TYPES.LEVEL_UP,
      userId,
      timestamp: new Date().toISOString(),
      data: {
        newLevel,
        totalXp
      }
    }
    await this.publishEvent(event)
  }

  public async publishXpEarned(userId: string, xpAmount: number, totalXp: number): Promise<void> {
    const event: JobQuestEvent = {
      id: createEventId(),
      type: EVENT_TYPES.XP_EARNED,
      userId,
      timestamp: new Date().toISOString(),
      data: {
        xpAmount,
        totalXp
      }
    }
    await this.publishEvent(event)
  }

  // Daily Challenge Events
  public async publishDailyChallengeCompleted(userId: string, challengeId: string, challengeTitle: string, challengeDescription: string, xpReward: number): Promise<void> {
    const event: JobQuestEvent = {
      id: createEventId(),
      type: EVENT_TYPES.DAILY_CHALLENGE_COMPLETED,
      userId,
      timestamp: new Date().toISOString(),
      data: {
        challengeId,
        challengeTitle,
        challengeDescription,
        xpReward,
        completed: true
      }
    }
    await this.publishEvent(event)
  }

  public async publishDailyChallengeAvailable(userId: string, challengeId: string, challengeTitle: string, challengeDescription: string): Promise<void> {
    const event: JobQuestEvent = {
      id: createEventId(),
      type: EVENT_TYPES.DAILY_CHALLENGE_AVAILABLE,
      userId,
      timestamp: new Date().toISOString(),
      data: {
        challengeId,
        challengeTitle,
        challengeDescription,
        completed: false
      }
    }
    await this.publishEvent(event)
  }

  // Learning Events
  public async publishLearningStarted(userId: string, resourceId: string, resourceTitle: string, resourceType: string): Promise<void> {
    const event: JobQuestEvent = {
      id: createEventId(),
      type: EVENT_TYPES.LEARNING_STARTED,
      userId,
      timestamp: new Date().toISOString(),
      data: {
        resourceId,
        resourceTitle,
        resourceType,
        progress: 0,
        completed: false
      }
    }
    await this.publishEvent(event)
  }

  public async publishLearningCompleted(userId: string, resourceId: string, resourceTitle: string, resourceType: string, progress: number): Promise<void> {
    const event: JobQuestEvent = {
      id: createEventId(),
      type: EVENT_TYPES.LEARNING_COMPLETED,
      userId,
      timestamp: new Date().toISOString(),
      data: {
        resourceId,
        resourceTitle,
        resourceType,
        progress,
        completed: true
      }
    }
    await this.publishEvent(event)
  }

  // Notebook Events
  public async publishNotebookEntryCreated(userId: string, entryId: string, title: string, tags: string[], wordCount: number): Promise<void> {
    const event: JobQuestEvent = {
      id: createEventId(),
      type: EVENT_TYPES.NOTEBOOK_ENTRY_CREATED,
      userId,
      timestamp: new Date().toISOString(),
      data: {
        entryId,
        title,
        tags,
        wordCount
      }
    }
    await this.publishEvent(event)
  }

  // Notification Events
  public async publishNotificationSent(userId: string, notificationId: string, notificationType: string, title: string, message: string): Promise<void> {
    const event: JobQuestEvent = {
      id: createEventId(),
      type: EVENT_TYPES.NOTIFICATION_SENT,
      userId,
      timestamp: new Date().toISOString(),
      data: {
        notificationId,
        notificationType,
        title,
        message,
        read: false
      }
    }
    await this.publishEvent(event)
  }

  public async publishNotificationRead(userId: string, notificationId: string, notificationType: string, title: string, message: string): Promise<void> {
    const event: JobQuestEvent = {
      id: createEventId(),
      type: EVENT_TYPES.NOTIFICATION_READ,
      userId,
      timestamp: new Date().toISOString(),
      data: {
        notificationId,
        notificationType,
        title,
        message,
        read: true
      }
    }
    await this.publishEvent(event)
  }

  // System Events
  public async publishUserRegistered(userId: string, userEmail: string, userAgent?: string, ipAddress?: string): Promise<void> {
    const event: JobQuestEvent = {
      id: createEventId(),
      type: EVENT_TYPES.USER_REGISTERED,
      userId,
      timestamp: new Date().toISOString(),
      data: {
        userEmail,
        userAgent,
        ipAddress
      }
    }
    await this.publishEvent(event)
  }

  public async publishUserLogin(userId: string, userEmail: string, userAgent?: string, ipAddress?: string): Promise<void> {
    const event: JobQuestEvent = {
      id: createEventId(),
      type: EVENT_TYPES.USER_LOGIN,
      userId,
      timestamp: new Date().toISOString(),
      data: {
        userEmail,
        userAgent,
        ipAddress
      }
    }
    await this.publishEvent(event)
  }

  public async publishUserLogout(userId: string, userEmail: string): Promise<void> {
    const event: JobQuestEvent = {
      id: createEventId(),
      type: EVENT_TYPES.USER_LOGOUT,
      userId,
      timestamp: new Date().toISOString(),
      data: {
        userEmail
      }
    }
    await this.publishEvent(event)
  }

  public async publishSystemError(errorMessage: string, errorCode: string, userId?: string, metadata?: Record<string, any>): Promise<void> {
    const event: JobQuestEvent = {
      id: createEventId(),
      type: EVENT_TYPES.SYSTEM_ERROR,
      userId: userId || 'system',
      timestamp: new Date().toISOString(),
      data: {
        errorMessage,
        errorCode
      },
      metadata
    }
    await this.publishEvent(event)
  }
}

// Export singleton instance
export const kafkaProducer = KafkaProducerService.getInstance()
