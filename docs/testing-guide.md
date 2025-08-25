# JobQuest Testing Guide

## Testing the LinkedIn Job Analyzer

### Current Status
The LinkedIn job analyzer is experiencing issues with web scraping due to LinkedIn's anti-bot measures. However, the application has been updated to handle these failures gracefully.

### How to Test

#### 1. Test the Basic Application
1. Start the development server: `npm run dev`
2. Visit http://localhost:3000
3. Register a new account or log in
4. Navigate to the Jobs page
5. Click "Add Application"

#### 2. Test LinkedIn Import (Expected to Fail Gracefully)
1. In the job application modal, you'll see a LinkedIn import section
2. Try pasting a LinkedIn job URL like: `https://www.linkedin.com/jobs/view/123456789`
3. Click "Import"
4. **Expected Result**: You should see a helpful error message saying LinkedIn is blocking access
5. **Expected Behavior**: The job URL field should be pre-filled with your LinkedIn URL
6. You can then manually enter the job details

#### 3. Test Manual Job Entry
1. Fill in the job details manually:
   - Company: "Example Company"
   - Role: "Software Engineer"
   - Location: "San Francisco, CA"
   - Salary: "$120,000 - $150,000"
   - Description: "Job description here"
2. Click "Save"
3. **Expected Result**: Job application should be saved successfully

#### 4. Test the Mock Endpoint (Optional)
If you want to test the frontend integration with mock data:

1. Temporarily change the import URL in the modal from `/api/jobs/analyze` to `/api/jobs/analyze-test`
2. Try importing a LinkedIn URL
3. **Expected Result**: You should see mock job data populated in the form

### Troubleshooting

#### If you still get 400 errors:
1. Check the browser console for detailed error messages
2. Check the terminal where the dev server is running for server-side logs
3. Verify that the `.env` file exists and has the required variables

#### If the application doesn't start:
1. Make sure all dependencies are installed: `npm install`
2. Check Node.js version (requires 18+): `node --version`
3. Try clearing the cache: `rm -rf .next && npm run dev`

#### If database issues occur:
1. Reset the database: `npm run db:reset`
2. Generate Prisma client: `npm run db:generate`
3. Push schema changes: `npm run db:push`

### Expected Behavior Summary

✅ **Working Features:**
- User registration and login
- Manual job application entry
- Job application management (view, edit, delete)
- Basic application functionality

⚠️ **Limited Features:**
- LinkedIn job import (blocked by LinkedIn's anti-bot measures)
- AI enhancement (requires OpenAI API key)

🔄 **Fallback Options:**
- Manual job entry when LinkedIn import fails
- Graceful error handling with helpful messages
- Pre-filled job URL field when import fails

### Next Steps

1. **For Production Use**: Consider implementing alternative job data sources
2. **For Development**: The mock endpoint can be used for testing the UI
3. **For AI Features**: Add your OpenAI API key to the `.env` file

### Support

If you encounter any issues:
1. Check the troubleshooting guide: `docs/troubleshooting.md`
2. Look at the server logs in the terminal
3. Check the browser console for client-side errors
4. Verify all environment variables are set correctly
