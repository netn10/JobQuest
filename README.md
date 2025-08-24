# JobQuest - Gamified Job Search Platform

JobQuest is a comprehensive gamified platform designed to help job seekers stay focused, track applications, learn new skills, and maintain motivation through game mechanics.

## Features

### 🎯 Focus & Mission Lock
- Timer-based or task-based focus sessions
- Temporarily block distracting apps or websites
- Pomodoro timer integration
- XP rewards for completed missions

### 🏆 Gamification & Achievements
- XP system with levels and progress tracking
- Unlockable badges and achievements
- Daily and weekly challenges with bonus XP
- Streak tracking and leaderboards

### 📝 Daily Notebook
- Quick journaling with markdown support
- Tagging system for easy categorization
- Search and filter capabilities
- Export functionality

### 📚 Suggested Daily Learning
- AI-powered personalized learning recommendations
- Integration with external learning platforms
- Progress tracking and skill development paths
- Interactive quizzes and retention testing

### 💼 Job Application Tracker
- Comprehensive application management
- Status tracking and follow-up reminders
- AI-powered job matching insights
- Resume and cover letter attachment

### 📊 Analytics Dashboard
- Visual progress tracking for XP and achievements
- Job application success metrics
- Learning analytics and time tracking
- Customizable performance insights

### 🔔 Smart Notifications
- Mission and learning reminders
- Achievement unlock celebrations
- Job application follow-up alerts
- Streak maintenance warnings

### 🤖 AI Integration
- ChatGPT-powered learning recommendations
- Job application analysis and insights
- Motivational message generation
- Skill gap analysis and suggestions

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: SQLite (development), PostgreSQL (production)
- **AI**: OpenAI GPT-3.5-turbo API
- **Authentication**: NextAuth.js
- **UI Components**: Radix UI, Lucide React
- **Forms**: React Hook Form, Zod validation

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- OpenAI API key (for AI features)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/job-quest.git
   cd job-quest
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` and add your API keys and configuration.

4. Set up the database:
   ```bash
   npx prisma db push
   npx prisma generate
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

Required environment variables:

- `DATABASE_URL`: Database connection string
- `OPENAI_API_KEY`: OpenAI API key for AI features
- `NEXTAUTH_SECRET`: Secret for NextAuth.js session encryption
- `NEXTAUTH_URL`: Base URL for authentication callbacks

## Project Structure

```
src/
├── app/                    # Next.js 14 app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard page
│   ├── missions/          # Focus missions
│   ├── jobs/              # Job tracker
│   ├── notebook/          # Daily notebook
│   ├── learning/          # Learning hub
│   ├── achievements/      # Achievements page
│   └── settings/          # Settings page
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components
│   └── layout/           # Layout components
├── lib/                  # Utilities and configurations
│   ├── db.ts             # Database client
│   ├── openai.ts         # OpenAI integration
│   └── utils.ts          # Utility functions
└── prisma/               # Database schema
```

## API Endpoints

### Learning
- `GET /api/learning/recommendations` - Get personalized learning suggestions
- `POST /api/learning/recommendations` - Generate new recommendations

### Job Applications
- `POST /api/jobs/analyze` - Analyze job posting for fit and insights

### Missions
- `GET /api/missions` - Get user's missions
- `POST /api/missions` - Create new mission
- `PATCH /api/missions` - Update mission status

### Motivation
- `GET /api/motivation` - Get motivational message
- `POST /api/motivation` - Generate personalized motivation

## Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Database

The application uses Prisma ORM with SQLite for development. The schema includes models for users, missions, achievements, job applications, notebook entries, learning resources, and more.

To update the database:
```bash
npx prisma db push
npx prisma generate
```

### Testing the Application

1. Visit the dashboard to see the main interface
2. Create focus missions in the Missions tab
3. Track job applications in the Jobs tab
4. Take notes in the Daily Notebook
5. Explore learning resources in the Learning hub
6. Check achievements and progress
7. Customize settings in the Settings page

## Deployment

The application is configured for deployment on Vercel:

1. Connect your repository to Vercel
2. Set environment variables in the Vercel dashboard
3. Deploy automatically on push to main branch

For other platforms:

```bash
npm run build
npm start
```

## Next Steps

To fully utilize all features:

1. Add your OpenAI API key to enable AI-powered recommendations
2. Set up authentication with NextAuth.js
3. Configure notification system
4. Add data persistence for user sessions
5. Implement real app/website blocking for focus missions
6. Add email notifications and reminders

## License

This project is open source and available under the MIT License.