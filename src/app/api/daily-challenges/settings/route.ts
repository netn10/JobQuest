import { NextRequest, NextResponse } from 'next/server'
import { getUserDailyChallengeSettings, updateUserDailyChallengeSettings } from '@/lib/daily-challenges'

export async function GET(request: NextRequest) {
  try {
    // Get user ID from authorization header
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const userId = authHeader.replace('Bearer ', '')
    
    // Get user's daily challenge settings
    const settings = await getUserDailyChallengeSettings(userId)
    
    return NextResponse.json({
      success: true,
      settings
    })
    
  } catch (error) {
    console.error('Error fetching daily challenge settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get user ID from authorization header
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const userId = authHeader.replace('Bearer ', '')
    const { settings } = await request.json()
    
    // Update user's daily challenge settings
    await updateUserDailyChallengeSettings(userId, settings)
    
    return NextResponse.json({
      success: true,
      message: 'Daily challenge settings updated successfully'
    })
    
  } catch (error) {
    console.error('Error updating daily challenge settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
