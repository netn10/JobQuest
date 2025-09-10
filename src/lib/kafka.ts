import { Kafka, Producer, Consumer, EachMessagePayload } from 'kafkajs'

// Kafka configuration
const kafkaConfig = {
  clientId: 'job-quest-app',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
  retry: {
    initialRetryTime: 100,
    retries: 8
  }
}

// Create Kafka instance
export const kafka = new Kafka(kafkaConfig)

// Producer instance
let producer: Producer | null = null

export async function getProducer(): Promise<Producer> {
  if (!producer) {
    producer = kafka.producer()
    await producer.connect()
  }
  return producer
}

// Consumer instance
let consumer: Consumer | null = null

export async function getConsumer(groupId: string = 'job-quest-consumer'): Promise<Consumer> {
  if (!consumer) {
    consumer = kafka.consumer({ groupId })
    await consumer.connect()
  }
  return consumer
}

// Topic names
export const KAFKA_TOPICS = {
  USER_ACTIVITIES: 'user-activities',
  NOTIFICATIONS: 'notifications',
  ACHIEVEMENTS: 'achievements',
  DAILY_CHALLENGES: 'daily-challenges',
  JOB_APPLICATIONS: 'job-applications',
  LEARNING_PROGRESS: 'learning-progress',
  MISSION_EVENTS: 'mission-events',
  SYSTEM_EVENTS: 'system-events'
} as const

// Event types
export const EVENT_TYPES = {
  // User Activities
  MISSION_STARTED: 'mission.started',
  MISSION_COMPLETED: 'mission.completed',
  MISSION_FAILED: 'mission.failed',
  JOB_APPLIED: 'job.applied',
  JOB_STATUS_UPDATED: 'job.status.updated',
  NOTEBOOK_ENTRY_CREATED: 'notebook.entry.created',
  LEARNING_STARTED: 'learning.started',
  LEARNING_COMPLETED: 'learning.completed',
  
  // Achievements
  ACHIEVEMENT_UNLOCKED: 'achievement.unlocked',
  LEVEL_UP: 'level.up',
  XP_EARNED: 'xp.earned',
  STREAK_MILESTONE: 'streak.milestone',
  
  // Daily Challenges
  DAILY_CHALLENGE_COMPLETED: 'daily.challenge.completed',
  DAILY_CHALLENGE_AVAILABLE: 'daily.challenge.available',
  
  // Notifications
  NOTIFICATION_SENT: 'notification.sent',
  NOTIFICATION_READ: 'notification.read',
  
  // System Events
  USER_REGISTERED: 'user.registered',
  USER_LOGIN: 'user.login',
  USER_LOGOUT: 'user.logout',
  SYSTEM_ERROR: 'system.error'
} as const

// Base event interface
export interface BaseEvent {
  id: string
  type: string
  userId: string
  timestamp: string
  metadata?: Record<string, any>
}

// Specific event interfaces
export interface MissionEvent extends BaseEvent {
  type: typeof EVENT_TYPES.MISSION_STARTED | typeof EVENT_TYPES.MISSION_COMPLETED | typeof EVENT_TYPES.MISSION_FAILED
  data: {
    missionId: string
    missionName: string
    missionType: string
    duration?: number
    xpEarned?: number
  }
}

export interface JobApplicationEvent extends BaseEvent {
  type: typeof EVENT_TYPES.JOB_APPLIED | typeof EVENT_TYPES.JOB_STATUS_UPDATED
  data: {
    jobId: string
    companyName: string
    position: string
    status: string
    previousStatus?: string
  }
}

export interface AchievementEvent extends BaseEvent {
  type: typeof EVENT_TYPES.ACHIEVEMENT_UNLOCKED | typeof EVENT_TYPES.LEVEL_UP | typeof EVENT_TYPES.XP_EARNED
  data: {
    achievementId?: string
    achievementName?: string
    xpAmount: number
    newLevel?: number
    totalXp?: number
  }
}

export interface NotificationEvent extends BaseEvent {
  type: typeof EVENT_TYPES.NOTIFICATION_SENT | typeof EVENT_TYPES.NOTIFICATION_READ
  data: {
    notificationId: string
    notificationType: string
    title: string
    message: string
    read?: boolean
  }
}

export interface DailyChallengeEvent extends BaseEvent {
  type: typeof EVENT_TYPES.DAILY_CHALLENGE_COMPLETED | typeof EVENT_TYPES.DAILY_CHALLENGE_AVAILABLE
  data: {
    challengeId: string
    challengeTitle: string
    challengeDescription: string
    xpReward?: number
    completed?: boolean
  }
}

export interface LearningEvent extends BaseEvent {
  type: typeof EVENT_TYPES.LEARNING_STARTED | typeof EVENT_TYPES.LEARNING_COMPLETED
  data: {
    resourceId: string
    resourceTitle: string
    resourceType: string
    progress?: number
    completed?: boolean
  }
}

export interface NotebookEvent extends BaseEvent {
  type: typeof EVENT_TYPES.NOTEBOOK_ENTRY_CREATED
  data: {
    entryId: string
    title: string
    tags: string[]
    wordCount: number
  }
}

export interface SystemEvent extends BaseEvent {
  type: typeof EVENT_TYPES.USER_REGISTERED | typeof EVENT_TYPES.USER_LOGIN | typeof EVENT_TYPES.USER_LOGOUT | typeof EVENT_TYPES.SYSTEM_ERROR
  data: {
    userEmail?: string
    errorMessage?: string
    errorCode?: string
    userAgent?: string
    ipAddress?: string
  }
}

// Union type for all events
export type JobQuestEvent = 
  | MissionEvent 
  | JobApplicationEvent 
  | AchievementEvent 
  | NotificationEvent 
  | DailyChallengeEvent 
  | LearningEvent 
  | NotebookEvent 
  | SystemEvent

// Event handler type
export type EventHandler<T extends JobQuestEvent = JobQuestEvent> = (event: T) => Promise<void>

// Utility functions
export function createEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export function getTopicForEventType(eventType: string): string {
  if (eventType.startsWith('mission.')) {
    return KAFKA_TOPICS.MISSION_EVENTS
  }
  if (eventType.startsWith('job.')) {
    return KAFKA_TOPICS.JOB_APPLICATIONS
  }
  if (eventType.startsWith('achievement.') || eventType.startsWith('level.') || eventType.startsWith('xp.') || eventType.startsWith('streak.')) {
    return KAFKA_TOPICS.ACHIEVEMENTS
  }
  if (eventType.startsWith('notification.')) {
    return KAFKA_TOPICS.NOTIFICATIONS
  }
  if (eventType.startsWith('daily.challenge.')) {
    return KAFKA_TOPICS.DAILY_CHALLENGES
  }
  if (eventType.startsWith('learning.')) {
    return KAFKA_TOPICS.LEARNING_PROGRESS
  }
  if (eventType.startsWith('notebook.')) {
    return KAFKA_TOPICS.USER_ACTIVITIES
  }
  if (eventType.startsWith('user.') || eventType.startsWith('system.')) {
    return KAFKA_TOPICS.SYSTEM_EVENTS
  }
  
  return KAFKA_TOPICS.USER_ACTIVITIES
}

// Graceful shutdown
export async function disconnectKafka(): Promise<void> {
  if (producer) {
    await producer.disconnect()
    producer = null
  }
  if (consumer) {
    await consumer.disconnect()
    consumer = null
  }
}
