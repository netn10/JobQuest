import puppeteer from 'puppeteer'
import * as cheerio from 'cheerio'

interface LinkedInJobData {
  company: string
  role: string
  location?: string
  salary?: string
  description?: string
  jobUrl: string
  workArrangement?: string
  employmentType?: string
  experience?: string
  industry?: string
  benefits?: string[]
  skills?: string[]
  postedDate?: string
}

// Function to scrape LinkedIn job posting content using Puppeteer
async function scrapeLinkedInJob(url: string): Promise<string> {
  let browser: any | null = null
  
  try {
    // Launch browser in headless mode with Windows-compatible settings
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ],
      // Windows-specific settings
      executablePath: process.platform === 'win32' ? undefined : undefined,
      ignoreDefaultArgs: ['--disable-extensions']
    })

    const page = await browser.newPage()
    
    // Set user agent to avoid detection
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
    
    // Set viewport
    await page.setViewport({ width: 1920, height: 1080 })
    
    // Navigate to the LinkedIn job page
    await page.goto(url, { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    })
    
    // Wait for the job content to load
    await page.waitForSelector('.job-details-jobs-unified-top-card__job-title, h1', { timeout: 10000 })
    
    // Get the page content
    const content = await page.content()
    
    
    return content
  } catch (error) {
    console.error('Error scraping LinkedIn job:', error)
    throw new Error('Failed to scrape job posting content')
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}

