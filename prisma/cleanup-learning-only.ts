import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanupLearningOnly() {
  console.log('🧹 Starting Learning Hub - Learning Data Only cleanup...')

  try {
    // 1. Delete all learning resources (these are seeded data)
    const deletedResources = await prisma.learningResource.deleteMany({})
    console.log(`✅ Deleted ${deletedResources.count} learning resources`)

    // 2. Delete all learning progress (this will be recreated as users interact)
    const deletedProgress = await prisma.learningProgress.deleteMany({})
    console.log(`✅ Deleted ${deletedProgress.count} learning progress records`)

    // 3. Delete all achievements (these are seeded data)
    const deletedAchievements = await prisma.achievement.deleteMany({})
    console.log(`✅ Deleted ${deletedAchievements.count} achievements`)

    // 4. Delete all user achievements (these will be recreated as users unlock them)
    const deletedUserAchievements = await prisma.userAchievement.deleteMany({})
    console.log(`✅ Deleted ${deletedUserAchievements.count} user achievements`)

    // 5. Delete all daily challenges (these are seeded data)
    const deletedChallenges = await prisma.dailyChallenge.deleteMany({})
    console.log(`✅ Deleted ${deletedChallenges.count} daily challenges`)

    // 6. Delete all daily challenge progress (this will be recreated as users participate)
    const deletedChallengeProgress = await prisma.dailyChallengeProgress.deleteMany({})
    console.log(`✅ Deleted ${deletedChallengeProgress.count} daily challenge progress records`)

    // 7. Reset user XP and achievements (but keep other progress)
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
    console.log(`✅ Reset ${updatedUsers.count} users' XP and streaks`)

    console.log('🎉 Learning Hub learning data cleanup completed successfully!')
    console.log('📝 Note: User accounts, missions, job applications, and notebook entries have been preserved.')
    console.log('🔄 Run "npm run seed" to re-seed the database with fresh learning resources and achievements.')

  } catch (error) {
    console.error('❌ Error during cleanup:', error)
    throw error
  }
}

cleanupLearningOnly()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
