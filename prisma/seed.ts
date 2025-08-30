import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create a test user for development
  const testUserEmail = 'test@example.com'
  const existingUser = await prisma.user.findUnique({
    where: { email: testUserEmail }
  })

  if (!existingUser) {
    const hashedPassword = await bcrypt.hash('password123', 10)
    const testUser = await prisma.user.create({
      data: {
        email: testUserEmail,
        password: hashedPassword,
        name: 'Test User',
        xp: 0,
        level: 1,
        totalXp: 0,
        currentStreak: 0,
        longestStreak: 0,
        theme: 'light',
        notifications: true,
        timezone: 'UTC'
      }
    })
    console.log('Created test user:', testUser.id)
  }

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
      },

      // Advanced Focus Achievements (10 total)
      {
        name: 'Focus Sprint',
        description: 'Complete 3 focus sessions in a single day',
        icon: 'Timer',
        category: 'FOCUS',
        requirement: JSON.stringify({ type: 'DAILY_FOCUS_SESSIONS', count: 3 }),
        xpReward: 150
      },
      {
        name: 'Focus Marathon',
        description: 'Complete 5 focus sessions in a single day',
        icon: 'Timer',
        category: 'FOCUS',
        requirement: JSON.stringify({ type: 'DAILY_FOCUS_SESSIONS', count: 5 }),
        xpReward: 300
      },
      {
        name: 'Ultra Focus',
        description: 'Complete an 8-hour focus session',
        icon: 'Mountain',
        category: 'FOCUS',
        requirement: JSON.stringify({ type: 'FOCUS_SESSION_DURATION', minutes: 480 }),
        xpReward: 1000
      },
      {
        name: 'Focus Consistency',
        description: 'Complete at least 1 focus session for 30 consecutive days',
        icon: 'Calendar',
        category: 'FOCUS',
        requirement: JSON.stringify({ type: 'FOCUS_STREAK_DAYS', days: 30 }),
        xpReward: 750
      },
      {
        name: 'Pomodoro Master',
        description: 'Complete 100 25-minute focus sessions',
        icon: 'Clock',
        category: 'FOCUS',
        requirement: JSON.stringify({ type: 'POMODORO_SESSIONS', count: 100, duration: 25 }),
        xpReward: 500
      },
      {
        name: 'Deep Work Advocate',
        description: 'Complete 20 sessions longer than 2 hours',
        icon: 'Brain',
        category: 'FOCUS',
        requirement: JSON.stringify({ type: 'LONG_FOCUS_SESSIONS', count: 20, minMinutes: 120 }),
        xpReward: 600
      },
      {
        name: 'Focus Perfectionist',
        description: 'Complete 50 focus sessions without any breaks',
        icon: 'Shield',
        category: 'FOCUS',
        requirement: JSON.stringify({ type: 'PERFECT_FOCUS_SESSIONS', count: 50 }),
        xpReward: 800
      },
      {
        name: 'Early Bird Focus',
        description: 'Complete 25 focus sessions before 7 AM',
        icon: 'Sunrise',
        category: 'FOCUS',
        requirement: JSON.stringify({ type: 'EARLY_FOCUS_SESSIONS', count: 25, beforeHour: 7 }),
        xpReward: 400
      },
      {
        name: 'Midnight Oil',
        description: 'Complete 15 focus sessions after 10 PM',
        icon: 'Moon',
        category: 'FOCUS',
        requirement: JSON.stringify({ type: 'LATE_FOCUS_SESSIONS', count: 15, afterHour: 22 }),
        xpReward: 350
      },
      {
        name: 'Focus Zen Master',
        description: 'Complete 500 focus sessions total',
        icon: 'Lotus',
        category: 'FOCUS',
        requirement: JSON.stringify({ type: 'MISSIONS_COMPLETED', count: 500, missionType: 'FOCUS' }),
        xpReward: 2500
      },

      // Advanced Learning Achievements (10 total)
      {
        name: 'Knowledge Collector',
        description: 'Complete learning resources from 5 different categories',
        icon: 'Library',
        category: 'LEARNING',
        requirement: JSON.stringify({ type: 'LEARNING_CATEGORIES', count: 5 }),
        xpReward: 200
      },
      {
        name: 'Daily Learner',
        description: 'Complete at least 1 learning resource for 30 consecutive days',
        icon: 'Calendar',
        category: 'LEARNING',
        requirement: JSON.stringify({ type: 'LEARNING_STREAK_DAYS', days: 30 }),
        xpReward: 500
      },
      {
        name: 'Learning Sprint',
        description: 'Complete 15 learning resources in a single day',
        icon: 'Zap',
        category: 'LEARNING',
        requirement: JSON.stringify({ type: 'DAILY_LEARNING_RESOURCES', count: 15 }),
        xpReward: 400
      },
      {
        name: 'Tutorial Master',
        description: 'Complete 50 tutorial learning resources',
        icon: 'Monitor',
        category: 'LEARNING',
        requirement: JSON.stringify({ type: 'LEARNING_RESOURCES_BY_TYPE', count: 50, resourceType: 'TUTORIAL' }),
        xpReward: 600
      },
      {
        name: 'Book Worm',
        description: 'Complete 25 book learning resources',
        icon: 'BookOpen',
        category: 'LEARNING',
        requirement: JSON.stringify({ type: 'LEARNING_RESOURCES_BY_TYPE', count: 25, resourceType: 'BOOK' }),
        xpReward: 750
      },
      {
        name: 'Podcast Enthusiast',
        description: 'Complete 30 podcast learning resources',
        icon: 'Headphones',
        category: 'LEARNING',
        requirement: JSON.stringify({ type: 'LEARNING_RESOURCES_BY_TYPE', count: 30, resourceType: 'PODCAST' }),
        xpReward: 400
      },
      {
        name: 'Learning Machine',
        description: 'Complete 200 learning resources',
        icon: 'Cpu',
        category: 'LEARNING',
        requirement: JSON.stringify({ type: 'LEARNING_RESOURCES', count: 200 }),
        xpReward: 2000
      },
      {
        name: 'Skill Builder',
        description: 'Complete learning resources in 10 different categories',
        icon: 'Tool',
        category: 'LEARNING',
        requirement: JSON.stringify({ type: 'LEARNING_CATEGORIES', count: 10 }),
        xpReward: 800
      },
      {
        name: 'Weekend Scholar',
        description: 'Complete 50 learning resources on weekends',
        icon: 'Calendar',
        category: 'LEARNING',
        requirement: JSON.stringify({ type: 'WEEKEND_LEARNING_RESOURCES', count: 50 }),
        xpReward: 500
      },
      {
        name: 'Learning Guru',
        description: 'Complete 300 learning resources',
        icon: 'Crown',
        category: 'LEARNING',
        requirement: JSON.stringify({ type: 'LEARNING_RESOURCES', count: 300 }),
        xpReward: 3000
      },

      // Advanced Job Search Achievements (10 total)
      {
        name: 'Network Builder',
        description: 'Save 25 job contacts',
        icon: 'Users',
        category: 'JOB_SEARCH',
        requirement: JSON.stringify({ type: 'JOB_CONTACTS', count: 25 }),
        xpReward: 200
      },
      {
        name: 'Interview Champion',
        description: 'Get 25 job applications to screening stage',
        icon: 'Award',
        category: 'JOB_SEARCH',
        requirement: JSON.stringify({ type: 'JOB_APPLICATIONS_SCREENING', count: 25 }),
        xpReward: 1000
      },
      {
        name: 'Resume Perfectionist',
        description: 'Update resume 20 times',
        icon: 'FileText',
        category: 'JOB_SEARCH',
        requirement: JSON.stringify({ type: 'RESUME_UPDATES', count: 20 }),
        xpReward: 300
      },
      {
        name: 'Cover Letter Pro',
        description: 'Write 50 custom cover letters',
        icon: 'Edit',
        category: 'JOB_SEARCH',
        requirement: JSON.stringify({ type: 'COVER_LETTERS', count: 50 }),
        xpReward: 500
      },
      {
        name: 'Job Board Explorer',
        description: 'Apply through 5 different job platforms',
        icon: 'Globe',
        category: 'JOB_SEARCH',
        requirement: JSON.stringify({ type: 'JOB_PLATFORMS', count: 5 }),
        xpReward: 250
      },
      {
        name: 'Application Speedster',
        description: 'Apply to 10 jobs in a single day',
        icon: 'Zap',
        category: 'JOB_SEARCH',
        requirement: JSON.stringify({ type: 'DAILY_JOB_APPLICATIONS', count: 10 }),
        xpReward: 400
      },
      {
        name: 'Follow-up Master',
        description: 'Send follow-up messages for 30 applications',
        icon: 'Send',
        category: 'JOB_SEARCH',
        requirement: JSON.stringify({ type: 'FOLLOW_UP_MESSAGES', count: 30 }),
        xpReward: 350
      },
      {
        name: 'Job Hunt Marathon',
        description: 'Apply to 200 job positions',
        icon: 'Mountain',
        category: 'JOB_SEARCH',
        requirement: JSON.stringify({ type: 'JOB_APPLICATIONS', count: 200 }),
        xpReward: 1500
      },
      {
        name: 'Industry Explorer',
        description: 'Apply to jobs in 5 different industries',
        icon: 'Briefcase',
        category: 'JOB_SEARCH',
        requirement: JSON.stringify({ type: 'JOB_INDUSTRIES', count: 5 }),
        xpReward: 300
      },
      {
        name: 'Remote Work Advocate',
        description: 'Apply to 50 remote job positions',
        icon: 'Home',
        category: 'JOB_SEARCH',
        requirement: JSON.stringify({ type: 'REMOTE_JOB_APPLICATIONS', count: 50 }),
        xpReward: 400
      },

      // General Achievements (Mixed Categories - 10 total)
      {
        name: 'Task Crusher',
        description: 'Complete 50 daily tasks',
        icon: 'CheckSquare',
        category: 'XP',
        requirement: JSON.stringify({ type: 'DAILY_TASKS', count: 50 }),
        xpReward: 200
      },
      {
        name: 'Goal Setter',
        description: 'Set 10 personal goals',
        icon: 'Target',
        category: 'FOCUS',
        requirement: JSON.stringify({ type: 'PERSONAL_GOALS', count: 10 }),
        xpReward: 150
      },
      {
        name: 'Goal Achiever',
        description: 'Complete 5 personal goals',
        icon: 'Trophy',
        category: 'XP',
        requirement: JSON.stringify({ type: 'COMPLETED_GOALS', count: 5 }),
        xpReward: 300
      },
      {
        name: 'Time Tracker',
        description: 'Track time for 100 hours',
        icon: 'Clock',
        category: 'FOCUS',
        requirement: JSON.stringify({ type: 'TIME_TRACKED_HOURS', hours: 100 }),
        xpReward: 250
      },
      {
        name: 'Priority Master',
        description: 'Complete 25 high-priority tasks',
        icon: 'AlertTriangle',
        category: 'FOCUS',
        requirement: JSON.stringify({ type: 'HIGH_PRIORITY_TASKS', count: 25 }),
        xpReward: 200
      },
      {
        name: 'Deadline Keeper',
        description: 'Meet 20 task deadlines',
        icon: 'Calendar',
        category: 'XP',
        requirement: JSON.stringify({ type: 'DEADLINES_MET', count: 20 }),
        xpReward: 300
      },
      {
        name: 'Weekly Planner',
        description: 'Create 10 weekly plans',
        icon: 'PlaneTakeoff',
        category: 'FOCUS',
        requirement: JSON.stringify({ type: 'WEEKLY_PLANS', count: 10 }),
        xpReward: 150
      },
      {
        name: 'Habit Former',
        description: 'Track 5 habits for 30 days each',
        icon: 'Repeat',
        category: 'STREAK',
        requirement: JSON.stringify({ type: 'HABIT_STREAKS', habits: 5, days: 30 }),
        xpReward: 500
      },
      {
        name: 'Productivity Guru',
        description: 'Complete 200 tasks',
        icon: 'Crown',
        category: 'XP',
        requirement: JSON.stringify({ type: 'TOTAL_TASKS', count: 200 }),
        xpReward: 800
      },
      {
        name: 'Efficiency Expert',
        description: 'Complete 10 tasks in under estimated time',
        icon: 'Zap',
        category: 'XP',
        requirement: JSON.stringify({ type: 'TASKS_UNDER_TIME', count: 10 }),
        xpReward: 400
      },

      // Social Achievements (New Category - 10 total)
      {
        name: 'Community Member',
        description: 'Join the Job Quest community',
        icon: 'Users',
        category: 'SOCIAL',
        requirement: JSON.stringify({ type: 'COMMUNITY_JOIN', count: 1 }),
        xpReward: 50
      },
      {
        name: 'Helpful Member',
        description: 'Help 5 community members',
        icon: 'Heart',
        category: 'SOCIAL',
        requirement: JSON.stringify({ type: 'COMMUNITY_HELPS', count: 5 }),
        xpReward: 200
      },
      {
        name: 'Knowledge Sharer',
        description: 'Share 10 learning resources with community',
        icon: 'Share',
        category: 'SOCIAL',
        requirement: JSON.stringify({ type: 'SHARED_RESOURCES', count: 10 }),
        xpReward: 150
      },
      {
        name: 'Motivator',
        description: 'Send 25 encouragement messages',
        icon: 'MessageSquare',
        category: 'SOCIAL',
        requirement: JSON.stringify({ type: 'ENCOURAGEMENT_MESSAGES', count: 25 }),
        xpReward: 250
      },
      {
        name: 'Study Buddy',
        description: 'Form 3 study partnerships',
        icon: 'UserPlus',
        category: 'SOCIAL',
        requirement: JSON.stringify({ type: 'STUDY_PARTNERSHIPS', count: 3 }),
        xpReward: 300
      },
      {
        name: 'Mentor',
        description: 'Mentor 2 new job seekers',
        icon: 'GraduationCap',
        category: 'SOCIAL',
        requirement: JSON.stringify({ type: 'MENTORSHIP_SESSIONS', count: 2 }),
        xpReward: 500
      },
      {
        name: 'Event Organizer',
        description: 'Organize 5 community events',
        icon: 'Calendar',
        category: 'SOCIAL',
        requirement: JSON.stringify({ type: 'COMMUNITY_EVENTS', count: 5 }),
        xpReward: 400
      },
      {
        name: 'Success Story',
        description: 'Share your job search success story',
        icon: 'Star',
        category: 'SOCIAL',
        requirement: JSON.stringify({ type: 'SUCCESS_STORY', count: 1 }),
        xpReward: 1000
      },
      {
        name: 'Community Leader',
        description: 'Be recognized as top contributor for a month',
        icon: 'Crown',
        category: 'SOCIAL',
        requirement: JSON.stringify({ type: 'TOP_CONTRIBUTOR', months: 1 }),
        xpReward: 750
      },
      {
        name: 'Network Connector',
        description: 'Make 20 professional connections through the platform',
        icon: 'Link',
        category: 'SOCIAL',
        requirement: JSON.stringify({ type: 'PROFESSIONAL_CONNECTIONS', count: 20 }),
        xpReward: 600
      }
    ]
  })

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

}

main()
  .catch((e) => {
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })