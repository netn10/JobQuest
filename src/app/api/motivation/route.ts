import { NextRequest, NextResponse } from 'next/server'
import { generateMotivationalMessage } from '@/lib/openai'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 400 }
      )
    }

    // Get user's current context from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        achievements: {
          include: { achievement: true },
          orderBy: { unlockedAt: 'desc' },
          take: 3
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    const context = {
      streak: user.currentStreak,
      recentAchievements: user.achievements.map(ua => ua.achievement.name),
      upcomingGoals: ['Complete 5 focus sessions this week', 'Apply to 3 new positions']
    }

    const motivationalMessage = await generateMotivationalMessage(context, user.openaiApiKey || undefined)

    return NextResponse.json({
      success: true,
      message: motivationalMessage,
      context
    })
  } catch (error) {
    console.error('Error generating motivational message:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate motivational message' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 400 }
      )
    }

    // Return cached motivational message or generate a new one
    const context = {
      streak: 7, // This would come from user data
      recentAchievements: ['First Steps', 'Streak Keeper'],
      upcomingGoals: ['Complete daily learning', 'Apply to dream job']
    }

    // Get user to check if they have an API key
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { openaiApiKey: true }
    })

    const motivationalMessage = await generateMotivationalMessage(context, user?.openaiApiKey || undefined)

    return NextResponse.json({
      success: true,
      message: motivationalMessage
    })
  } catch (error) {
    console.error('Error fetching motivational message:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch motivational message' },
      { status: 500 }
    )
  }
}