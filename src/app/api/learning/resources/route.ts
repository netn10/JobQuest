import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { logLearningStarted, logLearningCompleted, logLearningProgressUpdated } from '@/lib/activity-logger'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const type = searchParams.get('type')
    const difficulty = searchParams.get('difficulty')
    const status = searchParams.get('status')
    const rating = searchParams.get('rating')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')

    // Build where clause for filtering
    const whereClause: any = {}
    
    if (type && type !== 'ALL') {
      whereClause.type = type
    }
    
    if (difficulty && difficulty !== 'ALL') {
      whereClause.difficulty = difficulty
    }

    // Get all learning resources
    const resources = await prisma.learningResource.findMany({
      where: whereClause,
      include: {
        learningProgress: userId ? {
          where: { userId }
        } : false
      },
      orderBy: { createdAt: 'desc' }
    })

    // Transform the data to match the frontend interface
    const transformedResources = resources.map(resource => {
      const userProgress = resource.learningProgress?.[0]
      
      return {
        id: resource.id,
        title: resource.title,
        description: resource.description || '',
        url: resource.url,
        type: resource.type,
        difficulty: resource.difficulty,
        estimatedTime: resource.estimatedTime || 0,
        tags: resource.tags ? JSON.parse(resource.tags) : [],
        source: resource.source || 'Unknown',
        status: userProgress?.status || 'NOT_STARTED',
        rating: userProgress?.rating || undefined,
        progress: userProgress?.timeSpent && resource.estimatedTime 
          ? Math.min(100, Math.round((userProgress.timeSpent / resource.estimatedTime) * 100))
          : undefined,
        startedAt: userProgress?.startedAt,
        completedAt: userProgress?.completedAt,
        timeSpent: userProgress?.timeSpent,
        notes: userProgress?.notes
      }
    })

    // Apply search filter if provided
    let filteredResources = transformedResources
    if (search) {
      const searchLower = search.toLowerCase()
      filteredResources = transformedResources.filter(resource => 
        resource.title.toLowerCase().includes(searchLower) ||
        resource.description.toLowerCase().includes(searchLower) ||
        resource.tags.some((tag: string) => tag.toLowerCase().includes(searchLower))
      )
    }

    // Apply status filter if provided
    if (status && status !== 'ALL') {
      filteredResources = filteredResources.filter(resource => resource.status === status)
    }

    // Apply rating filter if provided
    if (rating && rating !== 'ALL') {
      const ratingValue = parseInt(rating)
      if (ratingValue === 0) {
        // Show unrated resources
        filteredResources = filteredResources.filter(resource => !resource.rating || resource.rating === 0)
      } else {
        // Show resources with rating >= specified value
        filteredResources = filteredResources.filter(resource => resource.rating && resource.rating >= ratingValue)
      }
    }

    // Apply pagination
    const totalItems = filteredResources.length
    const totalPages = Math.ceil(totalItems / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedResources = filteredResources.slice(startIndex, endIndex)

    return NextResponse.json({
      success: true,
      resources: paginatedResources,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    })
  } catch (error) {
    console.error('Error fetching learning resources:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch learning resources' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const resourceId = searchParams.get('id')
    const deleteAll = searchParams.get('all')

    if (deleteAll === 'true') {
      // Delete all learning resources and their associated progress
      await prisma.learningProgress.deleteMany({})
      await prisma.learningResource.deleteMany({})

      return NextResponse.json({
        success: true,
        message: 'All resources deleted successfully'
      })
    }

    if (!resourceId) {
      return NextResponse.json(
        { success: false, error: 'Resource ID is required' },
        { status: 400 }
      )
    }

    // First, delete any learning progress associated with this resource
    await prisma.learningProgress.deleteMany({
      where: { resourceId }
    })

    // Then delete the resource itself
    await prisma.learningResource.delete({
      where: { id: resourceId }
    })

    return NextResponse.json({
      success: true,
      message: 'Resource deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting learning resource:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete learning resource' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, resourceId, action, timeSpent, notes, rating, title, description, url, type, difficulty, estimatedTime, tags, source } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Handle creating new resources
    if (action === 'create') {
      if (!title || !description || !url || !type || !difficulty || !estimatedTime) {
        return NextResponse.json(
          { success: false, error: 'Missing required fields for creating resource' },
          { status: 400 }
        )
      }

      const newResource = await prisma.learningResource.create({
        data: {
          title,
          description,
          url,
          type,
          difficulty,
          estimatedTime: parseInt(estimatedTime),
          tags: JSON.stringify(tags || []),
          source: source || 'User Added'
        }
      })

      return NextResponse.json({
        success: true,
        resource: newResource
      })
    }

    // Handle progress updates (existing functionality)
    if (!resourceId) {
      return NextResponse.json(
        { success: false, error: 'Resource ID is required for progress updates' },
        { status: 400 }
      )
    }

    let progressData: any = {}

    switch (action) {
      case 'start':
        progressData = {
          status: 'IN_PROGRESS',
          startedAt: new Date(),
          timeSpent: timeSpent || 0,
          notes: notes || null
        }
        break
      
      case 'update':
        progressData = {
          timeSpent: timeSpent || 0,
          notes: notes || null
        }
        break
      
      case 'complete':
        progressData = {
          status: 'COMPLETED',
          completedAt: new Date(),
          timeSpent: timeSpent || 0,
          notes: notes || null,
          rating: rating || null
        }
        break
      
      case 'rate':
        progressData = {
          rating: rating
        }
        break
      
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }

    // Get the resource details for logging
    const resource = await prisma.learningResource.findUnique({
      where: { id: resourceId }
    })

    // Upsert learning progress
    const progress = await prisma.learningProgress.upsert({
      where: {
        userId_resourceId: {
          userId,
          resourceId
        }
      },
      update: progressData,
      create: {
        userId,
        resourceId,
        ...progressData
      }
    })

    // Log activities based on action
    if (resource) {
      try {
        switch (action) {
          case 'start':
            await logLearningStarted(userId, resource.title, resourceId)
            break
          case 'complete':
            const result = await logLearningCompleted(userId, resource.title, resourceId, timeSpent || 0)
            // Return challenge completion info in the response
            if (result.challengeCompleted) {
              return NextResponse.json({
                success: true,
                progress,
                challengeCompleted: result.challengeCompleted
              })
            }
            break
          case 'update':
            if (timeSpent) {
              const progressPercent = resource.estimatedTime 
                ? Math.min(100, Math.round((timeSpent / resource.estimatedTime) * 100))
                : 0
              await logLearningProgressUpdated(userId, resource.title, resourceId, progressPercent)
            }
            break
        }
      } catch (error) {
        console.error('Error logging learning activity:', error)
      }
    }

    return NextResponse.json({
      success: true,
      progress
    })
  } catch (error) {
    console.error('Error updating learning progress:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update learning progress' },
      { status: 500 }
    )
  }
}
