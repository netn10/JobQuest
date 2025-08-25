import { NextRequest, NextResponse } from 'next/server'
import { getAuthHeaders } from '@/lib/auth'
import { parseLinkedInJobMock, isValidLinkedInJobUrl } from '@/lib/linkedin-parser-mock'

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
      return NextResponse.json({ error: 'Invalid LinkedIn job URL format. Please use: https://www.linkedin.com/jobs/view/[job-id]' }, { status: 400 })
    }

    try {
      console.log('Testing LinkedIn job parsing with mock data for URL:', linkedinUrl)
      
      // Use mock parser for testing
      const jobData = await parseLinkedInJobMock(linkedinUrl)
      
      console.log('Mock job data:', jobData)

      return NextResponse.json({
        success: true,
        data: jobData,
        message: 'Mock job data generated successfully for testing'
      })
    } catch (error) {
      console.error('Error with mock LinkedIn job parsing:', error)
      
      return NextResponse.json({ 
        error: 'Mock parsing failed. This should not happen in normal operation.' 
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Error in test analyze endpoint:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
