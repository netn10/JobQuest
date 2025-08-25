'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CollapsibleCard } from '@/components/ui/collapsible-card'
import { Target, Trophy, BookOpen, BriefcaseIcon, Clock, Zap, TrendingUp, Calendar, Users, Star, Play, CheckCircle, AlertCircle, ArrowRight, Plus, FileText, Video, GraduationCap, MapPin, DollarSign, Building, X } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { useUserStats } from '@/contexts/user-stats-context'
import { getAuthHeaders } from '@/lib/auth'
import { Calendar as CalendarComponent } from '@/components/calendar'
import { StatsDisplay } from '@/components/ui/stats-display'

interface DashboardData {
  activeMissions: any[]
  dailyChallenge: any
  recentActivity: any[]
  allActivities: any[]
  activeDates: string[]
  recentJobs: any[]
  recentLearning: any[]
  recentNotebookEntries: any[]
  upcomingInterviews: any[]
  learningRecommendations: any[]
  jobRecommendations: any[]
  weeklyProgress: {
    missionsCompleted: number
    applicationsSubmitted: number
    learningHours: number
    notebookEntries: number
  }
}

interface DashboardPageProps {
  navigate: (route: string) => void
}

export default function DashboardPage({ navigate }: DashboardPageProps) {
  const { user, loading: authLoading, checkAuth } = useAuth()
  const { stats, loading: statsLoading, error: statsError } = useUserStats()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showWelcome, setShowWelcome] = useState(true)

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
        setData({
          activeMissions: dashboardData.activeMissions || [],
          dailyChallenge: dashboardData.dailyChallenge,
          recentActivity: dashboardData.recentActivity || [],
          allActivities: dashboardData.allActivities || [],
          activeDates: dashboardData.activeDates || [],
          recentJobs: dashboardData.recentJobs || [],
          recentLearning: dashboardData.recentLearning || [],
          recentNotebookEntries: dashboardData.recentNotebookEntries || [],
          upcomingInterviews: dashboardData.upcomingInterviews || [],
          learningRecommendations: dashboardData.learningRecommendations || [],
          jobRecommendations: dashboardData.jobRecommendations || [],
          weeklyProgress: dashboardData.weeklyProgress || {
            missionsCompleted: 0,
            applicationsSubmitted: 0,
            learningHours: 0,
            notebookEntries: 0
          }
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [user])

  const handleViewMission = () => {
    navigate('missions')
  }

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'target': return Target
      case 'trophy': return Trophy
      case 'book': return BookOpen
      case 'briefcase': return BriefcaseIcon
      case 'zap': return Zap
      case 'video': return Video
      case 'file': return FileText
      case 'graduation': return GraduationCap
      default: return Clock
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'APPLIED': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
      case 'INTERVIEW': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
      case 'OFFER': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      case 'REJECTED': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      case 'COMPLETED': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
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

  if (authLoading || loading || statsLoading) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="space-y-4 lg:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 lg:gap-6">
            {[...Array(4)].map((_, i) => (
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

  if (error || statsError) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error loading dashboard: {error || statsError}</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!data || !stats) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <p>No data available</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-4 lg:space-y-6">
        {/* Welcome Section */}
        {showWelcome && (
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800 relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowWelcome(false)}
              className="absolute top-2 right-2 h-8 w-8 p-0 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
            >
              <X className="h-4 w-4" />
            </Button>
            <CardHeader>
              <CardTitle className="text-2xl font-bold flex items-center gap-2 text-blue-900 dark:text-blue-100 pr-8">
                <TrendingUp className="h-6 w-6" />
                Welcome back, {user?.name || 'Job Seeker'}!
              </CardTitle>
              <CardDescription className="text-blue-700 dark:text-blue-300">
                Ready to continue your job search journey? Here's your progress overview.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* Stats Overview */}
        <CollapsibleCard
          title="Stats Overview"
          description="Your progress and achievements at a glance"
          icon={TrendingUp}
          defaultExpanded={true}
          storageKey="dashboard-stats-overview"
        >
          <StatsDisplay showAll={true} />
        </CollapsibleCard>

        {/* Quick Actions */}
        <CollapsibleCard
          title="Quick Actions"
          description="Jump into your most important tasks"
          icon={Zap}
          defaultExpanded={true}
          storageKey="dashboard-quick-actions"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2"
              onClick={() => navigate('missions')}
            >
              <Target className="h-6 w-6" />
              <span className="text-sm">Start Mission</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2"
              onClick={() => navigate('jobs')}
            >
              <BriefcaseIcon className="h-6 w-6" />
              <span className="text-sm">Add Job</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2"
              onClick={() => navigate('learning')}
            >
              <BookOpen className="h-6 w-6" />
              <span className="text-sm">Learn</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2"
              onClick={() => navigate('notebook')}
            >
              <FileText className="h-6 w-6" />
              <span className="text-sm">Journal</span>
            </Button>
          </div>
        </CollapsibleCard>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Left Column - Active Missions & Daily Challenge */}
          <div className="lg:col-span-2 space-y-4 lg:space-y-6">
            {/* Active Missions */}
            <CollapsibleCard
              title="Active Missions"
              description="Complete missions to earn XP and achievements"
              icon={Target}
              defaultExpanded={true}
              storageKey="dashboard-active-missions"
              headerChildren={
                <Button variant="outline" size="sm" onClick={() => navigate('missions')}>
                  View All
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              }
            >
              <div className="space-y-4">
                {data.activeMissions.length > 0 ? (
                  data.activeMissions.map((mission) => (
                    <div key={mission.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-3">
                        <Target className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium">{mission.title}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{mission.description}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" onClick={handleViewMission}>Continue</Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No active missions</p>
                    <p className="text-sm">Start a new mission to begin earning XP!</p>
                    <Button size="sm" className="mt-2" onClick={() => navigate('missions')}>
                      <Plus className="h-4 w-4 mr-1" />
                      Create Mission
                    </Button>
                  </div>
                )}
              </div>
            </CollapsibleCard>

            {/* Daily Challenge */}
            <CollapsibleCard
              title="Today's Challenge"
              description="Complete daily challenges for bonus XP"
              icon={Trophy}
              defaultExpanded={true}
              storageKey="dashboard-daily-challenge"
            >
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
                    <span className="font-medium text-yellow-600">+{data.dailyChallenge.challenge.xpReward} XP</span>
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
            </CollapsibleCard>

            {/* Recent Job Applications */}
            <CollapsibleCard
              title="Recent Applications"
              description="Your latest job applications and their status"
              icon={BriefcaseIcon}
              defaultExpanded={true}
              storageKey="dashboard-recent-applications"
              headerChildren={
                <Button variant="outline" size="sm" onClick={() => navigate('jobs')}>
                  View All
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              }
            >
              {data.recentJobs.length > 0 ? (
                <div className="space-y-3">
                  {data.recentJobs.slice(0, 3).map((job) => (
                    <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Building className="h-5 w-5 text-gray-600" />
                        <div>
                          <p className="font-medium text-sm">{job.role}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{job.company}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(job.status)}>
                          {job.status}
                        </Badge>
                        <span className="text-xs text-gray-500">{formatTimeAgo(job.appliedDate)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                  <BriefcaseIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No recent applications</p>
                  <Button size="sm" className="mt-2" onClick={() => navigate('jobs')}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Application
                  </Button>
                </div>
              )}
            </CollapsibleCard>

            {/* Learning Progress */}
            <CollapsibleCard
              title="Learning Progress"
              description="Track your skill development and learning journey"
              icon={BookOpen}
              defaultExpanded={true}
              storageKey="dashboard-learning-progress"
              headerChildren={
                <Button variant="outline" size="sm" onClick={() => navigate('learning')}>
                  View All
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              }
            >
              {data.recentLearning.length > 0 ? (
                <div className="space-y-3">
                  {data.recentLearning.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {(() => {
                          const IconComponent = getIconComponent(item.type === 'VIDEO' ? 'video' : 'file')
                          return <IconComponent className="h-5 w-5 text-gray-600" />
                        })()}
                        <div>
                          <p className="font-medium text-sm">{item.title}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{item.source}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                        <span className="text-xs text-gray-500">{item.progress || 0}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                  <BookOpen className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No learning activities</p>
                  <Button size="sm" className="mt-2" onClick={() => navigate('learning')}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Resource
                  </Button>
                </div>
              )}
            </CollapsibleCard>
          </div>

          {/* Right Column - Calendar, Recent Activity, Recommendations */}
          <div className="space-y-4 lg:space-y-6">
            {/* Activity Calendar */}
            <CollapsibleCard
              title="Activity Calendar"
              description="Track your daily progress and achievements"
              icon={Calendar}
              defaultExpanded={true}
              storageKey="dashboard-activity-calendar"
            >
              <CalendarComponent 
                activeDates={data.activeDates.map(dateStr => new Date(dateStr))}
                activities={data.allActivities}
                className="h-fit"
              />
            </CollapsibleCard>
            
            {/* Recent Activity */}
            <CollapsibleCard
              title="Recent Activity"
              description="Your latest actions and achievements"
              icon={Clock}
              defaultExpanded={true}
              storageKey="dashboard-recent-activity"
            >
              {data.recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {data.recentActivity.slice(0, 8).map((activity, index) => {
                    const IconComponent = getIconComponent(activity.icon)
                    return (
                      <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center flex-shrink-0">
                          <IconComponent className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{activity.title}</p>
                          {activity.description && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{activity.description}</p>
                          )}
                          <p className="text-xs text-gray-400 dark:text-gray-500">{formatTimeAgo(activity.timestamp)}</p>
                        </div>
                        {activity.xpEarned && activity.xpEarned > 0 && (
                          <div className="flex-shrink-0">
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-xs">
                              +{activity.xpEarned} XP
                            </Badge>
                          </div>
                        )}
                      </div>
                    )
                  })}
                  {data.recentActivity.length > 8 && (
                    <div className="text-center pt-2">
                      <Button variant="outline" size="sm" onClick={() => navigate('activities')}>
                        View All Activities
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No recent activity</p>
                  <p className="text-xs">Start using the app to see your progress here!</p>
                </div>
              )}
            </CollapsibleCard>

            {/* Weekly Progress */}
            <CollapsibleCard
              title="This Week"
              description="Your weekly progress summary"
              icon={TrendingUp}
              defaultExpanded={true}
              storageKey="dashboard-weekly-progress"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Missions Completed</span>
                  <span className="font-medium">{data.weeklyProgress.missionsCompleted}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Applications Submitted</span>
                  <span className="font-medium">{data.weeklyProgress.applicationsSubmitted}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Learning Hours</span>
                  <span className="font-medium">{data.weeklyProgress.learningHours}h</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Journal Entries</span>
                  <span className="font-medium">{data.weeklyProgress.notebookEntries}</span>
                </div>
              </div>
            </CollapsibleCard>

            {/* Upcoming Interviews */}
            {data.upcomingInterviews.length > 0 && (
              <CollapsibleCard
                title="Upcoming Interviews"
                description="Your scheduled interviews"
                icon={Calendar}
                defaultExpanded={true}
                storageKey="dashboard-upcoming-interviews"
              >
                <div className="space-y-3">
                  {data.upcomingInterviews.slice(0, 2).map((interview) => (
                    <div key={interview.id} className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-sm">{interview.role}</p>
                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                          {interview.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{interview.company}</p>
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        {new Date(interview.date).toLocaleDateString()} at {interview.time}
                      </p>
                    </div>
                  ))}
                </div>
              </CollapsibleCard>
            )}

            {/* Quick Tips */}
            <CollapsibleCard
              title="Quick Tips"
              description="Helpful advice for your job search"
              icon={Star}
              defaultExpanded={true}
              storageKey="dashboard-quick-tips"
            >
              <div className="space-y-3 text-sm">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <p>Complete daily missions to maintain your streak and earn bonus XP</p>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <p>Track all your applications to identify patterns and improve your approach</p>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <p>Use the daily notebook to reflect on your progress and learnings</p>
                </div>
              </div>
            </CollapsibleCard>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
