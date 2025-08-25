import { NextRequest, NextResponse } from 'next/server'
import { generateRandomLearningResources } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { subject, count = 5 } = body

    if (!subject || typeof subject !== 'string') {
      return NextResponse.json({ error: 'Subject is required and must be a string' }, { status: 400 })
    }

    if (count && (typeof count !== 'number' || count < 1 || count > 10)) {
      return NextResponse.json({ error: 'Count must be a number between 1 and 10' }, { status: 400 })
    }

    console.log('Generating random learning resources for subject:', subject, 'count:', count)
    
    try {
      const resources = await generateRandomLearningResources({
        subject: subject.trim(),
        count: count || 5
      })
      
      console.log('Generated resources:', resources.length)

      return NextResponse.json({
        success: true,
        resources,
        message: `Generated ${resources.length} learning resources about "${subject}"`
      })
    } catch (error) {
      console.error('Error generating random resources:', error)
      
      // Handle specific error for non-software subjects
      if (error instanceof Error && error.message === 'SUBJECT_NOT_SOFTWARE_RELATED') {
        return NextResponse.json({ 
          error: 'SUBJECT_NOT_SOFTWARE_RELATED',
          message: `"${subject}" doesn't appear to be software or technology related. Please try subjects like: React, Python, Machine Learning, Web Development, Cybersecurity, DevOps, etc.`
        }, { status: 400 })
      }
      
      return NextResponse.json({ 
        error: 'Failed to generate learning resources. Please try again with a different subject.' 
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Error in random resources endpoint:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
