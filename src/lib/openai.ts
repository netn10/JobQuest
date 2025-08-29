import OpenAI from 'openai'

// Create OpenAI instance with default API key
const createOpenAI = (apiKey?: string) => {
  return new OpenAI({
    apiKey: apiKey || process.env.OPENAI_API_KEY,
  })
}

const openai = createOpenAI()

export async function generateLearningRecommendations(userProfile: {
  skills: string[]
  jobGoals: string[]
  currentLevel: string
  timeAvailable: number
}, userApiKey?: string) {
  try {
    const openaiInstance = userApiKey ? createOpenAI(userApiKey) : openai
    const completion = await openaiInstance.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a career coach AI that helps job seekers improve their skills. 
          Generate personalized learning recommendations based on user profile.
          Return a JSON array with 3-5 recommendations, each having:
          - title: string
          - description: string
          - url: string (use placeholder URLs)
          - type: "ARTICLE" | "VIDEO" | "TUTORIAL" | "COURSE"
          - difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED"
          - estimatedTime: number (in minutes)
          - tags: string[]`
        },
        {
          role: "user",
          content: `User Profile:
          - Skills: ${userProfile.skills.join(', ')}
          - Job Goals: ${userProfile.jobGoals.join(', ')}
          - Current Level: ${userProfile.currentLevel}
          - Available Time: ${userProfile.timeAvailable} minutes per day
          
          Provide learning recommendations that will help them achieve their job goals.`
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    })

    const content = completion.choices[0]?.message?.content
    if (!content) throw new Error('No response from OpenAI')

    return JSON.parse(content)
  } catch (error) {
    // Fallback recommendations
    return [
      {
        title: "JavaScript Fundamentals",
        description: "Master the basics of JavaScript programming",
        url: "https://example.com/js-fundamentals",
        type: "TUTORIAL",
        difficulty: "BEGINNER",
        estimatedTime: 60,
        tags: ["JavaScript", "Programming"]
      },
      {
        title: "React Best Practices",
        description: "Learn modern React patterns and best practices",
        url: "https://example.com/react-best-practices",
        type: "COURSE",
        difficulty: "INTERMEDIATE",
        estimatedTime: 120,
        tags: ["React", "Frontend"]
      }
    ]
  }
}

export async function generateJobApplicationInsights(application: {
  company: string
  role: string
  description: string
  userSkills: string[]
}, userApiKey?: string) {
  try {
    const openaiInstance = userApiKey ? createOpenAI(userApiKey) : openai
    const completion = await openaiInstance.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a job application coach. Analyze job postings and provide insights.
          Return a JSON object with:
          - matchScore: number (0-100, how well user fits the role)
          - strengths: string[] (user's relevant skills)
          - gaps: string[] (skills user should improve)
          - suggestions: string[] (actionable advice for the application)
          - keywords: string[] (important keywords from job description)`
        },
        {
          role: "user",
          content: `Job Application Analysis:
          Company: ${application.company}
          Role: ${application.role}
          Description: ${application.description}
          User Skills: ${application.userSkills.join(', ')}
          
          Analyze this job posting and provide insights.`
        }
      ],
      temperature: 0.5,
      max_tokens: 800,
    })

    const content = completion.choices[0]?.message?.content
    if (!content) throw new Error('No response from OpenAI')

    return JSON.parse(content)
  } catch (error) {
    // Fallback insights
    return {
      matchScore: 75,
      strengths: ["JavaScript", "React"],
      gaps: ["System Design", "Leadership"],
      suggestions: [
        "Highlight your frontend experience",
        "Mention any team collaboration projects"
      ],
      keywords: ["JavaScript", "React", "Frontend", "Teamwork"]
    }
  }
}

