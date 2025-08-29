import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanupLearningOnly() {
  try {
    // 1. Delete all learning resources (these are seeded data)
    const deletedResources = await prisma.learningResource.deleteMany({})

    // 2. Delete all learning progress (this will be recreated as users interact)
    const deletedProgress = await prisma.learningProgress.deleteMany({})

    // 3. Delete all achievements (these are seeded data)
    const deletedAchievements = await prisma.achievement.deleteMany({})

    // 4. Delete all user achievements (these will be recreated as users unlock them)
    const deletedUserAchievements = await prisma.userAchievement.deleteMany({})

    // 5. Delete all daily challenges (these are seeded data)
    const deletedChallenges = await prisma.dailyChallenge.deleteMany({})

    // 6. Delete all daily challenge progress (this will be recreated as users participate)
    const deletedChallengeProgress = await prisma.dailyChallengeProgress.deleteMany({})

    // 7. Delete all activities (these are generated from all user actions)
    const deletedActivities = await prisma.activity.deleteMany({})

    // 8. Reset user XP and achievements (but keep other progress)
    const updatedUsers = await prisma.user.updateMany({
      data: {
        xp: 0,
        level: 1,
        totalXp: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: null
      }
    })

  } catch (error) {
    throw error
  }
}

cleanupLearningOnly()
  .catch((e) => {
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
