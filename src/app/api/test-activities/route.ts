import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const userId = authHeader.replace('Bearer ', '')
    console.log('Checking activities for user:', userId)
    
    // Get all activities for this user
    const activities = await prisma.activity.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })
    
    console.log(`Found ${activities.length} activities:`, activities)
    
    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true }
    })
    
    return NextResponse.json({
      user,
      activities,
      count: activities.length
    })
  } catch (error) {
    console.error('Error checking activities:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}