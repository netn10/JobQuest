import { prisma } from './db'
import { ActivityType } from '@prisma/client'
import { updateDailyChallengeProgress } from './daily-challenges'
import { serverKafka } from './kafka-server'

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
    return await prisma.activity.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        description: data.description,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
        xpEarned: data.xpEarned !== undefined ? data.xpEarned : undefined
      }
    })
  } catch (error) {
    throw error
  }
}

// Convenience functions for common activities
export async function logMissionStarted(userId: string, missionTitle: string, missionId: string) {
  const activity = await logActivity({
    userId,
    type: 'MISSION_STARTED',
    title: `Started mission: ${missionTitle}`,
    description: 'You began a new mission',
    metadata: { missionId }
  })

  // Publish to Kafka
  try {
    await serverKafka.publishMissionStarted(userId, missionId, missionTitle, 'FOCUS')
  } catch (error) {
    console.error('Failed to publish mission started event to Kafka:', error)
  }

  return activity
}

export async function logMissionCompleted(userId: string, missionTitle: string, missionId: string, xpEarned: number) {
  const activity = await logActivity({
    userId,
    type: 'MISSION_COMPLETED',
    title: `Completed mission: ${missionTitle}`,
    description: `Earned ${xpEarned} XP`,
    metadata: { missionId, xpEarned },
    xpEarned: xpEarned >= 0 ? xpEarned : undefined
  })
  
  // Publish to Kafka
  try {
    await serverKafka.publishMissionCompleted(userId, missionId, missionTitle, 'FOCUS', 0, xpEarned)
  } catch (error) {
    console.error('Failed to publish mission completed event to Kafka:', error)
  }

  // Update daily challenge progress
  let challengeCompleted = null
  try {
    const challengeResult = await updateDailyChallengeProgress(userId)
    if (challengeResult && !Array.isArray(challengeResult) && challengeResult.newlyCompleted) {
      challengeCompleted = challengeResult.newlyCompleted
      
      // Store completion info in activity metadata for client retrieval
      activity.metadata = JSON.stringify({
        ...(activity.metadata ? JSON.parse(activity.metadata as string) : {}),
        challengeCompleted: challengeResult.newlyCompleted
      })
      
      await prisma.activity.update({
        where: { id: activity.id },
        data: { metadata: activity.metadata }
      })

      // Publish daily challenge completion to Kafka
      try {
        await serverKafka.publishDailyChallengeCompleted(
          userId, 
          challengeResult.newlyCompleted.id, 
          challengeResult.newlyCompleted.title, 
          challengeResult.newlyCompleted.description, 
          challengeResult.newlyCompleted.xpReward
        )
      } catch (error) {
        console.error('Failed to publish daily challenge completed event to Kafka:', error)
      }
    }
  } catch (error) {
    console.error('Error updating daily challenge progress after mission completion:', error)
  }
  
  return { activity, challengeCompleted }
}

export async function logJobApplied(userId: string, role: string, company: string, jobId: string) {
  const activity = await logActivity({
    userId,
    type: 'JOB_APPLIED',
    title: `Applied to ${role} at ${company}`,
    description: 'You submitted a job application',
    metadata: { jobId, role, company }
  })

  // Publish to Kafka
  try {
    await serverKafka.publishJobApplied(userId, jobId, company, role)
  } catch (error) {
    console.error('Failed to publish job applied event to Kafka:', error)
  }
  
  // Update daily challenge progress
  let challengeCompleted = null
  try {
    console.log('Updating daily challenge progress for job application by user:', userId)
    const challengeResult = await updateDailyChallengeProgress(userId)
    console.log('Daily challenge update result:', challengeResult)
    if (challengeResult && !Array.isArray(challengeResult) && challengeResult.newlyCompleted) {
      challengeCompleted = challengeResult.newlyCompleted
      console.log('Challenge newly completed:', challengeCompleted)
      
      // Store completion info in activity metadata for client retrieval
      activity.metadata = JSON.stringify({
        ...(activity.metadata ? JSON.parse(activity.metadata as string) : {}),
        challengeCompleted: challengeResult.newlyCompleted
      })
      
      await prisma.activity.update({
        where: { id: activity.id },
        data: { metadata: activity.metadata }
      })

      // Publish daily challenge completion to Kafka
      try {
        await serverKafka.publishDailyChallengeCompleted(
          userId, 
          challengeResult.newlyCompleted.id, 
          challengeResult.newlyCompleted.title, 
          challengeResult.newlyCompleted.description, 
          challengeResult.newlyCompleted.xpReward
        )
      } catch (error) {
        console.error('Failed to publish daily challenge completed event to Kafka:', error)
      }
    }
  } catch (error) {
    console.error('Error updating daily challenge progress after job application:', error)
  }
  
  return { activity, challengeCompleted }
}

