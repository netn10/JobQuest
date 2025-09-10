import { getConsumer, KAFKA_TOPICS, JobQuestEvent, EventHandler, EachMessagePayload } from './kafka'
import { db } from './db'

export class KafkaConsumerService {
  private static instance: KafkaConsumerService
  private isRunning = false
  private eventHandlers: Map<string, EventHandler[]> = new Map()

  private constructor() {}

  public static getInstance(): KafkaConsumerService {
    if (!KafkaConsumerService.instance) {
      KafkaConsumerService.instance = new KafkaConsumerService()
    }
    return KafkaConsumerService.instance
  }

  public registerEventHandler(eventType: string, handler: EventHandler): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, [])
    }
    this.eventHandlers.get(eventType)!.push(handler)
  }

  public unregisterEventHandler(eventType: string, handler: EventHandler): void {
    const handlers = this.eventHandlers.get(eventType)
    if (handlers) {
      const index = handlers.indexOf(handler)
      if (index > -1) {
        handlers.splice(index, 1)
      }
    }
  }

  private async handleMessage(payload: EachMessagePayload): Promise<void> {
    try {
      const { message } = payload
      if (!message.value) {
        return
      }

      const event: JobQuestEvent = JSON.parse(message.value.toString())
      console.log(`Processing event: ${event.type} for user: ${event.userId}`)

      // Get handlers for this event type
      const handlers = this.eventHandlers.get(event.type) || []
      
      // Execute all handlers for this event type
      await Promise.all(handlers.map(handler => handler(event)))

      // Process event based on type
      await this.processEvent(event)

    } catch (error) {
      console.error('Error handling Kafka message:', error)
      // In production, you might want to send this to a dead letter queue
    }
  }

  private async processEvent(event: JobQuestEvent): Promise<void> {
    try {
      switch (event.type) {
        case 'mission.completed':
          await this.handleMissionCompleted(event)
          break
        case 'achievement.unlocked':
          await this.handleAchievementUnlocked(event)
          break
        case 'daily.challenge.completed':
          await this.handleDailyChallengeCompleted(event)
          break
        case 'job.applied':
          await this.handleJobApplied(event)
          break
        case 'learning.completed':
          await this.handleLearningCompleted(event)
          break
        case 'level.up':
          await this.handleLevelUp(event)
          break
        case 'xp.earned':
          await this.handleXpEarned(event)
          break
        case 'user.registered':
          await this.handleUserRegistered(event)
          break
        case 'system.error':
          await this.handleSystemError(event)
          break
        default:
          console.log(`No specific handler for event type: ${event.type}`)
      }
    } catch (error) {
      console.error(`Error processing event ${event.type}:`, error)
    }
  }

  private async handleMissionCompleted(event: JobQuestEvent): Promise<void> {
    // Log mission completion for analytics
    console.log(`User ${event.userId} completed mission: ${event.data?.missionName}`)
    // Note: Real-time notifications would be handled by a separate service
  }

  private async handleAchievementUnlocked(event: JobQuestEvent): Promise<void> {
    // Log achievement unlock for analytics
    console.log(`User ${event.userId} unlocked achievement: ${event.data?.achievementName}`)
    // Note: Real-time notifications would be handled by a separate service
  }

  private async handleDailyChallengeCompleted(event: JobQuestEvent): Promise<void> {
    // Log daily challenge completion for analytics
    console.log(`User ${event.userId} completed daily challenge: ${event.data?.challengeTitle}`)
    // Note: Real-time notifications would be handled by a separate service
  }

  private async handleJobApplied(event: JobQuestEvent): Promise<void> {
    // Log job application for analytics
    console.log(`User ${event.userId} applied to job at ${event.data?.companyName}`)
  }

  private async handleLearningCompleted(event: JobQuestEvent): Promise<void> {
    // Log learning completion for analytics
    console.log(`User ${event.userId} completed learning: ${event.data?.resourceTitle}`)
    // Note: Real-time notifications would be handled by a separate service
  }

  private async handleLevelUp(event: JobQuestEvent): Promise<void> {
    // Log level up for analytics
    console.log(`User ${event.userId} leveled up to level ${event.data?.newLevel}`)
    // Note: Real-time notifications would be handled by a separate service
  }

  private async handleXpEarned(event: JobQuestEvent): Promise<void> {
    // Log XP earning for analytics
    console.log(`User ${event.userId} earned ${event.data?.xpAmount} XP`)
  }

  private async handleUserRegistered(event: JobQuestEvent): Promise<void> {
    // Log user registration for analytics
    console.log(`New user registered: ${event.userId}`)
    // Note: Welcome notifications would be handled by a separate service
  }

  private async handleSystemError(event: JobQuestEvent): Promise<void> {
    // Log system errors
    console.error(`System error: ${event.data?.errorMessage} (Code: ${event.data?.errorCode})`)
  }

  public async start(): Promise<void> {
    if (this.isRunning) {
      console.log('Kafka consumer is already running')
      return
    }

    try {
      const consumer = await getConsumer('job-quest-consumer')
      
      // Subscribe to all topics
      const topics = Object.values(KAFKA_TOPICS)
      await consumer.subscribe({ topics })

      // Start consuming messages
      await consumer.run({
        eachMessage: this.handleMessage.bind(this)
      })

      this.isRunning = true
      console.log('Kafka consumer started successfully')
    } catch (error) {
      console.error('Failed to start Kafka consumer:', error)
      throw error
    }
  }

  public async stop(): Promise<void> {
    if (!this.isRunning) {
      console.log('Kafka consumer is not running')
      return
    }

    try {
      const consumer = await getConsumer()
      await consumer.disconnect()
      this.isRunning = false
      console.log('Kafka consumer stopped successfully')
    } catch (error) {
      console.error('Failed to stop Kafka consumer:', error)
      throw error
    }
  }

  public isConsumerRunning(): boolean {
    return this.isRunning
  }
}

// Export singleton instance
export const kafkaConsumer = KafkaConsumerService.getInstance()

// Default event handlers for common events
kafkaConsumer.registerEventHandler('mission.completed', async (event) => {
  console.log(`Mission completed by user ${event.userId}`)
})

kafkaConsumer.registerEventHandler('achievement.unlocked', async (event) => {
  console.log(`Achievement unlocked by user ${event.userId}`)
})

kafkaConsumer.registerEventHandler('daily.challenge.completed', async (event) => {
  console.log(`Daily challenge completed by user ${event.userId}`)
})

kafkaConsumer.registerEventHandler('job.applied', async (event) => {
  console.log(`Job application by user ${event.userId}`)
})

kafkaConsumer.registerEventHandler('learning.completed', async (event) => {
  console.log(`Learning completed by user ${event.userId}`)
})

kafkaConsumer.registerEventHandler('level.up', async (event) => {
  console.log(`Level up for user ${event.userId}`)
})

kafkaConsumer.registerEventHandler('xp.earned', async (event) => {
  console.log(`XP earned by user ${event.userId}`)
})

kafkaConsumer.registerEventHandler('user.registered', async (event) => {
  console.log(`New user registered: ${event.userId}`)
})

kafkaConsumer.registerEventHandler('system.error', async (event) => {
  console.error(`System error: ${event.data?.errorMessage}`)
})
