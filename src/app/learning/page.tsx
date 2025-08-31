'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/auth-context'
import { LearningResourceModal } from '@/components/learning-resource-modal'
import { RandomResourcesModal } from '@/components/random-resources-modal'
import { ConfirmationModal } from '@/components/ui/confirmation-modal'
import { 
  GraduationCap, 
  Play, 
  BookOpen, 
  Video, 
  FileText,
  Clock,
  Star,
  ExternalLink,
  Search,
  Filter,
  TrendingUp,
  CheckCircle,
  Circle,
  Loader2,
  Sparkles,
  Trash2
} from 'lucide-react'
import { StarRating } from '@/components/ui/star-rating'
import { useToast } from '@/hooks/use-toast'
import { useUserStats } from '@/contexts/user-stats-context'

type ResourceType = 'ARTICLE' | 'VIDEO' | 'TUTORIAL' | 'COURSE' | 'BOOK' | 'PROJECT' | 'PODCAST'
type DifficultyLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'
type ProgressStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'

interface LearningResource {
  id: string
  title: string
  description: string
  url: string
  type: ResourceType
  difficulty: DifficultyLevel
  estimatedTime: number
  tags: string[]
  source: string
  status: ProgressStatus
  rating?: number
  progress?: number
  startedAt?: string
  completedAt?: string
  timeSpent?: number
  notes?: string
}

