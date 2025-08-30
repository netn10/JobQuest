import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Get user ID from authorization header
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const userId = authHeader.replace('Bearer ', '')
    
    // Get recent activities (last 10) with potential challenge completions
    const activities = await prisma.activity.findMany({
      where: {
        userId,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20
    })
    
    return NextResponse.json(activities)
    
  } catch (error) {
    console.error('Error fetching recent activities:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}