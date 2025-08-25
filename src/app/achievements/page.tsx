'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Trophy, 
  Target, 
  BookOpen, 
  BriefcaseIcon, 
  Zap, 
  Clock,
  TrendingUp,
  Lock,
  Unlock,
  Crown,
  Star,
  Users,
  Filter,
  Loader2,
  RefreshCw
} from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/hooks/use-toast'

type AchievementCategory = 'FOCUS' | 'LEARNING' | 'JOB_SEARCH' | 'STREAK' | 'XP' | 'SOCIAL'

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  category: AchievementCategory
  xpReward: number
  isUnlocked: boolean
  unlockedAt?: Date
  progress?: number
  maxProgress?: number
  requirement: string
}

interface AchievementsData {
  achievements: Achievement[]
  stats: {
    totalAchievements: number
    unlockedAchievements: number
    completionRate: number
    totalXPFromAchievements: number
  }
}

export default function AchievementsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [achievementsData, setAchievementsData] = useState<AchievementsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<AchievementCategory | 'ALL'>('ALL')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UNLOCKED' | 'LOCKED'>('ALL')
  const [checkingAchievements, setCheckingAchievements] = useState(false)
  const [newlyUnlockedAchievements, setNewlyUnlockedAchievements] = useState<string[]>([])

  useEffect(() => {
    if (user) {
      fetchAchievements()
    }
  }, [user])

  const fetchAchievements = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/achievements', {
        headers: {
          'Authorization': `Bearer ${user?.id}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch achievements')
      }

      const data = await response.json()
      setAchievementsData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const checkForNewAchievements = async () => {
    if (!user) return
    
    try {
      setCheckingAchievements(true)
      
      // Call user-stats API to trigger achievement checking
      const response = await fetch('/api/user-stats', {
        headers: {
          'Authorization': `Bearer ${user.id}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to check achievements')
      }

      // Refresh achievements data
      await fetchAchievements()
      
      // Check for newly unlocked achievements
      if (achievementsData) {
        const newUnlocked = achievementsData.achievements.filter(a => 
          a.isUnlocked && a.unlockedAt && 
          new Date(a.unlockedAt).getTime() > Date.now() - 60000
        ).map(a => a.id)
        
        if (newUnlocked.length > 0) {
          setNewlyUnlockedAchievements(newUnlocked)
          setTimeout(() => setNewlyUnlockedAchievements([]), 10000) // Clear after 10 seconds
        }
      }
      
      toast({
        title: 'Achievements Checked',
        description: 'Your progress has been updated and any new achievements have been unlocked!',
        variant: 'success',
      })
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to check for new achievements. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setCheckingAchievements(false)
    }
  }

  const getCategoryIcon = (category: AchievementCategory) => {
    switch (category) {
      case 'FOCUS': return Target
      case 'LEARNING': return BookOpen
      case 'JOB_SEARCH': return BriefcaseIcon
      case 'STREAK': return TrendingUp
      case 'XP': return Zap
      case 'SOCIAL': return Users
      default: return Trophy
    }
  }

  const getRarityColor = (achievement: Achievement) => {
    // Determine rarity based on XP reward
    if (achievement.xpReward >= 1000) return 'from-yellow-400 to-orange-500' // Legendary
    if (achievement.xpReward >= 500) return 'from-purple-400 to-purple-600' // Epic
    if (achievement.xpReward >= 200) return 'from-blue-400 to-blue-600' // Rare
    return 'from-gray-400 to-gray-600' // Common
  }

  const getRarityText = (achievement: Achievement) => {
    // Determine rarity based on XP reward
    if (achievement.xpReward >= 1000) return 'text-yellow-600' // Legendary
    if (achievement.xpReward >= 500) return 'text-purple-600' // Epic
    if (achievement.xpReward >= 200) return 'text-blue-600' // Rare
    return 'text-gray-600' // Common
  }

  const getRarityLabel = (achievement: Achievement) => {
    // Determine rarity based on XP reward
    if (achievement.xpReward >= 1000) return 'LEGENDARY'
    if (achievement.xpReward >= 500) return 'EPIC'
    if (achievement.xpReward >= 200) return 'RARE'
    return 'COMMON'
  }

  const filteredAchievements = achievementsData?.achievements.filter(achievement => {
    const matchesCategory = categoryFilter === 'ALL' || achievement.category === categoryFilter
    const matchesStatus = statusFilter === 'ALL' || 
                         (statusFilter === 'UNLOCKED' && achievement.isUnlocked) ||
                         (statusFilter === 'LOCKED' && !achievement.isUnlocked)
    return matchesCategory && matchesStatus
  }) || []

  const getLatestAchievement = () => {
    if (!achievementsData) return null
    return achievementsData.achievements
      .filter(a => a.isUnlocked)
      .sort((a, b) => new Date(b.unlockedAt || 0).getTime() - new Date(a.unlockedAt || 0).getTime())[0]
  }

  const latestAchievement = getLatestAchievement()

  if (loading) {
    return (
      <DashboardLayout title="Achievements">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading achievements...</span>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout title="Achievements">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchAchievements}>Try Again</Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!achievementsData) {
    return (
      <DashboardLayout title="Achievements">
        <div className="flex items-center justify-center min-h-[400px]">
          <p>No achievements data available</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Achievements">
      <div className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{achievementsData.stats.unlockedAchievements}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Achievements Unlocked</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{achievementsData.stats.completionRate}%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                  <Zap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{achievementsData.stats.totalXPFromAchievements}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">XP from Achievements</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <Star className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{achievementsData.achievements.filter(a => getRarityLabel(a) === 'LEGENDARY' && a.isUnlocked).length}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Legendary Unlocked</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* New Achievements Celebration */}
        {newlyUnlockedAchievements.length > 0 && (
          <Card className="border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 dark:border-yellow-700 animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center justify-center space-x-3">
                <Trophy className="h-8 w-8 text-yellow-600 dark:text-yellow-400 animate-bounce" />
                <div className="text-center">
                  <h3 className="text-lg font-bold text-yellow-800 dark:text-yellow-200">
                    🎉 New Achievements Unlocked! 🎉
                  </h3>
                  <p className="text-yellow-700 dark:text-yellow-300">
                    Congratulations! You&apos;ve unlocked {newlyUnlockedAchievements.length} new achievement{newlyUnlockedAchievements.length > 1 ? 's' : ''}!
                  </p>
                </div>
                <Trophy className="h-8 w-8 text-yellow-600 dark:text-yellow-400 animate-bounce" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Achievement */}
        {latestAchievement && (
          <Card className="border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 dark:border-yellow-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-yellow-800 dark:text-yellow-200">
                <Trophy className="h-5 w-5" />
                <span>Latest Achievement</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-16 h-16 bg-gradient-to-r ${getRarityColor(latestAchievement)} rounded-full flex items-center justify-center`}>
                    {(() => {
                      const IconComponent = getCategoryIcon(latestAchievement.category)
                      return <IconComponent className="h-8 w-8 text-white" />
                    })()}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100">{latestAchievement.name}</h3>
                    <p className="text-yellow-700 dark:text-yellow-300">{latestAchievement.description}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className={`px-2 py-1 ${getRarityText(latestAchievement).replace('text-', 'bg-').replace('-600', '-100')} ${getRarityText(latestAchievement)} text-xs rounded-full font-medium dark:bg-opacity-20`}>
                        {getRarityLabel(latestAchievement)}
                      </span>
                      <span className="text-sm text-yellow-800 dark:text-yellow-200">+{latestAchievement.xpReward} XP</span>
                    </div>
                  </div>
                </div>
                <div className="text-right text-yellow-700 dark:text-yellow-300">
                  <p className="text-sm">Unlocked</p>
                  <p className="text-xs">
                    {latestAchievement.unlockedAt ? 
                      new Date(latestAchievement.unlockedAt).toLocaleDateString() : 
                      'Recently'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters and Actions */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value as AchievementCategory | 'ALL')}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="ALL">All Categories</option>
                  <option value="FOCUS">Focus</option>
                  <option value="LEARNING">Learning</option>
                  <option value="JOB_SEARCH">Job Search</option>
                  <option value="STREAK">Streaks</option>
                  <option value="XP">Experience</option>
                  <option value="SOCIAL">Social</option>
                </select>
                
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as 'ALL' | 'UNLOCKED' | 'LOCKED')}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="ALL">All Status</option>
                  <option value="UNLOCKED">Unlocked</option>
                  <option value="LOCKED">Locked</option>
                </select>
              </div>
              
              <Button 
                onClick={checkForNewAchievements}
                disabled={checkingAchievements}
                className="flex items-center space-x-2"
              >
                {checkingAchievements ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                <span>Check Achievements</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAchievements.map((achievement) => {
            const CategoryIcon = getCategoryIcon(achievement.category)
            
            return (
              <Card 
                key={achievement.id} 
                className={`hover:shadow-md transition-all duration-300 ${
                  achievement.isUnlocked ? 'border-l-4 border-l-yellow-400' : 'opacity-80'
                } ${newlyUnlockedAchievements.includes(achievement.id) ? 
                   'animate-pulse ring-2 ring-yellow-400' : ''}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-r ${
                        achievement.isUnlocked ? getRarityColor(achievement) : 'from-gray-300 to-gray-400'
                      }`}>
                        {achievement.isUnlocked ? (
                          <CategoryIcon className="h-6 w-6 text-white" />
                        ) : (
                          <Lock className="h-6 w-6 text-white" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold">{achievement.name}</h3>
                        <span className={`text-xs font-medium ${getRarityText(achievement)}`}>
                          {getRarityLabel(achievement)}
                        </span>
                      </div>
                    </div>
                    {achievement.isUnlocked ? (
                      <Unlock className="h-5 w-5 text-green-500" />
                    ) : (
                      <Lock className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className={`text-sm ${achievement.isUnlocked ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400'}`}>
                    {achievement.description}
                  </p>
                  
                  {achievement.progress !== undefined && achievement.maxProgress && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className={achievement.isUnlocked ? 'text-green-600 font-medium' : 'text-gray-600'}>
                          {achievement.progress} / {achievement.maxProgress}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            achievement.isUnlocked ? 'bg-green-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium">+{achievement.xpReward} XP</span>
                    </div>
                    {achievement.unlockedAt && (
                      <span className="text-xs text-gray-500">
                        {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredAchievements.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No achievements found matching your filters</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}