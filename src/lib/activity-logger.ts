import { prisma } from './db'
import { ActivityType } from '@prisma/client'

interface ActivityData {
  userId: string
  type: ActivityType
  title: string
  description?: string
  metadata?: Record<string, any>
  xpEarned?: number
}

export async function logActivity(data: ActivityData) {
  try {
    const activity = await prisma.activity.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        description: data.description,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
        xpEarned: data.xpEarned || 0
      }
    })
    
    console.log(`Activity logged: ${data.type} - ${data.title} for user ${data.userId}`)
    return activity
  } catch (error) {
    console.error('Error logging activity:', error)
    throw error
  }
}

// Convenience functions for common activities
export async function logMissionStarted(userId: string, missionTitle: string, missionId: string) {
  return logActivity({
    userId,
    type: 'MISSION_STARTED',
    title: `Started mission: ${missionTitle}`,
    description: 'You began a new mission',
    metadata: { missionId }
  })
}

export async function logMissionCompleted(userId: string, missionTitle: string, missionId: string, xpEarned: number) {
  return logActivity({
    userId,
    type: 'MISSION_COMPLETED',
    title: `Completed mission: ${missionTitle}`,
    description: `Earned ${xpEarned} XP`,
    metadata: { missionId, xpEarned },
    xpEarned
  })
}

export async function logJobApplied(userId: string, role: string, company: string, jobId: string) {
  return logActivity({
    userId,
    type: 'JOB_APPLIED',
    title: `Applied to ${role} at ${company}`,
    description: 'You submitted a job application',
    metadata: { jobId, role, company }
  })
}

export async function logJobStatusUpdated(userId: string, role: string, company: string, oldStatus: string, newStatus: string, jobId: string) {
  return logActivity({
    userId,
    type: 'JOB_STATUS_UPDATED',
    title: `Updated ${role} at ${company}`,
    description: `Status changed from ${oldStatus} to ${newStatus}`,
    metadata: { jobId, role, company, oldStatus, newStatus }
  })
}

export async function logNotebookEntryCreated(userId: string, entryTitle: string, entryId: string) {
  return logActivity({
    userId,
    type: 'NOTEBOOK_ENTRY_CREATED',
    title: `Created journal entry: ${entryTitle}`,
    description: 'You added a new journal entry',
    metadata: { entryId, title: entryTitle }
  })
}

export async function logNotebookEntryUpdated(userId: string, entryTitle: string, entryId: string) {
  return logActivity({
    userId,
    type: 'NOTEBOOK_ENTRY_UPDATED',
    title: `Updated journal entry: ${entryTitle}`,
    description: 'You updated a journal entry',
    metadata: { entryId, title: entryTitle }
  })
}

export async function logLearningStarted(userId: string, resourceTitle: string, resourceId: string) {
  return logActivity({
    userId,
    type: 'LEARNING_STARTED',
    title: `Started learning: ${resourceTitle}`,
    description: 'You began a new learning resource',
    metadata: { resourceId, title: resourceTitle }
  })
}

export async function logLearningCompleted(userId: string, resourceTitle: string, resourceId: string, timeSpent: number) {
  return logActivity({
    userId,
    type: 'LEARNING_COMPLETED',
    title: `Completed learning: ${resourceTitle}`,
    description: `Spent ${timeSpent} minutes learning`,
    metadata: { resourceId, title: resourceTitle, timeSpent }
  })
}

export async function logLearningProgressUpdated(userId: string, resourceTitle: string, resourceId: string, progress: number) {
  return logActivity({
    userId,
    type: 'LEARNING_PROGRESS_UPDATED',
    title: `Updated progress: ${resourceTitle}`,
    description: `Progress: ${progress}%`,
    metadata: { resourceId, title: resourceTitle, progress }
  })
}

export async function logAchievementUnlocked(userId: string, achievementName: string, achievementId: string, xpEarned: number) {
  return logActivity({
    userId,
    type: 'ACHIEVEMENT_UNLOCKED',
    title: `Unlocked achievement: ${achievementName}`,
    description: `Earned ${xpEarned} XP`,
    metadata: { achievementId, name: achievementName },
    xpEarned
  })
}

export async function logDailyChallengeCompleted(userId: string, challengeTitle: string, challengeId: string, xpEarned: number) {
  return logActivity({
    userId,
    type: 'DAILY_CHALLENGE_COMPLETED',
    title: `Completed daily challenge: ${challengeTitle}`,
    description: `Earned ${xpEarned} XP`,
    metadata: { challengeId, title: challengeTitle },
    xpEarned
  })
}

export async function logStreakMilestone(userId: string, streakDays: number) {
  return logActivity({
    userId,
    type: 'STREAK_MILESTONE',
    title: `Reached ${streakDays} day streak!`,
    description: 'You maintained your activity streak',
    metadata: { streakDays }
  })
}

export async function logXpEarned(userId: string, amount: number, source: string) {
  return logActivity({
    userId,
    type: 'XP_EARNED',
    title: `Earned ${amount} XP`,
    description: `From: ${source}`,
    metadata: { amount, source },
    xpEarned: amount
  })
}

export async function logLevelUp(userId: string, newLevel: number) {
  return logActivity({
    userId,
    type: 'LEVEL_UP',
    title: `Level up! You're now level ${newLevel}`,
    description: 'Congratulations on reaching a new level!',
    metadata: { newLevel }
  })
}
