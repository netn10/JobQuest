import { prisma } from './db'

export interface ChallengeRequirement {
  type: string
  count?: number
  days?: number
  missionType?: string
  resourceType?: string
  beforeHour?: number
  afterHour?: number
  category?: string
}

export interface DailyChallengeSettings {
  notebookEntriesTarget: number
  learningMaterialsTarget: number
  jobApplicationsTarget: number
  enableNotebookChallenge: boolean
  enableLearningChallenge: boolean
  enableJobApplicationChallenge: boolean
}

export const DEFAULT_DAILY_CHALLENGE_SETTINGS: DailyChallengeSettings = {
  notebookEntriesTarget: 1,
  learningMaterialsTarget: 2,
  jobApplicationsTarget: 1,
  enableNotebookChallenge: true,
  enableLearningChallenge: true,
  enableJobApplicationChallenge: true
}

export async function getUserDailyChallengeSettings(userId: string): Promise<DailyChallengeSettings> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { dailyChallengeSettings: true }
    })

    if (!user || !user.dailyChallengeSettings) {
      return DEFAULT_DAILY_CHALLENGE_SETTINGS
    }

    const settings = user.dailyChallengeSettings as DailyChallengeSettings
    return {
      ...DEFAULT_DAILY_CHALLENGE_SETTINGS,
      ...settings
    }
  } catch (error) {
    console.error('Error getting user daily challenge settings:', error)
    return DEFAULT_DAILY_CHALLENGE_SETTINGS
  }
}

export async function updateUserDailyChallengeSettings(userId: string, settings: Partial<DailyChallengeSettings>): Promise<void> {
  try {
    const currentSettings = await getUserDailyChallengeSettings(userId)
    const updatedSettings = { ...currentSettings, ...settings }

    await prisma.user.update({
      where: { id: userId },
      data: {
        dailyChallengeSettings: updatedSettings
      }
    })
  } catch (error) {
    console.error('Error updating user daily challenge settings:', error)
    throw error
  }
}

export async function createConsistentDailyChallenges(date: Date, userId: string) {
  try {
    const settings = await getUserDailyChallengeSettings(userId)
    const challenges = []

    // Create notebook entry challenge
    if (settings.enableNotebookChallenge) {
      challenges.push({
        title: "Daily Reflection",
        description: `Write ${settings.notebookEntriesTarget} notebook entry${settings.notebookEntriesTarget > 1 ? 's' : ''} today`,
        type: "LEARNING" as const,
        requirement: JSON.stringify({ 
          type: "NOTEBOOK_ENTRIES", 
          count: settings.notebookEntriesTarget 
        }),
        xpReward: 25 + (settings.notebookEntriesTarget * 5)
      })
    }

    // Create learning materials challenge
    if (settings.enableLearningChallenge) {
      challenges.push({
        title: "Knowledge Seeker",
        description: `Complete ${settings.learningMaterialsTarget} learning material${settings.learningMaterialsTarget > 1 ? 's' : ''} today`,
        type: "LEARNING" as const,
        requirement: JSON.stringify({ 
          type: "LEARNING_RESOURCES", 
          count: settings.learningMaterialsTarget 
        }),
        xpReward: 30 + (settings.learningMaterialsTarget * 10)
      })
    }

    // Create job application challenge
    if (settings.enableJobApplicationChallenge) {
      challenges.push({
        title: "Job Hunter",
        description: `Submit ${settings.jobApplicationsTarget} job application${settings.jobApplicationsTarget > 1 ? 's' : ''} today`,
        type: "JOB_APPLICATION" as const,
        requirement: JSON.stringify({ 
          type: "JOB_APPLICATIONS", 
          count: settings.jobApplicationsTarget 
        }),
        xpReward: 40 + (settings.jobApplicationsTarget * 15)
      })
    }


    // Create all challenges for the date and automatically start them
    const createdChallenges = []
    for (const challenge of challenges) {
      const created = await prisma.dailyChallenge.create({
        data: {
          ...challenge,
          date: date
        }
      })
      
      // Automatically create progress entry with IN_PROGRESS status
      await prisma.dailyChallengeProgress.create({
        data: {
          userId,
          challengeId: created.id,
          status: 'IN_PROGRESS',
          progress: 0
        }
      })
      
      createdChallenges.push(created)
    }

    return createdChallenges
  } catch (error) {
    console.error('Error creating consistent daily challenges:', error)
    throw error
  }
}

