import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { checkAndUnlockAchievements } from '@/lib/achievements'
import { updateUserStreak } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = authHeader.replace('Bearer ', '')
    
    const applications = await prisma.jobApplication.findMany({
      where: { userId },
      orderBy: { appliedDate: 'desc' }
    })

    return NextResponse.json(applications)
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
      newlyUnlockedAchievements
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating job application:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
