# Notification System Documentation

## Overview

The JobQuest notification system provides both in-app notifications and browser notifications to keep users informed about their progress, achievements, and important events.

## Features

### Notification Types

1. **Mission Reminders** - Remind users to start their focus missions
2. **Achievement Unlocks** - Celebrate when users unlock achievements
3. **Daily Challenges** - Notify about new daily challenges and updates
4. **Job Application Followups** - Remind users to follow up on job applications
5. **Learning Suggestions** - Provide personalized learning recommendations
6. **Streak Warnings** - Warn users when their streak is at risk
7. **Email Notifications** - Send notifications via email (future feature)

### Components

#### 1. Notification Preferences UI (`src/app/settings/page.tsx`)
- Located in the Settings page under the "Notifications" tab
- Shows browser notification permission status
- Provides toggle switches for each notification type
- Includes a "Test" button to verify notifications work

#### 2. Notification Service (`src/lib/notifications.ts`)
- Handles browser notification permissions
- Provides methods to show different types of notifications
- Manages notification lifecycle (auto-close, interaction requirements)

#### 3. Notifications Context (`src/contexts/notifications-context.tsx`)
- Manages notification preferences state
- Handles saving preferences to the database
- Provides methods to check if notifications should be shown

#### 4. Notification Store (`src/contexts/notification-store-context.tsx`)
- Manages in-app notification history
- Handles notification read/unread status
- Provides helper functions for adding specific notification types

#### 5. Notification Center (`src/components/notification-center.tsx`)
- Displays in-app notification dropdown
- Shows notification count badge
- Handles notification interactions

## Database Schema

The notification preferences are stored in the `User` model:

```prisma
model User {
  // ... other fields
  notifications         Boolean                  @default(true)  // Legacy field
  notificationPreferences Json?                  // New granular preferences
  // ... other fields
}
```

The `notificationPreferences` field stores a JSON object with boolean values for each notification type:

```json
{
  "missionReminders": true,
  "achievementUnlocks": true,
  "dailyChallenges": true,
  "jobApplicationFollowups": true,
  "learningsuggestions": true,
  "streakWarnings": true,
  "emailNotifications": false
}
```

## API Endpoints

### GET `/api/settings`
- Returns user settings including notification preferences
- Parses the `notificationPreferences` JSON field

### PUT `/api/settings`
- Updates user settings including notification preferences
- Stores notification preferences as JSON in the database

## Usage Examples

### Showing a Notification

```typescript
import { useNotifications } from '@/contexts/notifications-context'

const { showNotification } = useNotifications()

// Show an achievement notification
await showNotification('achievementUnlocks', {
  name: 'First Mission',
  xpReward: 50
})
```

### Adding an In-App Notification

```typescript
import { useNotificationHelpers } from '@/contexts/notification-store-context'

const { addAchievementNotification } = useNotificationHelpers()

addAchievementNotification('First Mission', 'Completed your first focus mission!', 50)
```

### Checking Notification Permissions

```typescript
import { useNotifications } from '@/contexts/notifications-context'

const { permission, isEnabled } = useNotifications()

if (permission === 'granted' && isEnabled) {
  // Notifications are enabled
}
```

## Browser Compatibility

The notification system uses the Web Notifications API, which is supported in:
- Chrome 22+
- Firefox 22+
- Safari 7+
- Edge 14+

## Security Considerations

1. **Permission-based**: Notifications only work if the user grants permission
2. **User-controlled**: Users can disable specific notification types
3. **Secure storage**: Preferences are stored securely in the database
4. **No sensitive data**: Notifications don't contain sensitive information

## Future Enhancements

1. **Email Notifications**: Implement email-based notifications
2. **Push Notifications**: Add service worker for push notifications
3. **Notification Scheduling**: Allow users to schedule notifications
4. **Custom Notification Sounds**: Add sound options for different notification types
5. **Notification Templates**: Allow customization of notification messages
