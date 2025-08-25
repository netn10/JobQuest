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
      return NextResponse.json({ error: 'Invalid LinkedIn job URL format. Please use: https://www.linkedin.com/jobs/view/[job-id]' }, { status: 400 })
    }

    try {
      console.log('Starting LinkedIn job parsing for URL:', linkedinUrl)
      
      // Parse the LinkedIn job data using real web scraping
      const jobData = await parseLinkedInJob(linkedinUrl)
      
      console.log('Parsed job data:', jobData)

      // Validate that we got meaningful data - be more lenient if we have at least a role
      if (!jobData.role) {
        console.log('Missing required job data - company:', jobData.company, 'role:', jobData.role)
        return NextResponse.json({ 
          error: 'Unable to extract job information from the LinkedIn page. The job posting might be private, expired, or the page structure has changed. Please try manual entry instead.' 
        }, { status: 400 })
      }

      // If we have a role but no company, provide a helpful message
      if (!jobData.company) {
        console.log('Partial data extracted - role found but company missing')
        return NextResponse.json({
          success: true,
          data: jobData,
          message: 'Partial job data extracted. Company name could not be found automatically. Please review and complete the information manually.',
          partial: true
        })
      }

      return NextResponse.json({
        success: true,
        data: jobData,
        message: 'Job data extracted successfully from LinkedIn'
      })
    } catch (error) {
      console.error('Error parsing LinkedIn job:', error)
      
      // Provide more specific error messages
      if (error instanceof Error) {
        console.log('Error message:', error.message)
        
        if (error.message.includes('Failed to scrape')) {
          return NextResponse.json({ 
            error: 'Unable to access the LinkedIn job posting. This might be due to LinkedIn blocking automated access. Please try manual entry instead.' 
          }, { status: 400 })
        }
        if (error.message.includes('Unable to extract job information')) {
          return NextResponse.json({ 
            error: 'Could not find job information on the LinkedIn page. The job might be private, expired, or the page structure has changed. Please try manual entry instead.' 
          }, { status: 400 })
        }
        if (error.message.includes('timeout')) {
          return NextResponse.json({ 
            error: 'Request timed out while accessing LinkedIn. Please try again or use manual entry instead.' 
          }, { status: 408 })
        }
        if (error.message.includes('Invalid LinkedIn job URL format')) {
          return NextResponse.json({ 
            error: 'Invalid LinkedIn job URL format. Please use: https://www.linkedin.com/jobs/view/[job-id]' 
          }, { status: 400 })
        }
      }
      
      return NextResponse.json({ 
        error: 'Failed to extract job data from LinkedIn. This is likely due to LinkedIn blocking automated access. Please use manual entry instead.' 
      }, { status: 400 })
    }

  } catch (error) {
    console.error('Error analyzing LinkedIn job:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}