export async function generateMotivationalMessage(context: {
  streak: number
  recentAchievements: string[]
  upcomingGoals: string[]
}, userApiKey?: string) {
  try {
    const openaiInstance = userApiKey ? createOpenAI(userApiKey) : openai
    const completion = await openaiInstance.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a motivational coach for job seekers. Generate encouraging, personalized messages that are uplifting but not overly cheery. Keep it under 100 words."
        },
        {
          role: "user",
          content: `Generate a motivational message for someone with:
          - Current streak: ${context.streak} days
          - Recent achievements: ${context.recentAchievements.join(', ')}
          - Upcoming goals: ${context.upcomingGoals.join(', ')}`
        }
      ],
      temperature: 0.8,
      max_tokens: 150,
    })

    const content = completion.choices[0]?.message?.content
    if (!content) throw new Error('No response from OpenAI')

    return content.trim()
  } catch (error) {
    return "Keep pushing forward! Every step you take brings you closer to your goals. Your consistency is building the foundation for your success."
  }
}

export async function analyzeLearningResource(url: string, userApiKey?: string) {
  try {
    const openaiInstance = userApiKey ? createOpenAI(userApiKey) : openai
    
    // First, try to fetch the content from the URL
    let content = ''
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch content: ${response.status}`)
      }
      
      const html = await response.text()
      
      // Extract text content from HTML (basic extraction)
      const textContent = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 2000) // Limit content length
      
      content = textContent
    } catch (fetchError) {
      // Continue with URL analysis only
    }

    const completion = await openaiInstance.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are an AI that analyzes learning resources. Based on the URL and content, extract information about the learning resource.
          
          Return a JSON object with:
          - title: string (the title of the learning resource)
          - description: string (brief description of what will be learned)
          - type: "ARTICLE" | "VIDEO" | "TUTORIAL" | "COURSE" | "BOOK" | "PROJECT" | "PODCAST"
          - difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT"
          - estimatedTime: number (estimated time in minutes)
          - tags: string[] (relevant tags/topics)
          - source: string (the platform or source, e.g., "React.dev", "YouTube", "Coursera")
          
          Analyze the URL patterns and content to determine:
          - Type: Look for keywords like "video", "course", "tutorial", "article", "book", "project"
          - Difficulty: Based on content complexity and target audience
          - Time: Estimate based on content length and type
          - Tags: Extract relevant technologies, topics, or skills
          - Source: Identify the platform or website name`
        },
        {
          role: "user",
          content: `Analyze this learning resource:
          URL: ${url}
          ${content ? `Content Preview: ${content}` : 'No content available'}
          
          Provide a detailed analysis of this learning resource.`
        }
      ],
      temperature: 0.3,
      max_tokens: 800,
    })

    const responseContent = completion.choices[0]?.message?.content
    if (!responseContent) throw new Error('No response from OpenAI')

    const analysis = JSON.parse(responseContent)
    
    // Validate and clean the analysis
    return {
      title: analysis.title?.trim() || '',
      description: analysis.description?.trim() || '',
      url: url,
      type: analysis.type?.toUpperCase() || 'ARTICLE',
      difficulty: analysis.difficulty?.toUpperCase() || 'BEGINNER',
      estimatedTime: parseInt(analysis.estimatedTime) || 30,
      tags: Array.isArray(analysis.tags) ? analysis.tags : [],
      source: analysis.source?.trim() || ''
    }
  } catch (error) {
    // Fallback analysis based on URL patterns
    const urlLower = url.toLowerCase()
    let type = 'ARTICLE'
    let difficulty = 'BEGINNER'
    let estimatedTime = 30
    let tags: string[] = []
    let source = ''
    
    // Determine type from URL
    if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) {
      type = 'VIDEO'
      source = 'YouTube'
      estimatedTime = 15
    } else if (urlLower.includes('coursera.org')) {
      type = 'COURSE'
      source = 'Coursera'
      estimatedTime = 60
    } else if (urlLower.includes('udemy.com')) {
      type = 'COURSE'
      source = 'Udemy'
      estimatedTime = 60
    } else if (urlLower.includes('freecodecamp.org')) {
      type = 'TUTORIAL'
      source = 'freeCodeCamp'
      estimatedTime = 45
    } else if (urlLower.includes('react.dev') || urlLower.includes('reactjs.org')) {
      type = 'ARTICLE'
      source = 'React.dev'
      tags = ['React', 'JavaScript']
    } else if (urlLower.includes('mdn.') || urlLower.includes('developer.mozilla.org')) {
      type = 'ARTICLE'
      source = 'MDN Web Docs'
      tags = ['Web Development', 'Documentation']
    }
    
    // Extract domain as source if not already set
    if (!source) {
      try {
        const domain = new URL(url).hostname.replace('www.', '')
        source = domain
      } catch {
        source = 'Unknown'
      }
    }
    
    return {
      title: '',
      description: '',
      url: url,
      type,
      difficulty,
      estimatedTime,
      tags,
      source
    }
  }
}

