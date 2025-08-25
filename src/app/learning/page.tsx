'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/auth-context'
import { LearningResourceModal } from '@/components/learning-resource-modal'
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
  Loader2
} from 'lucide-react'

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
  const [resources, setResources] = useState<LearningResource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<ResourceType | 'ALL'>('ALL')
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyLevel | 'ALL'>('ALL')
  const [statusFilter, setStatusFilter] = useState<ProgressStatus | 'ALL'>('ALL')

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
          ...(statusFilter !== 'ALL' && { status: statusFilter })
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
        console.error('Error fetching resources:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchResources()
  }, [user?.id, searchTerm, typeFilter, difficultyFilter, statusFilter])

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
        // Refresh the resources to show updated progress
        const params = new URLSearchParams({
          userId: user.id,
          ...(searchTerm && { search: searchTerm }),
          ...(typeFilter !== 'ALL' && { type: typeFilter }),
          ...(difficultyFilter !== 'ALL' && { difficulty: difficultyFilter }),
          ...(statusFilter !== 'ALL' && { status: statusFilter })
        })

        const refreshResponse = await fetch(`/api/learning/resources?${params}`)
        const refreshData = await refreshResponse.json()
        
        if (refreshData.success) {
          setResources(refreshData.resources)
        }
      } else {
        console.error('Failed to update progress:', data.error)
      }
    } catch (err) {
      console.error('Error updating learning progress:', err)
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
          ...(statusFilter !== 'ALL' && { status: statusFilter })
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
        console.error('Error fetching resources:', err)
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

  const totalTimeSpent = resources
    .filter(r => r.status === 'COMPLETED')
    .reduce((total, r) => total + (r.timeSpent || 0), 0)

  return (
    <DashboardLayout 
      title="Learning Hub"
      headerChildren={
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
      }
    >
      <div className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-foreground">{getStatusCount('TOTAL')}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Total Resources</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{getStatusCount('COMPLETED')}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Completed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{getStatusCount('IN_PROGRESS')}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">In Progress</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{getStatusCount('NOT_STARTED')}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Not Started</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{Math.floor(totalTimeSpent / 60)}h</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Time Learned</div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Suggestion */}
        {!loading && resources.length > 0 && (
          <Card className="border-blue-300 bg-blue-50 dark:bg-blue-900/20">
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
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
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
                    {getStatusIcon(resource.status)}
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

                  {resource.rating && (
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star
                          key={star}
                          className={`h-3 w-3 ${
                            star <= resource.rating! ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="text-xs text-gray-600 dark:text-gray-400 ml-1">({resource.rating}/5)</span>
                    </div>
                  )}

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
    </DashboardLayout>
  )
}