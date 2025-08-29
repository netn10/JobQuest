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
  category?: string
  platform?: string
  industry?: string
  taskType?: string
  goalType?: string
  communityAction?: string
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
        notebookEntries: true,
        activities: true,
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

    // Helper functions for complex calculations
    const getFocusSessionsInTimeRange = (beforeHour?: number, afterHour?: number) => {
      return user.missions.filter(m => {
        if (m.status !== 'COMPLETED' || m.type !== 'FOCUS' || !m.startedAt) return false
        
        const startHour = m.startedAt.getHours()
        if (beforeHour && startHour >= beforeHour) return false
        if (afterHour && startHour <= afterHour) return false
        return true
      })
    }

    const getWeekendFocusSessions = () => {
      return user.missions.filter(m => {
        if (m.status !== 'COMPLETED' || m.type !== 'FOCUS' || !m.startedAt) return false
        const dayOfWeek = m.startedAt.getDay()
        return dayOfWeek === 0 || dayOfWeek === 6 // Sunday or Saturday
      })
    }

    const getDailyLearningResources = () => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      return user.learningProgress.filter(lp => {
        if (lp.status !== 'COMPLETED' || !lp.completedAt) return false
        return lp.completedAt >= today && lp.completedAt < tomorrow
      })
    }

    const getDailyJobApplications = () => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      return user.jobApplications.filter(app => {
        return app.appliedDate >= today && app.appliedDate < tomorrow
      })
    }

    const getJobApplicationStreak = () => {
      // This would require more complex logic to track consecutive days
      // For now, return a simple count of recent applications
      const recentApps = user.jobApplications.filter(app => {
        const appDate = new Date(app.appliedDate)
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        return appDate >= weekAgo
      })
      return recentApps.length
    }

    const getLearningStreakDays = () => {
      // This would require tracking daily learning activities
      // For now, return current streak from user data
      return user.currentStreak
    }

    const getLearningCategories = () => {
      const categories = new Set()
      user.learningProgress.forEach(lp => {
        if (lp.status === 'COMPLETED' && lp.resource) {
          categories.add(lp.resource.type)
        }
      })
      return categories.size
    }

    const getPomodoroSessions = () => {
      return user.missions.filter(m => 
        m.status === 'COMPLETED' && 
        m.type === 'FOCUS' && 
        m.duration && 
        m.duration === 25 // Standard Pomodoro duration
      ).length
    }

    const getLongFocusSessions = () => {
      return user.missions.filter(m => 
        m.status === 'COMPLETED' && 
        m.type === 'FOCUS' && 
        m.duration && 
        m.duration >= 60 // 1 hour or longer
      ).length
    }

    const getPerfectFocusSessions = () => {
      return user.missions.filter(m => 
        m.status === 'COMPLETED' && 
        m.type === 'FOCUS' && 
        m.duration && 
        m.elapsedTime && 
        m.duration === m.elapsedTime // Completed without interruption
      ).length
    }

    const getWeekendLearningResources = () => {
      return user.learningProgress.filter(lp => {
        if (lp.status !== 'COMPLETED' || !lp.completedAt) return false
        const dayOfWeek = lp.completedAt.getDay()
        return dayOfWeek === 0 || dayOfWeek === 6
      }).length
    }

    const getNotebookEntries = () => {
      return user.notebookEntries.length
    }

    const getResumeUpdates = () => {
      // This would require tracking resume update activities
      // For now, return 0 as placeholder
      return 0
    }

    const getCoverLetters = () => {
      // This would require tracking cover letter activities
      // For now, return 0 as placeholder
      return 0
    }

    const getJobPlatforms = () => {
      const platforms = new Set()
      user.jobApplications.forEach(app => {
        if (app.jobUrl) {
          // Extract platform from URL
          const url = new URL(app.jobUrl)
          platforms.add(url.hostname)
        }
      })
      return platforms.size
    }

    const getFollowUpMessages = () => {
      // This would require tracking follow-up activities
      // For now, return 0 as placeholder
      return 0
    }

    const getJobIndustries = () => {
      // This would require industry data in job applications
      // For now, return 0 as placeholder
      return 0
    }

    const getRemoteJobApplications = () => {
      // This would require location data in job applications
      // For now, return 0 as placeholder
      return 0
    }

    const getDailyTasks = () => {
      // This would require task tracking system
      // For now, return 0 as placeholder
      return 0
    }

    const getPersonalGoals = () => {
      // This would require goal tracking system
      // For now, return 0 as placeholder
      return 0
    }

    const getCompletedGoals = () => {
      // This would require goal tracking system
      // For now, return 0 as placeholder
      return 0
    }

    const getTimeTrackedHours = () => {
      const totalMinutes = user.missions
        .filter(m => m.status === 'COMPLETED' && m.elapsedTime)
        .reduce((sum, m) => sum + (m.elapsedTime || 0), 0)
      return Math.floor(totalMinutes / 60)
    }

    const getHighPriorityTasks = () => {
      // This would require priority tracking in missions
      // For now, return 0 as placeholder
      return 0
    }

    const getDeadlinesMet = () => {
      // This would require deadline tracking
      // For now, return 0 as placeholder
      return 0
    }

    const getWeeklyPlans = () => {
      // This would require planning system
      // For now, return 0 as placeholder
      return 0
    }

    const getHabitStreaks = () => {
      // This would require habit tracking system
      // For now, return current streak as approximation
      return user.currentStreak
    }

    const getTotalTasks = () => {
      return user.missions.length
    }

    const getTasksUnderTime = () => {
      return user.missions.filter(m => 
        m.status === 'COMPLETED' && 
        m.duration && 
        m.elapsedTime && 
        m.elapsedTime <= m.duration
      ).length
    }

    const getCommunityActions = (actionType: string) => {
      // This would require community/network tracking
      // For now, return 0 as placeholder
      return 0
    }

    const getProfessionalConnections = () => {
      // This would require network tracking
      // For now, return 0 as placeholder
      return 0
    }

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
            app.status === 'SCREENING' || app.status === 'INTERVIEW' || app.status === 'OFFER'
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

        // Focus Session Types
        case 'POMODORO_SESSIONS':
          const pomodoroSessions = getPomodoroSessions()
          shouldUnlock = pomodoroSessions >= (requirement.count || 1)
          break

        case 'LONG_FOCUS_SESSIONS':
          const longFocusSessions = getLongFocusSessions()
          shouldUnlock = longFocusSessions >= (requirement.count || 1)
          break

        case 'PERFECT_FOCUS_SESSIONS':
          const perfectSessions = getPerfectFocusSessions()
          shouldUnlock = perfectSessions >= (requirement.count || 1)
          break

        case 'EARLY_FOCUS_SESSIONS':
          const earlySessions = getFocusSessionsInTimeRange(undefined, requirement.beforeHour || 9)
          shouldUnlock = earlySessions.length >= (requirement.count || 1)
          break

        case 'LATE_FOCUS_SESSIONS':
          const lateSessions = getFocusSessionsInTimeRange(requirement.afterHour || 18, undefined)
          shouldUnlock = lateSessions.length >= (requirement.count || 1)
          break

        case 'WEEKEND_FOCUS_SESSIONS':
          const weekendSessions = getWeekendFocusSessions()
          shouldUnlock = weekendSessions.length >= (requirement.count || 1)
          break

        // Learning Types
        case 'LEARNING_CATEGORIES':
          const learningCategories = getLearningCategories()
          shouldUnlock = learningCategories >= (requirement.count || 1)
          break

        case 'LEARNING_STREAK_DAYS':
          const learningStreak = getLearningStreakDays()
          shouldUnlock = learningStreak >= (requirement.days || 1)
          break

        case 'DAILY_LEARNING_RESOURCES':
          const dailyLearning = getDailyLearningResources()
          shouldUnlock = dailyLearning.length >= (requirement.count || 1)
          break

        case 'WEEKEND_LEARNING_RESOURCES':
          const weekendLearning = getWeekendLearningResources()
          shouldUnlock = weekendLearning >= (requirement.count || 1)
          break

        // Job Application Types
        case 'JOB_CONTACTS':
          const jobContacts = getProfessionalConnections()
          shouldUnlock = jobContacts >= (requirement.count || 1)
          break

        case 'RESUME_UPDATES':
          const resumeUpdates = getResumeUpdates()
          shouldUnlock = resumeUpdates >= (requirement.count || 1)
          break

        case 'COVER_LETTERS':
          const coverLetters = getCoverLetters()
          shouldUnlock = coverLetters >= (requirement.count || 1)
          break

        case 'JOB_PLATFORMS':
          const jobPlatforms = getJobPlatforms()
          shouldUnlock = jobPlatforms >= (requirement.count || 1)
          break

        case 'DAILY_JOB_APPLICATIONS':
          const dailyJobApps = getDailyJobApplications()
          shouldUnlock = dailyJobApps.length >= (requirement.count || 1)
          break

        case 'FOLLOW_UP_MESSAGES':
          const followUps = getFollowUpMessages()
          shouldUnlock = followUps >= (requirement.count || 1)
          break

        case 'JOB_INDUSTRIES':
          const jobIndustries = getJobIndustries()
          shouldUnlock = jobIndustries >= (requirement.count || 1)
          break

        case 'REMOTE_JOB_APPLICATIONS':
          const remoteJobs = getRemoteJobApplications()
          shouldUnlock = remoteJobs >= (requirement.count || 1)
          break

        case 'JOB_APPLICATION_STREAK':
          const jobStreak = getJobApplicationStreak()
          shouldUnlock = jobStreak >= (requirement.count || 1)
          break

        // Task and Goal Types
        case 'DAILY_TASKS':
          const dailyTasks = getDailyTasks()
          shouldUnlock = dailyTasks >= (requirement.count || 1)
          break

        case 'PERSONAL_GOALS':
          const personalGoals = getPersonalGoals()
          shouldUnlock = personalGoals >= (requirement.count || 1)
          break

        case 'COMPLETED_GOALS':
          const completedGoals = getCompletedGoals()
          shouldUnlock = completedGoals >= (requirement.count || 1)
          break

        case 'TIME_TRACKED_HOURS':
          const timeTracked = getTimeTrackedHours()
          shouldUnlock = timeTracked >= (requirement.count || 1)
          break

        case 'HIGH_PRIORITY_TASKS':
          const highPriorityTasks = getHighPriorityTasks()
          shouldUnlock = highPriorityTasks >= (requirement.count || 1)
          break

        case 'DEADLINES_MET':
          const deadlinesMet = getDeadlinesMet()
          shouldUnlock = deadlinesMet >= (requirement.count || 1)
          break

        case 'WEEKLY_PLANS':
          const weeklyPlans = getWeeklyPlans()
          shouldUnlock = weeklyPlans >= (requirement.count || 1)
          break

        case 'HABIT_STREAKS':
          const habitStreaks = getHabitStreaks()
          shouldUnlock = habitStreaks >= (requirement.days || 1)
          break

        case 'TOTAL_TASKS':
          const totalTasks = getTotalTasks()
          shouldUnlock = totalTasks >= (requirement.count || 1)
          break

        case 'TASKS_UNDER_TIME':
          const tasksUnderTime = getTasksUnderTime()
          shouldUnlock = tasksUnderTime >= (requirement.count || 1)
          break

        // Community and Network Types
        case 'COMMUNITY_JOIN':
        case 'COMMUNITY_HELPS':
        case 'SHARED_RESOURCES':
        case 'ENCOURAGEMENT_MESSAGES':
        case 'STUDY_PARTNERSHIPS':
        case 'MENTORSHIP_SESSIONS':
        case 'COMMUNITY_EVENTS':
        case 'SUCCESS_STORY':
        case 'TOP_CONTRIBUTOR':
          const communityActions = getCommunityActions(requirement.type)
          shouldUnlock = communityActions >= (requirement.count || 1)
          break

        case 'PROFESSIONAL_CONNECTIONS':
          const connections = getProfessionalConnections()
          shouldUnlock = connections >= (requirement.count || 1)
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
        notebookEntries: true,
        activities: true,
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

    // Helper functions (same as above)
    const getFocusSessionsInTimeRange = (beforeHour?: number, afterHour?: number) => {
      return user.missions.filter(m => {
        if (m.status !== 'COMPLETED' || m.type !== 'FOCUS' || !m.startedAt) return false
        
        const startHour = m.startedAt.getHours()
        if (beforeHour && startHour >= beforeHour) return false
        if (afterHour && startHour <= afterHour) return false
        return true
      })
    }

    const getWeekendFocusSessions = () => {
      return user.missions.filter(m => {
        if (m.status !== 'COMPLETED' || m.type !== 'FOCUS' || !m.startedAt) return false
        const dayOfWeek = m.startedAt.getDay()
        return dayOfWeek === 0 || dayOfWeek === 6
      })
    }

    const getDailyLearningResources = () => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      return user.learningProgress.filter(lp => {
        if (lp.status !== 'COMPLETED' || !lp.completedAt) return false
        return lp.completedAt >= today && lp.completedAt < tomorrow
      })
    }

    const getDailyJobApplications = () => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      return user.jobApplications.filter(app => {
        return app.appliedDate >= today && app.appliedDate < tomorrow
      })
    }

    const getJobApplicationStreak = () => {
      const recentApps = user.jobApplications.filter(app => {
        const appDate = new Date(app.appliedDate)
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        return appDate >= weekAgo
      })
      return recentApps.length
    }

    const getLearningStreakDays = () => {
      return user.currentStreak
    }

    const getLearningCategories = () => {
      const categories = new Set()
      user.learningProgress.forEach(lp => {
        if (lp.status === 'COMPLETED' && lp.resource) {
          categories.add(lp.resource.type)
        }
      })
      return categories.size
    }

    const getPomodoroSessions = () => {
      return user.missions.filter(m => 
        m.status === 'COMPLETED' && 
        m.type === 'FOCUS' && 
        m.duration && 
        m.duration === 25
      ).length
    }

    const getLongFocusSessions = () => {
      return user.missions.filter(m => 
        m.status === 'COMPLETED' && 
        m.type === 'FOCUS' && 
        m.duration && 
        m.duration >= 60
      ).length
    }

    const getPerfectFocusSessions = () => {
      return user.missions.filter(m => 
        m.status === 'COMPLETED' && 
        m.type === 'FOCUS' && 
        m.duration && 
        m.elapsedTime && 
        m.duration === m.elapsedTime
      ).length
    }

    const getWeekendLearningResources = () => {
      return user.learningProgress.filter(lp => {
        if (lp.status !== 'COMPLETED' || !lp.completedAt) return false
        const dayOfWeek = lp.completedAt.getDay()
        return dayOfWeek === 0 || dayOfWeek === 6
      }).length
    }

    const getNotebookEntries = () => {
      return user.notebookEntries.length
    }

    const getJobPlatforms = () => {
      const platforms = new Set()
      user.jobApplications.forEach(app => {
        if (app.jobUrl) {
          const url = new URL(app.jobUrl)
          platforms.add(url.hostname)
        }
      })
      return platforms.size
    }

    const getTimeTrackedHours = () => {
      const totalMinutes = user.missions
        .filter(m => m.status === 'COMPLETED' && m.elapsedTime)
        .reduce((sum, m) => sum + (m.elapsedTime || 0), 0)
      return Math.floor(totalMinutes / 60)
    }

    const getTotalTasks = () => {
      return user.missions.length
    }

    const getTasksUnderTime = () => {
      return user.missions.filter(m => 
        m.status === 'COMPLETED' && 
        m.duration && 
        m.elapsedTime && 
        m.elapsedTime <= m.duration
      ).length
    }

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
              app.status === 'SCREENING' || app.status === 'INTERVIEW' || app.status === 'OFFER'
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

          // Focus Session Types
          case 'POMODORO_SESSIONS':
            const pomodoroSessions = getPomodoroSessions()
            progress = Math.min(pomodoroSessions, requirement.count || 1)
            maxProgress = requirement.count || 1
            break

          case 'LONG_FOCUS_SESSIONS':
            const longFocusSessions = getLongFocusSessions()
            progress = Math.min(longFocusSessions, requirement.count || 1)
            maxProgress = requirement.count || 1
            break

          case 'PERFECT_FOCUS_SESSIONS':
            const perfectSessions = getPerfectFocusSessions()
            progress = Math.min(perfectSessions, requirement.count || 1)
            maxProgress = requirement.count || 1
            break

          case 'EARLY_FOCUS_SESSIONS':
            const earlySessions = getFocusSessionsInTimeRange(undefined, requirement.beforeHour || 9)
            progress = Math.min(earlySessions.length, requirement.count || 1)
            maxProgress = requirement.count || 1
            break

          case 'LATE_FOCUS_SESSIONS':
            const lateSessions = getFocusSessionsInTimeRange(requirement.afterHour || 18, undefined)
            progress = Math.min(lateSessions.length, requirement.count || 1)
            maxProgress = requirement.count || 1
            break

          case 'WEEKEND_FOCUS_SESSIONS':
            const weekendSessions = getWeekendFocusSessions()
            progress = Math.min(weekendSessions.length, requirement.count || 1)
            maxProgress = requirement.count || 1
            break

          // Learning Types
          case 'LEARNING_CATEGORIES':
            const learningCategories = getLearningCategories()
            progress = Math.min(learningCategories, requirement.count || 1)
            maxProgress = requirement.count || 1
            break

          case 'LEARNING_STREAK_DAYS':
            const learningStreak = getLearningStreakDays()
            progress = Math.min(learningStreak, requirement.days || 1)
            maxProgress = requirement.days || 1
            break

          case 'DAILY_LEARNING_RESOURCES':
            const dailyLearning = getDailyLearningResources()
            progress = Math.min(dailyLearning.length, requirement.count || 1)
            maxProgress = requirement.count || 1
            break

          case 'WEEKEND_LEARNING_RESOURCES':
            const weekendLearning = getWeekendLearningResources()
            progress = Math.min(weekendLearning, requirement.count || 1)
            maxProgress = requirement.count || 1
            break

          // Job Application Types
          case 'JOB_CONTACTS':
          case 'RESUME_UPDATES':
          case 'COVER_LETTERS':
          case 'FOLLOW_UP_MESSAGES':
          case 'JOB_INDUSTRIES':
          case 'REMOTE_JOB_APPLICATIONS':
          case 'DAILY_TASKS':
          case 'PERSONAL_GOALS':
          case 'COMPLETED_GOALS':
          case 'HIGH_PRIORITY_TASKS':
          case 'DEADLINES_MET':
          case 'WEEKLY_PLANS':
          case 'HABIT_STREAKS':
          case 'COMMUNITY_JOIN':
          case 'COMMUNITY_HELPS':
          case 'SHARED_RESOURCES':
          case 'ENCOURAGEMENT_MESSAGES':
          case 'STUDY_PARTNERSHIPS':
          case 'MENTORSHIP_SESSIONS':
          case 'COMMUNITY_EVENTS':
          case 'SUCCESS_STORY':
          case 'TOP_CONTRIBUTOR':
          case 'PROFESSIONAL_CONNECTIONS':
            // Placeholder progress for unimplemented features
            progress = isUnlocked ? 1 : 0
            maxProgress = 1
            break

          case 'JOB_PLATFORMS':
            const jobPlatforms = getJobPlatforms()
            progress = Math.min(jobPlatforms, requirement.count || 1)
            maxProgress = requirement.count || 1
            break

          case 'DAILY_JOB_APPLICATIONS':
            const dailyJobApps = getDailyJobApplications()
            progress = Math.min(dailyJobApps.length, requirement.count || 1)
            maxProgress = requirement.count || 1
            break

          case 'JOB_APPLICATION_STREAK':
            const jobStreak = getJobApplicationStreak()
            progress = Math.min(jobStreak, requirement.count || 1)
            maxProgress = requirement.count || 1
            break

          case 'TIME_TRACKED_HOURS':
            const timeTracked = getTimeTrackedHours()
            progress = Math.min(timeTracked, requirement.count || 1)
            maxProgress = requirement.count || 1
            break

          case 'TOTAL_TASKS':
            const totalTasks = getTotalTasks()
            progress = Math.min(totalTasks, requirement.count || 1)
            maxProgress = requirement.count || 1
            break

          case 'TASKS_UNDER_TIME':
            const tasksUnderTime = getTasksUnderTime()
            progress = Math.min(tasksUnderTime, requirement.count || 1)
            maxProgress = requirement.count || 1
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
