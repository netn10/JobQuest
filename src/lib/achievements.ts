import { prisma } from './db'
import { logAchievementUnlocked } from './activity-logger'

export interface AchievementRequirement {
  type: string
  count?: number
  days?: number
  xp?: number
  minutes?: number
  missionType?: string
  resourceType?: string
  beforeHour?: number
  afterHour?: number
}

export async function checkAndUnlockAchievements(userId: string) {
  try {
    // Get user data with all related information
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        missions: true,
        jobApplications: true,
        learningProgress: {
          include: {
            resource: true
          }
        },
        achievements: {
          include: {
            achievement: true
          }
        }
      }
    })

    if (!user) {
      console.log('User not found in achievements check:', userId)
      return {
        newlyUnlockedAchievements: [],
        totalXpAwarded: 0
      }
    }

    // Get all available achievements
    const allAchievements = await prisma.achievement.findMany({
      orderBy: { createdAt: 'asc' }
    }).catch(error => {
      console.error('Error fetching achievements:', error)
      return []
    })

    if (allAchievements.length === 0) {
      console.log('No achievements found in database')
      return {
        newlyUnlockedAchievements: [],
        totalXpAwarded: 0
      }
    }

    const newlyUnlockedAchievements = []
    let totalXpAwarded = 0

    // Check each achievement
    for (const achievement of allAchievements) {
      // Skip if already unlocked
      const alreadyUnlocked = user.achievements.some(ua => ua.achievementId === achievement.id)
      if (alreadyUnlocked) continue

      // Parse requirement
      let requirement: AchievementRequirement
      try {
        requirement = JSON.parse(achievement.requirement)
      } catch (error) {
        console.error(`Failed to parse requirement for achievement ${achievement.id}:`, error)
        continue
      }

      // Check if achievement should be unlocked
      let shouldUnlock = false

      switch (requirement.type) {
        case 'MISSIONS_COMPLETED':
          let completedMissions
          if (requirement.missionType) {
            completedMissions = user.missions.filter(m => 
              m.status === 'COMPLETED' && m.type === requirement.missionType
            ).length
          } else {
            completedMissions = user.missions.filter(m => m.status === 'COMPLETED').length
          }
          shouldUnlock = completedMissions >= (requirement.count || 1)
          break

        case 'STREAK_DAYS':
          shouldUnlock = user.currentStreak >= (requirement.days || 1)
          break

        case 'TOTAL_XP':
          shouldUnlock = user.totalXp >= (requirement.xp || 1)
          break

        case 'JOB_APPLICATIONS':
          const applications = user.jobApplications.length
          shouldUnlock = applications >= (requirement.count || 1)
          break

        case 'JOB_APPLICATIONS_SCREENING':
          const screeningApps = user.jobApplications.filter(app => 
            app.status === 'SCREENING' || app.status === 'INTERVIEWING' || app.status === 'OFFER_RECEIVED'
          ).length
          shouldUnlock = screeningApps >= (requirement.count || 1)
          break

        case 'LEARNING_RESOURCES':
          const completedLearning = user.learningProgress.filter(lp => lp.status === 'COMPLETED').length
          shouldUnlock = completedLearning >= (requirement.count || 1)
          break

        case 'LEARNING_RESOURCES_BY_TYPE':
          const completedByType = user.learningProgress.filter(lp => 
            lp.status === 'COMPLETED' && 
            lp.resource && 
            lp.resource.type === requirement.resourceType
          ).length
          shouldUnlock = completedByType >= (requirement.count || 1)
          break

        case 'FOCUS_SESSION_DURATION':
          const longSessions = user.missions.filter(m => 
            m.status === 'COMPLETED' && 
            m.type === 'FOCUS' && 
            m.duration && 
            m.duration >= (requirement.minutes || 60)
          ).length
          shouldUnlock = longSessions > 0
          break

        // New achievement types that would need additional data/logic to implement fully
        case 'EARLY_FOCUS_SESSIONS':
        case 'LATE_FOCUS_SESSIONS':
        case 'WEEKEND_FOCUS_SESSIONS':
        case 'DAILY_LEARNING_RESOURCES':
        case 'DAILY_JOB_APPLICATIONS':
        case 'JOB_APPLICATION_STREAK':
          // These would require additional tracking in the database
          // For now, mark as not unlocked (can be implemented later with enhanced data tracking)
          shouldUnlock = false
          console.log(`Achievement type ${requirement.type} requires enhanced tracking - not yet implemented`)
          break

        default:
          console.warn(`Unknown achievement requirement type: ${requirement.type}`)
          continue
      }

      // Unlock achievement if conditions are met
      if (shouldUnlock) {
        try {
          // Create user achievement record
          await prisma.userAchievement.create({
            data: {
              userId,
              achievementId: achievement.id
            }
          })

          // Award XP
          await prisma.user.update({
            where: { id: userId },
            data: {
              xp: { increment: achievement.xpReward },
              totalXp: { increment: achievement.xpReward }
            }
          })

          // Log achievement unlock activity
          try {
            await logAchievementUnlocked(userId, achievement.name, achievement.id, achievement.xpReward)
          } catch (error) {
            console.error('Error logging achievement unlock activity:', error)
          }

          newlyUnlockedAchievements.push({
            id: achievement.id,
            name: achievement.name,
            description: achievement.description,
            xpReward: achievement.xpReward,
            category: achievement.category
          })

          totalXpAwarded += achievement.xpReward

          console.log(`Achievement unlocked: ${achievement.name} (+${achievement.xpReward} XP)`)
        } catch (error) {
          console.error(`Failed to unlock achievement ${achievement.id}:`, error)
        }
      }
    }

    return {
      newlyUnlockedAchievements,
      totalXpAwarded
    }
  } catch (error) {
    console.error('Error checking achievements:', error)
    throw error
  }
}

