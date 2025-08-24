import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date)
}

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

export function calculateLevel(totalXp: number): number {
  return Math.floor(Math.sqrt(totalXp / 100)) + 1
}

export function calculateXpForNextLevel(currentLevel: number): number {
  return Math.pow(currentLevel, 2) * 100
}

export function calculateXpProgress(currentXp: number, totalXp: number): number {
  const currentLevel = calculateLevel(totalXp)
  const xpForCurrentLevel = calculateXpForNextLevel(currentLevel - 1)
  const xpForNextLevel = calculateXpForNextLevel(currentLevel)
  
  return ((currentXp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  if (remainingMinutes === 0) {
    return `${hours}h`
  }
  return `${hours}h ${remainingMinutes}m`
}

export function getStreakStatus(lastActiveDate: Date | null): 'active' | 'broken' | 'new' {
  if (!lastActiveDate) return 'new'
  
  // Use a consistent date calculation that works on both server and client
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const lastActive = new Date(lastActiveDate.getFullYear(), lastActiveDate.getMonth(), lastActiveDate.getDate())
  const diffInDays = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffInDays === 0 || diffInDays === 1) return 'active'
  return 'broken'
}

export async function updateUserStreak(userId: string, prisma: any) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        currentStreak: true,
        longestStreak: true,
        lastActiveDate: true
      }
    })

    if (!user) return

    const now = new Date()
    // Convert to Israel time (UTC+3)
    const israelTime = new Date(now.getTime() + (3 * 60 * 60 * 1000))
    const today = new Date(israelTime.getFullYear(), israelTime.getMonth(), israelTime.getDate())
    
    let newCurrentStreak = user.currentStreak
    let newLongestStreak = Number(user.longestStreak)

    if (!user.lastActiveDate) {
      // First activity - start streak at 1
      newCurrentStreak = 1
      newLongestStreak = Math.max(newLongestStreak, 1)
    } else {
      const lastActive = new Date(user.lastActiveDate.getFullYear(), user.lastActiveDate.getMonth(), user.lastActiveDate.getDate())
      const diffInDays = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24))
      
      if (diffInDays === 0) {
        // Already active today - no change to streak
        return
      } else if (diffInDays === 1) {
        // Consecutive day - increment streak
        newCurrentStreak = user.currentStreak + 1
        newLongestStreak = Math.max(newLongestStreak, newCurrentStreak)
      } else {
        // Streak broken - reset to 1
        newCurrentStreak = 1
        newLongestStreak = Math.max(newLongestStreak, 1)
      }
    }

    // Update user streak data
    await prisma.user.update({
      where: { id: userId },
      data: {
        currentStreak: newCurrentStreak,
        longestStreak: newLongestStreak,
        lastActiveDate: today
      }
    })

    return {
      currentStreak: newCurrentStreak,
      longestStreak: newLongestStreak
    }
  } catch (error) {
    console.error('Error updating user streak:', error)
    throw error
  }
}

export function generateCalendarData(activeDates: Date[] = [], currentMonth: Date = new Date()) {
  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  
  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startDayOfWeek = firstDay.getDay()
  
  // Create calendar grid
  const calendar = []
  let day = 1
  
  // Get today's date in Israel time (UTC+3)
  const now = new Date()
  const israelTime = new Date(now.getTime() + (3 * 60 * 60 * 1000)) // UTC+3
  const todayIsrael = new Date(israelTime.getFullYear(), israelTime.getMonth(), israelTime.getDate())
  
  for (let week = 0; week < 6; week++) {
    const weekDays = []
    
    for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
      if ((week === 0 && dayOfWeek < startDayOfWeek) || day > daysInMonth) {
        weekDays.push(null)
      } else {
        const currentDate = new Date(year, month, day)
        
        // Convert dates to ISO string format (YYYY-MM-DD) for reliable comparison
        const currentDateStr = currentDate.toISOString().split('T')[0]
        const isActive = activeDates.some(date => {
          const dateStr = date.toISOString().split('T')[0]
          return dateStr === currentDateStr
        })
        
        const isToday = currentDate.toDateString() === todayIsrael.toDateString()
        
        weekDays.push({
          date: currentDate,
          day,
          isActive,
          isToday
        })
        day++
      }
    }
    
    calendar.push(weekDays)
  }
  
  return calendar
}