// Function to extract job content from HTML using Cheerio
function extractJobContentFromHTML(html: string, url: string): LinkedInJobData {
  const $ = cheerio.load(html)
  
  // Extract job title
  let jobTitle = ''
  const titleSelectors = [
    '.top-card-layout__title',
    '.job-details-jobs-unified-top-card__job-title',
    'h1[data-test-id="job-details-jobs-unified-top-card__job-title"]',
    'h1',
    '.job-details-jobs-unified-top-card__job-title h1',
    '.decorated-job-posting__job-title'
  ]
  
  for (const selector of titleSelectors) {
    const element = $(selector).first()
    if (element.length > 0) {
      jobTitle = element.text().trim()
      break
    }
  }
  
  // Extract company name - updated selectors for current LinkedIn structure
  let companyName = ''
  const companySelectors = [
    '.job-details-jobs-unified-top-card__company-name',
    'a[data-test-id="job-details-jobs-unified-top-card__company-name"]',
    '.job-details-jobs-unified-top-card__company-name a',
    '.job-details-jobs-unified-top-card__company-name span',
    // New selectors for updated LinkedIn structure
    '[data-test-id="job-details-jobs-unified-top-card__company-name"]',
    '.job-details-jobs-unified-top-card__company-name',
    '.job-details-jobs-unified-top-card__company-name a',
    '.job-details-jobs-unified-top-card__company-name span',
    // Alternative selectors
    '.job-details-jobs-unified-top-card__company',
    '.job-details-jobs-unified-top-card__company a',
    '.job-details-jobs-unified-top-card__company span',
    // More generic selectors
    'a[href*="/company/"]',
    '.job-details-jobs-unified-top-card a[href*="/company/"]',
    // Fallback selectors
    '.job-details-jobs-unified-top-card__company-name, .job-details-jobs-unified-top-card__company',
    'a[data-test-id*="company"]',
    '.job-details-jobs-unified-top-card [data-test-id*="company"]'
  ]
  
  for (const selector of companySelectors) {
    const element = $(selector).first()
    if (element.length > 0) {
      companyName = element.text().trim()
      if (companyName) {
        console.log('Found company name with selector:', selector, 'Value:', companyName)
        break
      }
    }
  }
  
  // Extract location and work arrangement
  let location = ''
  let workArrangement = ''
  const locationSelectors = [
    '.job-details-jobs-unified-top-card__primary-description-container .job-details-jobs-unified-top-card__bullet',
    '.job-details-jobs-unified-top-card__bullet',
    'span[data-test-id="job-details-jobs-unified-top-card__bullet"]',
    '.job-details-jobs-unified-top-card__location',
    '.job-details-jobs-unified-top-card__bullet span',
    '.job-details-jobs-unified-top-card__primary-description-container span:contains("·")',
    '.job-details-jobs-unified-top-card__primary-description .job-details-jobs-unified-top-card__bullet',
    '[data-test-id="job-details-jobs-unified-top-card__primary-description"] .job-details-jobs-unified-top-card__bullet'
  ]
  
  // Try to find location info - also check all location-related elements
  const allLocationElements = $('*[class*="location"]')
  
  allLocationElements.each((i, el) => {
    if (!location) {
      const text = $(el).text().trim()
      if (text && text.match(/[A-Za-z\s]+,\s*[A-Z]{2}|[A-Za-z\s]+,\s*[A-Za-z\s]+|Remote|Hybrid|On-site/i)) {
        location = text
      }
    }
  })
  
  // Try standard selectors if not found
  if (!location) {
    for (const selector of locationSelectors) {
      const elements = $(selector)
      elements.each((i, el) => {
        const text = $(el).text().trim()
        if (text && !location) {
          // Check if this looks like a location (contains city/state patterns)
          if (text.match(/[A-Za-z\s]+,\s*[A-Z]{2}|[A-Za-z\s]+,\s*[A-Za-z\s]+|Remote|Hybrid|On-site/i)) {
            location = text
          }
        }
      })
      if (location) break
    }
  }
  
  // Extract work arrangement separately
  const workArrangementSelectors = [
    '.job-details-jobs-unified-top-card__workplace-type',
    '[data-test-id="job-details-jobs-unified-top-card__workplace-type"]',
    '.job-details-jobs-unified-top-card__primary-description-container span:contains("Remote")',
    '.job-details-jobs-unified-top-card__primary-description-container span:contains("Hybrid")',
    '.job-details-jobs-unified-top-card__primary-description-container span:contains("On-site")'
  ]
  
  for (const selector of workArrangementSelectors) {
    const element = $(selector).first()
    if (element.length > 0) {
      const text = element.text().trim()
      if (text.match(/Remote|Hybrid|On-site/i)) {
        workArrangement = text
        break
      }
    }
  }
  
  // Extract salary information
  let salary = ''
  const salarySelectors = [
    '.job-details-jobs-unified-top-card__salary-info',
    '.job-details-jobs-unified-top-card__salary',
    '[data-test-id="job-details-jobs-unified-top-card__salary-info"]',
    '.job-details-jobs-unified-top-card__compensation'
  ]
  
  for (const selector of salarySelectors) {
    const element = $(selector).first()
    if (element.length > 0) {
      salary = element.text().trim()
      break
    }
  }
  
  // Extract job description - try multiple selectors and get the longest/most detailed one
  let description = ''
  const descriptionSelectors = [
    '.decorated-job-posting__details',
    '.jobs-description__content .jobs-description-content__text',
    '.jobs-description-content__text', 
    '.job-details-jobs-unified-top-card__job-description',
    '.jobs-description .jobs-description-content__text',
    '.job-description',
    '[data-test-id="job-details-jobs-unified-top-card__job-description"]',
    '.job-details-jobs-unified-top-card__description',
    '.jobs-box__html-content',
    '.jobs-description__content',
    '#job-details .jobs-description-content__text',
    '.jobs-description-details .jobs-description-content__text'
  ]
  
  let bestDescription = ''
  
  // First try all description-related elements
  const allDescriptionElements = $('*[class*="description"]')
  
  allDescriptionElements.each((i, el) => {
    const text = $(el).text().trim()
    if (text.length > bestDescription.length && text.length > 50) { // Only consider substantial text
      bestDescription = text
    }
  })
  
  // Try standard selectors if not found
  if (!bestDescription) {
    for (const selector of descriptionSelectors) {
      const element = $(selector).first()
      if (element.length > 0) {
        const text = element.text().trim()
        // Take the longest description found
        if (text.length > bestDescription.length) {
          bestDescription = text
        }
      }
    }
  }
  description = bestDescription
  
  // Clean up the extracted data
  const cleanText = (text: string) => {
    return text
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '\n')
      .trim()
  }

  // Fallback: Try to extract company name from URL if not found in HTML
  let finalCompanyName = cleanText(companyName)
  if (!finalCompanyName) {
    // Try to extract from URL patterns
    const urlMatch = url.match(/\/company\/([^\/\?]+)/)
    if (urlMatch) {
      finalCompanyName = urlMatch[1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      console.log('Extracted company name from URL:', finalCompanyName)
    }
  }
  
  // Extract additional job details
  let employmentType = ''
  const employmentTypeSelectors = [
    '.job-details-jobs-unified-top-card__job-insight .job-details-jobs-unified-top-card__job-insight-text:contains("Full-time")',
    '.job-details-jobs-unified-top-card__job-insight .job-details-jobs-unified-top-card__job-insight-text:contains("Part-time")',
    '.job-details-jobs-unified-top-card__job-insight .job-details-jobs-unified-top-card__job-insight-text:contains("Contract")',
    '.job-details-jobs-unified-top-card__job-insight .job-details-jobs-unified-top-card__job-insight-text:contains("Internship")',
    '.job-details-jobs-unified-top-card__job-insight-text',
    '[data-test-id="job-details-jobs-unified-top-card__job-insight"] span'
  ]
  
  for (const selector of employmentTypeSelectors) {
    const element = $(selector).first()
    if (element.length > 0) {
      const text = element.text().trim()
      if (text.match(/Full-time|Part-time|Contract|Internship|Temporary/i)) {
        employmentType = text
        break
      }
    }
  }
  
  // Extract experience level
  let experience = ''
  const experienceSelectors = [
    '.job-details-jobs-unified-top-card__job-insight .job-details-jobs-unified-top-card__job-insight-text:contains("level")',
    '.job-details-jobs-unified-top-card__job-insight .job-details-jobs-unified-top-card__job-insight-text:contains("Entry")',
    '.job-details-jobs-unified-top-card__job-insight .job-details-jobs-unified-top-card__job-insight-text:contains("Mid")',
    '.job-details-jobs-unified-top-card__job-insight .job-details-jobs-unified-top-card__job-insight-text:contains("Senior")',
    '.job-details-jobs-unified-top-card__job-insight .job-details-jobs-unified-top-card__job-insight-text:contains("Director")',
    '.job-details-jobs-unified-top-card__job-insight .job-details-jobs-unified-top-card__job-insight-text:contains("Executive")',
    '.job-details-jobs-unified-top-card__job-insight-text'
  ]
  
  for (const selector of experienceSelectors) {
    const element = $(selector).first()
    if (element.length > 0) {
      const text = element.text().trim()
      if (text.match(/Entry|Associate|Mid|Senior|Lead|Principal|Director|Executive|Manager.*level|.*level/i)) {
        experience = text
        break
      }
    }
  }
  
  // Extract skills from job posting
  let skills: string[] = []
  const skillsSelectors = [
    '.job-details-jobs-unified-top-card__job-insight .job-details-jobs-unified-top-card__job-insight-text:contains("skills")',
    '.jobs-unified-top-card__job-insight .jobs-unified-top-card__job-insight-text',
    '.job-details-jobs-unified-top-card__skills',
    '.jobs-search-results__list-item .job-details-jobs-unified-top-card__job-insight'
  ]
  
  for (const selector of skillsSelectors) {
    const elements = $(selector)
    elements.each((i, el) => {
      const text = $(el).text().trim()
      // Extract skill-like keywords from text
      if (text.toLowerCase().includes('skill')) {
        const skillMatches = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g)
        if (skillMatches) {
          skills.push(...skillMatches.filter(skill => skill.length > 2))
        }
      }
    })
  }
  
  // Extract posted date
  let postedDate = ''
  const postedDateSelectors = [
    '.job-details-jobs-unified-top-card__primary-description-container time',
    '.jobs-unified-top-card__subtitle-secondary-grouping time',
    'time[datetime]',
    '.job-details-jobs-unified-top-card__primary-description time'
  ]
  
  for (const selector of postedDateSelectors) {
    const element = $(selector).first()
    if (element.length > 0) {
      postedDate = element.attr('datetime') || element.text().trim()
      break
    }
  }
  
  return {
    company: finalCompanyName,
    role: cleanText(jobTitle),
    location: cleanText(location),
    salary: cleanText(salary),
    description: cleanText(description),
    jobUrl: url,
    workArrangement: cleanText(workArrangement),
    employmentType: cleanText(employmentType),
    experience: cleanText(experience),
    skills: skills.filter(skill => skill.trim().length > 0),
    postedDate: cleanText(postedDate)
  }
}

