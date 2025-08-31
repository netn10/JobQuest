import { NextRequest, NextResponse } from 'next/server'
import { updateDailyChallengeProgress } from '@/lib/daily-challenges'

// Helper function to serialize BigInt and Date values
function serializeBigInt(obj: any): any {
  if (obj === null || obj === undefined) return obj
  if (typeof obj === 'bigint') return Number(obj)
  if (obj instanceof Date) return obj.toISOString()
  if (Array.isArray(obj)) return obj.map(serializeBigInt)
  if (typeof obj === 'object') {
    const serialized: any = {}
    for (const [key, value] of Object.entries(obj)) {
      serialized[key] = serializeBigInt(value)
    }
    return serialized
  }
  return obj
}

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
    
    // Handle different return types from updateDailyChallengeProgress
    if (Array.isArray(result)) {
      // Return first challenge if it's an array
      const firstChallenge = result[0]
      return NextResponse.json(serializeBigInt({
        challenge: firstChallenge?.challenge,
        progress: firstChallenge?.progress,
        updated: true
      }))
    } else if (result && 'challenges' in result) {
      // Return first challenge if it's an object with challenges array
      const firstChallenge = result.challenges[0]
      return NextResponse.json(serializeBigInt({
        challenge: firstChallenge?.challenge,
        progress: firstChallenge?.progress,
        updated: true,
        newlyCompleted: result.newlyCompleted,
        xpAwarded: result.newlyCompleted?.xpReward || 0
      }))
    } else {
      return NextResponse.json({ message: 'No daily challenge found for today' })
    }
    
  } catch (error) {
    console.error('Error updating daily challenge progress:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
