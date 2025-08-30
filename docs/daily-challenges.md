# Daily Challenges System

## Overview

The daily challenges system has been updated to provide consistent, customizable challenges that users can configure in their settings. Instead of random challenges each day, users now have the same types of challenges every day with targets they can adjust.

## Features

### Consistent Challenge Types

Every day, users get the same three types of challenges (if enabled):

1. **Daily Reflection** - Write notebook entries
2. **Knowledge Seeker** - Complete learning materials  
3. **Job Hunter** - Submit job applications

### Customizable Targets

Users can customize the target numbers for each challenge type in their settings:

- **Notebook Entries**: 1-10 entries per day
- **Learning Materials**: 1-10 materials per day
- **Job Applications**: 1-10 applications per day

### Enable/Disable Challenges

Users can enable or disable specific challenge types based on their preferences and current focus areas.

## Technical Implementation

### Database Schema

The system uses a new `dailyChallengeSettings` JSON field in the User model to store user preferences:

```typescript
interface DailyChallengeSettings {
  notebookEntriesTarget: number
  learningMaterialsTarget: number
  jobApplicationsTarget: number
  enableNotebookChallenge: boolean
  enableLearningChallenge: boolean
  enableJobApplicationChallenge: boolean
}
```

### API Endpoints

- `GET /api/daily-challenges` - Get current daily challenges and progress
- `POST /api/daily-challenges` - Update challenge progress
- `GET /api/daily-challenges/settings` - Get user's challenge settings
- `PUT /api/daily-challenges/settings` - Update user's challenge settings

### Challenge Creation

Challenges are created automatically when:
1. A user first accesses the daily challenges page
2. No challenges exist for the current date
3. User settings are updated (affects new challenges only)

### XP Rewards

XP rewards scale with the difficulty of the target:
- **Notebook Entries**: 25 + (target × 5) XP
- **Learning Materials**: 30 + (target × 10) XP  
- **Job Applications**: 40 + (target × 15) XP

## User Interface

### Settings Page

A new "Daily Challenges" tab in the settings page allows users to:
- Enable/disable specific challenge types
- Adjust target numbers for each challenge type
- See information about how the system works

### Dashboard

The dashboard shows up to 2 current challenges with progress bars and completion status.

### Daily Challenges Page

The dedicated daily challenges page shows:
- All current challenges for the day
- Progress tracking for each challenge
- Recent challenge history
- Statistics and tips

## Migration from Random Challenges

The system automatically migrates from the old random challenge system:
- Existing users get default settings on first access
- New challenges are created using the consistent system
- Old challenge data is preserved for history

## Benefits

1. **Predictability**: Users know what to expect each day
2. **Customization**: Targets can be adjusted to match user capacity
3. **Flexibility**: Users can focus on specific areas by enabling/disabling challenges
4. **Scalability**: XP rewards scale with difficulty
5. **Consistency**: Same challenge types every day reduces cognitive load

## Future Enhancements

Potential improvements could include:
- Weekly challenge themes
- Streak bonuses for completing all challenges
- Challenge difficulty levels (Easy, Normal, Hard)
- Seasonal or special event challenges
- Challenge sharing and social features
