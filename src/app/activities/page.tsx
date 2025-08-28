'use client'

import { useState, useEffect, useCallback } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Activity, 
  Search, 
  Filter, 
  Calendar,
  Clock,
  TrendingUp,
  Target,
  BookOpen,
  BriefcaseIcon,
  Trophy,
  Zap,
  Users,
  Star,
  Award,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Loader2
} from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'

interface Activity {
  id: string
  type: string
  title: string
  description?: string
  icon: string
  timestamp: string
  xpEarned?: number
  metadata?: Record<string, any>
}

export default function ActivitiesPage() {
  const { user } = useAuth()
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedPeriod, setSelectedPeriod] = useState('all')

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true)
      
      if (!user?.id) {
        console.error('No user ID available')
        setActivities([])
        return
      }
      
      console.log('Fetching activities for user:', user.id)
      const response = await fetch('/api/dashboard', {
        headers: {
          'Authorization': `Bearer ${user.id}`
        }
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API response not ok:', response.status, errorText)
        throw new Error(`Failed to fetch activities: ${response.status} ${errorText}`)
      }

      const data = await response.json()
      setActivities(data.allActivities || [])
    } catch (error) {
      console.error('Error fetching activities:', error)
      setActivities([])
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    if (user?.id) {
      fetchActivities()
    }
  }, [user?.id, fetchActivities])

  const getIconComponent = (iconName: string) => {
    const iconMap: Record<string, any> = {
      'target': Target,
      'book-open': BookOpen,
      'briefcase': BriefcaseIcon,
      'trophy': Trophy,
      'zap': Zap,
      'users': Users,
      'star': Star,
      'award': Award,
      'trending-up': TrendingUp,
      'activity': Activity
    }
    return iconMap[iconName] || Activity
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'mission_started':
      case 'mission_completed':
      case 'mission_failed':
        return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25'
      case 'job_applied':
      case 'job_status_updated':
        return 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/25'
      case 'notebook_entry_created':
      case 'notebook_entry_updated':
        return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25'
      case 'learning_started':
      case 'learning_completed':
      case 'learning_progress_updated':
        return 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/25'
      case 'achievement_unlocked':
        return 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-lg shadow-yellow-500/25'
      case 'daily_challenge_completed':
        return 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/25'
      case 'streak_milestone':
      case 'xp_earned':
      case 'level_up':
        return 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-lg shadow-indigo-500/25'
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg'
    }
  }

  const getIconBgColor = (type: string) => {
    switch (type) {
      case 'mission_started':
      case 'mission_completed':
      case 'mission_failed':
        return 'bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30'
      case 'job_applied':
      case 'job_status_updated':
        return 'bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30'
      case 'notebook_entry_created':
      case 'notebook_entry_updated':
        return 'bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30'
      case 'learning_started':
      case 'learning_completed':
      case 'learning_progress_updated':
        return 'bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30'
      case 'achievement_unlocked':
        return 'bg-gradient-to-br from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30'
      case 'daily_challenge_completed':
        return 'bg-gradient-to-br from-pink-100 to-rose-100 dark:from-pink-900/30 dark:to-rose-900/30'
      case 'streak_milestone':
      case 'xp_earned':
      case 'level_up':
        return 'bg-gradient-to-br from-indigo-100 to-blue-100 dark:from-indigo-900/30 dark:to-blue-900/30'
      default:
        return 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700'
    }
  }

  const getIconColor = (type: string) => {
    switch (type) {
      case 'mission_started':
      case 'mission_completed':
      case 'mission_failed':
        return 'text-blue-600 dark:text-blue-400'
      case 'job_applied':
      case 'job_status_updated':
        return 'text-emerald-600 dark:text-emerald-400'
      case 'notebook_entry_created':
      case 'notebook_entry_updated':
        return 'text-purple-600 dark:text-purple-400'
      case 'learning_started':
      case 'learning_completed':
      case 'learning_progress_updated':
        return 'text-orange-600 dark:text-orange-400'
      case 'achievement_unlocked':
        return 'text-yellow-600 dark:text-yellow-400'
      case 'daily_challenge_completed':
        return 'text-pink-600 dark:text-pink-400'
      case 'streak_milestone':
      case 'xp_earned':
      case 'level_up':
        return 'text-indigo-600 dark:text-indigo-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
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

  const timePeriods = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' }
  ]

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (activity.description && activity.description.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesType = selectedType === 'all' || activity.type === selectedType
    return matchesSearch && matchesType
  })

  const getActivityStats = () => {
    const total = activities.length
    const today = activities.filter(a => {
      const activityDate = new Date(a.timestamp)
      const today = new Date()
      return activityDate.toDateString() === today.toDateString()
    }).length
    const thisWeek = activities.filter(a => {
      const activityDate = new Date(a.timestamp)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return activityDate >= weekAgo
    }).length
    const totalXP = activities.reduce((sum, a) => sum + (a.xpEarned || 0), 0)

    return { total, today, thisWeek, totalXP }
  }

  const stats = getActivityStats()

  if (loading) {
    return (
      <DashboardLayout title="Activity History">
        <div className="space-y-6 max-w-6xl mx-auto">
          {/* Header with shimmer loading */}
          <div className="text-center space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse w-64 mx-auto"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96 mx-auto"></div>
          </div>

          {/* Stats cards loading */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Activity items loading */}
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Activity History">
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Enhanced Header Section */}
        <div className="text-center space-y-4">
          <div className="relative">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent">
              Activity History
            </h1>
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Track all your actions and achievements with detailed insights into your progress
          </p>
        </div>

        {/* Enhanced Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Activities</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Activity className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Today</p>
                  <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">{stats.today}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400">This Week</p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{stats.thisWeek}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Total XP Earned</p>
                  <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{stats.totalXP}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Zap className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Filters Section */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-gray-100">
              <Filter className="h-5 w-5 text-blue-500" />
              <span>Filters & Search</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Search Activities</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search activities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Activity Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  {activityTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Time Period</label>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  {timePeriods.map(period => (
                    <option key={period.value} value={period.value}>
                      {period.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">Showing {filteredActivities.length} of {activities.length} activities</span>
                {filteredActivities.length > 0 && (
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs">
                    {Math.round((filteredActivities.length / activities.length) * 100)}% match
                  </span>
                )}
              </div>
              
              <div className="flex space-x-2">
                {(searchTerm || selectedType !== 'all' || selectedPeriod !== 'all') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchTerm('')
                      setSelectedType('all')
                      setSelectedPeriod('all')
                    }}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                  >
                    Clear Filters
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchActivities}
                  className="flex items-center space-x-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Refresh</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Activities List */}
        <div className="space-y-4">
          {filteredActivities.length > 0 ? (
            filteredActivities.map((activity, index) => {
              const IconComponent = getIconComponent(activity.icon)
              return (
                <Card 
                  key={activity.id || index} 
                  className="group hover:shadow-xl transition-all duration-300 border-0 bg-white dark:bg-gray-800 overflow-hidden relative"
                  style={{
                    animationDelay: `${index * 50}ms`
                  }}
                >
                  {/* Animated border gradient */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                  <div className="absolute inset-[1px] bg-white dark:bg-gray-800 rounded-lg"></div>
                  
                  <CardContent className="p-6 relative">
                    <div className="flex items-start space-x-6">
                      {/* Enhanced Icon */}
                      <div className={`w-16 h-16 ${getIconBgColor(activity.type)} rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                        <IconComponent className={`h-8 w-8 ${getIconColor(activity.type)}`} />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                              {activity.title}
                            </h3>
                            {activity.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">
                                {activity.description}
                              </p>
                            )}
                          </div>
                          
                          {/* XP Badge */}
                          {activity.xpEarned && activity.xpEarned > 0 && (
                            <div className="flex-shrink-0 ml-4">
                              <div className="flex items-center space-x-1 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 px-3 py-1.5 rounded-full">
                                <Sparkles className="h-4 w-4 text-green-600 dark:text-green-400" />
                                <span className="text-sm font-bold text-green-700 dark:text-green-300">
                                  +{activity.xpEarned} XP
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Enhanced Metadata */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Badge className={`${getTypeColor(activity.type)} text-xs font-medium px-3 py-1`}>
                              {activity.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </Badge>
                            <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                              <Clock className="h-3 w-3" />
                              <span>{formatTimeAgo(activity.timestamp)}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              {formatDate(activity.timestamp)}
                            </span>
                            <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          ) : (
            <Card className="border-0 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
              <CardContent className="p-12 text-center">
                <div className="flex flex-col items-center space-y-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center">
                    <Activity className="h-10 w-10 text-gray-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                      No activities found
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-md">
                      {searchTerm || selectedType !== 'all' 
                        ? 'Try adjusting your filters or search terms to find more activities.'
                        : 'Start completing missions, applying to jobs, or learning new skills to see your activity history here!'
                      }
                    </p>
                  </div>
                  {(searchTerm || selectedType !== 'all') && (
                    <Button 
                      onClick={() => {
                        setSearchTerm('')
                        setSelectedType('all')
                        setSelectedPeriod('all')
                      }}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