// Function to parse job data using OpenAI for additional processing
async function enhanceJobDataWithAI(jobData: LinkedInJobData): Promise<LinkedInJobData> {
  try {
    // If we have basic data, use AI to enhance and clean it
    if (jobData.company && jobData.role) {
      // Check if OpenAI API key is available
      if (!process.env.OPENAI_API_KEY) {
        console.warn('OpenAI API key not found. Skipping AI enhancement.')
        return jobData
      }
      
      const { default: openai } = await import('openai')
      
      const openaiClient = new openai({
        apiKey: process.env.OPENAI_API_KEY,
      })
      
      const completion = await openaiClient.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a job data cleaning expert. Clean and enhance extracted job data.
            
Return a JSON object with the following structure:
{
  "company": "string (cleaned company name)",
  "role": "string (cleaned job title)",
  "location": "string (cleaned location)",
  "workArrangement": "string (Remote/Hybrid/On-site)",
  "employmentType": "string (Full-time/Part-time/Contract/etc)",
  "experience": "string (experience level)",
  "salary": "string (cleaned salary info or null)",
  "description": "string (cleaned job description)",
  "skills": "array of strings (relevant skills mentioned)",
  "postedDate": "string (when job was posted)"
}

Guidelines:
- Clean and format company names (remove extra spaces, proper capitalization)
- Clean job titles (remove extra text, proper formatting)
- Separate location from work arrangement (Remote/Hybrid/On-site)
- Clean employment type (Full-time, Part-time, Contract, Internship, etc.)
- Extract experience level (Entry, Mid, Senior, etc.)
- Clean salary information if present
- Clean job descriptions by removing extra whitespace and formatting properly
- Extract relevant technical skills and soft skills mentioned
- Clean posted date information
- If any field is empty or unclear, use null or empty string
- Be conservative - don't add information that wasn't in the original data`
          },
          {
            role: "user",
            content: `Clean and enhance this extracted job data:

Company: ${jobData.company}
Role: ${jobData.role}
Location: ${jobData.location || 'Not found'}
Work Arrangement: ${jobData.workArrangement || 'Not found'}
Employment Type: ${jobData.employmentType || 'Not found'}
Experience Level: ${jobData.experience || 'Not found'}
Salary: ${jobData.salary || 'Not found'}
Description: ${jobData.description || 'Not found'}
Skills: ${jobData.skills?.join(', ') || 'Not found'}
Posted Date: ${jobData.postedDate || 'Not found'}

Please provide the cleaned data in JSON format.`
          }
        ],
        temperature: 0.1,
        max_tokens: 800,
      })

      const content = completion.choices[0]?.message?.content
      if (content) {
        try {
          const enhancedData = JSON.parse(content)
          return {
            ...jobData,
            company: enhancedData.company || jobData.company,
            role: enhancedData.role || jobData.role,
            location: enhancedData.location || jobData.location,
            workArrangement: enhancedData.workArrangement || jobData.workArrangement,
            employmentType: enhancedData.employmentType || jobData.employmentType,
            experience: enhancedData.experience || jobData.experience,
            salary: enhancedData.salary || jobData.salary,
            description: enhancedData.description || jobData.description,
            skills: enhancedData.skills || jobData.skills,
            postedDate: enhancedData.postedDate || jobData.postedDate
          }
        } catch (parseError) {
          console.error('Error parsing AI enhanced data:', parseError)
          return jobData
        }
      }
    }
    
    return jobData
  } catch (error) {
    console.error('Error enhancing job data with AI:', error)
    return jobData
  }
}

export async function parseLinkedInJob(linkedinUrl: string): Promise<LinkedInJobData> {
  try {
    // Validate URL format
    const linkedinJobRegex = /^https:\/\/www\.linkedin\.com\/jobs\/view\/[^\/]+/
    if (!linkedinJobRegex.test(linkedinUrl)) {
      throw new Error('Invalid LinkedIn job URL format')
    }

    // Scrape the actual LinkedIn job page
    const htmlContent = await scrapeLinkedInJob(linkedinUrl)
    
    // Extract job data from the HTML
    const extractedData = extractJobContentFromHTML(htmlContent, linkedinUrl)
    
    // Validate that we got meaningful data
    if (!extractedData.company && !extractedData.role) {
      throw new Error('Unable to extract job information from the LinkedIn page')
    }
    
    // Enhance the data with AI if we have basic information
    const enhancedData = await enhanceJobDataWithAI(extractedData)
    
    return enhancedData
    
  } catch (error) {
    console.error('Error parsing LinkedIn job:', error)
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('Invalid LinkedIn job URL format')) {
        throw new Error('Invalid LinkedIn job URL format. Please use: https://www.linkedin.com/jobs/view/[job-id]')
      }
      if (error.message.includes('Unable to extract job information')) {
        throw new Error('Unable to extract job information from the LinkedIn page. The job posting might be private, expired, or the page structure has changed.')
      }
      if (error.message.includes('Failed to scrape')) {
        throw new Error('Unable to access the LinkedIn job posting. Please check if the URL is correct and the job is still active.')
      }
      if (error.message.includes('timeout')) {
        throw new Error('Request timed out while accessing LinkedIn. Please try again or check your internet connection.')
      }
    }
    
    throw new Error('Failed to parse LinkedIn job data. Please try again or enter the information manually.')
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