export async function updateDailyChallengeProgress(userId: string) {
  try {
    // Get today's date
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    // Get today's challenges
    const dailyChallenges = await prisma.dailyChallenge.findMany({
      where: {
        date: {
          gte: today,
          lt: tomorrow
        }
      }
    })
    
    if (dailyChallenges.length === 0) {
      // Create challenges if none exist
      await createConsistentDailyChallenges(today, userId)
      return null
    }
    
    const updatedChallenges = []
    let completionInfo = null
    
    for (const dailyChallenge of dailyChallenges) {
      // Get user's progress for this challenge
      let userProgress = await prisma.dailyChallengeProgress.findUnique({
        where: {
          userId_challengeId: {
            userId,
            challengeId: dailyChallenge.id
          }
        }
      })
      
      if (!userProgress) {
        userProgress = await prisma.dailyChallengeProgress.create({
          data: {
            userId,
            challengeId: dailyChallenge.id,
            status: 'IN_PROGRESS',
            progress: 0
          }
        })
      }
      
      // Update any NOT_STARTED challenges to IN_PROGRESS
      if (userProgress.status === 'NOT_STARTED') {
        userProgress = await prisma.dailyChallengeProgress.update({
          where: {
            userId_challengeId: {
              userId,
              challengeId: dailyChallenge.id
            }
          },
          data: {
            status: 'IN_PROGRESS'
          }
        })
      }
      
      // If already completed, don't update
      if (userProgress.status === 'COMPLETED') {
        updatedChallenges.push({ challenge: dailyChallenge, progress: userProgress })
        continue
      }
      
      // Parse challenge requirement
      let requirement: ChallengeRequirement
      try {
        requirement = JSON.parse(dailyChallenge.requirement)
      } catch (error) {
        console.error('Error parsing challenge requirement:', error)
        updatedChallenges.push({ challenge: dailyChallenge, progress: userProgress })
        continue
      }
      
      // Calculate current progress based on requirement type
      const currentProgress = await calculateCurrentProgress(userId, requirement)
      
      // Update progress if it has changed
      if (currentProgress !== userProgress.progress) {
        const isCompleted = currentProgress >= (requirement.count || requirement.days || 1)
        
        userProgress = await prisma.dailyChallengeProgress.update({
          where: {
            userId_challengeId: {
              userId,
              challengeId: dailyChallenge.id
            }
          },
          data: {
            progress: currentProgress,
            status: isCompleted ? 'COMPLETED' : 'IN_PROGRESS',
            completedAt: isCompleted ? new Date() : null
          }
        })
        
        // If challenge was just completed, award XP and store completion info
        if (isCompleted && userProgress.status === 'COMPLETED') {
          await prisma.user.update({
            where: { id: userId },
            data: {
              xp: { increment: dailyChallenge.xpReward },
              totalXp: { increment: dailyChallenge.xpReward }
            }
          })
          
          // Store completion info for client-side notifications
          completionInfo = {
            title: dailyChallenge.title,
            description: dailyChallenge.description,
            xpReward: dailyChallenge.xpReward
          }
        }
      }
      
      updatedChallenges.push({ challenge: dailyChallenge, progress: userProgress })
    }
    
    // Return challenges array with completion info if any challenge was completed
    if (completionInfo) {
      return {
        challenges: updatedChallenges,
        newlyCompleted: completionInfo
      }
    }
    
    return updatedChallenges
    
  } catch (error) {
    console.error('Error updating daily challenge progress:', error)
    return null
  }
}