export async function getAchievementProgress(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        missions: true,
        jobApplications: true,
        learningProgress: {
          include: {
            resource: true
          }
        },
        achievements: {
          include: {
            achievement: true
          }
        }
      }
    })

    if (!user) {
      throw new Error('User not found')
    }

    const allAchievements = await prisma.achievement.findMany({
      orderBy: { createdAt: 'asc' }
    })

    return allAchievements.map(achievement => {
      const userAchievement = user.achievements.find(ua => ua.achievementId === achievement.id)
      const isUnlocked = !!userAchievement
      
      let progress = 0
      let maxProgress = 1
      
      try {
        const requirement = JSON.parse(achievement.requirement)
        
        switch (requirement.type) {
          case 'MISSIONS_COMPLETED':
            let completedMissions
            if (requirement.missionType) {
              completedMissions = user.missions.filter(m => 
                m.status === 'COMPLETED' && m.type === requirement.missionType
              ).length
            } else {
              completedMissions = user.missions.filter(m => m.status === 'COMPLETED').length
            }
            progress = Math.min(completedMissions, requirement.count || 1)
            maxProgress = requirement.count || 1
            break
            
          case 'STREAK_DAYS':
            progress = Math.min(user.currentStreak, requirement.days || 1)
            maxProgress = requirement.days || 1
            break
            
          case 'TOTAL_XP':
            progress = Math.min(user.totalXp, requirement.xp || 1)
            maxProgress = requirement.xp || 1
            break
            
          case 'JOB_APPLICATIONS':
            const applications = user.jobApplications.length
            progress = Math.min(applications, requirement.count || 1)
            maxProgress = requirement.count || 1
            break

          case 'JOB_APPLICATIONS_SCREENING':
            const screeningApps = user.jobApplications.filter(app => 
              app.status === 'SCREENING' || app.status === 'INTERVIEWING' || app.status === 'OFFER_RECEIVED'
            ).length
            progress = Math.min(screeningApps, requirement.count || 1)
            maxProgress = requirement.count || 1
            break
            
          case 'LEARNING_RESOURCES':
            const completedLearning = user.learningProgress.filter(lp => lp.status === 'COMPLETED').length
            progress = Math.min(completedLearning, requirement.count || 1)
            maxProgress = requirement.count || 1
            break

          case 'LEARNING_RESOURCES_BY_TYPE':
            const completedByType = user.learningProgress.filter(lp => 
              lp.status === 'COMPLETED' && 
              lp.resource && 
              lp.resource.type === requirement.resourceType
            ).length
            progress = Math.min(completedByType, requirement.count || 1)
            maxProgress = requirement.count || 1
            break
            
          case 'FOCUS_SESSION_DURATION':
            const longSessions = user.missions.filter(m => 
              m.status === 'COMPLETED' && 
              m.type === 'FOCUS' && 
              m.duration && 
              m.duration >= (requirement.minutes || 60)
            ).length
            progress = longSessions > 0 ? 1 : 0
            maxProgress = 1
            break

          // New achievement types that would need additional data/logic to implement fully
          case 'EARLY_FOCUS_SESSIONS':
          case 'LATE_FOCUS_SESSIONS':
          case 'WEEKEND_FOCUS_SESSIONS':
          case 'DAILY_LEARNING_RESOURCES':
          case 'DAILY_JOB_APPLICATIONS':
          case 'JOB_APPLICATION_STREAK':
            progress = isUnlocked ? 1 : 0
            maxProgress = 1
            break
            
          default:
            progress = isUnlocked ? 1 : 0
            maxProgress = 1
        }
      } catch (error) {
        progress = isUnlocked ? 1 : 0
        maxProgress = 1
      }

      return {
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        category: achievement.category,
        xpReward: achievement.xpReward,
        isUnlocked,
        unlockedAt: userAchievement?.unlockedAt,
        progress,
        maxProgress,
        requirement: achievement.requirement
      }
    })
  } catch (error) {
    console.error('Error getting achievement progress:', error)
    throw error
  }
}
