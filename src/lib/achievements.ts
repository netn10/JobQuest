import { prisma } from './db'

export interface AchievementRequirement {
  type: string
  count?: number
  days?: number
  xp?: number
  minutes?: number
  missionType?: string
}

export async function checkAndUnlockAchievements(userId: string) {
  try {
    // Get user data with all related information
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        missions: true,
        jobApplications: true,
        learningProgress: true,
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

    // Get all available achievements
    const allAchievements = await prisma.achievement.findMany({
      orderBy: { createdAt: 'asc' }
    })

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
          let completedMissions = user.missions.filter(m => m.status === 'COMPLETED')
          if (requirement.missionType) {
            completedMissions = completedMissions.filter(m => m.type === requirement.missionType)
          }
          shouldUnlock = completedMissions.length >= (requirement.count || 1)
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
          const screeningApplications = user.jobApplications.filter(ja => ja.status === 'SCREENING').length
          shouldUnlock = screeningApplications >= (requirement.count || 1)
          break

        case 'JOB_APPLICATIONS_INTERVIEW':
          const interviewApplications = user.jobApplications.filter(ja => ja.status === 'INTERVIEW').length
          shouldUnlock = interviewApplications >= (requirement.count || 1)
          break

        case 'LEARNING_RESOURCES':
          const completedLearning = user.learningProgress.filter(lp => lp.status === 'COMPLETED').length
          shouldUnlock = completedLearning >= (requirement.count || 1)
          break

        case 'LEARNING_RESOURCES_DAILY':
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          const tomorrow = new Date(today)
          tomorrow.setDate(tomorrow.getDate() + 1)
          
          const dailyCompletedLearning = user.learningProgress.filter(lp => 
            lp.status === 'COMPLETED' && 
            lp.completedAt && 
            lp.completedAt >= today && 
            lp.completedAt < tomorrow
          ).length
          shouldUnlock = dailyCompletedLearning >= (requirement.count || 1)
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
        learningProgress: true,
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
            let completedMissions = user.missions.filter(m => m.status === 'COMPLETED')
            if (requirement.missionType) {
              completedMissions = completedMissions.filter(m => m.type === requirement.missionType)
            }
            progress = Math.min(completedMissions.length, requirement.count || 1)
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
            const screeningApplications = user.jobApplications.filter(ja => ja.status === 'SCREENING').length
            progress = Math.min(screeningApplications, requirement.count || 1)
            maxProgress = requirement.count || 1
            break

          case 'JOB_APPLICATIONS_INTERVIEW':
            const interviewApplications = user.jobApplications.filter(ja => ja.status === 'INTERVIEW').length
            progress = Math.min(interviewApplications, requirement.count || 1)
            maxProgress = requirement.count || 1
            break
            
          case 'LEARNING_RESOURCES':
            const completedLearning = user.learningProgress.filter(lp => lp.status === 'COMPLETED').length
            progress = Math.min(completedLearning, requirement.count || 1)
            maxProgress = requirement.count || 1
            break

          case 'LEARNING_RESOURCES_DAILY':
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            const tomorrow = new Date(today)
            tomorrow.setDate(tomorrow.getDate() + 1)
            
            const dailyCompletedLearning = user.learningProgress.filter(lp => 
              lp.status === 'COMPLETED' && 
              lp.completedAt && 
              lp.completedAt >= today && 
              lp.completedAt < tomorrow
            ).length
            progress = Math.min(dailyCompletedLearning, requirement.count || 1)
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