export default function LearningPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const { addXp } = useUserStats()
  const [resources, setResources] = useState<LearningResource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isRandomModalOpen, setIsRandomModalOpen] = useState(false)
  const [deleteConfirmationModal, setDeleteConfirmationModal] = useState<{
    isOpen: boolean
    type: 'single' | 'all'
    resourceId?: string
    resourceTitle?: string
  }>({
    isOpen: false,
    type: 'single'
  })
  const [isDeletingResources, setIsDeletingResources] = useState(false)

  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<ResourceType | 'ALL'>('ALL')
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyLevel | 'ALL'>('ALL')
  const [statusFilter, setStatusFilter] = useState<ProgressStatus | 'ALL'>('ALL')
  const [ratingFilter, setRatingFilter] = useState<number | 'ALL'>('ALL')

  // Fetch learning resources
  useEffect(() => {
    const fetchResources = async () => {
      // Allow viewing resources without being logged in
      // User progress will be empty if not logged in
      
      try {
        setLoading(true)
        const params = new URLSearchParams({
          ...(user?.id && { userId: user.id }),
          ...(searchTerm && { search: searchTerm }),
          ...(typeFilter !== 'ALL' && { type: typeFilter }),
          ...(difficultyFilter !== 'ALL' && { difficulty: difficultyFilter }),
          ...(statusFilter !== 'ALL' && { status: statusFilter }),
          ...(ratingFilter !== 'ALL' && { rating: ratingFilter.toString() })
        })

        const response = await fetch(`/api/learning/resources?${params}`)
        const data = await response.json()

        if (data.success) {
          setResources(data.resources)
        } else {
          setError(data.error || 'Failed to fetch resources')
        }
      } catch (err) {
        setError('Failed to fetch learning resources')
      } finally {
        setLoading(false)
      }
    }

    fetchResources()
  }, [user?.id, searchTerm, typeFilter, difficultyFilter, statusFilter, ratingFilter])

  // Handle learning actions
  const handleLearningAction = async (resourceId: string, action: string, additionalData?: any) => {
    if (!user?.id) {
      alert('Please log in to track your learning progress')
      return
    }

    try {
      const response = await fetch('/api/learning/resources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          resourceId,
          action,
          ...additionalData
        })
      })

      const data = await response.json()
      
      if (data.success) {
        // Show completion toast if resource was completed
        if (action === 'complete') {
          const completedResource = resources.find(r => r.id === resourceId)
          if (completedResource) {
            toast({
              title: "🎉 Learning Resource Completed!",
              description: `Great job! You completed "${completedResource.title}"!`,
              variant: "default",
              actionUrl: "/learning"
            })
          }
          
          // Check if a daily challenge was completed (returned directly from the API)
          if (data.challengeCompleted) {
            // Update XP immediately in the UI
            addXp(data.challengeCompleted.xpReward)
            
            toast({
              title: "🎉 Daily Challenge Completed!",
              description: `You completed "${data.challengeCompleted.title}" and earned ${data.challengeCompleted.xpReward} XP!`,
              variant: "default",
            })
          } else {
            // Fallback: Check for daily challenge completion using refresh endpoint
            try {
              const challengeResponse = await fetch('/api/daily-challenges/refresh', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${user.id}`
                }
              })
              
              if (challengeResponse.ok) {
                const challengeResult = await challengeResponse.json()
                
                // Show toast notification if a challenge was completed
                if (challengeResult.newlyCompleted) {
                  // Update XP immediately in the UI
                  addXp(challengeResult.xpAwarded)
                  
                  toast({
                    title: "🎉 Daily Challenge Completed!",
                    description: `You completed "${challengeResult.newlyCompleted.title}" and earned ${challengeResult.xpAwarded} XP!`,
                    variant: "default",
                  })
                }
              }
            } catch (challengeError) {
              console.error('Error checking daily challenges:', challengeError)
            }
          }
        }

        // Refresh the resources to show updated progress
        const params = new URLSearchParams({
          userId: user.id,
          ...(searchTerm && { search: searchTerm }),
          ...(typeFilter !== 'ALL' && { type: typeFilter }),
          ...(difficultyFilter !== 'ALL' && { difficulty: difficultyFilter }),
          ...(statusFilter !== 'ALL' && { status: statusFilter }),
          ...(ratingFilter !== 'ALL' && { rating: ratingFilter.toString() })
        })

        const refreshResponse = await fetch(`/api/learning/resources?${params}`)
        const refreshData = await refreshResponse.json()
        
        if (refreshData.success) {
          setResources(refreshData.resources)
        }
      }
    } catch (err) {
      // Error updating learning progress
    }
  }

  // Handle rating changes
  const handleRatingChange = async (resourceId: string, rating: number) => {
    if (!user?.id) {
      alert('Please log in to rate learning resources')
      return
    }

    try {
      const response = await fetch('/api/learning/resources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          resourceId,
          action: 'rate',
          rating
        })
      })

      const data = await response.json()
      
      if (data.success) {
        // Update the local state to reflect the rating change
        setResources(prevResources => 
          prevResources.map(resource => 
            resource.id === resourceId 
              ? { ...resource, rating }
              : resource
          )
        )
      }
    } catch (err) {
      console.error('Error updating rating:', err)
    }
  }

  // Handle deleting a resource
  const handleDeleteResource = (resourceId: string, resourceTitle: string) => {
    if (!user?.id) {
      alert('Please log in to delete learning resources')
      return
    }

    setDeleteConfirmationModal({
      isOpen: true,
      type: 'single',
      resourceId,
      resourceTitle
    })
  }

  // Handle the actual deletion after confirmation
  const confirmDeleteResource = async () => {
    if (!deleteConfirmationModal.resourceId) return

    setIsDeletingResources(true)
    try {
      const response = await fetch(`/api/learning/resources?id=${deleteConfirmationModal.resourceId}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      
      if (data.success) {
        // Refresh the resources to remove the deleted one
        handleResourceAdded()
        setDeleteConfirmationModal({ isOpen: false, type: 'single' })
      } else {
        alert('Failed to delete resource')
      }
    } catch (err) {
      alert('Failed to delete resource')
    } finally {
      setIsDeletingResources(false)
    }
  }

  // Handle deleting all resources
  const handleDeleteAllResources = () => {
    if (!user?.id) {
      alert('Please log in to delete learning resources')
      return
    }

    if (resources.length === 0) {
      alert('No resources to delete')
      return
    }

    setDeleteConfirmationModal({
      isOpen: true,
      type: 'all'
    })
  }

  // Handle the actual deletion of all resources after confirmation
  const confirmDeleteAllResources = async () => {
    setIsDeletingResources(true)
    try {
      const response = await fetch(`/api/learning/resources?all=true`, {
        method: 'DELETE'
      })

      const data = await response.json()
      
      if (data.success) {
        // Refresh the resources to show empty state
        handleResourceAdded()
        setDeleteConfirmationModal({ isOpen: false, type: 'single' })
      } else {
        alert('Failed to delete all resources')
      }
    } catch (err) {
      alert('Failed to delete all resources')
    } finally {
      setIsDeletingResources(false)
    }
  }

  // Handle resource added callback
  const handleResourceAdded = () => {
    // Refresh the resources list
    const fetchResources = async () => {
      // Allow viewing resources without being logged in
      
      try {
        setLoading(true)
        const params = new URLSearchParams({
          ...(user?.id && { userId: user.id }),
          ...(searchTerm && { search: searchTerm }),
          ...(typeFilter !== 'ALL' && { type: typeFilter }),
          ...(difficultyFilter !== 'ALL' && { difficulty: difficultyFilter }),
          ...(statusFilter !== 'ALL' && { status: statusFilter }),
          ...(ratingFilter !== 'ALL' && { rating: ratingFilter.toString() })
        })

        const response = await fetch(`/api/learning/resources?${params}`)
        const data = await response.json()

        if (data.success) {
          setResources(data.resources)
        } else {
          setError(data.error || 'Failed to fetch resources')
        }
      } catch (err) {
        setError('Failed to fetch learning resources')
      } finally {
        setLoading(false)
      }
    }

    fetchResources()
  }

  const getTypeIcon = (type: ResourceType) => {
    switch (type) {
      case 'ARTICLE': return <FileText className="h-4 w-4" />
      case 'VIDEO': return <Video className="h-4 w-4" />
      case 'TUTORIAL': return <BookOpen className="h-4 w-4" />
      case 'COURSE': return <GraduationCap className="h-4 w-4" />
      case 'BOOK': return <BookOpen className="h-4 w-4" />
      case 'PROJECT': return <Play className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getDifficultyColor = (difficulty: DifficultyLevel) => {
    switch (difficulty) {
      case 'BEGINNER': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      case 'INTERMEDIATE': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
      case 'ADVANCED': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
      case 'EXPERT': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    }
  }

  const getStatusIcon = (status: ProgressStatus) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'IN_PROGRESS': return <Play className="h-4 w-4 text-blue-500" />
      default: return <Circle className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusCount = (status: ProgressStatus | 'TOTAL') => {
    if (status === 'TOTAL') return resources.length
    return resources.filter(r => r.status === status).length
  }

  const getRatedResourcesCount = () => {
    return resources.filter(r => r.rating && r.rating > 0).length
  }

  const getAverageRating = () => {
    const ratedResources = resources.filter(r => r.rating && r.rating > 0)
    if (ratedResources.length === 0) return 0
    const totalRating = ratedResources.reduce((sum, r) => sum + (r.rating || 0), 0)
    return Math.round((totalRating / ratedResources.length) * 10) / 10
  }

  const totalTimeSpent = resources
    .filter(r => r.status === 'COMPLETED')
    .reduce((total, r) => total + (r.timeSpent || 0), 0)

  return (
    <DashboardLayout 
      title="Learning Hub"
      headerChildren={
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline"
            onClick={() => {
              if (!user?.id) {
                alert('Please log in to discover random resources')
                return
              }
              setIsRandomModalOpen(true)
            }}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Discover Resources
          </Button>
          <Button onClick={() => {
            if (!user?.id) {
              alert('Please log in to add learning resources')
              return
            }
            setIsModalOpen(true)
          }}>
            <GraduationCap className="h-4 w-4 mr-2" />
            Add Resource
          </Button>
          {user?.id && resources.length > 0 && (
            <Button 
              variant="danger"
              onClick={handleDeleteAllResources}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete All
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-8 max-w-7xl mx-auto px-4">
        {/* Header Section */}
        <div className="text-center space-y-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Learning Hub
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Discover, track, and master new skills for your career growth with personalized learning paths
          </p>
        </div>

        {/* Enhanced Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
          <Card className="border-0 bg-indigo-600/10 overflow-hidden relative">
            <div className="absolute inset-0 bg-indigo-600/5"></div>
            <CardContent className="p-4 relative">
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">{getStatusCount('TOTAL')}</div>
                <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">Total Resources</div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 bg-green-600/10 overflow-hidden relative">
            <div className="absolute inset-0 bg-green-600/5"></div>
            <CardContent className="p-4 relative">
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">{getStatusCount('COMPLETED')}</div>
                <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">Completed</div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 bg-yellow-600/10 overflow-hidden relative">
            <div className="absolute inset-0 bg-yellow-600/5"></div>
            <CardContent className="p-4 relative">
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{getStatusCount('IN_PROGRESS')}</div>
                <div className="text-xs font-semibold text-yellow-600 dark:text-yellow-400 uppercase tracking-wide">In Progress</div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 bg-orange-600/10 overflow-hidden relative">
            <div className="absolute inset-0 bg-orange-600/5"></div>
            <CardContent className="p-4 relative">
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">{getRatedResourcesCount()}</div>
                <div className="text-xs font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wide">Rated Resources</div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 bg-pink-600/10 overflow-hidden relative">
            <div className="absolute inset-0 bg-pink-600/5"></div>
            <CardContent className="p-4 relative">
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold text-pink-900 dark:text-pink-100">{getAverageRating()}</div>
                <div className="text-xs font-semibold text-pink-600 dark:text-pink-400 uppercase tracking-wide">Avg Rating</div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 bg-purple-600/10 overflow-hidden relative">
            <div className="absolute inset-0 bg-purple-600/5"></div>
            <CardContent className="p-4 relative">
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">{Math.floor(totalTimeSpent / 60)}h</div>
                <div className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide">Time Learned</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Rated Resources */}
        {getRatedResourcesCount() > 0 && (
          <Card className="border-yellow-300 bg-yellow-600/10">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-yellow-900 dark:text-yellow-200">
                <Star className="h-5 w-5" />
                <span>Your Top Rated Resources</span>
              </CardTitle>
              <CardDescription className="text-yellow-700 dark:text-yellow-300">
                Your highest-rated learning resources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {resources
                  .filter(r => r.rating && r.rating >= 4)
                  .sort((a, b) => (b.rating || 0) - (a.rating || 0))
                  .slice(0, 3)
                  .map((resource) => (
                    <div key={resource.id} className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                        {getTypeIcon(resource.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-yellow-900 dark:text-yellow-200 truncate">
                          {resource.title}
                        </h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <StarRating
                            rating={resource.rating || 0}
                            readonly={true}
                            size="sm"
                            showValue={false}
                          />
                          <span className="text-xs text-yellow-700 dark:text-yellow-300">
                            {resource.rating}/5
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Surprise Me Section */}
        <Card className="border-purple-300 bg-purple-600/10">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-purple-900 dark:text-purple-200">
              <Sparkles className="h-5 w-5" />
              <span>Discover New Learning Resources</span>
            </CardTitle>
            <CardDescription className="text-purple-700 dark:text-purple-300">
              Explore random high-quality learning resources from across the internet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-purple-900 dark:text-purple-200">AI-Powered Discovery</h4>
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    Get personalized learning recommendations from popular platforms and sources
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => {
                  if (!user?.id) {
                    alert('Please log in to discover random resources')
                    return
                  }
                  setIsRandomModalOpen(true)
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Surprise Me
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Today's Suggestion */}
        {!loading && resources.length > 0 && (
          <Card className="border-blue-300 bg-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-blue-900 dark:text-blue-200">
                <TrendingUp className="h-5 w-5" />
                <span>Today&apos;s Learning Suggestion</span>
              </CardTitle>
              <CardDescription className="text-blue-700 dark:text-blue-300">
                Personalized recommendation based on your goals and progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(() => {
                // Find the best suggestion: in-progress items first, then not started
                const inProgress = resources.filter(r => r.status === 'IN_PROGRESS')
                const notStarted = resources.filter(r => r.status === 'NOT_STARTED')
                const suggestion = inProgress[0] || notStarted[0]
                
                if (!suggestion) return null
                
                const remainingTime = suggestion.estimatedTime - (suggestion.timeSpent || 0)
                const progressPercent = suggestion.progress || 0
                
                return (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                        {getTypeIcon(suggestion.type)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-blue-900 dark:text-blue-200">{suggestion.title}</h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          {suggestion.status === 'IN_PROGRESS' 
                            ? `Continue where you left off - ${progressPercent}% complete`
                            : 'Start your learning journey'
                          }
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`px-2 py-1 text-xs rounded ${getDifficultyColor(suggestion.difficulty)}`}>
                            {suggestion.difficulty}
                          </span>
                          <span className="flex items-center text-xs text-blue-600 dark:text-blue-400">
                            <Clock className="h-3 w-3 mr-1" />
                            {remainingTime > 0 ? `${remainingTime} min remaining` : 'Ready to complete'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button 
                      onClick={() => handleLearningAction(
                        suggestion.id, 
                        suggestion.status === 'IN_PROGRESS' ? 'update' : 'start'
                      )}
                    >
                      {suggestion.status === 'IN_PROGRESS' ? 'Continue Learning' : 'Start Learning'}
                    </Button>
                  </div>
                )
              })()}
            </CardContent>
          </Card>
        )}

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4 justify-center items-center">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search resources, tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as ResourceType | 'ALL')}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-black dark:text-white"
              >
                <option value="ALL">All Types</option>
                <option value="ARTICLE">Articles</option>
                <option value="VIDEO">Videos</option>
                <option value="TUTORIAL">Tutorials</option>
                <option value="COURSE">Courses</option>
                <option value="BOOK">Books</option>
                <option value="PROJECT">Projects</option>
              </select>

              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value as DifficultyLevel | 'ALL')}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-black dark:text-white"
              >
                <option value="ALL">All Levels</option>
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
                <option value="EXPERT">Expert</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as ProgressStatus | 'ALL')}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-black dark:text-white"
              >
                <option value="ALL">All Status</option>
                <option value="NOT_STARTED">Not Started</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>

              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value === 'ALL' ? 'ALL' : parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-black dark:text-white"
              >
                <option value="ALL">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4+ Stars</option>
                <option value="3">3+ Stars</option>
                <option value="2">2+ Stars</option>
                <option value="1">1+ Stars</option>
                <option value="0">Unrated</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Resources Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-600 dark:text-gray-400">Loading learning resources...</span>
          </div>
        ) : error ? (
          <Card>
            <CardContent className="p-12 text-center">
              <GraduationCap className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : resources.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">No learning resources found</p>
              <Button onClick={() => {
                if (!user?.id) {
                  alert('Please log in to add learning resources')
                  return
                }
                setIsModalOpen(true)
              }}>
                <GraduationCap className="h-4 w-4 mr-2" />
                Add Your First Resource
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((resource) => (
              <Card key={resource.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        {getTypeIcon(resource.type)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm text-foreground">{resource.title}</h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{resource.source}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(resource.status)}
                      {user?.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteResource(resource.id, resource.title)}
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-700 dark:text-gray-300">{resource.description}</p>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className={`px-2 py-1 rounded ${getDifficultyColor(resource.difficulty)}`}>
                      {resource.difficulty}
                    </span>
                    <span className="flex items-center text-gray-600 dark:text-gray-400">
                      <Clock className="h-3 w-3 mr-1" />
                      {resource.estimatedTime} min
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {resource.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {resource.status === 'IN_PROGRESS' && resource.progress && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-400">Progress</span>
                        <span className="text-foreground">{resource.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-blue-500 h-1.5 rounded-full transition-all duration-300" 
                          style={{ width: `${resource.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Star Rating */}
                  <div className="border-t border-gray-100 dark:border-gray-700 pt-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {resource.rating ? `Your Rating: ${resource.rating}/5` : 'Rate this resource'}
                        </span>
                      </div>
                      <StarRating
                        rating={resource.rating || 0}
                        onRatingChange={(rating) => handleRatingChange(resource.id, rating)}
                        readonly={false}
                        size="md"
                        showValue={false}
                      />
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    {resource.status === 'NOT_STARTED' && (
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleLearningAction(resource.id, 'start')}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Start
                      </Button>
                    )}
                    {resource.status === 'IN_PROGRESS' && (
                      <>
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleLearningAction(resource.id, 'update', { timeSpent: (resource.timeSpent || 0) + 10 })}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Continue
                        </Button>
                        {(resource.progress || 0) >= 80 && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleLearningAction(resource.id, 'complete', { timeSpent: resource.estimatedTime })}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Complete
                          </Button>
                        )}
                      </>
                    )}
                    {resource.status === 'COMPLETED' && (
                      <Button size="sm" variant="outline" className="flex-1">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Review
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => window.open(resource.url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <LearningResourceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onResourceAdded={handleResourceAdded}
      />
      
      <RandomResourcesModal
        isOpen={isRandomModalOpen}
        onClose={() => setIsRandomModalOpen(false)}
        onResourceAdded={handleResourceAdded}
      />

      <ConfirmationModal
        isOpen={deleteConfirmationModal.isOpen}
        onClose={() => setDeleteConfirmationModal({ isOpen: false, type: 'single' })}
        onConfirm={deleteConfirmationModal.type === 'all' ? confirmDeleteAllResources : confirmDeleteResource}
        title={
          deleteConfirmationModal.type === 'all' 
            ? 'Delete All Learning Resources' 
            : 'Delete Learning Resource'
        }
        description={
          deleteConfirmationModal.type === 'all'
            ? `Are you sure you want to delete ALL ${resources.length} learning resources? This will permanently delete:

• All your saved learning resources
• All your learning progress and notes  
• All your time tracking data

This action cannot be undone.`
            : `Are you sure you want to delete "${deleteConfirmationModal.resourceTitle}"?

This will permanently delete:
• The learning resource
• Your progress and notes for this resource
• Your time tracking data for this resource

This action cannot be undone.`
        }
        confirmText={deleteConfirmationModal.type === 'all' ? 'Delete All Resources' : 'Delete Resource'}
        requireTextConfirmation={deleteConfirmationModal.type === 'all' ? 'DELETE ALL' : undefined}
        destructive={true}
        isLoading={isDeletingResources}
      />
    </DashboardLayout>
  )
}