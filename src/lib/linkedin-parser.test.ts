import { parseLinkedInJob, isValidLinkedInJobUrl, extractJobIdFromUrl } from './linkedin-parser'

// Simple test function to verify LinkedIn parser functionality
export async function testLinkedInParser() {
  console.log('Testing LinkedIn Parser...')
  
  // Test URL validation
  const validUrl = 'https://www.linkedin.com/jobs/view/1234567890'
  const invalidUrl = 'https://example.com/jobs/view/1234567890'
  
  console.log('URL Validation Tests:')
  console.log(`Valid URL: ${isValidLinkedInJobUrl(validUrl)}`) // Should be true
  console.log(`Invalid URL: ${isValidLinkedInJobUrl(invalidUrl)}`) // Should be false
  
  // Test job ID extraction
  console.log('\nJob ID Extraction Tests:')
  console.log(`Job ID from valid URL: ${extractJobIdFromUrl(validUrl)}`) // Should be '1234567890'
  console.log(`Job ID from invalid URL: ${extractJobIdFromUrl(invalidUrl)}`) // Should be null
  
  // Test job parsing
  console.log('\nJob Parsing Tests:')
  try {
    const jobData = await parseLinkedInJob(validUrl)
    console.log('Parsed Job Data:')
    console.log(`Company: ${jobData.company}`)
    console.log(`Role: ${jobData.role}`)
    console.log(`Location: ${jobData.location}`)
    console.log(`Salary: ${jobData.salary}`)
    console.log(`Description length: ${jobData.description?.length} characters`)
    console.log(`Job URL: ${jobData.jobUrl}`)
  } catch (error) {
    console.error('Error parsing job:', error)
  }
  
  // Test with different URLs to ensure consistent data
  console.log('\nConsistency Tests:')
  const url1 = 'https://www.linkedin.com/jobs/view/test-job-1'
  const url2 = 'https://www.linkedin.com/jobs/view/test-job-2'
  
  try {
    const job1 = await parseLinkedInJob(url1)
    const job2 = await parseLinkedInJob(url2)
    
    console.log(`Same URL returns same data: ${job1.company === job1.company}`)
    console.log(`Different URLs return different data: ${job1.company !== job2.company}`)
  } catch (error) {
    console.error('Error in consistency tests:', error)
  }
  
  console.log('\nLinkedIn Parser Tests Complete!')
}

// Run tests if this file is executed directly
if (typeof window === 'undefined') {
  testLinkedInParser().catch(console.error)
}
