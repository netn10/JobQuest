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
      // Focus Achievements
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
        name: 'Century Club',
        description: 'Complete 100 missions',
        icon: 'Crown',
        category: 'FOCUS',
        requirement: JSON.stringify({ type: 'MISSIONS_COMPLETED', count: 100 }),
        xpReward: 1000
      },
      
      // Streak Achievements
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
      
      // Learning Achievements
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
      
      // Job Search Achievements
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
      
      // XP Achievements
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

  // Check if learning resources already exist
  const existingResources = await prisma.learningResource.count()
  
  if (existingResources === 0) {
    // Create real learning resources
    const learningResources = await prisma.learningResource.createMany({
    data: [
      // React & Frontend Resources
      {
        title: 'React 18 New Features',
        description: 'Learn about React 18\'s concurrent features, automatic batching, and new hooks',
        url: 'https://react.dev/blog/2022/03/29/react-v18',
        type: 'ARTICLE',
        difficulty: 'INTERMEDIATE',
        estimatedTime: 25,
        tags: JSON.stringify(['React', 'JavaScript', 'Frontend']),
        source: 'React.dev'
      },
      {
        title: 'Advanced React Patterns',
        description: 'Master compound components, render props, and advanced hooks patterns',
        url: 'https://kentcdodds.com/blog/advanced-react-patterns',
        type: 'TUTORIAL',
        difficulty: 'ADVANCED',
        estimatedTime: 45,
        tags: JSON.stringify(['React', 'JavaScript', 'Patterns']),
        source: 'Kent C. Dodds'
      },
      {
        title: 'TypeScript for React Developers',
        description: 'Comprehensive guide to using TypeScript with React',
        url: 'https://www.typescriptlang.org/docs/handbook/react.html',
        type: 'TUTORIAL',
        difficulty: 'INTERMEDIATE',
        estimatedTime: 60,
        tags: JSON.stringify(['TypeScript', 'React', 'JavaScript']),
        source: 'TypeScript Official'
      },
      {
        title: 'Next.js 14 App Router',
        description: 'Learn the new App Router and Server Components in Next.js 14',
        url: 'https://nextjs.org/docs/app',
        type: 'COURSE',
        difficulty: 'INTERMEDIATE',
        estimatedTime: 120,
        tags: JSON.stringify(['Next.js', 'React', 'Full Stack']),
        source: 'Next.js Official'
      },
      
      // Backend & API Resources
      {
        title: 'Building REST APIs with Node.js',
        description: 'Step-by-step guide to creating scalable REST APIs',
        url: 'https://nodejs.org/en/learn/getting-started/introduction-to-nodejs',
        type: 'PROJECT',
        difficulty: 'INTERMEDIATE',
        estimatedTime: 90,
        tags: JSON.stringify(['Node.js', 'API', 'Backend']),
        source: 'Node.js Official'
      },
      {
        title: 'Express.js Best Practices',
        description: 'Learn best practices for building Express.js applications',
        url: 'https://expressjs.com/en/advanced/best-practices-performance.html',
        type: 'ARTICLE',
        difficulty: 'INTERMEDIATE',
        estimatedTime: 30,
        tags: JSON.stringify(['Express.js', 'Node.js', 'Backend']),
        source: 'Express.js Official'
      },
      {
        title: 'Database Design Principles',
        description: 'Learn fundamental database design and normalization',
        url: 'https://www.postgresql.org/docs/current/ddl.html',
        type: 'TUTORIAL',
        difficulty: 'BEGINNER',
        estimatedTime: 75,
        tags: JSON.stringify(['Database', 'SQL', 'Design']),
        source: 'PostgreSQL Official'
      },
      
      // System Design & Architecture
      {
        title: 'System Design Interview Prep',
        description: 'Comprehensive guide to system design interviews',
        url: 'https://github.com/donnemartin/system-design-primer',
        type: 'COURSE',
        difficulty: 'ADVANCED',
        estimatedTime: 180,
        tags: JSON.stringify(['System Design', 'Interview', 'Architecture']),
        source: 'GitHub'
      },
      {
        title: 'Microservices Architecture',
        description: 'Learn about microservices patterns and best practices',
        url: 'https://martinfowler.com/articles/microservices.html',
        type: 'ARTICLE',
        difficulty: 'ADVANCED',
        estimatedTime: 40,
        tags: JSON.stringify(['Microservices', 'Architecture', 'Backend']),
        source: 'Martin Fowler'
      },
      
      // DevOps & Tools
      {
        title: 'Docker for Developers',
        description: 'Learn Docker basics and containerization',
        url: 'https://docs.docker.com/get-started/',
        type: 'TUTORIAL',
        difficulty: 'BEGINNER',
        estimatedTime: 60,
        tags: JSON.stringify(['Docker', 'DevOps', 'Containers']),
        source: 'Docker Official'
      },
      {
        title: 'Git Advanced Techniques',
        description: 'Master Git workflows, branching strategies, and advanced commands',
        url: 'https://git-scm.com/book/en/v2',
        type: 'BOOK',
        difficulty: 'INTERMEDIATE',
        estimatedTime: 120,
        tags: JSON.stringify(['Git', 'Version Control', 'Workflow']),
        source: 'Git Official'
      },
      
      // Interview Prep
      {
        title: 'JavaScript Interview Questions',
        description: 'Common JavaScript interview questions and answers',
        url: 'https://github.com/sudheerj/javascript-interview-questions',
        type: 'ARTICLE',
        difficulty: 'INTERMEDIATE',
        estimatedTime: 45,
        tags: JSON.stringify(['JavaScript', 'Interview', 'Frontend']),
        source: 'GitHub'
      },
      {
        title: 'Data Structures & Algorithms',
        description: 'Essential data structures and algorithms for coding interviews',
        url: 'https://leetcode.com/explore/',
        type: 'COURSE',
        difficulty: 'INTERMEDIATE',
        estimatedTime: 200,
        tags: JSON.stringify(['Algorithms', 'Data Structures', 'Interview']),
        source: 'LeetCode'
      },
      
      // Modern Web Development
      {
        title: 'Web Performance Optimization',
        description: 'Learn techniques to improve website performance',
        url: 'https://web.dev/performance/',
        type: 'TUTORIAL',
        difficulty: 'INTERMEDIATE',
        estimatedTime: 90,
        tags: JSON.stringify(['Performance', 'Web', 'Optimization']),
        source: 'Web.dev'
      },
      {
        title: 'Progressive Web Apps',
        description: 'Build modern Progressive Web Applications',
        url: 'https://web.dev/progressive-web-apps/',
        type: 'COURSE',
        difficulty: 'INTERMEDIATE',
        estimatedTime: 150,
        tags: JSON.stringify(['PWA', 'Web', 'Mobile']),
        source: 'Web.dev'
      },
      
      // Soft Skills
      {
        title: 'Technical Writing for Developers',
        description: 'Learn to write clear documentation and technical content',
        url: 'https://developers.google.com/tech-writing',
        type: 'COURSE',
        difficulty: 'BEGINNER',
        estimatedTime: 60,
        tags: JSON.stringify(['Writing', 'Documentation', 'Communication']),
        source: 'Google Developers'
      },
      {
        title: 'Remote Work Best Practices',
        description: 'Tips and strategies for effective remote work',
        url: 'https://zapier.com/blog/remote-work-guide/',
        type: 'ARTICLE',
        difficulty: 'BEGINNER',
        estimatedTime: 20,
        tags: JSON.stringify(['Remote Work', 'Productivity', 'Communication']),
        source: 'Zapier'
      }
    ]
  })

      console.log('Created learning resources:', learningResources)
    } else {
      console.log('Learning resources already exist, skipping...')
    }

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