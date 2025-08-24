// Simple authentication utilities
// In a production app, you'd use JWT tokens or session cookies

export interface User {
  id: string
  email: string
  name: string | null
  image: string | null
  xp: number
  level: number
  totalXp: number
  currentStreak: number
  longestStreak: number | bigint
  theme: string
  notifications: boolean
}

export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null
  
  try {
    const userStr = localStorage.getItem('currentUser')
    return userStr ? JSON.parse(userStr) : null
  } catch {
    return null
  }
}

// Helper function to serialize user data for localStorage
const serializeUser = (user: User) => {
  return {
    ...user,
    longestStreak: Number(user.longestStreak)
  }
}

export const setCurrentUser = (user: User | null): void => {
  if (typeof window === 'undefined') return
  
  if (user) {
    const userForStorage = serializeUser(user)
    localStorage.setItem('currentUser', JSON.stringify(userForStorage))
  } else {
    localStorage.removeItem('currentUser')
  }
}

export const getAuthHeaders = (): Record<string, string> => {
  const user = getCurrentUser()
  return user ? { 'Authorization': `Bearer ${user.id}` } : {}
}

// Mock user functionality removed
