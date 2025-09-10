import { kafkaConsumer } from './kafka-consumer'
import { serverKafka } from './kafka-server'

export async function initializeKafka(): Promise<void> {
  try {
    console.log('Initializing Kafka services...')
    
    // Start the consumer
    await kafkaConsumer.start()
    
    // Test producer connection
    await serverKafka.publishSystemError(
      'Kafka initialization test',
      'STARTUP_TEST',
      'system'
    )
    
    console.log('Kafka services initialized successfully')
  } catch (error) {
    console.error('Failed to initialize Kafka services:', error)
    throw error
  }
}

export async function shutdownKafka(): Promise<void> {
  try {
    console.log('Shutting down Kafka services...')
    
    // Stop the consumer
    await kafkaConsumer.stop()
    
    console.log('Kafka services shut down successfully')
  } catch (error) {
    console.error('Failed to shutdown Kafka services:', error)
    throw error
  }
}

// Note: Kafka initialization should be called explicitly in your application
// Example: await initializeKafka() in your server startup code
