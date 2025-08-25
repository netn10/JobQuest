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
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    
    if (date) {
      // Get entry for specific date
      const startDate = new Date(date + 'T00:00:00.000Z')
      const endDate = new Date(date + 'T23:59:59.999Z')
      
      const entry = await prisma.notebookEntry.findFirst({
        where: { 
          userId,
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        orderBy: { updatedAt: 'desc' }
      })

      return NextResponse.json(entry)
    } else {
      // Get all entries
      const entries = await prisma.notebookEntry.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      })

      return NextResponse.json(entries)
    }
  } catch (error) {
    console.error('Error fetching notebook entries:', error)
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

    const { title, content, tags, date } = body

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    // Check if entry exists for this date
    let entry
    if (date) {
      const startDate = new Date(date + 'T00:00:00.000Z')
      const endDate = new Date(date + 'T23:59:59.999Z')
      
      entry = await prisma.notebookEntry.findFirst({
        where: { 
          userId,
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        }
      })
    }

    if (entry) {
      // Update existing entry
      entry = await prisma.notebookEntry.update({
        where: { id: entry.id },
        data: {
          title,
          content,
          tags: tags ? JSON.stringify(tags) : null,
          updatedAt: new Date()
        }
      })
    } else {
      // Create new entry
      entry = await prisma.notebookEntry.create({
        data: {
          title,
          content,
          tags: tags ? JSON.stringify(tags) : null,
          userId,
          createdAt: date ? new Date(date + 'T12:00:00.000Z') : new Date()
        }
      })
    }

    // Update streak and check for achievement unlocks after notebook entry creation
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
      console.error('Error updating streak or checking achievements after notebook entry:', error)
    }

    return NextResponse.json({
      entry,
      newlyUnlockedAchievements
    }, { status: entry ? 200 : 201 })
  } catch (error) {
    console.error('Error creating/updating notebook entry:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = authHeader.replace('Bearer ', '')
    const { searchParams } = new URL(request.url)
    const entryId = searchParams.get('id')
    const date = searchParams.get('date')

    if (!entryId && !date) {
      return NextResponse.json({ error: 'Entry ID or date is required' }, { status: 400 })
    }

    let deletedEntry
    if (entryId) {
      deletedEntry = await prisma.notebookEntry.delete({
        where: { 
          id: entryId,
          userId 
        }
      })
    } else if (date) {
      const startDate = new Date(date + 'T00:00:00.000Z')
      const endDate = new Date(date + 'T23:59:59.999Z')
      
      deletedEntry = await prisma.notebookEntry.deleteMany({
        where: { 
          userId,
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting notebook entry:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}