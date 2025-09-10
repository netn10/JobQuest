#!/usr/bin/env tsx

/**
 * Kafka Integration Example Script
 * 
 * This script demonstrates how to use the Kafka integration in JobQuest.
 * Run with: npx tsx scripts/kafka-example.ts
 */

import { serverKafka } from '../src/lib/kafka-server'
import { kafkaConsumer } from '../src/lib/kafka-consumer'

async function demonstrateKafkaIntegration() {
  console.log('🚀 Starting Kafka Integration Demo...\n')

  try {
    // Start the consumer
    console.log('📡 Starting Kafka consumer...')
    await kafkaConsumer.start()
    console.log('✅ Consumer started successfully\n')

    // Register a custom event handler
    kafkaConsumer.registerEventHandler('mission.completed', async (event) => {
      console.log(`🎯 Custom handler: Mission completed by user ${event.userId}`)
      console.log(`   Mission: ${event.data?.missionName}`)
      console.log(`   XP Earned: ${event.data?.xpEarned}\n`)
    })

    // Simulate some events
    const testUserId = 'demo-user-123'
    
    console.log('📤 Publishing test events...\n')

    // Mission events
    await serverKafka.publishMissionStarted(testUserId, 'mission-1', 'Focus Session', 'FOCUS')
    console.log('✅ Published: mission.started')

    await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second

    await serverKafka.publishMissionCompleted(testUserId, 'mission-1', 'Focus Session', 'FOCUS', 25, 50)
    console.log('✅ Published: mission.completed')

    await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second

    // Job application event
    await serverKafka.publishJobApplied(testUserId, 'job-1', 'Tech Corp', 'Software Engineer')
    console.log('✅ Published: job.applied')

    await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second

    // Achievement event
    await serverKafka.publishAchievementUnlocked(testUserId, 'achievement-1', 'First Mission', 25)
    console.log('✅ Published: achievement.unlocked')

    await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second

    // Daily challenge event
    await serverKafka.publishDailyChallengeCompleted(testUserId, 'challenge-1', 'Complete a Mission', 'Finish any mission today', 100)
    console.log('✅ Published: daily.challenge.completed')

    await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second

    // Learning event
    await serverKafka.publishLearningStarted(testUserId, 'resource-1', 'React Fundamentals', 'COURSE')
    console.log('✅ Published: learning.started')

    await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second

    await serverKafka.publishLearningCompleted(testUserId, 'resource-1', 'React Fundamentals', 'COURSE', 100)
    console.log('✅ Published: learning.completed')

    await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second

    // Notebook event
    await serverKafka.publishNotebookEntryCreated(testUserId, 'entry-1', 'Daily Reflection', ['reflection', 'daily'], 150)
    console.log('✅ Published: notebook.entry.created')

    await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second

    // System event
    await serverKafka.publishUserRegistered(testUserId, 'demo@example.com', 'Mozilla/5.0...', '192.168.1.1')
    console.log('✅ Published: user.registered')

    console.log('\n🎉 Demo completed! Check the logs above to see events being processed.')
    console.log('💡 You can also check the Kafka UI at http://localhost:8080 to see the topics and messages.')

    // Keep the script running for a bit to see all events processed
    console.log('\n⏳ Waiting 5 seconds for all events to be processed...')
    await new Promise(resolve => setTimeout(resolve, 5000))

  } catch (error) {
    console.error('❌ Error during demo:', error)
  } finally {
    // Stop the consumer
    console.log('\n🛑 Stopping Kafka consumer...')
    await kafkaConsumer.stop()
    console.log('✅ Consumer stopped successfully')
    console.log('\n👋 Demo finished!')
  }
}

// Run the demo
if (require.main === module) {
  demonstrateKafkaIntegration().catch(console.error)
}

export { demonstrateKafkaIntegration }
