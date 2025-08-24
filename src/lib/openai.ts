import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function generateLearningRecommendations(userProfile: {
  skills: string[]
  jobGoals: string[]
  currentLevel: string
  timeAvailable: number
}) {
  try {
    const completion = await openai.chat.completions.create({
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
    console.error('OpenAI API error:', error)
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
}) {
  try {
    const completion = await openai.chat.completions.create({
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
    console.error('OpenAI API error:', error)
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
}) {
  try {
    const completion = await openai.chat.completions.create({
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
    console.error('OpenAI API error:', error)
    return "Keep pushing forward! Every step you take brings you closer to your goals. Your consistency is building the foundation for your success."
  }
}

export default openai