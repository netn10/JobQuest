import { NextRequest, NextResponse } from 'next/server'
import { analyzeLearningResource } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url } = body

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
    }

    try {
      console.log('Starting learning resource analysis for URL:', url)
      
      // Use AI to analyze the learning resource
      const analysis = await analyzeLearningResource(url)
      
      console.log('AI analysis result:', analysis)

      // Validate that we got meaningful data
      if (!analysis.title && !analysis.description) {
        console.log('Missing required analysis data')
        return NextResponse.json({ 
          error: 'Unable to analyze the learning resource. The content might be private, expired, or not accessible. Please try manual entry instead.' 
        }, { status: 400 })
      }

      // If we have partial data, provide a helpful message
      if (!analysis.title || !analysis.description) {
        console.log('Partial data extracted')
        return NextResponse.json({
          success: true,
          ...analysis,
          message: 'Partial analysis completed. Please review and complete the information manually.',
          partial: true
        })
      }

      return NextResponse.json({
        success: true,
        ...analysis,
        message: 'Learning resource analyzed successfully'
      })
    } catch (error) {
      console.error('Error analyzing learning resource:', error)
      
      // Provide more specific error messages
      if (error instanceof Error) {
        console.log('Error message:', error.message)
        
        if (error.message.includes('Failed to fetch')) {
          return NextResponse.json({ 
            error: 'Unable to access the learning resource. The URL might be invalid or the content might be private. Please try manual entry instead.' 
          }, { status: 400 })
        }
        if (error.message.includes('Unable to analyze')) {
          return NextResponse.json({ 
            error: 'Could not analyze the learning resource content. The page might be private, expired, or not accessible. Please try manual entry instead.' 
          }, { status: 400 })
        }
        if (error.message.includes('timeout')) {
          return NextResponse.json({ 
            error: 'Request timed out while analyzing the resource. Please try again or use manual entry instead.' 
          }, { status: 408 })
        }
      }
      
      return NextResponse.json({ 
        error: 'Failed to analyze the learning resource. Please use manual entry instead.' 
      }, { status: 400 })
    }

  } catch (error) {
    console.error('Error analyzing learning resource URL:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 