export async function logJobStatusUpdated(userId: string, role: string, company: string, oldStatus: string, newStatus: string, jobId: string) {
  const activity = await logActivity({
    userId,
    type: 'JOB_STATUS_UPDATED',
    title: `Updated ${role} at ${company}`,
    description: `Status changed from ${oldStatus} to ${newStatus}`,
    metadata: { jobId, role, company, oldStatus, newStatus }
  })

  // Publish to Kafka
  try {
    await serverKafka.publishJobStatusUpdated(userId, jobId, company, role, newStatus, oldStatus)
  } catch (error) {
    console.error('Failed to publish job status updated event to Kafka:', error)
  }

  return activity
}

export async function logNotebookEntryCreated(userId: string, entryTitle: string, entryId: string) {
  const activity = await logActivity({
    userId,
    type: 'NOTEBOOK_ENTRY_CREATED',
    title: `Created journal entry: ${entryTitle}`,
    description: 'You added a new journal entry',
    metadata: { entryId, title: entryTitle }
  })
  
  // Update daily challenge progress
  let challengeCompleted = null
  try {
    const challengeResult = await updateDailyChallengeProgress(userId)
    if (challengeResult && !Array.isArray(challengeResult) && challengeResult.newlyCompleted) {
      challengeCompleted = challengeResult.newlyCompleted
      
      // Store completion info in activity metadata for client retrieval
      activity.metadata = JSON.stringify({
        ...(activity.metadata ? JSON.parse(activity.metadata as string) : {}),
        challengeCompleted: challengeResult.newlyCompleted
      })
      
      await prisma.activity.update({
        where: { id: activity.id },
        data: { metadata: activity.metadata }
      })
    }
  } catch (error) {
    console.error('Error updating daily challenge progress after notebook entry creation:', error)
  }
  
  return { activity, challengeCompleted }
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

export async function logLearningCompleted(userId: string, resourceTitle: string, resourceId: string, timeSpent: number, xpEarned?: number) {
  const activity = await logActivity({
    userId,
    type: 'LEARNING_COMPLETED',
    title: `Completed learning: ${resourceTitle}`,
    description: xpEarned && xpEarned > 0 ? `Spent ${timeSpent} minutes learning and earned ${xpEarned} XP` : `Spent ${timeSpent} minutes learning`,
    metadata: { resourceId, title: resourceTitle, timeSpent },
    xpEarned: xpEarned !== undefined ? xpEarned : undefined
  })
  
  // Update daily challenge progress
  let challengeCompleted = null
  try {
    const challengeResult = await updateDailyChallengeProgress(userId)
    if (challengeResult && !Array.isArray(challengeResult) && challengeResult.newlyCompleted) {
      challengeCompleted = challengeResult.newlyCompleted
      
      // Store completion info in activity metadata for client retrieval
      activity.metadata = JSON.stringify({
        ...(activity.metadata ? JSON.parse(activity.metadata as string) : {}),
        challengeCompleted: challengeResult.newlyCompleted
      })
      
      await prisma.activity.update({
        where: { id: activity.id },
        data: { metadata: activity.metadata }
      })
    }
  } catch (error) {
    console.error('Error updating daily challenge progress after learning completion:', error)
  }
  
  return { activity, challengeCompleted }
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
  const activity = await logActivity({
    userId,
    type: 'ACHIEVEMENT_UNLOCKED',
    title: `Unlocked achievement: ${achievementName}`,
    description: `Earned ${xpEarned} XP`,
    metadata: { achievementId, name: achievementName },
    xpEarned: xpEarned >= 0 ? xpEarned : undefined
  })

  // Publish to Kafka
  try {
    await serverKafka.publishAchievementUnlocked(userId, achievementId, achievementName, xpEarned)
  } catch (error) {
    console.error('Failed to publish achievement unlocked event to Kafka:', error)
  }

  return activity
}

export async function logDailyChallengeCompleted(userId: string, challengeTitle: string, challengeId: string, xpEarned: number) {
  return logActivity({
    userId,
    type: 'DAILY_CHALLENGE_COMPLETED',
    title: `Completed daily challenge: ${challengeTitle}`,
    description: `Earned ${xpEarned} XP`,
    metadata: { challengeId, title: challengeTitle },
    xpEarned: xpEarned >= 0 ? xpEarned : undefined
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
    xpEarned: amount >= 0 ? amount : undefined
  })
}

export async function logLevelUp(userId: string, newLevel: number) {
  const activity = await logActivity({
    userId,
    type: 'LEVEL_UP',
    title: `Level up! You're now level ${newLevel}`,
    description: 'Congratulations on reaching a new level!',
    metadata: { newLevel }
  })

  // Publish to Kafka
  try {
    await serverKafka.publishLevelUp(userId, newLevel, 0) // totalXp would need to be passed in
  } catch (error) {
    console.error('Failed to publish level up event to Kafka:', error)
  }

  return activity
}
