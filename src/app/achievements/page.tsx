'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  RefreshCw,
  ArrowUpDown,
  ChevronDown,
  Sparkles,
  Award,
  Medal,
  Gem,
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  List
} from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/hooks/use-toast'

type AchievementCategory = 'FOCUS' | 'LEARNING' | 'JOB_SEARCH' | 'STREAK' | 'XP' | 'SOCIAL'
type AchievementRarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'
type SortOption = 'name' | 'rarity' | 'xpReward' | 'category' | 'unlocked' | 'progress'

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

const ITEMS_PER_PAGE = 12

export default function AchievementsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [achievementsData, setAchievementsData] = useState<AchievementsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<AchievementCategory | 'ALL'>('ALL')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UNLOCKED' | 'LOCKED'>('ALL')
  const [rarityFilter, setRarityFilter] = useState<AchievementRarity | 'ALL'>('ALL')
  const [sortBy, setSortBy] = useState<SortOption>('rarity')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [checkingAchievements, setCheckingAchievements] = useState(false)
  const [newlyUnlockedAchievements, setNewlyUnlockedAchievements] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [activeTab, setActiveTab] = useState<string>('all')

  useEffect(() => {
    if (user) {
      fetchAchievements()
    }
  }, [user])

  useEffect(() => {
    setCurrentPage(1) // Reset to first page when filters change
  }, [categoryFilter, statusFilter, rarityFilter, searchQuery])

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
    // Determine rarity based on XP reward with enhanced gradients
    if (achievement.xpReward >= 1000) return 'from-yellow-300 via-yellow-400 to-orange-400' // LEGENDARY
    if (achievement.xpReward >= 500) return 'from-purple-400 via-purple-500 to-pink-500' // Epic
    if (achievement.xpReward >= 200) return 'from-blue-400 via-blue-500 to-cyan-500' // Rare
    return 'from-gray-300 via-gray-400 to-gray-500' // Common
  }

  const getRarityBorder = (achievement: Achievement) => {
    // Enhanced border colors for rarity
    if (achievement.xpReward >= 1000) return 'border-yellow-400 shadow-lg shadow-yellow-200/50' // LEGENDARY
    if (achievement.xpReward >= 500) return 'border-purple-400 shadow-lg shadow-purple-200/50' // Epic
    if (achievement.xpReward >= 200) return 'border-blue-400 shadow-lg shadow-blue-200/50' // Rare
    return 'border-gray-300 shadow-md' // Common
  }

  const getRarityText = (achievement: Achievement) => {
    // Determine rarity text color
    if (achievement.xpReward >= 1000) return 'text-yellow-600 dark:text-yellow-400' // LEGENDARY
    if (achievement.xpReward >= 500) return 'text-purple-600 dark:text-purple-400' // Epic
    if (achievement.xpReward >= 200) return 'text-blue-600 dark:text-blue-400' // Rare
    return 'text-gray-600 dark:text-gray-400' // Common
  }

  const getRarityBg = (achievement: Achievement) => {
    // Background color for rarity labels
    if (achievement.xpReward >= 1000) return 'bg-yellow-600/10' // LEGENDARY
    if (achievement.xpReward >= 500) return 'bg-purple-600/10' // Epic
    if (achievement.xpReward >= 200) return 'bg-primary/10' // Rare
    return 'bg-gray-600/10' // Common
  }

  const getRarityLabel = (achievement: Achievement): AchievementRarity => {
    // Determine rarity based on XP reward
    if (achievement.xpReward >= 1000) return 'LEGENDARY'
    if (achievement.xpReward >= 500) return 'EPIC'
    if (achievement.xpReward >= 200) return 'RARE'
    return 'COMMON'
  }

  const getRarityIcon = (achievement: Achievement) => {
    const rarity = getRarityLabel(achievement)
    switch (rarity) {
      case 'LEGENDARY': return <Crown className="h-3 w-3" />
      case 'EPIC': return <Gem className="h-3 w-3" />
      case 'RARE': return <Medal className="h-3 w-3" />
      default: return <Award className="h-3 w-3" />
    }
  }

  const filteredAndSortedAchievements = (() => {
    if (!achievementsData) return []
    
    let filtered = achievementsData.achievements.filter(achievement => {
      // Hide social achievements for now
      if (achievement.category === 'SOCIAL') return false
      
      const matchesCategory = categoryFilter === 'ALL' || achievement.category === categoryFilter
      const matchesStatus = statusFilter === 'ALL' || 
                           (statusFilter === 'UNLOCKED' && achievement.isUnlocked) ||
                           (statusFilter === 'LOCKED' && !achievement.isUnlocked)
      const matchesRarity = rarityFilter === 'ALL' || getRarityLabel(achievement) === rarityFilter
      const matchesSearch = searchQuery === '' || 
                           achievement.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           achievement.description.toLowerCase().includes(searchQuery.toLowerCase())
      
      return matchesCategory && matchesStatus && matchesRarity && matchesSearch
    })

    // Sort achievements
    filtered.sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'rarity':
          const rarityOrder = { 'COMMON': 0, 'RARE': 1, 'EPIC': 2, 'LEGENDARY': 3 }
          comparison = rarityOrder[getRarityLabel(a)] - rarityOrder[getRarityLabel(b)]
          break
        case 'xpReward':
          comparison = a.xpReward - b.xpReward
          break
        case 'category':
          comparison = a.category.localeCompare(b.category)
          break
        case 'unlocked':
          comparison = (a.isUnlocked ? 1 : 0) - (b.isUnlocked ? 1 : 0)
          break
        case 'progress':
          const aProgress = a.progress && a.maxProgress ? a.progress / a.maxProgress : 0
          const bProgress = b.progress && b.maxProgress ? b.progress / b.maxProgress : 0
          comparison = aProgress - bProgress
          break
        default:
          comparison = 0
      }
      
      return sortOrder === 'desc' ? -comparison : comparison
    })

    return filtered
  })()

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedAchievements.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedAchievements = filteredAndSortedAchievements.slice(startIndex, endIndex)

  const getLatestAchievement = () => {
    if (!achievementsData) return null
    return achievementsData.achievements
      .filter(a => a.isUnlocked && a.category !== 'SOCIAL')
      .sort((a, b) => new Date(b.unlockedAt || 0).getTime() - new Date(a.unlockedAt || 0).getTime())[0]
  }

  const latestAchievement = getLatestAchievement()

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    if (value === 'all') {
      setCategoryFilter('ALL')
    } else {
      setCategoryFilter(value as AchievementCategory)
    }
  }

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
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Your Achievements
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Track your progress and celebrate your accomplishments
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="w-full">
            <CardContent className="p-4 h-20 flex items-center justify-center">
              <div className="flex items-center justify-center gap-3 w-full">
                <div className="text-center flex-1">
                  <div className="text-xl font-bold">{achievementsData.stats.unlockedAchievements}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Unlocked</div>
                </div>
                <Trophy className="h-6 w-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="w-full">
            <CardContent className="p-4 h-20 flex items-center justify-center">
              <div className="flex items-center justify-center gap-3 w-full">
                <div className="text-center flex-1">
                  <div className="text-xl font-bold">{achievementsData.stats.completionRate}%</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Complete</div>
                </div>
                <Target className="h-6 w-6 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="w-full">
            <CardContent className="p-4 h-20 flex items-center justify-center">
              <div className="flex items-center justify-center gap-3 w-full">
                <div className="text-center flex-1">
                  <div className="text-xl font-bold">{achievementsData.stats.totalXPFromAchievements}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Total XP</div>
                </div>
                <Zap className="h-6 w-6 text-purple-600 dark:text-purple-400 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="w-full">
            <CardContent className="p-4 h-20 flex items-center justify-center">
              <div className="flex items-center justify-center gap-3 w-full">
                <div className="text-center flex-1">
                  <div className="text-xl font-bold">{achievementsData.achievements.filter(a => a.category !== 'SOCIAL' && getRarityLabel(a) === 'LEGENDARY' && a.isUnlocked).length}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Legendary</div>
                </div>
                <Star className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* New Achievements Celebration */}
        {newlyUnlockedAchievements.length > 0 && (
          <Card className="border-yellow-200 bg-yellow-600/10 dark:border-yellow-700 animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center justify-center space-x-3">
                <Trophy className="h-6 w-6 text-yellow-600 dark:text-yellow-400 animate-bounce" />
                <div className="text-center">
                  <h3 className="text-base font-bold text-yellow-800 dark:text-yellow-200">
                    🎉 New Achievements Unlocked! 🎉
                  </h3>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Congratulations! You&apos;ve unlocked {newlyUnlockedAchievements.length} new achievement{newlyUnlockedAchievements.length > 1 ? 's' : ''}!
                  </p>
                </div>
                <Trophy className="h-6 w-6 text-yellow-600 dark:text-yellow-400 animate-bounce" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Achievement */}
        {latestAchievement && (
          <Card className="border-yellow-200 bg-yellow-600/10 dark:border-yellow-700">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-yellow-800 dark:text-yellow-200 text-lg">
                <Trophy className="h-5 w-5" />
                <span>Latest Achievement</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 ${getRarityColor(latestAchievement).replace('text-', 'bg-').replace('-600', '-600')} rounded-full flex items-center justify-center`}>
                    {(() => {
                      const IconComponent = getCategoryIcon(latestAchievement.category)
                      return <IconComponent className="h-6 w-6 text-white" />
                    })()}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-yellow-900 dark:text-yellow-100">{latestAchievement.name}</h3>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">{latestAchievement.description}</p>
                    <div className="flex items-center space-x-2 mt-1">
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

        {/* Enhanced Filters and Actions */}
        <Card>
          <CardContent className="p-4">
            {/* Search Bar */}
            <div className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search achievements..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Category Tabs */}
            <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-4">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="FOCUS">🎯 Focus</TabsTrigger>
                <TabsTrigger value="LEARNING">📚 Learning</TabsTrigger>
                <TabsTrigger value="JOB_SEARCH">💼 Jobs</TabsTrigger>
                <TabsTrigger value="STREAK">🔥 Streaks</TabsTrigger>
                <TabsTrigger value="XP">⚡ XP</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as 'ALL' | 'UNLOCKED' | 'LOCKED')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
                >
                  <option value="ALL">All Status</option>
                  <option value="UNLOCKED">✅ Unlocked</option>
                  <option value="LOCKED">🔒 Locked</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Rarity</label>
                <select
                  value={rarityFilter}
                  onChange={(e) => setRarityFilter(e.target.value as AchievementRarity | 'ALL')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
                >
                  <option value="ALL">All Rarities</option>
                  <option value="COMMON">🥉 Common</option>
                  <option value="RARE">🥈 Rare</option>
                  <option value="EPIC">🥇 Epic</option>
                  <option value="LEGENDARY">👑 Legendary</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Sort</label>
                <div className="flex space-x-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
                  >
                    <option value="rarity">Rarity</option>
                    <option value="name">Name</option>
                    <option value="xpReward">XP Reward</option>
                    <option value="unlocked">Status</option>
                    <option value="progress">Progress</option>
                  </select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="px-2"
                  >
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Action Buttons and Stats */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                <span>Showing {filteredAndSortedAchievements.length} achievements</span>
                {totalPages > 1 && (
                  <span>Page {currentPage} of {totalPages}</span>
                )}
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  className="flex items-center space-x-2"
                >
                  {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
                  <span>{viewMode === 'grid' ? 'List' : 'Grid'}</span>
                </Button>
                
                <Button 
                  onClick={checkForNewAchievements}
                  disabled={checkingAchievements}
                  className="flex items-center space-x-2"
                  size="sm"
                >
                  {checkingAchievements ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  <span>Check</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Achievements Display */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginatedAchievements.map((achievement) => {
              const CategoryIcon = getCategoryIcon(achievement.category)
              const rarityLabel = getRarityLabel(achievement)
              
              return (
                <Card 
                  key={achievement.id} 
                  className={`hover:shadow-lg transition-all duration-300 ${getRarityBorder(achievement)} ${
                    achievement.isUnlocked ? 'transform hover:scale-105' : 'opacity-75'
                  } ${newlyUnlockedAchievements.includes(achievement.id) ? 
                     'animate-pulse ring-4 ring-yellow-400/50' : ''} relative overflow-hidden`}
                >
                  {/* Rarity Indicator */}
                  <div className={`absolute top-0 right-0 w-0 h-0 border-l-[25px] border-b-[25px] border-l-transparent ${
                    achievement.isUnlocked ? 
                      (rarityLabel === 'LEGENDARY' ? 'border-b-yellow-400' :
                       rarityLabel === 'EPIC' ? 'border-b-purple-500' :
                       rarityLabel === 'RARE' ? 'border-b-blue-500' : 'border-b-gray-400') 
                      : 'border-b-gray-300'
                  }`}>
                  </div>
                  
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          achievement.isUnlocked ? getRarityColor(achievement).replace('text-', 'bg-').replace('-600', '-600') : 'bg-gray-600'
                        } shadow-lg`}>
                          {achievement.isUnlocked ? (
                            <CategoryIcon className="h-5 w-5 text-white drop-shadow-sm" />
                          ) : (
                            <Lock className="h-5 w-5 text-white drop-shadow-sm" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-sm leading-tight truncate">{achievement.name}</h3>
                          <div className={`inline-flex items-center space-x-1 px-1 py-0.5 rounded-full text-xs font-bold ${getRarityBg(achievement)} ${getRarityText(achievement)} mt-1`}>
                            {getRarityIcon(achievement)}
                            <span className="text-xs">{rarityLabel}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <p className={`text-xs leading-relaxed line-clamp-2 ${
                      achievement.isUnlocked ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {achievement.description}
                    </p>
                    
                    {achievement.progress !== undefined && achievement.maxProgress && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600 dark:text-gray-400">Progress</span>
                          <span className={`font-bold ${achievement.isUnlocked ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`}>
                            {achievement.progress} / {achievement.maxProgress}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ease-out ${
                              achievement.isUnlocked ? 
                                'bg-green-600' : 
                                'bg-primary'
                            }`}
                            style={{ width: `${Math.min((achievement.progress / achievement.maxProgress) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-1 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-full">
                        <Zap className="h-3 w-3 text-yellow-500" />
                        <span className="text-xs font-bold text-yellow-700 dark:text-yellow-300">+{achievement.xpReward}</span>
                      </div>
                      {achievement.unlockedAt && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(achievement.unlockedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          // List View
          <div className="space-y-2">
            {paginatedAchievements.map((achievement) => {
              const CategoryIcon = getCategoryIcon(achievement.category)
              const rarityLabel = getRarityLabel(achievement)
              
              return (
                <Card 
                  key={achievement.id}
                  className={`hover:shadow-md transition-all duration-200 ${getRarityBorder(achievement)} ${
                    achievement.isUnlocked ? '' : 'opacity-75'
                  } ${newlyUnlockedAchievements.includes(achievement.id) ? 
                     'animate-pulse ring-2 ring-yellow-400/50' : ''}`}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br ${
                        achievement.isUnlocked ? getRarityColor(achievement) : 'from-gray-300 to-gray-400'
                      } shadow-md flex-shrink-0`}>
                        {achievement.isUnlocked ? (
                          <CategoryIcon className="h-5 w-5 text-white" />
                        ) : (
                          <Lock className="h-5 w-5 text-white" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-bold text-sm truncate">{achievement.name}</h3>
                          <div className={`inline-flex items-center space-x-1 px-1 py-0.5 rounded-full text-xs font-bold ${getRarityBg(achievement)} ${getRarityText(achievement)}`}>
                            {getRarityIcon(achievement)}
                            <span className="text-xs">{rarityLabel}</span>
                          </div>
                        </div>
                        <p className={`text-xs ${achievement.isUnlocked ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400'} line-clamp-1`}>
                          {achievement.description}
                        </p>
                        
                        {achievement.progress !== undefined && achievement.maxProgress && (
                          <div className="mt-1">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-gray-600 dark:text-gray-400">Progress</span>
                              <span className={achievement.isUnlocked ? 'text-green-600 dark:text-green-400 font-bold' : 'text-blue-600 dark:text-blue-400 font-bold'}>
                                {achievement.progress} / {achievement.maxProgress}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                              <div 
                                className={`h-1.5 rounded-full transition-all duration-500 ${
                                  achievement.isUnlocked ? 'bg-green-500' : 'bg-blue-500'
                                }`}
                                style={{ width: `${Math.min((achievement.progress / achievement.maxProgress) * 100, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col items-end space-y-1 flex-shrink-0">
                        <div className="flex items-center space-x-1 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-full">
                          <Zap className="h-3 w-3 text-yellow-500" />
                          <span className="text-xs font-bold text-yellow-700 dark:text-yellow-300">+{achievement.xpReward}</span>
                        </div>
                        {achievement.unlockedAt && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(achievement.unlockedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {startIndex + 1}-{Math.min(endIndex, filteredAndSortedAchievements.length)} of {filteredAndSortedAchievements.length} achievements
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (currentPage <= 3) {
                        pageNum = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = currentPage - 2 + i
                      }
                      
                      return (
                                                 <Button
                           key={pageNum}
                           variant={currentPage === pageNum ? "primary" : "outline"}
                           size="sm"
                           onClick={() => setCurrentPage(pageNum)}
                           className="w-8 h-8 p-0"
                         >
                           {pageNum}
                         </Button>
                      )
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {filteredAndSortedAchievements.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                  <Trophy className="h-8 w-8 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">No achievements found</h3>
                  <p className="text-gray-500 dark:text-gray-400">Try adjusting your filters or search terms</p>
                </div>
                <Button 
                  onClick={() => {
                    setCategoryFilter('ALL')
                    setStatusFilter('ALL')
                    setRarityFilter('ALL')
                    setSearchQuery('')
                    setActiveTab('all')
                  }}
                  variant="outline"
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}