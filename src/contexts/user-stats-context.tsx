'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useAuth } from './auth-context'
import { getAuthHeaders } from '@/lib/auth'

interface UserStats {
  totalXp: number
  level: number
  currentStreak: number
  longestStreak: number
  applications: number
  pendingResponses: number
  xpForNextLevel: number
  xpProgress: number
  notebookEntries: number
  completedLearning: number
  unlockedAchievements: number
  totalLearningHours: number
}

interface UserStatsContextType {
  stats: UserStats | null
  loading: boolean
  error: string | null
  refreshStats: () => Promise<void>
  updateStats: (newStats: Partial<UserStats>) => void
}

const UserStatsContext = createContext<UserStatsContextType | undefined>(undefined)

export function UserStatsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/user-stats', {
        headers: getAuthHeaders()
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to fetch user stats (${response.status})`)
      }
      
      const data = await response.json()
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const refreshStats = async () => {
    await fetchStats()
  }

  const updateStats = (newStats: Partial<UserStats>) => {
    if (stats) {
      setStats({ ...stats, ...newStats })
    }
  }

  // Fetch stats when user changes
  useEffect(() => {
    if (user && !stats) {
      fetchStats()
    }
  }, [user])

  // Clear stats when user logs out
  useEffect(() => {
    if (!user) {
      setStats(null)
      setError(null)
    }
  }, [user])

  return (
    <UserStatsContext.Provider value={{ 
      stats, 
      loading, 
      error, 
      refreshStats, 
      updateStats 
    }}>
      {children}
    </UserStatsContext.Provider>
  )
}

export function useUserStats() {
  const context = useContext(UserStatsContext)
  if (context === undefined) {
    throw new Error('useUserStats must be used within a UserStatsProvider')
  }
  return context
}
