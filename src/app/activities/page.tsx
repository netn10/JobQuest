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
  Loader2,
  BarChart3,
  Eye,
  CalendarDays,
  Target as TargetIcon,
  BookOpen as BookOpenIcon,
  Briefcase,
  Trophy as TrophyIcon,
  Zap as ZapIcon,
  Users as UsersIcon,
  Star as StarIcon,
  Award as AwardIcon,
  TrendingUp as TrendingUpIcon
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
        setActivities([])
        return
      }
      const response = await fetch('/api/dashboard', {
        headers: {
          'Authorization': `Bearer ${user.id}`
        }
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to fetch activities: ${response.status} ${errorText}`)
      }

      const data = await response.json()
      setActivities(data.allActivities || [])
    } catch (error) {
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
      'target': TargetIcon,
      'book-open': BookOpenIcon,
      'briefcase': Briefcase,
      'trophy': TrophyIcon,
      'zap': ZapIcon,
      'users': UsersIcon,
      'star': StarIcon,
      'award': AwardIcon,
      'trending-up': TrendingUpIcon,
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
        return 'bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800'
      case 'job_applied':
      case 'job_status_updated':
        return 'bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border border-emerald-200 dark:border-emerald-800'
      case 'notebook_entry_created':
      case 'notebook_entry_updated':
        return 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800'
      case 'learning_started':
      case 'learning_completed':
      case 'learning_progress_updated':
        return 'bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200 dark:border-orange-800'
      case 'achievement_unlocked':
        return 'bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border border-yellow-200 dark:border-yellow-800'
      case 'daily_challenge_completed':
        return 'bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 border border-pink-200 dark:border-pink-800'
      case 'streak_milestone':
      case 'xp_earned':
      case 'level_up':
        return 'bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 border border-indigo-200 dark:border-indigo-800'
      default:
        return 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border border-gray-200 dark:border-gray-600'
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
    { value: 'all', label: 'All Activities', icon: Activity },
    { value: 'mission_started', label: 'Missions Started', icon: Target },
    { value: 'mission_completed', label: 'Missions Completed', icon: Trophy },
    { value: 'job_applied', label: 'Job Applications', icon: Briefcase },
    { value: 'job_status_updated', label: 'Job Updates', icon: TrendingUp },
    { value: 'notebook_entry_created', label: 'Journal Entries', icon: BookOpen },
    { value: 'learning_started', label: 'Learning Started', icon: BookOpen },
    { value: 'learning_completed', label: 'Learning Completed', icon: Award },
    { value: 'achievement_unlocked', label: 'Achievements', icon: Star },
    { value: 'daily_challenge_completed', label: 'Daily Challenges', icon: Zap },
    { value: 'streak_milestone', label: 'Streak Milestones', icon: TrendingUp },
    { value: 'xp_earned', label: 'XP Earned', icon: Zap },
    { value: 'level_up', label: 'Level Ups', icon: Trophy }
  ]

  const timePeriods = [
    { value: 'all', label: 'All Time', icon: BarChart3 },
    { value: 'today', label: 'Today', icon: Calendar },
    { value: 'week', label: 'This Week', icon: CalendarDays },
    { value: 'month', label: 'This Month', icon: Calendar }
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
        <div className="space-y-8 max-w-7xl mx-auto px-4">
          {/* Enhanced Header with shimmer loading */}
          <div className="text-center space-y-6">
            <div className="relative">
              <div className="h-12 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-2xl animate-pulse w-80 mx-auto"></div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse"></div>
            </div>
            <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-xl animate-pulse w-96 mx-auto"></div>
          </div>

          {/* Enhanced Stats cards loading */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="overflow-hidden border-0 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-2/3"></div>
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-xl w-3/4"></div>
                      </div>
                      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Enhanced Activity items loading */}
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="overflow-hidden border-0 bg-white dark:bg-gray-800 shadow-lg">
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="flex items-start space-x-6">
                      <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
                      <div className="flex-1 space-y-3">
                        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-lg w-3/4"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/2"></div>
                        <div className="flex items-center space-x-4">
                          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20"></div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                        </div>
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
      <div className="space-y-8 max-w-7xl mx-auto px-4">
        {/* Enhanced Header Section with animated elements */}
        <div className="text-center space-y-6">
          <div className="relative inline-block">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-600 to-purple-600 dark:from-white dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              Activity History
            </h1>
            <div className="absolute -top-3 -right-3 w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-lg"></div>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Track your journey through detailed insights and celebrate every milestone in your career quest
          </p>
        </div>

        {/* Enhanced Stats Overview with better animations */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 dark:from-blue-900/20 dark:via-cyan-900/20 dark:to-blue-800/20 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10"></div>
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">Total Activities</p>
                  <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{stats.total}</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Activity className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100 dark:from-emerald-900/20 dark:via-green-900/20 dark:to-emerald-800/20 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-green-500/10"></div>
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">Today</p>
                  <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">{stats.today}</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Calendar className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-purple-800/20 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10"></div>
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide">This Week</p>
                  <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">{stats.thisWeek}</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-yellow-50 via-amber-50 to-yellow-100 dark:from-yellow-900/20 dark:via-amber-900/20 dark:to-yellow-800/20 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-amber-500/10"></div>
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-yellow-600 dark:text-yellow-400 uppercase tracking-wide">Total XP</p>
                  <p className="text-3xl font-bold text-yellow-900 dark:text-yellow-100">{stats.totalXP}</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Zap className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Filters Section with better visual design */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5"></div>
          <CardHeader className="pb-6 relative">
            <CardTitle className="flex items-center space-x-3 text-gray-900 dark:text-gray-100">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Filter className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold">Filters & Search</span>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-normal">Refine your activity view</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 relative">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Search Activities</label>
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
                  <input
                    type="text"
                    placeholder="Search activities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 placeholder-gray-400 dark:placeholder-gray-500"
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Activity Type</label>
                <div className="relative">
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-4 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 appearance-none cursor-pointer"
                  >
                    {activityTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Time Period</label>
                <div className="relative">
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="w-full px-4 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 appearance-none cursor-pointer"
                  >
                    {timePeriods.map(period => (
                      <option key={period.value} value={period.value}>
                        {period.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-6 border-t-2 border-gray-100 dark:border-gray-700">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Showing {filteredActivities.length} of {activities.length} activities
                </span>
                {filteredActivities.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-semibold">
                      {Math.round((filteredActivities.length / activities.length) * 100)}% match
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-3">
                {(searchTerm || selectedType !== 'all' || selectedPeriod !== 'all') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchTerm('')
                      setSelectedType('all')
                      setSelectedPeriod('all')
                    }}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 px-4 py-2 rounded-xl transition-all duration-200"
                  >
                    Clear Filters
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchActivities}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl border-2 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Refresh</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Activities List with staggered animations */}
        <div className="space-y-4">
          {filteredActivities.length > 0 ? (
            filteredActivities.map((activity, index) => {
              const IconComponent = getIconComponent(activity.icon)
              return (
                <Card 
                  key={activity.id || index} 
                  className="border-0 bg-white dark:bg-gray-800 overflow-hidden relative shadow-lg"
                >
                  
                  <CardContent className="p-8 relative">
                    <div className="flex items-start space-x-8">
                      {/* Enhanced Icon with better styling */}
                      <div className={`w-20 h-20 ${getIconBgColor(activity.type)} rounded-3xl flex items-center justify-center flex-shrink-0 shadow-xl`}>
                        <IconComponent className={`h-10 w-10 ${getIconColor(activity.type)}`} />
                      </div>
                      
                      {/* Enhanced Content */}
                      <div className="flex-1 min-w-0 space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
                              {activity.title}
                            </h3>
                            {activity.description && (
                              <p className="text-base text-gray-600 dark:text-gray-400 mt-3 leading-relaxed">
                                {activity.description}
                              </p>
                            )}
                          </div>
                          
                          {/* Enhanced XP Badge */}
                          {activity.xpEarned !== null && activity.xpEarned !== undefined && (
                            <div className="flex-shrink-0 ml-6">
                              <div className={`flex items-center space-x-2 px-4 py-2 rounded-2xl border ${
                                activity.xpEarned > 0 
                                  ? 'bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 border-green-200 dark:border-green-800'
                                  : 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 border-gray-200 dark:border-gray-600'
                              }`}>
                                <Sparkles className={`h-5 w-5 ${
                                  activity.xpEarned > 0 
                                    ? 'text-green-600 dark:text-green-400'
                                    : 'text-gray-500 dark:text-gray-400'
                                }`} />
                                <span className={`text-sm font-bold ${
                                  activity.xpEarned > 0 
                                    ? 'text-green-700 dark:text-green-300'
                                    : 'text-gray-600 dark:text-gray-300'
                                }`}>
                                  +{activity.xpEarned} XP
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Enhanced Metadata with better layout */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <Badge className={`${getTypeColor(activity.type)} text-sm font-semibold px-4 py-2 rounded-xl`}>
                              {activity.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </Badge>
                            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                              <Clock className="h-4 w-4" />
                              <span className="font-medium">{formatTimeAgo(activity.timestamp)}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <span className="text-sm text-gray-400 dark:text-gray-500 font-medium">
                              {formatDate(activity.timestamp)}
                            </span>
                            <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center">
                              <ArrowRight className="h-4 w-4 text-gray-400" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          ) : (
            <Card className="border-0 bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 shadow-xl">
              <CardContent className="p-16 text-center">
                <div className="flex flex-col items-center space-y-8">
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-3xl flex items-center justify-center">
                      <Activity className="h-12 w-12 text-gray-400" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full"></div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                      No activities found
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-md text-lg leading-relaxed">
                      {searchTerm || selectedType !== 'all' 
                        ? 'Try adjusting your filters or search terms to discover more activities in your journey.'
                        : 'Start your adventure by completing missions, applying to jobs, or learning new skills to see your activity history here!'
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
                      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
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
