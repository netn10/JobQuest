# JobQuest Troubleshooting Guide

## Common Issues and Solutions

### 1. LinkedIn Job Analyzer Returns 400 Error

**Problem**: The `/api/jobs/analyze` endpoint returns a 400 status code.

**Solutions**:

#### A. Missing Environment Variables
- **Cause**: The application requires environment variables to be set up.
- **Solution**: 
  1. Run the setup script: `powershell -ExecutionPolicy Bypass -File scripts/setup-env.ps1`
  2. Edit the `.env` file and add your OpenAI API key (optional but recommended)
  3. Restart the development server

#### B. Puppeteer Issues on Windows
- **Cause**: Puppeteer may have issues running on Windows systems.
- **Solution**:
  1. Make sure you have the latest version of Node.js installed
  2. Try running: `npm install puppeteer --force`
  3. If issues persist, the application will still work without web scraping (manual entry mode)

#### C. Invalid LinkedIn URL Format
- **Cause**: The URL doesn't match the expected LinkedIn job format.
- **Solution**: Use URLs in the format: `https://www.linkedin.com/jobs/view/[job-id]`

### 2. OpenAI API Key Issues

**Problem**: AI features are not working or returning errors.

**Solutions**:
- Get your API key from: https://platform.openai.com/api-keys
- Add it to the `.env` file: `OPENAI_API_KEY="your-key-here"`
- The application will work without the API key, but AI enhancement features will be disabled

### 3. Database Issues

**Problem**: Database errors or missing data.

**Solutions**:
1. Reset the database: `npm run db:reset`
2. Generate Prisma client: `npm run db:generate`
3. Push schema changes: `npm run db:push`
4. Seed initial data: `npm run db:seed`

### 4. Development Server Issues

**Problem**: Server won't start or crashes.

**Solutions**:
1. Clear Next.js cache: `rm -rf .next`
2. Reinstall dependencies: `rm -rf node_modules && npm install`
3. Check Node.js version (requires 18+): `node --version`
4. Try running without Turbopack: `next dev` instead of `npm run dev`

### 5. Authentication Issues

**Problem**: Login/registration not working.

**Solutions**:
1. Clear browser localStorage
2. Check browser console for errors
3. Verify the auth API endpoints are working
4. Check if the database is properly seeded

## Environment Setup Checklist

- [ ] Node.js 18+ installed
- [ ] Dependencies installed (`npm install`)
- [ ] Environment variables configured (`.env` file)
- [ ] Database set up (`npm run db:push`)
- [ ] Development server running (`npm run dev`)

## Testing the Application

1. **Basic Functionality**:
   - Visit http://localhost:3000
   - Register a new account
   - Create a focus mission
   - Add a job application

2. **LinkedIn Integration**:
   - Go to Jobs page
   - Try adding a LinkedIn job URL
   - If web scraping fails, use manual entry mode

3. **AI Features** (requires OpenAI API key):
   - Check learning recommendations
   - Test job analysis features
   - Verify motivational messages

## Getting Help

If you're still experiencing issues:

1. Check the browser console for error messages
2. Look at the terminal output for server errors
3. Verify all environment variables are set correctly
4. Try the troubleshooting steps above
5. Check the application logs for more detailed error information

## Performance Tips

- Use manual job entry if LinkedIn scraping is slow
- Disable AI features if you don't have an OpenAI API key
- Clear browser cache if the UI seems slow
- Restart the development server if it becomes unresponsive
