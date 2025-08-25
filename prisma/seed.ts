import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Mock user removed - users should register normally

  // Sample missions removed - will be created when users register

  // Check if achievements already exist
  const existingAchievements = await prisma.achievement.count()
  
  if (existingAchievements === 0) {
    // Achievements will be created for new users
    const achievements = await prisma.achievement.createMany({
    data: [
      // Focus Achievements (15 total)
      {
        name: 'First Steps',
        description: 'Complete your first focus mission',
        icon: 'Target',
        category: 'FOCUS',
        requirement: JSON.stringify({ type: 'MISSIONS_COMPLETED', count: 1, missionType: 'FOCUS' }),
        xpReward: 50
      },
      {
        name: 'Getting Started',
        description: 'Complete 5 focus missions',
        icon: 'Target',
        category: 'FOCUS',
        requirement: JSON.stringify({ type: 'MISSIONS_COMPLETED', count: 5, missionType: 'FOCUS' }),
        xpReward: 100
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
        name: 'Focus Veteran',
        description: 'Complete 25 focus missions',
        icon: 'Target',
        category: 'FOCUS',
        requirement: JSON.stringify({ type: 'MISSIONS_COMPLETED', count: 25, missionType: 'FOCUS' }),
        xpReward: 350
      },
      {
        name: 'Focus Champion',
        description: 'Complete 50 focus missions',
        icon: 'Crown',
        category: 'FOCUS',
        requirement: JSON.stringify({ type: 'MISSIONS_COMPLETED', count: 50, missionType: 'FOCUS' }),
        xpReward: 600
      },
      {
        name: 'Century Club',
        description: 'Complete 100 missions',
        icon: 'Crown',
        category: 'FOCUS',
        requirement: JSON.stringify({ type: 'MISSIONS_COMPLETED', count: 100 }),
        xpReward: 1000
      },
      {
        name: 'Quick Focus',
        description: 'Complete a 30-minute focus session',
        icon: 'Clock',
        category: 'FOCUS',
        requirement: JSON.stringify({ type: 'FOCUS_SESSION_DURATION', minutes: 30 }),
        xpReward: 75
      },
      {
        name: 'Hour of Power',
        description: 'Complete a 1-hour uninterrupted focus session',
        icon: 'Clock',
        category: 'FOCUS',
        requirement: JSON.stringify({ type: 'FOCUS_SESSION_DURATION', minutes: 60 }),
        xpReward: 150
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
        name: 'Marathon Focus',
        description: 'Complete a 4-hour focus session',
        icon: 'Clock',
        category: 'FOCUS',
        requirement: JSON.stringify({ type: 'FOCUS_SESSION_DURATION', minutes: 240 }),
        xpReward: 500
      },
      {
        name: 'Focus Monk',
        description: 'Complete a 6-hour focus session',
        icon: 'Clock',
        category: 'FOCUS',
        requirement: JSON.stringify({ type: 'FOCUS_SESSION_DURATION', minutes: 360 }),
        xpReward: 750
      },
      {
        name: 'Morning Person',
        description: 'Complete 10 focus sessions before 9 AM',
        icon: 'Sun',
        category: 'FOCUS',
        requirement: JSON.stringify({ type: 'EARLY_FOCUS_SESSIONS', count: 10, beforeHour: 9 }),
        xpReward: 200
      },
      {
        name: 'Night Owl',
        description: 'Complete 10 focus sessions after 8 PM',
        icon: 'Moon',
        category: 'FOCUS',
        requirement: JSON.stringify({ type: 'LATE_FOCUS_SESSIONS', count: 10, afterHour: 20 }),
        xpReward: 200
      },
      {
        name: 'Weekend Warrior',
        description: 'Complete 20 focus sessions on weekends',
        icon: 'Calendar',
        category: 'FOCUS',
        requirement: JSON.stringify({ type: 'WEEKEND_FOCUS_SESSIONS', count: 20 }),
        xpReward: 250
      },
      {
        name: 'Focus Master',
        description: 'Complete 200 focus missions',
        icon: 'Crown',
        category: 'FOCUS',
        requirement: JSON.stringify({ type: 'MISSIONS_COMPLETED', count: 200, missionType: 'FOCUS' }),
        xpReward: 1500
      },

      // Learning Achievements (10 total)
      {
        name: 'First Lesson',
        description: 'Complete your first learning resource',
        icon: 'BookOpen',
        category: 'LEARNING',
        requirement: JSON.stringify({ type: 'LEARNING_RESOURCES', count: 1 }),
        xpReward: 25
      },
      {
        name: 'Quick Learner',
        description: 'Complete 5 learning resources',
        icon: 'BookOpen',
        category: 'LEARNING',
        requirement: JSON.stringify({ type: 'LEARNING_RESOURCES', count: 5 }),
        xpReward: 100
      },
      {
        name: 'Knowledge Seeker',
        description: 'Complete 10 learning resources',
        icon: 'BookOpen',
        category: 'LEARNING',
        requirement: JSON.stringify({ type: 'LEARNING_RESOURCES', count: 10 }),
        xpReward: 200
      },
      {
        name: 'Study Buddy',
        description: 'Complete 25 learning resources',
        icon: 'Users',
        category: 'LEARNING',
        requirement: JSON.stringify({ type: 'LEARNING_RESOURCES', count: 25 }),
        xpReward: 400
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
        name: 'Knowledge Expert',
        description: 'Complete 100 learning resources',
        icon: 'GraduationCap',
        category: 'LEARNING',
        requirement: JSON.stringify({ type: 'LEARNING_RESOURCES', count: 100 }),
        xpReward: 1200
      },
      {
        name: 'Speed Reader',
        description: 'Complete 10 learning resources in a single day',
        icon: 'Zap',
        category: 'LEARNING',
        requirement: JSON.stringify({ type: 'DAILY_LEARNING_RESOURCES', count: 10 }),
        xpReward: 300
      },
      {
        name: 'Video Scholar',
        description: 'Complete 20 video learning resources',
        icon: 'Play',
        category: 'LEARNING',
        requirement: JSON.stringify({ type: 'LEARNING_RESOURCES_BY_TYPE', count: 20, resourceType: 'VIDEO' }),
        xpReward: 250
      },
      {
        name: 'Article Enthusiast',
        description: 'Complete 30 article learning resources',
        icon: 'FileText',
        category: 'LEARNING',
        requirement: JSON.stringify({ type: 'LEARNING_RESOURCES_BY_TYPE', count: 30, resourceType: 'ARTICLE' }),
        xpReward: 300
      },
      {
        name: 'Course Completer',
        description: 'Complete 10 course learning resources',
        icon: 'Award',
        category: 'LEARNING',
        requirement: JSON.stringify({ type: 'LEARNING_RESOURCES_BY_TYPE', count: 10, resourceType: 'COURSE' }),
        xpReward: 500
      },

      // Job Search Achievements (10 total)
      {
        name: 'First Application',
        description: 'Submit your first job application',
        icon: 'Send',
        category: 'JOB_SEARCH',
        requirement: JSON.stringify({ type: 'JOB_APPLICATIONS', count: 1 }),
        xpReward: 50
      },
      {
        name: 'Getting Out There',
        description: 'Apply to 5 job positions',
        icon: 'BriefcaseIcon',
        category: 'JOB_SEARCH',
        requirement: JSON.stringify({ type: 'JOB_APPLICATIONS', count: 5 }),
        xpReward: 100
      },
      {
        name: 'Job Hunter',
        description: 'Apply to 10 job positions',
        icon: 'BriefcaseIcon',
        category: 'JOB_SEARCH',
        requirement: JSON.stringify({ type: 'JOB_APPLICATIONS', count: 10 }),
        xpReward: 150
      },
      {
        name: 'Active Searcher',
        description: 'Apply to 25 job positions',
        icon: 'Search',
        category: 'JOB_SEARCH',
        requirement: JSON.stringify({ type: 'JOB_APPLICATIONS', count: 25 }),
        xpReward: 300
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
        name: 'Persistent Applicant',
        description: 'Apply to 100 job positions',
        icon: 'Target',
        category: 'JOB_SEARCH',
        requirement: JSON.stringify({ type: 'JOB_APPLICATIONS', count: 100 }),
        xpReward: 800
      },
      {
        name: 'Interview Ready',
        description: 'Get 5 job applications to screening stage',
        icon: 'Phone',
        category: 'JOB_SEARCH',
        requirement: JSON.stringify({ type: 'JOB_APPLICATIONS_SCREENING', count: 5 }),
        xpReward: 300
      },
      {
        name: 'Interview Pro',
        description: 'Get 15 job applications to screening stage',
        icon: 'Phone',
        category: 'JOB_SEARCH',
        requirement: JSON.stringify({ type: 'JOB_APPLICATIONS_SCREENING', count: 15 }),
        xpReward: 600
      },
      {
        name: 'Daily Applier',
        description: 'Apply to 5 jobs in a single day',
        icon: 'Calendar',
        category: 'JOB_SEARCH',
        requirement: JSON.stringify({ type: 'DAILY_JOB_APPLICATIONS', count: 5 }),
        xpReward: 200
      },
      {
        name: 'Application Streak',
        description: 'Apply to at least 1 job for 7 consecutive days',
        icon: 'TrendingUp',
        category: 'JOB_SEARCH',
        requirement: JSON.stringify({ type: 'JOB_APPLICATION_STREAK', days: 7 }),
        xpReward: 350
      },

      // Streak Achievements (8 total)
      {
        name: 'First Day',
        description: 'Start your activity streak',
        icon: 'Play',
        category: 'STREAK',
        requirement: JSON.stringify({ type: 'STREAK_DAYS', days: 1 }),
        xpReward: 25
      },
      {
        name: 'Streak Starter',
        description: 'Maintain a 3-day activity streak',
        icon: 'TrendingUp',
        category: 'STREAK',
        requirement: JSON.stringify({ type: 'STREAK_DAYS', days: 3 }),
        xpReward: 75
      },
      {
        name: 'One Week Strong',
        description: 'Maintain a 7-day activity streak',
        icon: 'TrendingUp',
        category: 'STREAK',
        requirement: JSON.stringify({ type: 'STREAK_DAYS', days: 7 }),
        xpReward: 150
      },
      {
        name: 'Two Weeks',
        description: 'Maintain a 14-day activity streak',
        icon: 'Calendar',
        category: 'STREAK',
        requirement: JSON.stringify({ type: 'STREAK_DAYS', days: 14 }),
        xpReward: 250
      },
      {
        name: 'Streak Master',
        description: 'Maintain a 30-day activity streak',
        icon: 'Crown',
        category: 'STREAK',
        requirement: JSON.stringify({ type: 'STREAK_DAYS', days: 30 }),
        xpReward: 500
      },
      {
        name: 'Two Month Champion',
        description: 'Maintain a 60-day activity streak',
        icon: 'Trophy',
        category: 'STREAK',
        requirement: JSON.stringify({ type: 'STREAK_DAYS', days: 60 }),
        xpReward: 800
      },
      {
        name: 'Quarter Master',
        description: 'Maintain a 90-day activity streak',
        icon: 'Star',
        category: 'STREAK',
        requirement: JSON.stringify({ type: 'STREAK_DAYS', days: 90 }),
        xpReward: 1200
      },
      {
        name: 'Year Long Dedication',
        description: 'Maintain a 365-day activity streak',
        icon: 'Crown',
        category: 'STREAK',
        requirement: JSON.stringify({ type: 'STREAK_DAYS', days: 365 }),
        xpReward: 2000
      },

      // XP Achievements (7 total)
      {
        name: 'First Points',
        description: 'Earn your first 100 XP',
        icon: 'Zap',
        category: 'XP',
        requirement: JSON.stringify({ type: 'TOTAL_XP', xp: 100 }),
        xpReward: 50
      },
      {
        name: 'XP Collector',
        description: 'Earn 1,000 total XP',
        icon: 'Zap',
        category: 'XP',
        requirement: JSON.stringify({ type: 'TOTAL_XP', xp: 1000 }),
        xpReward: 100
      },
      {
        name: 'XP Enthusiast',
        description: 'Earn 2,500 total XP',
        icon: 'Zap',
        category: 'XP',
        requirement: JSON.stringify({ type: 'TOTAL_XP', xp: 2500 }),
        xpReward: 200
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
        name: 'XP Champion',
        description: 'Earn 10,000 total XP',
        icon: 'Zap',
        category: 'XP',
        requirement: JSON.stringify({ type: 'TOTAL_XP', xp: 10000 }),
        xpReward: 750
      },
      {
        name: 'XP Legend',
        description: 'Earn 25,000 total XP',
        icon: 'Crown',
        category: 'XP',
        requirement: JSON.stringify({ type: 'TOTAL_XP', xp: 25000 }),
        xpReward: 1000
      },
      {
        name: 'XP Grandmaster',
        description: 'Earn 50,000 total XP',
        icon: 'Crown',
        category: 'XP',
        requirement: JSON.stringify({ type: 'TOTAL_XP', xp: 50000 }),
        xpReward: 2000
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

  // No default learning resources created - users start with empty learning hub

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