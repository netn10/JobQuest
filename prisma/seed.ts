import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Mock user removed - users should register normally

  // Sample missions removed - will be created when users register

  // Check if achievements already exist
  const existingAchievements = await prisma.achievement.count()
  
  if (existingAchievements === 0) {
    // Create 20 comprehensive achievements shared between all users
    const achievements = await prisma.achievement.createMany({
    data: [
      // 🎯 FOCUS ACHIEVEMENTS (5 achievements)
      {
        name: 'First Steps',
        description: 'Complete your first focus mission',
        icon: 'Target',
        category: 'FOCUS',
        requirement: JSON.stringify({ type: 'MISSIONS_COMPLETED', count: 1, missionType: 'FOCUS' }),
        xpReward: 50
      },
      {
        name: 'Deep Focus',
        description: 'Complete a 2-hour uninterrupted focus session',
        icon: 'Clock',
        category: 'FOCUS',
        requirement: JSON.stringify({ type: 'FOCUS_SESSION_DURATION', minutes: 120 }),
        xpReward: 300
      },
      {
        name: 'Focus Warrior',
        description: 'Complete 10 focus missions',
        icon: 'Target',
        category: 'FOCUS',
        requirement: JSON.stringify({ type: 'MISSIONS_COMPLETED', count: 10, missionType: 'FOCUS' }),
        xpReward: 200
      },
      {
        name: 'Marathon Runner',
        description: 'Complete a 4-hour focus session',
        icon: 'Timer',
        category: 'FOCUS',
        requirement: JSON.stringify({ type: 'FOCUS_SESSION_DURATION', minutes: 240 }),
        xpReward: 500
      },
      {
        name: 'Focus Master',
        description: 'Complete 50 focus missions',
        icon: 'Crown',
        category: 'FOCUS',
        requirement: JSON.stringify({ type: 'MISSIONS_COMPLETED', count: 50, missionType: 'FOCUS' }),
        xpReward: 750
      },
      
      // 📈 STREAK ACHIEVEMENTS (4 achievements)
      {
        name: 'Streak Starter',
        description: 'Maintain a 3-day activity streak',
        icon: 'TrendingUp',
        category: 'STREAK',
        requirement: JSON.stringify({ type: 'STREAK_DAYS', days: 3 }),
        xpReward: 75
      },
      {
        name: 'Streak Keeper',
        description: 'Maintain a 7-day activity streak',
        icon: 'TrendingUp',
        category: 'STREAK',
        requirement: JSON.stringify({ type: 'STREAK_DAYS', days: 7 }),
        xpReward: 150
      },
      {
        name: 'Streak Master',
        description: 'Maintain a 30-day activity streak',
        icon: 'TrendingUp',
        category: 'STREAK',
        requirement: JSON.stringify({ type: 'STREAK_DAYS', days: 30 }),
        xpReward: 500
      },
      {
        name: 'Streak Legend',
        description: 'Maintain a 100-day activity streak',
        icon: 'TrendingUp',
        category: 'STREAK',
        requirement: JSON.stringify({ type: 'STREAK_DAYS', days: 100 }),
        xpReward: 1000
      },
      
      // 📚 LEARNING ACHIEVEMENTS (4 achievements)
      {
        name: 'Knowledge Seeker',
        description: 'Complete 10 learning resources',
        icon: 'BookOpen',
        category: 'LEARNING',
        requirement: JSON.stringify({ type: 'LEARNING_RESOURCES', count: 10 }),
        xpReward: 200
      },
      {
        name: 'Lifelong Learner',
        description: 'Complete 50 learning resources',
        icon: 'BookOpen',
        category: 'LEARNING',
        requirement: JSON.stringify({ type: 'LEARNING_RESOURCES', count: 50 }),
        xpReward: 750
      },
      {
        name: 'Learning Expert',
        description: 'Complete 100 learning resources',
        icon: 'GraduationCap',
        category: 'LEARNING',
        requirement: JSON.stringify({ type: 'LEARNING_RESOURCES', count: 100 }),
        xpReward: 1500
      },
      {
        name: 'Speed Learner',
        description: 'Complete 5 learning resources in a single day',
        icon: 'Zap',
        category: 'LEARNING',
        requirement: JSON.stringify({ type: 'LEARNING_RESOURCES_DAILY', count: 5 }),
        xpReward: 300
      },
      
      // 💼 JOB SEARCH ACHIEVEMENTS (4 achievements)
      {
        name: 'Job Hunter',
        description: 'Apply to 10 job positions',
        icon: 'BriefcaseIcon',
        category: 'JOB_SEARCH',
        requirement: JSON.stringify({ type: 'JOB_APPLICATIONS', count: 10 }),
        xpReward: 150
      },
      {
        name: 'Application Master',
        description: 'Apply to 50 job positions',
        icon: 'BriefcaseIcon',
        category: 'JOB_SEARCH',
        requirement: JSON.stringify({ type: 'JOB_APPLICATIONS', count: 50 }),
        xpReward: 400
      },
      {
        name: 'Interview Ready',
        description: 'Get 5 job applications to screening stage',
        icon: 'BriefcaseIcon',
        category: 'JOB_SEARCH',
        requirement: JSON.stringify({ type: 'JOB_APPLICATIONS_SCREENING', count: 5 }),
        xpReward: 300
      },
      {
        name: 'Career Champion',
        description: 'Get 10 job applications to interview stage',
        icon: 'Trophy',
        category: 'JOB_SEARCH',
        requirement: JSON.stringify({ type: 'JOB_APPLICATIONS_INTERVIEW', count: 10 }),
        xpReward: 600
      },
      
      // ⚡ XP ACHIEVEMENTS (3 achievements)
      {
        name: 'XP Collector',
        description: 'Earn 1,000 total XP',
        icon: 'Zap',
        category: 'XP',
        requirement: JSON.stringify({ type: 'TOTAL_XP', xp: 1000 }),
        xpReward: 100
      },
      {
        name: 'XP Master',
        description: 'Earn 5,000 total XP',
        icon: 'Zap',
        category: 'XP',
        requirement: JSON.stringify({ type: 'TOTAL_XP', xp: 5000 }),
        xpReward: 500
      },
      {
        name: 'XP Legend',
        description: 'Earn 10,000 total XP',
        icon: 'Zap',
        category: 'XP',
        requirement: JSON.stringify({ type: 'TOTAL_XP', xp: 10000 }),
        xpReward: 1000
      }
    ]
  })

      console.log('Created achievements:', achievements)
    } else {
      console.log('Achievements already exist, skipping...')
    }

    // User achievements will be created when users unlock them

  // Sample job applications removed - will be created by users

  // Create today's daily challenge
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const dailyChallenge = await prisma.dailyChallenge.upsert({
    where: { date: today },
    update: {},
    create: {
      title: 'Focus Master',
      description: 'Complete 3 focus sessions without breaks',
      type: 'FOCUS',
      requirement: JSON.stringify({ type: 'focus_sessions', count: 3, consecutive: true }),
      xpReward: 50,
      date: today
    }
  })

  console.log('Created daily challenge:', dailyChallenge)

  // Learning resources are no longer automatically created
  // Users can add their own resources through the Learning Hub interface
  console.log('📚 Learning resources are not automatically created. Users can add their own resources.')

    // Daily challenge progress will be created when users participate
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })