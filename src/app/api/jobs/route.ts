import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { checkAndUnlockAchievements } from '@/lib/achievements'
import { updateUserStreak } from '@/lib/utils'
import { logJobApplied } from '@/lib/activity-logger'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = authHeader.replace('Bearer ', '')
    
    // Get pagination parameters
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    
    // Calculate skip value for pagination
    const skip = (page - 1) * limit
    
    // Build where clause for search
    const whereClause: any = { userId }
    if (search) {
      whereClause.OR = [
        { company: { contains: search, mode: 'insensitive' } },
        { role: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    // Get total count for pagination
    const totalCount = await prisma.jobApplication.count({
      where: whereClause
    })
    
    // Get paginated applications
    const applications = await prisma.jobApplication.findMany({
      where: whereClause,
      orderBy: { appliedDate: 'desc' },
      skip,
      take: limit
    })

    return NextResponse.json({
      applications,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        itemsPerPage: limit,
        hasNextPage: page * limit < totalCount,
        hasPrevPage: page > 1
      }
    })
  } catch (error) {
    console.error('Error fetching job applications:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = authHeader.replace('Bearer ', '')
    const body = await request.json()

    const { company, role, description, status, notes, nextAction, salary, location, jobUrl } = body

    if (!company || !role) {
      return NextResponse.json({ error: 'Company and role are required' }, { status: 400 })
    }

    const application = await prisma.jobApplication.create({
      data: {
        company,
        role,
        description,
        status: status || 'APPLIED',
        notes,
        nextAction,
        salary,
        location,
        jobUrl,
        userId
      }
    })

    // Log the job application activity
    let challengeCompleted = null
    try {
      console.log('Logging job application activity for user:', userId)
      const result = await logJobApplied(userId, role, company, application.id)
      console.log('Job application activity logged, challenge result:', result)
      challengeCompleted = result.challengeCompleted
      console.log('Challenge completed:', challengeCompleted)
    } catch (error) {
      console.error('Error logging job application activity:', error)
    }

    // Update streak and check for achievement unlocks after job application creation
    let newlyUnlockedAchievements: any[] = []
    
    try {
      await Promise.all([
        updateUserStreak(userId, prisma),
        checkAndUnlockAchievements(userId).then(result => {
          newlyUnlockedAchievements = result.newlyUnlockedAchievements || []
          if (newlyUnlockedAchievements.length > 0) {
            console.log(`Unlocked ${newlyUnlockedAchievements.length} achievements for user ${userId}`)
          }
        })
      ])
    } catch (error) {
      console.error('Error updating streak or checking achievements after job application creation:', error)
    }

    return NextResponse.json({
      application,
      newlyUnlockedAchievements,
      challengeCompleted
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating job application:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
