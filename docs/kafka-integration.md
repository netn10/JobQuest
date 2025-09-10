# Kafka Integration Documentation

## Overview

JobQuest now includes Apache Kafka integration for real-time event streaming, enabling scalable event-driven architecture for user activities, notifications, and system events.

## Architecture

### Event Flow
```
User Action → Activity Logger → Server Kafka Producer → Kafka Topics → Kafka Consumer → Real-time Processing
```

### Server-Side Architecture
Kafka services are designed to run only on the server side to avoid browser compatibility issues:
- **Server Components**: Use `serverKafka` service directly
- **Client Components**: Use API endpoints to publish events
- **API Routes**: Use `serverKafka` service for event publishing

### Components

1. **Kafka Infrastructure** - Docker Compose setup with Zookeeper, Kafka, and Kafka UI
2. **Event Schemas** - TypeScript interfaces for all event types
3. **Producer Service** - Publishes events to Kafka topics
4. **Consumer Service** - Processes events from Kafka topics
5. **API Endpoints** - REST API for Kafka management and event publishing
6. **Integration Layer** - Connects Kafka with existing activity logging and notification systems

## Topics

The system uses the following Kafka topics:

- `user-activities` - General user activities and interactions
- `notifications` - Notification events and status updates
- `achievements` - Achievement unlocks, level ups, and XP events
- `daily-challenges` - Daily challenge completions and availability
- `job-applications` - Job application events and status updates
- `learning-progress` - Learning resource events and progress tracking
- `mission-events` - Mission start, completion, and failure events
- `system-events` - System-level events like user registration and errors

## Event Types

### Mission Events
- `mission.started` - User starts a focus mission
- `mission.completed` - User completes a mission
- `mission.failed` - User fails a mission

### Job Application Events
- `job.applied` - User applies to a job
- `job.status.updated` - Job application status changes

### Achievement Events
- `achievement.unlocked` - User unlocks an achievement
- `level.up` - User reaches a new level
- `xp.earned` - User earns XP points

### Daily Challenge Events
- `daily.challenge.completed` - User completes a daily challenge
- `daily.challenge.available` - New daily challenge becomes available

### Learning Events
- `learning.started` - User starts a learning resource
- `learning.completed` - User completes a learning resource

### Notification Events
- `notification.sent` - Notification is sent to user
- `notification.read` - User reads a notification

### System Events
- `user.registered` - New user registration
- `user.login` - User login
- `user.logout` - User logout
- `system.error` - System error occurred

## Setup and Installation

### Prerequisites
- Docker and Docker Compose
- Node.js 18+
- Kafka client library (kafkajs) - already installed

### Environment Variables
Add to your `.env` file:
```env
KAFKA_BROKER=localhost:9092
```

### Starting Kafka Infrastructure
```bash
# Start Kafka, Zookeeper, and Kafka UI
npm run kafka:up

# View logs
npm run kafka:logs

# Access Kafka UI
npm run kafka:ui
# Then open http://localhost:8080
```

### Stopping Kafka Infrastructure
```bash
npm run kafka:down
```

## Usage

### Publishing Events

#### Using the Server-Side Producer Service
```typescript
import { serverKafka } from '@/lib/kafka-server'

// Publish a mission completion event (server-side only)
await serverKafka.publishMissionCompleted(
  userId,
  missionId,
  missionName,
  missionType,
  duration,
  xpEarned
)
```

#### Using the API Endpoint
```typescript
// POST /api/kafka/events
const response = await fetch('/api/kafka/events', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    eventType: 'mission.completed',
    data: {
      missionId: 'mission_123',
      missionName: 'Focus Session',
      missionType: 'FOCUS',
      duration: 25,
      xpEarned: 50
    }
  })
})
```

### Consuming Events

#### Registering Event Handlers
```typescript
import { kafkaConsumer } from '@/lib/kafka-consumer'

// Register a custom event handler
kafkaConsumer.registerEventHandler('mission.completed', async (event) => {
  console.log(`Mission completed by user ${event.userId}`)
  // Custom processing logic
})
```

#### Starting the Consumer
```typescript
import { kafkaConsumer } from '@/lib/kafka-consumer'

// Start consuming events
await kafkaConsumer.start()
```

### Managing Kafka Services

#### Check Status
```bash
# GET /api/kafka/status
curl http://localhost:3000/api/kafka/status
```

#### Start/Stop Consumer
```bash
# Start consumer
curl -X POST http://localhost:3000/api/kafka/status \
  -H "Content-Type: application/json" \
  -d '{"action": "start"}'

# Stop consumer
curl -X POST http://localhost:3000/api/kafka/status \
  -H "Content-Type: application/json" \
  -d '{"action": "stop"}'
```

