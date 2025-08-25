'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/hooks/use-toast'
import { 
  Sparkles, 
  Search, 
  Loader2,
  Plus,
  ExternalLink,
  Clock,
  Calendar
} from 'lucide-react'

type ResourceType = 'ARTICLE' | 'VIDEO' | 'TUTORIAL' | 'COURSE' | 'BOOK' | 'PROJECT' | 'PODCAST'
type DifficultyLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'

interface RandomResource {
  title: string
  description: string
  url: string
  type: ResourceType
  difficulty: DifficultyLevel
  estimatedTime: number
  tags: string[]
  source: string
  year: number
}

interface RandomResourcesModalProps {
  isOpen: boolean
  onClose: () => void
  onResourceAdded: () => void
}

export function RandomResourcesModal({ isOpen, onClose, onResourceAdded }: RandomResourcesModalProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [subject, setSubject] = useState('')
  const [count, setCount] = useState(5)
  const [isGenerating, setIsGenerating] = useState(false)
  const [resources, setResources] = useState<RandomResource[]>([])
  const [hasGenerated, setHasGenerated] = useState(false)

  const handleGenerateResources = async () => {
    if (!subject.trim()) {
      toast({
        title: "Subject Required",
        description: "Please enter a subject to search for learning resources",
        variant: "destructive",
      })
      return
    }

    if (count < 1 || count > 10) {
      toast({
        title: "Invalid Count",
        description: "Please enter a number between 1 and 10",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    
    try {
      const response = await fetch('/api/learning/random-resources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          subject: subject.trim(), 
          count 
        })
      })

      const data = await response.json()

      if (response.ok) {
        setResources(data.resources)
        setHasGenerated(true)
        
        toast({
          title: "Resources Generated!",
          description: data.message,
          variant: "default",
        })
      } else {
        // Handle non-software subject error
        if (data.error === 'SUBJECT_NOT_SOFTWARE_RELATED') {
          toast({
            title: "Subject Not Software-Related",
            description: data.message,
            variant: "destructive",
          })
        } else {
          toast({
            title: "Generation Failed",
            description: data.error || 'Failed to generate resources. Please try again.',
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      console.error('Error generating resources:', error)
      toast({
        title: "Generation Failed",
        description: "Network error. Please check your connection and try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleAddResource = async (resource: RandomResource) => {
    if (!user?.id) {
      toast({
        title: "Login Required",
        description: "Please log in to add learning resources",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch('/api/learning/resources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create',
          userId: user.id,
          title: resource.title,
          description: resource.description,
          url: resource.url,
          type: resource.type,
          difficulty: resource.difficulty,
          estimatedTime: resource.estimatedTime,
          tags: resource.tags,
          source: resource.source
        })
      })

      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "Resource Added!",
          description: `${resource.title} has been added to your learning collection`,
          variant: "default",
        })
        onResourceAdded()
      } else {
        toast({
          title: "Failed to Add",
          description: data.error || "Failed to add resource to your collection",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error adding resource:', error)
      toast({
        title: "Failed to Add",
        description: "Failed to add resource to your collection",
        variant: "destructive",
      })
    }
  }

  const getTypeIcon = (type: ResourceType) => {
    switch (type) {
      case 'ARTICLE': return <span className="text-blue-500">📄</span>
      case 'VIDEO': return <span className="text-red-500">🎥</span>
      case 'TUTORIAL': return <span className="text-green-500">📚</span>
      case 'COURSE': return <span className="text-purple-500">🎓</span>
      case 'BOOK': return <span className="text-orange-500">📖</span>
      case 'PROJECT': return <span className="text-indigo-500">⚡</span>
      case 'PODCAST': return <span className="text-pink-500">🎧</span>
      default: return <span className="text-gray-500">📄</span>
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

  const getYearBadge = (year: number) => {
    const currentYear = new Date().getFullYear()
    const isRecent = year >= currentYear - 1
    
    return (
      <span className={`px-2 py-1 text-xs rounded ${
        isRecent 
          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
          : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
      }`}>
        <Calendar className="h-3 w-3 inline mr-1" />
        {year}
      </span>
    )
  }

  const handleReset = () => {
    setSubject('')
    setCount(5)
    setResources([])
    setHasGenerated(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5" />
            <span>Discover Learning Resources</span>
          </DialogTitle>
          <DialogDescription>
            Enter a subject and discover random high-quality learning resources from across the internet.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Search Section */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
            <h3 className="text-sm font-medium text-purple-900 dark:text-purple-100 mb-3 flex items-center gap-2">
              <Search className="h-4 w-4" />
              Find Learning Resources
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g., React, Python, Machine Learning, Cybersecurity"
                  disabled={isGenerating}
                />
              </div>
              
              <div>
                <Label htmlFor="count">Number of Resources</Label>
                <Input
                  id="count"
                  type="number"
                  value={count}
                  onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                  min="1"
                  max="10"
                  placeholder="1-10"
                  disabled={isGenerating}
                />
              </div>
            </div>
            
            <div className="flex gap-2 mt-3">
              <Button
                onClick={handleGenerateResources}
                disabled={!subject.trim() || isGenerating}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Discovering...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Discover Resources
                  </>
                )}
              </Button>
              
              {hasGenerated && (
                <Button
                  variant="outline"
                  onClick={handleReset}
                  disabled={isGenerating}
                >
                  New Search
                </Button>
              )}
            </div>
            
            <div className="mt-2 space-y-1">
              <p className="text-xs text-purple-700 dark:text-purple-300">
                🤖 AI-powered discovery of real learning resources from popular platforms
              </p>
              <p className="text-xs text-green-600 dark:text-green-400">
                📅 Prioritizes resources from {new Date().getFullYear() - 1}-{new Date().getFullYear()} (current year)
              </p>
              <p className="text-xs text-purple-600 dark:text-purple-400">
                💡 Examples: "React", "Python", "Machine Learning", "Web Development", "Cybersecurity"
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400">
                ⚠️ Only software/technology subjects are supported
              </p>
            </div>
          </div>

          {/* Results Section */}
          {hasGenerated && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Discovered Resources for "{subject}"
                </h3>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {resources.length} resources found
                </span>
              </div>
              
              {resources.length === 0 ? (
                <div className="text-center py-8">
                  <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    No resources found for "{subject}". Try a different subject or search term.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {resources.map((resource, index) => (
                    <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className="text-2xl">
                            {getTypeIcon(resource.type)}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-foreground mb-1">{resource.title}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {resource.description}
                            </p>
                            
                            <div className="flex items-center space-x-2 mb-2">
                              <span className={`px-2 py-1 text-xs rounded ${getDifficultyColor(resource.difficulty)}`}>
                                {resource.difficulty}
                              </span>
                              <span className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                                <Clock className="h-3 w-3 mr-1" />
                                {resource.estimatedTime} min
                              </span>
                              {getYearBadge(resource.year)}
                              <span className="text-xs text-gray-600 dark:text-gray-400">
                                via {resource.source}
                              </span>
                            </div>
                            
                            <div className="flex flex-wrap gap-1">
                              {resource.tags.slice(0, 3).map(tag => (
                                <span key={tag} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col space-y-2 ml-4">
                          <Button
                            size="sm"
                            onClick={() => handleAddResource(resource)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(resource.url, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
