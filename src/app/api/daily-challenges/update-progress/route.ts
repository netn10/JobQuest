import { NextRequest, NextResponse } from 'next/server'
import { updateDailyChallengeProgress } from '@/lib/daily-challenges'

export async function POST(request: NextRequest) {
  try {
    // Get user ID from authorization header
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const userId = authHeader.replace('Bearer ', '')
    
    // Update daily challenge progress
    const result = await updateDailyChallengeProgress(userId)
    
    if (!result) {
      return NextResponse.json({ message: 'No daily challenge found for today' })
    }
    
    return NextResponse.json({
      challenge: result.challenge,
      progress: result.progress,
      updated: true
    })
    
  } catch (error) {
    console.error('Error updating daily challenge progress:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
