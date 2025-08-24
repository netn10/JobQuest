interface LinkedInJobData {
  company: string
  role: string
  location?: string
  salary?: string
  description?: string
  jobUrl: string
}

export async function parseLinkedInJob(linkedinUrl: string): Promise<LinkedInJobData> {
  try {
    // Validate URL format
    const linkedinJobRegex = /^https:\/\/www\.linkedin\.com\/jobs\/view\/[^\/]+/
    if (!linkedinJobRegex.test(linkedinUrl)) {
      throw new Error('Invalid LinkedIn job URL format')
    }

    // In a production environment, you would:
    // 1. Use a headless browser (Puppeteer/Playwright) to load the page
    // 2. Wait for the content to load
    // 3. Extract data using selectors
    // 4. Handle rate limiting and anti-bot measures
    
    // For now, we'll return mock data based on the URL
    // This is a placeholder implementation
    
    const urlParts = linkedinUrl.split('/')
    const jobId = urlParts[urlParts.length - 1]
    
    // Generate different mock data based on job ID to simulate variety
    const mockCompanies = [
      'Google',
      'Microsoft',
      'Apple',
      'Amazon',
      'Meta',
      'Netflix',
      'Twitter',
      'Uber',
      'Airbnb',
      'Stripe',
      'Shopify',
      'Slack',
      'Zoom',
      'Salesforce',
      'Adobe'
    ]
    
    const mockRoles = [
      'Senior Software Engineer',
      'Frontend Developer',
      'Backend Engineer',
      'Full Stack Developer',
      'DevOps Engineer',
      'Data Scientist',
      'Product Manager',
      'UX Designer',
      'Mobile Developer',
      'Cloud Engineer',
      'Security Engineer',
      'Machine Learning Engineer'
    ]
    
    const mockLocations = [
      'San Francisco, CA',
      'New York, NY',
      'Seattle, WA',
      'Austin, TX',
      'Boston, MA',
      'Denver, CO',
      'Chicago, IL',
      'Los Angeles, CA',
      'Remote',
      'San Francisco, CA (Hybrid)',
      'New York, NY (On-site)',
      'Seattle, WA (Remote-first)'
    ]
    
    const mockSalaries = [
      '$120,000 - $180,000',
      '$100,000 - $150,000',
      '$150,000 - $220,000',
      '$80,000 - $130,000',
      '$200,000 - $300,000',
      '$90,000 - $140,000',
      '$130,000 - $190,000',
      '$110,000 - $170,000'
    ]
    
    // Use job ID to generate consistent mock data for the same URL
    const hash = jobId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0)
      return a & a
    }, 0)
    
    const companyIndex = Math.abs(hash) % mockCompanies.length
    const roleIndex = Math.abs(hash >> 8) % mockRoles.length
    const locationIndex = Math.abs(hash >> 16) % mockLocations.length
    const salaryIndex = Math.abs(hash >> 24) % mockSalaries.length
    
    const mockData: LinkedInJobData = {
      company: mockCompanies[companyIndex],
      role: mockRoles[roleIndex],
      location: mockLocations[locationIndex],
      salary: mockSalaries[salaryIndex],
      description: `We are seeking a talented ${mockRoles[roleIndex]} to join our growing team at ${mockCompanies[companyIndex]}.

Key Responsibilities:
• Develop and maintain scalable applications
• Collaborate with cross-functional teams
• Write clean, maintainable code
• Participate in code reviews and technical discussions
• Contribute to architectural decisions

Requirements:
• 3+ years of experience in software development
• Proficiency in modern programming languages
• Experience with cloud platforms and databases
• Strong problem-solving and communication skills
• Bachelor's degree in Computer Science or related field

Benefits:
• Competitive salary and equity
• Comprehensive health benefits
• Flexible work arrangements
• Professional development opportunities
• Collaborative and inclusive work environment

This is an exciting opportunity to work on cutting-edge technology and make a real impact in a fast-growing company.`,
      jobUrl: linkedinUrl
    }

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    return mockData
  } catch (error) {
    console.error('Error parsing LinkedIn job:', error)
    throw new Error('Failed to parse LinkedIn job data')
  }
}

// Helper function to validate LinkedIn URLs
export function isValidLinkedInJobUrl(url: string): boolean {
  const linkedinJobRegex = /^https:\/\/www\.linkedin\.com\/jobs\/view\/[^\/]+/
  return linkedinJobRegex.test(url)
}

// Helper function to extract job ID from LinkedIn URL
export function extractJobIdFromUrl(url: string): string | null {
  const match = url.match(/\/jobs\/view\/([^\/\?]+)/)
  return match ? match[1] : null
}
