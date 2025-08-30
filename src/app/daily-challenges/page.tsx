'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CollapsibleCard } from '@/components/ui/collapsible-card'
import { Trophy, Target, BookOpen, BriefcaseIcon, Clock, Zap, Calendar, CheckCircle, Play, ArrowLeft, Star, TrendingUp } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { getAuthHeaders } from '@/lib/auth'
import { useToast } from '@/hooks/use-toast'

interface DailyChallenge {
  id: string
  title: string
  description: string
  type: string
  xpReward: number
  date: string
}

interface ChallengeProgress {
  id: string
  status: string
  progress: number
  completedAt?: string
  challenge: DailyChallenge
}

interface DailyChallengesData {
  currentChallenges: Array<{
    challenge: DailyChallenge
    progress: ChallengeProgress
    progressPercentage: number
  }>
  recentChallenges: Array<{
    challenge: DailyChallenge
    progress: ChallengeProgress
    progressPercentage: number
  }>
  stats: {
    totalCompleted: number
    totalXpEarned: number
    currentStreak: number
    longestStreak: number
  }
}

export default function DailyChallengesPage() {
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [data, setData] = useState<DailyChallengesData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (!user) return

    const fetchDailyChallenges = async () => {
      try {
        const response = await fetch('/api/daily-challenges', {
          headers: getAuthHeaders()
        })
        if (!response.ok) {
          throw new Error('Failed to fetch daily challenges')
        }
        const challengesData = await response.json()
        setData(challengesData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchDailyChallenges()
  }, [user])


  const getChallengeIcon = (type: string) => {
    switch (type) {
      case 'FOCUS': return Target
      case 'LEARNING': return BookOpen
      case 'JOB_APPLICATION': return BriefcaseIcon
      case 'STREAK': return TrendingUp
      case 'XP': return Star
      default: return Trophy
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
      case 'NOT_STARTED': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  if (authLoading || loading) {
    return (
      <DashboardLayout title="Daily Challenges">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
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
      <DashboardLayout title="Daily Challenges">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error loading daily challenges: {error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Daily Challenges">
      <div className="space-y-8 max-w-7xl mx-auto px-4">
        {/* Enhanced Header */}
        <div className="text-center space-y-6">
          <div className="relative inline-block">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-pink-600 to-purple-600 dark:from-white dark:via-pink-400 dark:to-purple-400 bg-clip-text text-transparent">
              Daily Challenges
            </h1>
            <div className="absolute -top-3 -right-3 w-6 h-6 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full shadow-lg"></div>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"></div>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Complete daily challenges to earn bonus XP and track your progress with gamified learning
          </p>
          <div className="flex justify-center">
            <Button variant="outline" onClick={() => router.back()} className="px-6 py-3 rounded-2xl border-2 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
        </div>

        {/* Enhanced Stats Overview */}
        {data && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-0 bg-gradient-to-br from-yellow-50 via-amber-50 to-yellow-100 dark:from-yellow-900/20 dark:via-amber-900/20 dark:to-yellow-800/20 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-amber-500/10"></div>
              <CardContent className="p-6 relative">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-yellow-600 dark:text-yellow-400 uppercase tracking-wide">Total Completed</p>
                    <p className="text-3xl font-bold text-yellow-900 dark:text-yellow-100">{data.stats.totalCompleted}</p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Trophy className="h-7 w-7 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 bg-gradient-to-br from-orange-50 via-red-50 to-orange-100 dark:from-orange-900/20 dark:via-red-900/20 dark:to-orange-800/20 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10"></div>
              <CardContent className="p-6 relative">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wide">Total XP Earned</p>
                    <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">{data.stats.totalXpEarned}</p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Star className="h-7 w-7 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100 dark:from-emerald-900/20 dark:via-green-900/20 dark:to-emerald-800/20 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-green-500/10"></div>
              <CardContent className="p-6 relative">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">Current Streak</p>
                    <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">{data.stats.currentStreak}</p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <TrendingUp className="h-7 w-7 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-purple-800/20 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10"></div>
              <CardContent className="p-6 relative">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide">Longest Streak</p>
                    <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">{data.stats.longestStreak}</p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Trophy className="h-7 w-7 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Current Challenges */}
        {data?.currentChallenges && data.currentChallenges.length > 0 && (
          <CollapsibleCard
            title="Today's Challenges"
            description="Complete today's challenges for bonus XP"
            icon={Trophy}
            defaultExpanded={true}
            storageKey="daily-challenges-current"
          >
            <div className="space-y-6">
              {data.currentChallenges.map((challengeData) => (
                <div key={challengeData.challenge.id} className="space-y-4">
                  <div className="flex items-center justify-between p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                        {(() => {
                          const IconComponent = getChallengeIcon(challengeData.challenge.type)
                          return <IconComponent className="h-6 w-6 text-white" />
                        })()}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                          {challengeData.challenge.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                          {challengeData.challenge.description}
                        </p>
                        <div className="flex items-center space-x-4 mt-2">
                          <Badge className={getStatusColor(challengeData.progress.status)}>
                            {challengeData.progress.status.replace('_', ' ')}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            +{challengeData.challenge.xpReward} XP
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-bold text-purple-600">
                        {challengeData.progressPercentage}%
                      </div>
                      <div className="text-sm text-gray-500">Complete</div>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Progress</span>
                      <span className="font-medium">{challengeData.progressPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full shadow-sm transition-all duration-300" 
                        style={{ width: `${challengeData.progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                  
                </div>
              ))}
            </div>
          </CollapsibleCard>
        )}

        {/* Recent Challenges */}
        <CollapsibleCard
          title="Recent Challenges"
          description="Your challenge history from the past week"
          icon={Calendar}
          defaultExpanded={true}
          storageKey="daily-challenges-recent"
        >
          <div className="space-y-4">
            {data?.recentChallenges && data.recentChallenges.length > 0 ? (
              data.recentChallenges.map((challengeData) => (
                <div key={challengeData.challenge.id} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      {(() => {
                        const IconComponent = getChallengeIcon(challengeData.challenge.type)
                        return <IconComponent className="h-5 w-5 text-white" />
                      })()}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                        {challengeData.challenge.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(challengeData.challenge.date)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <Badge className={getStatusColor(challengeData.progress.status)}>
                      {challengeData.progress.status.replace('_', ' ')}
                    </Badge>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900 dark:text-gray-100">
                        +{challengeData.challenge.xpReward} XP
                      </div>
                      <div className="text-sm text-gray-500">
                        {challengeData.progressPercentage}% complete
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Trophy className="h-16 w-16 mx-auto mb-6 text-gray-300" />
                <p className="text-lg font-medium mb-2">No recent challenges</p>
                <p className="text-sm text-gray-400">Complete your first challenge to see it here!</p>
              </div>
            )}
          </div>
        </CollapsibleCard>

        {/* Challenge Tips */}
        <CollapsibleCard
          title="Challenge Tips"
          description="How to maximize your challenge completion"
          icon={Zap}
          defaultExpanded={true}
          storageKey="daily-challenges-tips"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Complete challenges daily</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Build a streak to earn bonus rewards</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Focus on variety</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Different challenge types offer different XP rewards</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Plan ahead</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Some challenges require specific timing or conditions</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Track your progress</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Monitor your completion rate and XP earnings</p>
                </div>
              </div>
            </div>
          </div>
        </CollapsibleCard>
      </div>
    </DashboardLayout>
  )
}
