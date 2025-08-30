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
import { useToast } from '@/hooks/use-toast'

interface DashboardData {
  activeMissions: any[]
  dailyChallenges: any[]
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
  const { toast } = useToast()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showWelcome, setShowWelcome] = useState(false)
  const [previousChallengeStatus, setPreviousChallengeStatus] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('login')
    }
  }, [user, authLoading, navigate])

  // Check if we should show the welcome message
  useEffect(() => {
    if (user) {
      const welcomeKey = `welcome-shown-${user.id}`
      const lastWelcomeShown = localStorage.getItem(welcomeKey)
      const currentSession = sessionStorage.getItem('current-session')
      
      // Show welcome if it hasn't been shown in this session or if it's been more than 24 hours
      const now = new Date().getTime()
      const lastShown = lastWelcomeShown ? parseInt(lastWelcomeShown) : 0
      const twentyFourHours = 24 * 60 * 60 * 1000
      
      if (!currentSession || (now - lastShown) > twentyFourHours) {
        setShowWelcome(true)
        sessionStorage.setItem('current-session', 'true')
      }
    }
  }, [user])

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
        // Check for daily challenge completion
        if (dashboardData.dailyChallenges && 
            dashboardData.dailyChallenges.length > 0) {
          
          // Check if any challenge was just completed
          const completedChallenge = dashboardData.dailyChallenges.find(
            (challenge: any) => challenge.progress && 
            previousChallengeStatus && 
            previousChallengeStatus !== 'COMPLETED' && 
            challenge.progress.status === 'COMPLETED'
          )
          
          if (completedChallenge) {
            // Show completion toast
            toast({
              title: "🎉 Daily Challenge Completed!",
              description: `Congratulations! You completed "${completedChallenge.challenge.title}" and earned ${completedChallenge.challenge.xpReward} XP!`,
              variant: "default",
              actionUrl: "/daily-challenges"
            })
          }
        }

        // Also check recent activities for challenge completion events
        if (dashboardData.recentActivity && dashboardData.recentActivity.length > 0) {
          const challengeCompletionActivity = dashboardData.recentActivity.find(
            (activity: any) => activity.type === 'daily_challenge_completed' && 
            activity.timestamp && 
            new Date(activity.timestamp).getTime() > Date.now() - 30000 // Within last 30 seconds
          )
          
          if (challengeCompletionActivity) {
            toast({
              title: "🎉 Daily Challenge Completed!",
              description: `Congratulations! You completed a daily challenge and earned ${challengeCompletionActivity.xpEarned || 0} XP!`,
              variant: "default",
              actionUrl: "/daily-challenges"
            })
          }
        }

        setData({
          activeMissions: dashboardData.activeMissions || [],
          dailyChallenges: dashboardData.dailyChallenges || [],
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

        // Update previous challenge status for next comparison
        if (dashboardData.dailyChallenges && dashboardData.dailyChallenges.length > 0) {
          const firstChallenge = dashboardData.dailyChallenges[0]
          if (firstChallenge.progress) {
            setPreviousChallengeStatus(firstChallenge.progress.status)
          }
        }

        // Challenges are now automatically started when created
        
        // Update daily challenge progress to ensure it's current
        if (dashboardData.dailyChallenges && dashboardData.dailyChallenges.length > 0) {
          try {
            await fetch('/api/daily-challenges/update-progress', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders()
              }
            })
          } catch (error) {
            console.error('Error updating daily challenge progress:', error)
          }
        }
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
      case 'APPLIED': return 'bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20'
      case 'INTERVIEW': return 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20'
      case 'OFFER': return 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20'
      case 'REJECTED': return 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20'
      case 'COMPLETED': return 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20'
      case 'IN_PROGRESS': return 'bg-[#6366F1]/10 text-[#6366F1] border-[#6366F1]/20'
      default: return 'bg-[#64748B]/10 text-[#64748B] border-[#64748B]/20'
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
      <div className="space-y-6 lg:space-y-8 max-w-7xl mx-auto">
        {/* Welcome Section */}
        {showWelcome && (
          <Card className="relative shadow-professional">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowWelcome(false)
                // Mark welcome as shown for this user
                const welcomeKey = `welcome-shown-${user?.id}`
                localStorage.setItem(welcomeKey, new Date().getTime().toString())
              }}
              className="absolute top-2 right-2 h-8 w-8 p-0 text-[#64748B] hover:text-[#F1F5F9]"
            >
              <X className="h-4 w-4" />
            </Button>
            <CardHeader>
              <CardTitle className="text-3xl font-bold flex items-center gap-3 text-[#F8FAFC] pr-8">
                <TrendingUp className="h-6 w-6 text-[#3B82F6]" />
                Welcome back, {user?.name || 'Job Seeker'}!
              </CardTitle>
              <CardDescription className="text-base text-[#F1F5F9] mt-2">
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
            <Button 
              variant="outline" 
              className="h-24 w-full flex-col space-y-2 border-2 border-[#1E293B] hover:border-[#3B82F6] hover:bg-[#111827] transition-all duration-200"
              onClick={() => navigate('missions')}
            >
              <Target className="h-7 w-7 text-[#3B82F6]" />
              <span className="text-sm font-medium">Start Mission</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-24 w-full flex-col space-y-2 border-2 border-[#1E293B] hover:border-[#6366F1] hover:bg-[#111827] transition-all duration-200"
              onClick={() => navigate('jobs')}
            >
              <BriefcaseIcon className="h-7 w-7 text-[#6366F1]" />
              <span className="text-sm font-medium">Add Job</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-24 w-full flex-col space-y-2 border-2 border-[#1E293B] hover:border-[#10B981] hover:bg-[#111827] transition-all duration-200"
              onClick={() => navigate('learning')}
            >
              <BookOpen className="h-7 w-7 text-[#10B981]" />
              <span className="text-sm font-medium">Learn</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-24 w-full flex-col space-y-2 border-2 border-[#1E293B] hover:border-[#F59E0B] hover:bg-[#111827] transition-all duration-200"
              onClick={() => navigate('notebook')}
            >
              <FileText className="h-7 w-7 text-[#F59E0B]" />
              <span className="text-sm font-medium">Journal</span>
            </Button>
          </div>
        </CollapsibleCard>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Active Missions & Daily Challenge */}
          <div className="lg:col-span-2 space-y-6 lg:space-y-8">
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
                    <div key={mission.id} className="flex items-center justify-between p-4 bg-[#1E293B] rounded-xl border border-[#334155] hover:shadow-professional transition-all duration-200">
                      <div className="flex items-center space-x-3">
                        <Target className="h-5 w-5 text-[#3B82F6]" />
                        <div>
                          <p className="font-semibold text-lg">{mission.title}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{mission.description}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" onClick={handleViewMission}>Continue</Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <Target className="h-16 w-16 mx-auto mb-6 text-[#64748B]" />
                    <p className="text-lg font-medium mb-2">No active missions</p>
                    <p className="text-sm text-[#94A3B8]">Start a new mission to begin earning XP!</p>
                    <Button size="sm" className="mt-2" onClick={() => navigate('missions')}>
                      <Plus className="h-4 w-4 mr-1" />
                      Create Mission
                    </Button>
                  </div>
                )}
              </div>
            </CollapsibleCard>

            {/* Daily Challenges */}
            <CollapsibleCard
              title="Daily Challenges"
              description="Complete daily challenges for bonus XP"
              icon={Trophy}
              defaultExpanded={true}
              storageKey="dashboard-daily-challenge"
              headerChildren={
                <Button variant="outline" size="sm" onClick={() => navigate('daily-challenges')}>
                  View All
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              }
            >
              {data.dailyChallenges && data.dailyChallenges.length > 0 ? (
                <div className="space-y-4">
                  {data.dailyChallenges.map((challengeData: any) => (
                    <div key={challengeData.challenge.id} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-[#3B82F6] rounded-full flex items-center justify-center shadow-professional">
                            <Trophy className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-lg">{challengeData.challenge.title}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{challengeData.challenge.description}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="w-full bg-[#334155] rounded-full h-3">
                        <div 
                          className="bg-[#3B82F6] h-3 rounded-full shadow-sm" 
                          style={{ width: `${challengeData.progressPercentage}%` }}
                        ></div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">{challengeData.progressPercentage}% completed</span>
                        <span className="font-medium text-[#F59E0B]">+{challengeData.challenge.xpReward} XP</span>
                      </div>
                      
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <Trophy className="h-16 w-16 mx-auto mb-6 text-[#64748B]" />
                  <p className="text-lg font-medium mb-2">No challenges available today</p>
                  <p className="text-sm text-[#94A3B8]">Check back tomorrow for new challenges!</p>
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
                    <div key={job.id} className="flex items-center justify-between p-4 bg-[#1E293B] rounded-xl border border-[#334155] hover:shadow-professional transition-all duration-200">
                      <div className="flex items-center space-x-3">
                        <Building className="h-5 w-5 text-[#6366F1]" />
                        <div>
                          <p className="font-semibold text-base">{job.role}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{job.company}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(job.status)}>
                          {job.status}
                        </Badge>
                        <span className="text-sm text-gray-500 font-medium">{formatTimeAgo(job.appliedDate)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                  <BriefcaseIcon className="h-12 w-12 mx-auto mb-4 text-[#64748B]" />
                  <p className="text-lg font-medium mb-2">No recent applications</p>
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
                    <div key={item.id} className="flex items-center justify-between p-4 bg-[#1E293B] rounded-xl border border-[#334155] hover:shadow-professional transition-all duration-200">
                      <div className="flex items-center space-x-3">
                        {(() => {
                          const IconComponent = getIconComponent(item.type === 'VIDEO' ? 'video' : 'file')
                          return <IconComponent className="h-5 w-5 text-[#10B981]" />
                        })()}
                        <div>
                          <p className="font-semibold text-base">{item.title}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.source}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                        <span className="text-sm text-gray-500 font-medium">{item.progress || 0}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-[#64748B]" />
                  <p className="text-lg font-medium mb-2">No learning activities</p>
                  <Button size="sm" className="mt-2" onClick={() => navigate('learning')}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Resource
                  </Button>
                </div>
              )}
            </CollapsibleCard>
          </div>

          {/* Right Column - Calendar, Recent Activity, Recommendations */}
          <div className="space-y-6 lg:space-y-8">
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
                userTimezone={(user as any)?.timezone || 'UTC'}
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
                      <div key={index} className="flex items-center space-x-3 p-3 rounded-xl hover:bg-[#1E293B] transition-all duration-200">
                        <div className="w-10 h-10 bg-[#1E293B] rounded-full flex items-center justify-center flex-shrink-0 shadow-professional border border-[#334155]">
                          <IconComponent className="h-5 w-5 text-[#F59E0B]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate">{activity.title}</p>
                          {activity.description && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{activity.description}</p>
                          )}
                          <p className="text-xs text-gray-400 dark:text-gray-500">{formatTimeAgo(activity.timestamp)}</p>
                        </div>
                        {activity.xpEarned !== null && activity.xpEarned !== undefined && (
                          <div className="flex-shrink-0">
                            <Badge className={`text-xs ${
                              activity.xpEarned > 0 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                            }`}>
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
                <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-[#64748B]" />
                  <p className="text-lg font-medium mb-2">No recent activity</p>
                  <p className="text-sm text-[#94A3B8]">Start using the app to see your progress here!</p>
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
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Missions Completed</span>
                  <span className="font-bold text-lg text-[#3B82F6]">{data.weeklyProgress.missionsCompleted}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Applications Submitted</span>
                  <span className="font-bold text-lg text-[#6366F1]">{data.weeklyProgress.applicationsSubmitted}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Learning Hours</span>
                  <span className="font-bold text-lg text-[#10B981]">{data.weeklyProgress.learningHours}h</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Journal Entries</span>
                  <span className="font-bold text-lg text-[#F59E0B]">{data.weeklyProgress.notebookEntries}</span>
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
                    <div key={interview.id} className="p-4 bg-[#1E293B] rounded-xl border border-[#334155] shadow-professional">
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-semibold text-base">{interview.role}</p>
                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                          {interview.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{interview.company}</p>
                      <p className="text-sm text-[#6366F1] font-medium">
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
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-[#10B981] mt-0.5 flex-shrink-0" />
                  <p className="text-sm font-medium">Complete daily missions to maintain your streak and earn bonus XP</p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-[#10B981] mt-0.5 flex-shrink-0" />
                  <p className="text-sm font-medium">Track all your applications to identify patterns and improve your approach</p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-[#10B981] mt-0.5 flex-shrink-0" />
                  <p className="text-sm font-medium">Use the daily notebook to reflect on your progress and learnings</p>
                </div>
              </div>
            </CollapsibleCard>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
