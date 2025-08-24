import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanup() {
  console.log('🧹 Starting Learning Hub data cleanup...')

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

    // 7. Delete all missions (these are user-generated, but we'll clean them too)
    const deletedMissions = await prisma.mission.deleteMany({})
    console.log(`✅ Deleted ${deletedMissions.count} missions`)

    // 8. Delete all job applications (user-generated, but cleaning for fresh start)
    const deletedJobApplications = await prisma.jobApplication.deleteMany({})
    console.log(`✅ Deleted ${deletedJobApplications.count} job applications`)

    // 9. Delete all notebook entries (user-generated, but cleaning for fresh start)
    const deletedNotebookEntries = await prisma.notebookEntry.deleteMany({})
    console.log(`✅ Deleted ${deletedNotebookEntries.count} notebook entries`)

    // 10. Delete all notifications (these are generated automatically)
    const deletedNotifications = await prisma.notification.deleteMany({})
    console.log(`✅ Deleted ${deletedNotifications.count} notifications`)

    // 11. Reset all users to default state (keep users but reset their progress)
    const updatedUsers = await prisma.user.updateMany({
      data: {
        xp: 0,
        level: 1,
        totalXp: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: null,
        theme: 'light',
        notifications: true,
        focusSettings: null
      }
    })
    console.log(`✅ Reset ${updatedUsers.count} users to default state`)

    console.log('🎉 Learning Hub cleanup completed successfully!')
    console.log('📝 Note: User accounts have been preserved but all progress has been reset.')
    console.log('📚 Learning resources and achievements have been removed and will not be automatically re-seeded.')

  } catch (error) {
    console.error('❌ Error during cleanup:', error)
    throw error
  }
}

cleanup()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
