import { NextRequest, NextResponse } from 'next/server'
import { updateDailyChallengeProgress } from '@/lib/daily-challenges'
import { prisma } from '@/lib/db'

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
    
    // Get updated user stats
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        xp: true,
        totalXp: true,
        level: true,
        currentStreak: true,
        longestStreak: true
      }
    })
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    // Calculate XP for next level (assuming 100 XP per level)
    const xpForNextLevel = 100
    // Convert BigInt to number for JSON serialization
    const userXp = Number(user.xp)
    const userTotalXp = Number(user.totalXp)
    const userLevel = Number(user.level)
    const userCurrentStreak = Number(user.currentStreak)
    const userLongestStreak = Number(user.longestStreak)
    
    const xpProgress = userXp % xpForNextLevel
    
    const updatedStats = {
      totalXp: userTotalXp,
      level: userLevel,
      currentStreak: userCurrentStreak,
      longestStreak: userLongestStreak,
      xpForNextLevel,
      xpProgress
    }
    
    if (!result) {
      return NextResponse.json({ 
        message: 'No daily challenge found for today',
        stats: updatedStats
      })
    }
    
    // Handle different return types from updateDailyChallengeProgress
    if (Array.isArray(result)) {
      // Return first challenge if it's an array
      const firstChallenge = result[0]
      return NextResponse.json({
        challenge: serializeBigInt(firstChallenge?.challenge),
        progress: serializeBigInt(firstChallenge?.progress),
        updated: true,
        stats: updatedStats
      })
    } else if (result && 'challenges' in result) {
      // Return first challenge if it's an object with challenges array
      const firstChallenge = result.challenges[0]
      return NextResponse.json({
        challenge: serializeBigInt(firstChallenge?.challenge),
        progress: serializeBigInt(firstChallenge?.progress),
        updated: true,
        newlyCompleted: serializeBigInt(result.newlyCompleted),
        xpAwarded: result.newlyCompleted?.xpReward || 0,
        stats: updatedStats
      })
    } else {
      return NextResponse.json({ 
        message: 'No daily challenge found for today',
        stats: updatedStats
      })
    }
    
  } catch (error) {
    console.error('Error updating daily challenge progress:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}