async function calculateCurrentProgress(userId: string, requirement: ChallengeRequirement): Promise<number> {
  try {
    // Get today's date range
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    switch (requirement.type) {
      case 'MISSIONS_COMPLETED':
        const completedMissions = await prisma.mission.count({
          where: {
            userId,
            status: 'COMPLETED',
            completedAt: {
              gte: today,
              lt: tomorrow
            },
            ...(requirement.missionType && { type: requirement.missionType })
          }
        })
        return completedMissions
        
      case 'LEARNING_RESOURCES':
        const completedLearning = await prisma.learningProgress.count({
          where: {
            userId,
            status: 'COMPLETED',
            completedAt: {
              gte: today,
              lt: tomorrow
            }
          }
        })
        return completedLearning
        
      case 'JOB_APPLICATIONS':
        const jobApplications = await prisma.jobApplication.count({
          where: {
            userId,
            appliedDate: {
              gte: today,
              lt: tomorrow
            }
          }
        })
        return jobApplications
        
      case 'STREAK_DAYS':
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { currentStreak: true }
        })
        return user?.currentStreak || 0
        
      case 'EARLY_FOCUS_SESSIONS':
        const earlySessions = await prisma.mission.count({
          where: {
            userId,
            status: 'COMPLETED',
            type: 'FOCUS',
            startedAt: {
              gte: today,
              lt: tomorrow,
              ...(requirement.beforeHour && {
                hour: { lt: requirement.beforeHour }
              })
            }
          }
        })
        return earlySessions
        
      case 'LATE_FOCUS_SESSIONS':
        const lateSessions = await prisma.mission.count({
          where: {
            userId,
            status: 'COMPLETED',
            type: 'FOCUS',
            startedAt: {
              gte: today,
              lt: tomorrow,
              ...(requirement.afterHour && {
                hour: { gte: requirement.afterHour }
              })
            }
          }
        })
        return lateSessions
        
      case 'WEEKEND_FOCUS_SESSIONS':
        const weekendSessions = await prisma.mission.count({
          where: {
            userId,
            status: 'COMPLETED',
            type: 'FOCUS',
            startedAt: {
              gte: today,
              lt: tomorrow
            }
          }
        })
        // Check if today is weekend (Saturday = 6, Sunday = 0)
        const dayOfWeek = today.getDay()
        return (dayOfWeek === 0 || dayOfWeek === 6) ? weekendSessions : 0
        
      case 'POMODORO_SESSIONS':
        const pomodoroSessions = await prisma.mission.count({
          where: {
            userId,
            status: 'COMPLETED',
            type: 'FOCUS',
            duration: 25,
            completedAt: {
              gte: today,
              lt: tomorrow
            }
          }
        })
        return pomodoroSessions
        
      case 'NOTEBOOK_ENTRIES':
        const notebookEntries = await prisma.notebookEntry.count({
          where: {
            userId,
            createdAt: {
              gte: today,
              lt: tomorrow
            }
          }
        })
        return notebookEntries
        
      case 'LEARNING_CATEGORIES':
        const learningCategories = await prisma.learningProgress.findMany({
          where: {
            userId,
            status: 'COMPLETED',
            completedAt: {
              gte: today,
              lt: tomorrow
            }
          },
          include: {
            resource: true
          }
        })
        
        const categories = new Set()
        learningCategories.forEach(progress => {
          if (progress.resource) {
            categories.add(progress.resource.type)
          }
        })
        return categories.size
        
      default:
        return 0
    }
  } catch (error) {
    console.error('Error calculating current progress:', error)
    return 0
  }
}

export async function getDailyChallengeProgress(userId: string) {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const dailyChallenges = await prisma.dailyChallenge.findMany({
      where: {
        date: {
          gte: today,
          lt: tomorrow
        }
      }
    })
    
    if (dailyChallenges.length === 0) {
      // Create challenges if none exist
      await createConsistentDailyChallenges(today, userId)
      return []
    }
    
    const challengesWithProgress = []
    
    for (const dailyChallenge of dailyChallenges) {
      let userProgress = await prisma.dailyChallengeProgress.findUnique({
        where: {
          userId_challengeId: {
            userId,
            challengeId: dailyChallenge.id
          }
        }
      })
      
      if (!userProgress) {
        // Auto-create progress entry if it doesn't exist
        userProgress = await prisma.dailyChallengeProgress.create({
          data: {
            userId,
            challengeId: dailyChallenge.id,
            status: 'IN_PROGRESS',
            progress: 0
          }
        })
      }
      
      const progressPercentage = calculateProgressPercentage(dailyChallenge, userProgress)
      
      challengesWithProgress.push({
        challenge: dailyChallenge,
        progress: userProgress,
        progressPercentage
      })
    }
    
    return challengesWithProgress
    
  } catch (error) {
    console.error('Error getting daily challenge progress:', error)
    return []
  }
}

function calculateProgressPercentage(challenge: any, userProgress: any): number {
  try {
    const requirement = JSON.parse(challenge.requirement)
    const target = requirement.count || requirement.days || 1
    return Math.min((userProgress.progress / target) * 100, 100)
  } catch (error) {
    return Math.min(userProgress.progress, 100)
  }
}
