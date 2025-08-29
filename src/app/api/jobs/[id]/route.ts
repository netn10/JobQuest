import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { checkAndUnlockAchievements } from '@/lib/achievements'
import { updateUserStreak } from '@/lib/utils'
import { logJobStatusUpdated } from '@/lib/activity-logger'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = authHeader.replace('Bearer ', '')
    const applicationId = id

    const application = await prisma.jobApplication.findFirst({
      where: { 
        id: applicationId,
        userId 
      }
    })

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    return NextResponse.json(application)
  } catch (error) {
    console.error('Error fetching job application:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = authHeader.replace('Bearer ', '')
    const applicationId = id
    const body = await request.json()

    const { company, role, description, status, notes, nextAction, salary, location, jobUrl } = body

    if (!company || !role) {
      return NextResponse.json({ error: 'Company and role are required' }, { status: 400 })
    }

    // Check if application exists and belongs to user
    const existingApplication = await prisma.jobApplication.findFirst({
      where: { 
        id: applicationId,
        userId 
      }
    })

    if (!existingApplication) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    const application = await prisma.jobApplication.update({
      where: { id: applicationId },
      data: {
        company,
        role,
        description,
        status: status || 'APPLIED',
        notes,
        nextAction,
        salary,
        location,
        jobUrl
      }
    })

    // Log activity for job updates
    try {
      if (existingApplication.status !== application.status) {
        // Log status change specifically
        await logJobStatusUpdated(
          userId, 
          application.role, 
          application.company, 
          existingApplication.status, 
          application.status, 
          application.id
        )
      } else {
        // Log general job update if status didn't change but other fields were updated
        const hasChanges = 
          existingApplication.company !== application.company ||
          existingApplication.role !== application.role ||
          existingApplication.description !== application.description ||
          existingApplication.notes !== application.notes ||
          existingApplication.nextAction !== application.nextAction ||
          existingApplication.salary !== application.salary ||
          existingApplication.location !== application.location ||
          existingApplication.jobUrl !== application.jobUrl

        if (hasChanges) {
          await logJobStatusUpdated(
            userId,
            application.role,
            application.company,
            'UPDATED',
            'UPDATED',
            application.id
          )
        }
      }
    } catch (error) {
      console.error('Error logging job update activity:', error)
    }

    // Update streak and check for achievement unlocks after job application update
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
      console.error('Error updating streak or checking achievements after job application update:', error)
    }

    return NextResponse.json({
      application,
      newlyUnlockedAchievements
    })
  } catch (error) {
    console.error('Error updating job application:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = authHeader.replace('Bearer ', '')
    const applicationId = id

    // Check if application exists and belongs to user
    const existingApplication = await prisma.jobApplication.findFirst({
      where: { 
        id: applicationId,
        userId 
      }
    })

    if (!existingApplication) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    await prisma.jobApplication.delete({
      where: { id: applicationId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting job application:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
