import { NextRequest, NextResponse } from 'next/server'
import { generateLearningRecommendations } from '@/lib/openai'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, timeAvailable = 30 } = body

    // In a real app, you'd get user data from the session/database
    const userProfile = {
      skills: ['JavaScript', 'React', 'TypeScript'],
      jobGoals: ['Frontend Developer', 'Full Stack Developer'],
      currentLevel: 'Intermediate',
      timeAvailable
    }

    // Get user to check if they have an API key
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { openaiApiKey: true }
    })

    const recommendations = await generateLearningRecommendations(userProfile, user?.openaiApiKey || undefined)

    // Optionally save recommendations to database
    // You could implement caching here to avoid repeated API calls

    return NextResponse.json({
      success: true,
      recommendations
    })
  } catch (error) {
    console.error('Error generating learning recommendations:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate recommendations' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get daily learning suggestions from database or generate new ones
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 400 }
      )
    }

    // Get user's learning progress to inform recommendations
    const learningProgress = await prisma.learningProgress.findMany({
      where: { userId },
      include: { resource: true },
      orderBy: { startedAt: 'desc' },
      take: 10
    })

    // Generate suggestions based on user's progress
    const userProfile = {
      skills: ['JavaScript', 'React', 'TypeScript'], // This would come from user profile
      jobGoals: ['Frontend Developer'],
      currentLevel: 'Intermediate',
      timeAvailable: 30
    }

    // Get user to check if they have an API key
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { openaiApiKey: true }
    })

    const suggestions = await generateLearningRecommendations(userProfile, user?.openaiApiKey || undefined)

    return NextResponse.json({
      success: true,
      suggestions,
      recentProgress: learningProgress
    })
  } catch (error) {
    console.error('Error fetching learning suggestions:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch suggestions' },
      { status: 500 }
    )
  }
}