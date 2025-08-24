'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Target, Trophy, BookOpen, BriefcaseIcon, TrendingUp, Clock, Zap } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { getAuthHeaders } from '@/lib/auth'
import { Calendar } from '@/components/calendar'

interface DashboardData {
  stats: {
    totalXp: number
    level: number
    currentStreak: number
    longestStreak: number
    applications: number
    pendingResponses: number
    xpForNextLevel: number
    xpProgress: number
  }
  activeMissions: any[]
  dailyChallenge: any
  recentActivity: any[]
  allActivities: any[]
  activeDates: string[]
}

interface DashboardPageProps {
  navigate: (route: string) => void
}

export default function DashboardPage({ navigate }: DashboardPageProps) {
  const { user, loading: authLoading, checkAuth } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('login')
    }
  }, [user, authLoading, navigate])

  useEffect(() => {
    if (!user) return

    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/dashboard', {
          headers: getAuthHeaders()
        })
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data')
        }
        const dashboardData = await response.json()
        setData(dashboardData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [user])

  // Fallback: if no user in context but we're in development, try to fetch with mock user
  useEffect(() => {
    if (!user && process.env.NODE_ENV === 'development' && !loading && !data) {
      const fetchWithMockUser = async () => {
        try {
          console.log('Attempting to fetch dashboard data with mock user')
          const response = await fetch('/api/dashboard', {
            headers: { 'Authorization': 'Bearer mock-user-id' }
          })
          if (response.ok) {
            const dashboardData = await response.json()
            setData(dashboardData)
            console.log('Dashboard data fetched successfully with mock user')
          } else {
            console.log('Failed to fetch dashboard data with mock user')
          }
        } catch (err) {
          console.error('Error fetching dashboard data with mock user:', err)
        } finally {
          setLoading(false)
        }
      }

      fetchWithMockUser()
    }
  }, [user, loading, data])

  const handleViewMission = () => {
    navigate('missions')
  }

  if (authLoading || loading) {
    return (
      <DashboardLayout title="Dashboard" navigate={navigate}>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {[...Array(5)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
                </CardHeader>
                <CardContent>
                  <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout title="Dashboard" navigate={navigate}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error loading dashboard: {error}</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!data) {
    return (
      <DashboardLayout title="Dashboard" navigate={navigate}>
        <div className="flex items-center justify-center h-64">
          <p>No data available</p>
        </div>
      </DashboardLayout>
    )
  }

  const formatTimeAgo = (date: string) => {
    const now = new Date()
    const past = new Date(date)
    const diffInMs = now.getTime() - past.getTime()
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
    
    const diffInWeeks = Math.floor(diffInDays / 7)
    return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`
  }

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'target': return Target
      case 'trophy': return Trophy
      case 'book': return BookOpen
      case 'briefcase': return BriefcaseIcon
      case 'zap': return Zap
      default: return Clock
    }
  }

  return (
    <DashboardLayout title="Dashboard" navigate={navigate}>
      <div className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total XP</CardTitle>
              <Zap className="h-4 w-4 xp-color" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.stats.totalXp.toLocaleString()}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Level {data.stats.level}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Level</CardTitle>
              <TrendingUp className="h-4 w-4 level-color" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.stats.level}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">{data.stats.xpProgress} XP to level {data.stats.level + 1}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
              <Target className="h-4 w-4 streak-color" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.max(1, data.stats.currentStreak)} days</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Keep it up!</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Longest Streak</CardTitle>
              <Trophy className="h-4 w-4 trophy-color" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.max(1, data.stats.longestStreak)} days</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Best record</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Applications</CardTitle>
              <BriefcaseIcon className="h-4 w-4 application-color" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.stats.applications}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">{data.stats.pendingResponses} responses pending</p>
            </CardContent>
          </Card>
        </div>

        {/* Current Missions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Missions</CardTitle>
              <CardDescription>Complete missions to earn XP and achievements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.activeMissions.length > 0 ? (
                data.activeMissions.map((mission) => (
                  <div key={mission.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                      <Target className="h-5 w-5 level-color" />
                      <div>
                        <p className="font-medium">{mission.title}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{mission.description}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" onClick={handleViewMission}>View</Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No active missions</p>
                  <p className="text-sm">Start a new mission to begin earning XP!</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Today's Challenge</CardTitle>
              <CardDescription>Complete daily challenges for bonus XP</CardDescription>
            </CardHeader>
            <CardContent>
              {data.dailyChallenge ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <Trophy className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">{data.dailyChallenge.challenge.title}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{data.dailyChallenge.challenge.description}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" 
                      style={{ width: `${data.dailyChallenge.progress}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{data.dailyChallenge.progress}% completed</span>
                    <span className="font-medium xp-color">+{data.dailyChallenge.challenge.xpReward} XP</span>
                  </div>
                  
                  <Button className="w-full">Start Challenge</Button>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No challenge available today</p>
                  <p className="text-sm">Check back tomorrow for new challenges!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Activity Calendar and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Calendar 
            activeDates={data.activeDates.map(dateStr => new Date(dateStr))}
            activities={data.allActivities}
            className="h-fit"
          />
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest achievements and progress</CardDescription>
            </CardHeader>
            <CardContent>
              {data.recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {data.recentActivity.map((activity, index) => {
                    const IconComponent = getIconComponent(activity.icon)
                    return (
                      <div key={index} className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                          <IconComponent className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.title}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{formatTimeAgo(activity.timestamp)}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No recent activity</p>
                  <p className="text-sm">Complete missions and challenges to see your progress here!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
