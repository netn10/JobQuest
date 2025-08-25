// Mock LinkedIn parser for testing and fallback purposes
// This provides sample data when real LinkedIn scraping is unavailable

interface LinkedInJobData {
  company: string
  role: string
  location?: string
  salary?: string
  description?: string
  jobUrl: string
}

// Mock job data for testing
const mockJobData: LinkedInJobData = {
  company: 'Example Company',
  role: 'Software Engineer',
  location: 'San Francisco, CA (Remote)',
  salary: '$120,000 - $150,000',
  description: 'We are looking for a talented Software Engineer to join our team. You will be responsible for developing and maintaining our web applications using modern technologies.',
  jobUrl: 'https://www.linkedin.com/jobs/view/example-123'
}

export async function parseLinkedInJobMock(linkedinUrl: string): Promise<LinkedInJobData> {
  // Simulate some processing time
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Return mock data with the provided URL
  return {
    ...mockJobData,
    jobUrl: linkedinUrl
  }
}

export function isValidLinkedInJobUrl(url: string): boolean {
  const linkedinJobRegex = /^https:\/\/www\.linkedin\.com\/jobs\/view\/[^\/]+/
  return linkedinJobRegex.test(url)
}

export function extractJobIdFromUrl(url: string): string | null {
  const match = url.match(/\/jobs\/view\/([^\/\?]+)/)
  return match ? match[1] : null
}
