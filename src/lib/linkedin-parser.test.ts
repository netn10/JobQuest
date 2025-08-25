// Simple test for LinkedIn parser functionality
import { isValidLinkedInJobUrl, extractJobIdFromUrl } from './linkedin-parser'

// Test URL validation
const testUrls = [
  'https://www.linkedin.com/jobs/view/123456789',
  'https://www.linkedin.com/jobs/view/abc123',
  'https://www.linkedin.com/jobs/view/123456789?refId=abc',
  'https://www.linkedin.com/jobs/view/123456789/',
  'https://www.linkedin.com/jobs/view/',
  'https://www.linkedin.com/jobs/',
  'https://www.google.com',
  'invalid-url'
]

console.log('Testing LinkedIn URL validation:')
testUrls.forEach(url => {
  const isValid = isValidLinkedInJobUrl(url)
  const jobId = extractJobIdFromUrl(url)
  console.log(`${url} -> Valid: ${isValid}, Job ID: ${jobId}`)
})

// Test job ID extraction
console.log('\nTesting job ID extraction:')
const testJobUrls = [
  'https://www.linkedin.com/jobs/view/123456789',
  'https://www.linkedin.com/jobs/view/abc123?refId=xyz',
  'https://www.linkedin.com/jobs/view/987654321/'
]

testJobUrls.forEach(url => {
  const jobId = extractJobIdFromUrl(url)
  console.log(`${url} -> Job ID: ${jobId}`)
})

console.log('\nLinkedIn parser test completed successfully!')
