import { NextRequest, NextResponse } from 'next/server'
import openai from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL is required' },
        { status: 400 }
      )
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    // Use OpenAI to analyze the URL content
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a learning resource analyzer. Analyze the given URL and extract information about the learning resource.
          
          Return a JSON object with the following structure:
          {
            "title": "Extracted title of the resource",
            "description": "Brief description of what the resource covers",
            "type": "ARTICLE" | "VIDEO" | "TUTORIAL" | "COURSE" | "BOOK" | "PROJECT" | "PODCAST",
            "difficulty": "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT",
            "estimatedTime": number (in minutes),
            "tags": ["tag1", "tag2", "tag3"],
            "source": "Source name (e.g., React.dev, YouTube, etc.)"
          }
          
          Guidelines:
          - Estimate time based on content length and complexity
          - Choose appropriate difficulty level based on content
          - Extract relevant tags from the content
          - Identify the source/platform
          - For YouTube URLs, estimate time based on video length if available
          - For articles, estimate 2-5 minutes per 1000 words
          - For courses, estimate based on number of modules/lessons
          - If you cannot access the content, make reasonable estimates based on the URL structure and domain`
        },
        {
          role: "user",
          content: `Please analyze this learning resource URL: ${url}
          
          If this is a YouTube URL, consider it a VIDEO type.
          If this is a documentation site (like docs, react.dev, etc.), consider it an ARTICLE or TUTORIAL.
          If this is a course platform (like Udemy, Coursera, etc.), consider it a COURSE.
          If this is a GitHub repository, consider it a PROJECT.
          If this is a podcast platform, consider it a PODCAST.`
        }
      ],
      temperature: 0.3,
      max_tokens: 500,
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from OpenAI')
    }

    // Parse the JSON response
    const analysis = JSON.parse(content)

    // Validate the response structure
    const requiredFields = ['title', 'description', 'type', 'difficulty', 'estimatedTime', 'tags', 'source']
    for (const field of requiredFields) {
      if (!analysis[field]) {
        throw new Error(`Missing required field: ${field}`)
      }
    }

    return NextResponse.json({
      success: true,
      analysis
    })
  } catch (error) {
    console.error('Error analyzing URL:', error)
    
    // Return a fallback analysis if OpenAI fails
    return NextResponse.json({
      success: true,
      analysis: {
        title: 'Learning Resource',
        description: 'A valuable learning resource for your professional development',
        type: 'ARTICLE',
        difficulty: 'INTERMEDIATE',
        estimatedTime: 30,
        tags: ['Learning', 'Development'],
        source: 'External Resource'
      }
    })
  }
}