## Integration Points

### Activity Logging
The existing activity logging system now automatically publishes events to Kafka:
- `logMissionStarted()` → `mission.started` event
- `logMissionCompleted()` → `mission.completed` event
- `logJobApplied()` → `job.applied` event
- `logAchievementUnlocked()` → `achievement.unlocked` event

### Notification System
The notification service now publishes events to Kafka:
- `show()` → `notification.sent` event
- All notification types are tracked

### Real-time Processing
The consumer service processes events and can:
- Send real-time notifications
- Update user statistics
- Trigger follow-up actions
- Log analytics data

## Event Schemas

### Base Event Interface
```typescript
interface BaseEvent {
  id: string
  type: string
  userId: string
  timestamp: string
  metadata?: Record<string, any>
}
```

### Mission Event Example
```typescript
interface MissionEvent extends BaseEvent {
  type: 'mission.completed'
  data: {
    missionId: string
    missionName: string
    missionType: string
    duration: number
    xpEarned: number
  }
}
```

## Monitoring and Debugging

### Kafka UI
Access the Kafka UI at http://localhost:8080 to:
- View topics and partitions
- Monitor message flow
- Inspect message content
- Check consumer lag

### Logs
```bash
# View all Kafka logs
npm run kafka:logs

# View specific service logs
docker-compose -f docker-compose.kafka.yml logs kafka
docker-compose -f docker-compose.kafka.yml logs kafka-ui
```

### Application Logs
The application logs Kafka events:
- Producer events: "Published event {type} to topic {topic} for user {userId}"
- Consumer events: "Processing event: {type} for user: {userId}"
- Errors: "Failed to publish/process event: {error}"

## Production Considerations

### Scaling
- Use multiple Kafka brokers for high availability
- Configure appropriate partition counts for topics
- Set up consumer groups for load balancing

### Security
- Enable SASL authentication
- Use SSL/TLS encryption
- Implement proper access controls

### Monitoring
- Set up Kafka metrics collection
- Monitor consumer lag
- Implement alerting for failed events

### Error Handling
- Implement dead letter queues for failed messages
- Add retry logic with exponential backoff
- Log all errors for debugging

## Troubleshooting

### Common Issues

1. **Kafka not starting**
   - Check Docker is running
   - Verify ports 9092, 2181, 8080 are available
   - Check Docker Compose logs

2. **Events not being published**
   - Verify Kafka is running
   - Check KAFKA_BROKER environment variable
   - Review application logs for errors

3. **Events not being consumed**
   - Ensure consumer is started
   - Check consumer group configuration
   - Verify topic subscriptions

4. **Performance issues**
   - Monitor consumer lag
   - Check partition distribution
   - Review message serialization

### Debug Commands
```bash
# Check Kafka status
docker-compose -f docker-compose.kafka.yml ps

# View topic details
docker exec job-quest-kafka kafka-topics --bootstrap-server localhost:9092 --list

# Check consumer groups
docker exec job-quest-kafka kafka-consumer-groups --bootstrap-server localhost:9092 --list
```

## Future Enhancements

1. **Event Sourcing** - Use Kafka as event store for complete audit trail
2. **CQRS** - Separate read and write models using Kafka
3. **Stream Processing** - Add Kafka Streams for real-time analytics
4. **Schema Registry** - Implement schema evolution and validation
5. **Dead Letter Queues** - Handle failed message processing
6. **Metrics and Monitoring** - Add comprehensive observability

## API Reference

### GET /api/kafka/status
Returns the current status of the Kafka consumer.

**Response:**
```json
{
  "status": "success",
  "data": {
    "consumerRunning": true,
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

### POST /api/kafka/status
Controls the Kafka consumer.

**Request:**
```json
{
  "action": "start" | "stop"
}
```

### POST /api/kafka/events
Publishes an event to Kafka.

**Request:**
```json
{
  "eventType": "mission.completed",
  "data": {
    "missionId": "mission_123",
    "missionName": "Focus Session",
    "missionType": "FOCUS",
    "duration": 25,
    "xpEarned": 50
  }
}
```

### GET /api/kafka/events
Returns available event types and their schemas.

**Response:**
```json
{
  "status": "success",
  "data": {
    "eventTypes": {
      "mission.completed": {
        "required": ["missionId", "missionName", "missionType", "duration", "xpEarned"],
        "description": "Published when a user completes a mission"
      }
    }
  }
}
```
