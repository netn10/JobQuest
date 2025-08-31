import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = authHeader.replace('Bearer ', '')

    // Get user with all related data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        missions: {
          orderBy: { createdAt: 'desc' }
        },
        jobApplications: {
          orderBy: { appliedDate: 'desc' }
        },
        notebookEntries: {
          orderBy: { createdAt: 'desc' }
        },
        learningProgress: {
          include: {
            resource: true
          },
          orderBy: { id: 'desc' }
        },
        achievements: {
          include: {
            achievement: true
          },
          orderBy: { unlockedAt: 'desc' }
        },
        dailyChallenges: {
          include: {
            challenge: true
          },
          orderBy: { id: 'desc' }
        },
        activities: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Prepare export data
    const exportData = {
      exportDate: new Date().toISOString(),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        timezone: user.timezone,
        level: user.level,
        totalXp: user.totalXp,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        settings: {
          focusSettings: user.focusSettings,
          notificationPreferences: user.notificationPreferences,
          notifications: user.notifications,
          openaiApiKey: user.openaiApiKey ? '[REDACTED]' : null
        }
      },
      missions: user.missions,
      jobApplications: user.jobApplications,
      notebookEntries: user.notebookEntries,
      learningProgress: user.learningProgress,
      achievements: user.achievements,
      dailyChallenges: user.dailyChallenges,
      activities: user.activities,
      stats: {
        totalMissions: user.missions.length,
        completedMissions: user.missions.filter(m => m.status === 'COMPLETED').length,
        totalApplications: user.jobApplications.length,
        totalNotebookEntries: user.notebookEntries.length,
        totalLearningItems: user.learningProgress.length,
        totalAchievements: user.achievements.length,
        totalDailyChallenges: user.dailyChallenges.length,
        totalActivities: user.activities.length
      }
    }

    // Helper function to convert BigInt to string for JSON serialization
    const convertBigIntToString = (obj: any): any => {
      if (obj === null || obj === undefined) {
        return obj
      }
      
      if (typeof obj === 'bigint') {
        return obj.toString()
      }
      
      if (Array.isArray(obj)) {
        return obj.map(convertBigIntToString)
      }
      
      if (typeof obj === 'object') {
        const converted: any = {}
        for (const [key, value] of Object.entries(obj)) {
          converted[key] = convertBigIntToString(value)
        }
        return converted
      }
      
      return obj
    }

    // Convert BigInt values to strings before JSON serialization
    const serializableData = convertBigIntToString(exportData)
    
    // Convert to JSON string
    const jsonData = JSON.stringify(serializableData, null, 2)
    
    // Create response with proper headers for file download
    const response = new NextResponse(jsonData, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="jobquest-export-${user.name || user.id}-${new Date().toISOString().split('T')[0]}.json"`,
        'Content-Length': Buffer.byteLength(jsonData, 'utf8').toString()
      }
    })

    return response

  } catch (error) {
    console.error('Error exporting user data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
