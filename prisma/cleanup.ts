import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanup() {
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

    // 7. Delete all missions (these are user-generated, but we'll clean them too)
    const deletedMissions = await prisma.mission.deleteMany({})

    // 8. Delete all job applications (user-generated, but cleaning for fresh start)
    const deletedJobApplications = await prisma.jobApplication.deleteMany({})

    // 9. Delete all notebook entries (user-generated, but cleaning for fresh start)
    const deletedNotebookEntries = await prisma.notebookEntry.deleteMany({})

    // 10. Delete all notifications (these are generated automatically)
    const deletedNotifications = await prisma.notification.deleteMany({})

    // 11. Delete all activities (these are generated automatically)
    const deletedActivities = await prisma.activity.deleteMany({})

    // 12. Reset all users to default state (keep users but reset their progress)
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
        focusSettings: {}
      }
    })

  } catch (error) {
    throw error
  }
}

cleanup()
  .catch((e) => {
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
