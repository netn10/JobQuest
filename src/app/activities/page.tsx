'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Target, Trophy, BookOpen, BriefcaseIcon, Clock, FileText, Zap, TrendingUp, Calendar, Filter, Search } from 'lucide-react'
import { getAuthHeaders } from '@/lib/auth'

interface Activity {
  id: string
  type: string
  title: string
  description?: string
  timestamp: string
  icon: string
  xpEarned?: number
  metadata?: any
}

export default function ActivitiesPage() {
  const [loading, setLoading] = useState(true)
  const [activities, setActivities] = useState<Activity[]>([])
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const router = useRouter()

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push('/')
      return
    }
    fetchActivities()
  }, [router])

  const fetchActivities = async () => {
    try {
      const response = await fetch('/api/dashboard', {
        headers: getAuthHeaders()
      })
      if (!response.ok) {
        throw new Error('Failed to fetch activities')
      }
      const data = await response.json()
      setActivities(data.allActivities || [])
      setFilteredActivities(data.allActivities || [])
    } catch (error) {
      console.error('Error fetching activities:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let filtered = activities

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(activity => activity.type === selectedType)
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(activity => 
        activity.title.toLowerCase().includes(term) ||
        (activity.description && activity.description.toLowerCase().includes(term))
      )
    }

    setFilteredActivities(filtered)
  }, [activities, selectedType, searchTerm])

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'target': return Target
      case 'trophy': return Trophy
      case 'book': return BookOpen
      case 'briefcase': return BriefcaseIcon
      case 'zap': return Zap
      case 'file': return FileText
      case 'trending-up': return TrendingUp
      default: return Clock
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'mission_started':
      case 'mission_completed':
      case 'mission_failed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
      case 'job_applied':
      case 'job_status_updated':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      case 'notebook_entry_created':
      case 'notebook_entry_updated':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
      case 'learning_started':
      case 'learning_completed':
      case 'learning_progress_updated':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
      case 'achievement_unlocked':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
      case 'daily_challenge_completed':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300'
      case 'streak_milestone':
      case 'xp_earned':
      case 'level_up':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    }
  }

  const formatTimeAgo = (date: string) => {
    const now = new Date()
    const past = new Date(date)
    const diffInMs = now.getTime() - past.getTime()
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInDays < 7) return `${diffInDays}d ago`
    
    const diffInWeeks = Math.floor(diffInDays / 7)
    return `${diffInWeeks}w ago`
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const activityTypes = [
    { value: 'all', label: 'All Activities' },
    { value: 'mission_started', label: 'Missions Started' },
    { value: 'mission_completed', label: 'Missions Completed' },
    { value: 'job_applied', label: 'Job Applications' },
    { value: 'job_status_updated', label: 'Job Updates' },
    { value: 'notebook_entry_created', label: 'Journal Entries' },
    { value: 'learning_started', label: 'Learning Started' },
    { value: 'learning_completed', label: 'Learning Completed' },
    { value: 'achievement_unlocked', label: 'Achievements' },
    { value: 'daily_challenge_completed', label: 'Daily Challenges' },
    { value: 'streak_milestone', label: 'Streak Milestones' },
    { value: 'xp_earned', label: 'XP Earned' },
    { value: 'level_up', label: 'Level Ups' }
  ]

  if (loading) {
    return (
      <DashboardLayout title="Activity History">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Activity History">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Activity History</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track all your actions and achievements
            </p>
          </div>
          <Button variant="outline" onClick={() => router.back()}>
            Back to Dashboard
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search activities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
              <div className="sm:w-48">
                <label className="block text-sm font-medium mb-2">Activity Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  {activityTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Showing {filteredActivities.length} of {activities.length} activities</span>
              {(searchTerm || selectedType !== 'all') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedType('all')
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Activities List */}
        <div className="space-y-4">
          {filteredActivities.length > 0 ? (
            filteredActivities.map((activity, index) => {
              const IconComponent = getIconComponent(activity.icon)
              return (
                <Card key={activity.id || index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center flex-shrink-0">
                        <IconComponent className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 dark:text-gray-100">
                              {activity.title}
                            </h3>
                            {activity.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {activity.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <Badge className={getTypeColor(activity.type)}>
                                {activity.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </Badge>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {formatTimeAgo(activity.timestamp)}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                              {formatDate(activity.timestamp)}
                            </p>
                          </div>
                          {activity.xpEarned && activity.xpEarned > 0 && (
                            <div className="flex-shrink-0">
                              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                +{activity.xpEarned} XP
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No activities found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {searchTerm || selectedType !== 'all' 
                    ? 'Try adjusting your filters to see more activities.'
                    : 'Start using the app to see your activity history here!'
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
