import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { createConsistentDailyChallenges } from '@/lib/daily-challenges'

export async function POST(request: NextRequest) {
  try {
    // Get user ID from authorization header
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const userId = authHeader.replace('Bearer ', '')
    
    // Get today's date in UTC
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    // Delete existing challenges for today
    await prisma.dailyChallenge.deleteMany({
      where: {
        date: {
          gte: today,
          lt: tomorrow
        }
      }
    })
    
    // Create fresh challenges based on current settings
    const newChallenges = await createConsistentDailyChallenges(today, userId)
    
    return NextResponse.json({
      message: 'Daily challenges refreshed successfully',
      challenges: newChallenges,
      count: newChallenges.length
    })
    
  } catch (error) {
    console.error('Error refreshing daily challenges:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}