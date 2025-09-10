import { NextRequest, NextResponse } from 'next/server'
import { kafkaConsumer } from '@/lib/kafka-consumer'

export async function GET(request: NextRequest) {
  try {
    const isRunning = kafkaConsumer.isConsumerRunning()
    
    return NextResponse.json({
      status: 'success',
      data: {
        consumerRunning: isRunning,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Error checking Kafka status:', error)
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Failed to check Kafka status',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()
    
    if (action === 'start') {
      await kafkaConsumer.start()
      return NextResponse.json({
        status: 'success',
        message: 'Kafka consumer started successfully'
      })
    } else if (action === 'stop') {
      await kafkaConsumer.stop()
      return NextResponse.json({
        status: 'success',
        message: 'Kafka consumer stopped successfully'
      })
    } else {
      return NextResponse.json(
        { 
          status: 'error', 
          message: 'Invalid action. Use "start" or "stop"' 
        },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error controlling Kafka consumer:', error)
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Failed to control Kafka consumer',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
