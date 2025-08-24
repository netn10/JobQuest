import { NextRequest, NextResponse } from 'next/server'
import { getAuthHeaders } from '@/lib/auth'
import { parseLinkedInJob, isValidLinkedInJobUrl } from '@/lib/linkedin-parser'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { linkedinUrl } = body

    if (!linkedinUrl) {
      return NextResponse.json({ error: 'LinkedIn URL is required' }, { status: 400 })
    }

    // Validate LinkedIn URL format
    if (!isValidLinkedInJobUrl(linkedinUrl)) {
      return NextResponse.json({ error: 'Invalid LinkedIn job URL format' }, { status: 400 })
    }

    try {
      // Parse the LinkedIn job data
      const jobData = await parseLinkedInJob(linkedinUrl)

      return NextResponse.json({
        success: true,
        data: jobData,
        message: 'Job data extracted successfully'
      })
    } catch (error) {
      console.error('Error parsing LinkedIn job:', error)
      return NextResponse.json({ 
        error: error instanceof Error ? error.message : 'Failed to parse LinkedIn job' 
      }, { status: 400 })
    }

  } catch (error) {
    console.error('Error analyzing LinkedIn job:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}