export async function generateRandomLearningResources(options: {
  subject: string
  count?: number
  userApiKey?: string
}) {
  const { subject, count = 5, userApiKey } = options
  
  try {
    const openaiInstance = userApiKey ? createOpenAI(userApiKey) : openai
    
    const completion = await openaiInstance.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are an AI that generates random, high-quality learning resources from the internet. 
          Create diverse, real learning resources that actually exist online for the given subject.
          
          CRITICAL REQUIREMENTS:
          - ONLY include software/technology/computer science related resources
          - PRIORITIZE resources from ${new Date().getFullYear()} and ${new Date().getFullYear() - 1}
          - Focus on programming, development, software engineering, data science, AI/ML, cybersecurity, etc.
          - REJECT non-software subjects like cooking, art, music, sports, travel, business (non-tech), health (non-tech), etc.
          - If the subject is not clearly software/tech related, return an empty array
          
          Return a JSON array with ${count} resources, each having:
          - title: string (actual title of the resource)
          - description: string (brief description of what will be learned)
          - url: string (real URL to the learning resource)
          - type: "ARTICLE" | "VIDEO" | "TUTORIAL" | "COURSE" | "BOOK" | "PROJECT" | "PODCAST"
          - difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT"
          - estimatedTime: number (estimated time in minutes)
          - tags: string[] (relevant tags/topics)
          - source: string (the platform or source, e.g., "React.dev", "YouTube", "Coursera")
          - year: number (publication year, prioritize ${new Date().getFullYear()} and ${new Date().getFullYear() - 1})
          
          ACCEPTABLE SUBJECTS: Programming, Web Development, Mobile Development, Data Science, 
          Machine Learning, AI, Cybersecurity, DevOps, Cloud Computing, Database, Networking, 
          Software Architecture, UI/UX Design, Game Development, Blockchain, etc.
          
          REJECT: Cooking, Art, Music, Sports, Travel, Business (non-tech), Health (non-tech), 
          Gardening, Fashion, Cooking, Photography (non-digital), etc.
          
          Include resources from popular platforms like:
          - YouTube channels (freeCodeCamp, Traversy Media, The Net Ninja, etc.)
          - Documentation sites (MDN, React.dev, Vue.js docs, etc.)
          - Learning platforms (Coursera, Udemy, freeCodeCamp, etc.)
          - Tech blogs (CSS-Tricks, Smashing Magazine, etc.)
          - Official documentation and tutorials
          
          Focus on the subject: ${subject}`
        },
        {
          role: "user",
          content: `Generate ${count} random learning resources about "${subject}" from the internet. 
          Make them diverse and include a mix of different difficulty levels and types.
          Focus on practical, high-quality resources that people actually use to learn about ${subject}.
          Prioritize recent resources from ${new Date().getFullYear()} and ${new Date().getFullYear() - 1} when possible.
          
          IMPORTANT: If "${subject}" is not clearly a software/technology subject, return an empty array.`
        }
      ],
      temperature: 0.8,
      max_tokens: 1500,
    })

    const responseContent = completion.choices[0]?.message?.content
    if (!responseContent) throw new Error('No response from OpenAI')

    const resources = JSON.parse(responseContent)
    
    // If AI returns empty array, it means the subject is not software-related
    if (!Array.isArray(resources) || resources.length === 0) {
      throw new Error('SUBJECT_NOT_SOFTWARE_RELATED')
    }
    
    // Validate and clean the resources
    return resources.map((resource: any) => ({
      title: resource.title?.trim() || 'Learning Resource',
      description: resource.description?.trim() || 'A valuable learning resource',
      url: resource.url?.trim() || '',
      type: resource.type?.toUpperCase() || 'ARTICLE',
      difficulty: resource.difficulty?.toUpperCase() || 'BEGINNER',
      estimatedTime: parseInt(resource.estimatedTime) || 30,
      tags: Array.isArray(resource.tags) ? resource.tags : [],
      source: resource.source?.trim() || 'Unknown',
      year: parseInt(resource.year) || new Date().getFullYear()
    }))
  } catch (error) {
    // Re-throw the software-related error
    if (error instanceof Error && error.message === 'SUBJECT_NOT_SOFTWARE_RELATED') {
      throw error
    }
    
    // Fallback resources based on common subjects
    const fallbackResources = getFallbackResources(subject, count)
    return fallbackResources
  }
}

function getFallbackResources(subject: string, count: number) {
  const subjectLower = subject.toLowerCase()
  const currentYear = new Date().getFullYear()
  
  // Check if subject is software-related with more comprehensive validation
  const softwareKeywords = [
    // Programming languages
    'programming', 'coding', 'javascript', 'python', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin', 'dart',
    // Web technologies
    'web development', 'frontend', 'backend', 'fullstack', 'html', 'css', 'react', 'vue', 'angular', 'node', 'express', 'next.js', 'nuxt',
    // Mobile development
    'mobile development', 'react native', 'flutter', 'ios', 'android', 'app development',
    // Data and AI
    'data science', 'machine learning', 'ai', 'artificial intelligence', 'deep learning', 'neural networks', 'data analysis', 'pandas', 'numpy', 'tensorflow', 'pytorch',
    // Databases
    'database', 'sql', 'mongodb', 'postgresql', 'mysql', 'redis', 'nosql',
    // DevOps and Cloud
    'devops', 'cloud', 'aws', 'azure', 'google cloud', 'docker', 'kubernetes', 'ci/cd', 'jenkins', 'gitlab', 'github actions',
    // Cybersecurity
    'cybersecurity', 'security', 'penetration testing', 'ethical hacking', 'network security', 'web security',
    // Other tech
    'software engineering', 'software development', 'api', 'rest', 'graphql', 'microservices', 'blockchain', 'game development', 'ui', 'ux', 'design systems',
    // Testing
    'testing', 'unit testing', 'integration testing', 'e2e testing', 'jest', 'cypress', 'selenium',
    // Version control
    'git', 'version control', 'github', 'gitlab', 'bitbucket'
  ]
  
  const isSoftwareRelated = softwareKeywords.some(keyword => 
    subjectLower.includes(keyword.toLowerCase())
  )
  
  if (!isSoftwareRelated) {
    throw new Error('SUBJECT_NOT_SOFTWARE_RELATED')
  }
  
  // Define fallback resources for common subjects (with dynamic year)
  const allResources = [
    // Web Development (Recent)
    {
      title: "React Tutorial - React.dev",
      description: "Learn React with the latest features and hooks",
      url: "https://react.dev/learn",
      type: "TUTORIAL",
      difficulty: "INTERMEDIATE",
      estimatedTime: 120,
      tags: ["React", "JavaScript", "Frontend"],
      source: "React.dev",
      year: currentYear
    },
    {
      title: "Next.js App Router Tutorial - YouTube",
      description: "Complete Next.js tutorial with App Router and Server Components",
      url: "https://www.youtube.com/watch?v=9P8mASSREYM",
      type: "VIDEO",
      difficulty: "INTERMEDIATE",
      estimatedTime: 180,
      tags: ["Next.js", "React", "Fullstack", "App Router"],
      source: "YouTube",
      year: currentYear
    },
    {
      title: "TypeScript Handbook - Official Docs",
      description: "Latest TypeScript documentation with new features and best practices",
      url: "https://www.typescriptlang.org/docs/",
      type: "ARTICLE",
      difficulty: "INTERMEDIATE",
      estimatedTime: 180,
      tags: ["TypeScript", "JavaScript", "Programming"],
      source: "TypeScript",
      year: currentYear
    },
    // Data Science & AI (Recent)
    {
      title: "Machine Learning Specialization - Coursera",
      description: "Updated machine learning course with latest AI developments",
      url: "https://www.coursera.org/specializations/machine-learning-introduction",
      type: "COURSE",
      difficulty: "INTERMEDIATE",
      estimatedTime: 600,
      tags: ["Machine Learning", "AI", "Python", "Mathematics"],
      source: "Coursera",
      year: currentYear
    },
    {
      title: "Python for Data Science - freeCodeCamp",
      description: "Comprehensive Python data science course with pandas and numpy",
      url: "https://www.freecodecamp.org/learn/data-analysis-with-python/",
      type: "TUTORIAL",
      difficulty: "BEGINNER",
      estimatedTime: 300,
      tags: ["Python", "Data Science", "Pandas", "NumPy"],
      source: "freeCodeCamp",
      year: currentYear
    },
    // Mobile Development (Recent)
    {
      title: "React Native Tutorial - YouTube",
      description: "Build mobile apps with React Native and latest features",
      url: "https://www.youtube.com/watch?v=0-S5a0eXPoc",
      type: "VIDEO",
      difficulty: "INTERMEDIATE",
      estimatedTime: 240,
      tags: ["React Native", "Mobile Development", "JavaScript"],
      source: "YouTube",
      year: currentYear
    },
    // DevOps & Cloud (Recent)
    {
      title: "Docker & Kubernetes - YouTube",
      description: "Modern containerization and orchestration with latest tools",
      url: "https://www.youtube.com/watch?v=fqMOX6JJhGo",
      type: "VIDEO",
      difficulty: "INTERMEDIATE",
      estimatedTime: 120,
      tags: ["Docker", "Kubernetes", "DevOps", "Containers"],
      source: "YouTube",
      year: currentYear
    },
    {
      title: "AWS Cloud Practitioner - A Cloud Guru",
      description: "Updated AWS certification course with latest services",
      url: "https://acloudguru.com/course/aws-certified-cloud-practitioner",
      type: "COURSE",
      difficulty: "BEGINNER",
      estimatedTime: 240,
      tags: ["AWS", "Cloud Computing", "DevOps"],
      source: "A Cloud Guru",
      year: currentYear
    },
    // Cybersecurity (Recent)
    {
      title: "Cybersecurity Fundamentals - SANS",
      description: "Updated cybersecurity course with latest threats and defenses",
      url: "https://www.sans.org/courses/cyber-aces/",
      type: "COURSE",
      difficulty: "BEGINNER",
      estimatedTime: 240,
      tags: ["Cybersecurity", "Security", "Networking"],
      source: "SANS",
      year: currentYear
    },
    // Legacy but still relevant resources
    {
      title: "JavaScript Fundamentals - freeCodeCamp",
      description: "Learn JavaScript basics with interactive exercises and projects",
      url: "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/",
      type: "TUTORIAL",
      difficulty: "BEGINNER",
      estimatedTime: 300,
      tags: ["JavaScript", "Programming", "Web Development"],
      source: "freeCodeCamp",
      year: currentYear - 1
    },
    {
      title: "CSS Grid Layout - MDN Web Docs",
      description: "Complete guide to CSS Grid Layout with examples and browser support",
      url: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout",
      type: "ARTICLE",
      difficulty: "INTERMEDIATE",
      estimatedTime: 60,
      tags: ["CSS", "Grid", "Layout", "Web Development"],
      source: "MDN Web Docs",
      year: currentYear - 1
    }
  ]
  
  // Filter resources based on subject keywords
  const relevantResources = allResources.filter(resource => {
    const resourceText = `${resource.title} ${resource.description} ${resource.tags.join(' ')}`.toLowerCase()
    return resourceText.includes(subjectLower) || 
           resource.tags.some(tag => tag.toLowerCase().includes(subjectLower))
  })
  
  // If no relevant resources found, return general programming resources
  const resourcesToUse = relevantResources.length > 0 ? relevantResources : allResources
  
  // Sort by year (newest first) and return random subset
  return resourcesToUse
    .sort((a, b) => b.year - a.year) // Sort by year descending
    .slice(0, count)
}

export default openai