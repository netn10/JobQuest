// Server-side only Kafka service
// This file should only be imported in server-side code (API routes, server components, etc.)

import { kafkaProducer } from './kafka-producer'

export class ServerKafkaService {
  private static instance: ServerKafkaService

  private constructor() {}

  public static getInstance(): ServerKafkaService {
    if (!ServerKafkaService.instance) {
      ServerKafkaService.instance = new ServerKafkaService()
    }
    return ServerKafkaService.instance
  }

  // Mission Events
  public async publishMissionStarted(userId: string, missionId: string, missionName: string, missionType: string): Promise<void> {
    return kafkaProducer.publishMissionStarted(userId, missionId, missionName, missionType)
  }

  public async publishMissionCompleted(userId: string, missionId: string, missionName: string, missionType: string, duration: number, xpEarned: number): Promise<void> {
    return kafkaProducer.publishMissionCompleted(userId, missionId, missionName, missionType, duration, xpEarned)
  }

  public async publishMissionFailed(userId: string, missionId: string, missionName: string, missionType: string): Promise<void> {
    return kafkaProducer.publishMissionFailed(userId, missionId, missionName, missionType)
  }

  // Job Application Events
  public async publishJobApplied(userId: string, jobId: string, companyName: string, position: string): Promise<void> {
    return kafkaProducer.publishJobApplied(userId, jobId, companyName, position)
  }

  public async publishJobStatusUpdated(userId: string, jobId: string, companyName: string, position: string, newStatus: string, previousStatus: string): Promise<void> {
    return kafkaProducer.publishJobStatusUpdated(userId, jobId, companyName, position, newStatus, previousStatus)
  }

  // Achievement Events
  public async publishAchievementUnlocked(userId: string, achievementId: string, achievementName: string, xpAmount: number): Promise<void> {
    return kafkaProducer.publishAchievementUnlocked(userId, achievementId, achievementName, xpAmount)
  }

  public async publishLevelUp(userId: string, newLevel: number, totalXp: number): Promise<void> {
    return kafkaProducer.publishLevelUp(userId, newLevel, totalXp)
  }

  public async publishXpEarned(userId: string, xpAmount: number, totalXp: number): Promise<void> {
    return kafkaProducer.publishXpEarned(userId, xpAmount, totalXp)
  }

  // Daily Challenge Events
  public async publishDailyChallengeCompleted(userId: string, challengeId: string, challengeTitle: string, challengeDescription: string, xpReward: number): Promise<void> {
    return kafkaProducer.publishDailyChallengeCompleted(userId, challengeId, challengeTitle, challengeDescription, xpReward)
  }

  public async publishDailyChallengeAvailable(userId: string, challengeId: string, challengeTitle: string, challengeDescription: string): Promise<void> {
    return kafkaProducer.publishDailyChallengeAvailable(userId, challengeId, challengeTitle, challengeDescription)
  }

  // Learning Events
  public async publishLearningStarted(userId: string, resourceId: string, resourceTitle: string, resourceType: string): Promise<void> {
    return kafkaProducer.publishLearningStarted(userId, resourceId, resourceTitle, resourceType)
  }

  public async publishLearningCompleted(userId: string, resourceId: string, resourceTitle: string, resourceType: string, progress: number): Promise<void> {
    return kafkaProducer.publishLearningCompleted(userId, resourceId, resourceTitle, resourceType, progress)
  }

  // Notebook Events
  public async publishNotebookEntryCreated(userId: string, entryId: string, title: string, tags: string[], wordCount: number): Promise<void> {
    return kafkaProducer.publishNotebookEntryCreated(userId, entryId, title, tags, wordCount)
  }

  // Notification Events
  public async publishNotificationSent(userId: string, notificationId: string, notificationType: string, title: string, message: string): Promise<void> {
    return kafkaProducer.publishNotificationSent(userId, notificationId, notificationType, title, message)
  }

  public async publishNotificationRead(userId: string, notificationId: string, notificationType: string, title: string, message: string): Promise<void> {
    return kafkaProducer.publishNotificationRead(userId, notificationId, notificationType, title, message)
  }

  // System Events
  public async publishUserRegistered(userId: string, userEmail: string, userAgent?: string, ipAddress?: string): Promise<void> {
    return kafkaProducer.publishUserRegistered(userId, userEmail, userAgent, ipAddress)
  }

  public async publishUserLogin(userId: string, userEmail: string, userAgent?: string, ipAddress?: string): Promise<void> {
    return kafkaProducer.publishUserLogin(userId, userEmail, userAgent, ipAddress)
  }

  public async publishUserLogout(userId: string, userEmail: string): Promise<void> {
    return kafkaProducer.publishUserLogout(userId, userEmail)
  }

  public async publishSystemError(errorMessage: string, errorCode: string, userId?: string, metadata?: Record<string, any>): Promise<void> {
    return kafkaProducer.publishSystemError(errorMessage, errorCode, userId, metadata)
  }
}

// Export singleton instance
export const serverKafka = ServerKafkaService.getInstance()
