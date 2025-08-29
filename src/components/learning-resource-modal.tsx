'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/hooks/use-toast'
import { 
  GraduationCap, 
  Play, 
  BookOpen, 
  Video, 
  FileText,
  X,
  Plus,
  Link,
  Loader2
} from 'lucide-react'

type ResourceType = 'ARTICLE' | 'VIDEO' | 'TUTORIAL' | 'COURSE' | 'BOOK' | 'PROJECT' | 'PODCAST'
type DifficultyLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'

interface LearningResourceModalProps {
  isOpen: boolean
  onClose: () => void
  onResourceAdded: () => void
}

export function LearningResourceModal({ isOpen, onClose, onResourceAdded }: LearningResourceModalProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [resourceUrl, setResourceUrl] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    type: 'ARTICLE' as ResourceType,
    difficulty: 'BEGINNER' as DifficultyLevel,
    estimatedTime: '',
    tags: '',
    source: ''
  })

  const handleAnalyzeUrl = async () => {
    if (!resourceUrl.trim()) return

    setIsAnalyzing(true)
    
    try {
      const response = await fetch('/api/learning/analyze-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: resourceUrl.trim() })
      })

      if (response.ok) {
        const result = await response.json()
        
        // Validate and clean the imported data
        const cleanedData = {
          title: result.title?.trim() || '',
          description: result.description?.trim() || '',
          url: result.url?.trim() || resourceUrl.trim(),
          type: (result.type?.toUpperCase() as ResourceType) || 'ARTICLE',
          difficulty: (result.difficulty?.toUpperCase() as DifficultyLevel) || 'BEGINNER',
          estimatedTime: result.estimatedTime?.toString() || '',
          tags: Array.isArray(result.tags) ? result.tags.join(', ') : '',
          source: result.source?.trim() || ''
        }
        
        setFormData(prev => ({
          ...prev,
          ...cleanedData
        }))
        
        setResourceUrl('')
        
        toast({
          title: "AI Analysis Complete!",
          description: `Successfully analyzed: ${cleanedData.title || 'Learning Resource'}`,
          variant: "default",
        })
        
      } else {
        const error = await response.json()
        toast({
          title: "Analysis Failed",
          description: error.error || 'Failed to analyze the URL. Please enter details manually.',
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Network error. Please check your connection and try again.",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) return

    setLoading(true)
    try {
      const response = await fetch('/api/learning/resources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create',
          userId: user.id,
          ...formData,
          estimatedTime: parseInt(formData.estimatedTime) || 0,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
        })
      })

      const data = await response.json()
      
      if (data.success) {
        // Reset form
        setFormData({
          title: '',
          description: '',
          url: '',
          type: 'ARTICLE',
          difficulty: 'BEGINNER',
          estimatedTime: '',
          tags: '',
          source: ''
        })
        onResourceAdded()
        onClose()
        toast({
          title: "Success",
          description: "Learning resource added successfully!",
          variant: "default",
        })
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to add learning resource",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add learning resource",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Add Learning Resource</span>
          </DialogTitle>
          <DialogDescription>
            Add a new learning resource to your collection. Use AI to analyze URLs or fill in details manually.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* AI URL Analysis Section */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
              <Link className="h-4 w-4" />
              AI-Powered URL Analysis
            </h3>
            <div className="flex gap-2">
              <Input
                value={resourceUrl}
                onChange={(e) => setResourceUrl(e.target.value)}
                placeholder="https://example.com/learning-resource"
                className="flex-1"
                disabled={isAnalyzing}
              />
              <Button
                type="button"
                onClick={handleAnalyzeUrl}
                disabled={!resourceUrl.trim() || isAnalyzing}
                className="bg-blue-600 hover:bg-blue-700 text-white min-w-[100px]"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Link className="h-4 w-4 mr-2" />
                    Analyze
                  </>
                )}
              </Button>
            </div>
            
            <div className="mt-2 space-y-1">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Paste a learning resource URL to automatically extract information
              </p>
              <p className="text-xs text-green-600 dark:text-green-400">
                🤖 AI-powered content analysis and metadata extraction
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                💡 If analysis fails, you can still enter details manually below
              </p>
              {(formData.title || formData.description || formData.type !== 'ARTICLE' || formData.difficulty !== 'BEGINNER' || formData.estimatedTime || formData.tags || formData.source) && (
                <div className="flex items-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        title: '',
                        description: '',
                        url: '',
                        type: 'ARTICLE',
                        difficulty: 'BEGINNER',
                        estimatedTime: '',
                        tags: '',
                        source: ''
                      })
                      toast({
                        title: "Form Cleared",
                        description: "Analyzed data has been cleared. You can now enter information manually.",
                        variant: "default",
                      })
                    }}
                    className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 underline"
                  >
                    Clear analyzed data
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="flex items-center gap-2">
                Title *
                {formData.title && (
                  <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 px-2 py-1 rounded">
                    Analyzed
                  </span>
                )}
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., Advanced React Patterns"
                required
                className={formData.title ? "border-green-300 focus:border-green-500 focus:ring-green-500" : ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                <SelectTrigger className={formData.type !== 'ARTICLE' ? "border-green-300 focus:border-green-500 focus:ring-green-500" : ""}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ARTICLE">Article</SelectItem>
                  <SelectItem value="VIDEO">Video</SelectItem>
                  <SelectItem value="TUTORIAL">Tutorial</SelectItem>
                  <SelectItem value="COURSE">Course</SelectItem>
                  <SelectItem value="BOOK">Book</SelectItem>
                  <SelectItem value="PROJECT">Project</SelectItem>
                  <SelectItem value="PODCAST">Podcast</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="flex items-center gap-2">
              Description *
              {formData.description && (
                <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 px-2 py-1 rounded">
                  Analyzed
                </span>
              )}
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Brief description of what you'll learn..."
              rows={3}
              required
              className={formData.description ? "border-green-300 focus:border-green-500 focus:ring-green-500" : ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">URL *</Label>
            <Input
              id="url"
              type="url"
              value={formData.url}
              onChange={(e) => handleInputChange('url', e.target.value)}
              placeholder="https://example.com/learning-resource"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty *</Label>
              <Select value={formData.difficulty} onValueChange={(value) => handleInputChange('difficulty', value)}>
                <SelectTrigger className={formData.difficulty !== 'BEGINNER' ? "border-green-300 focus:border-green-500 focus:ring-green-500" : ""}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BEGINNER">Beginner</SelectItem>
                  <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                  <SelectItem value="ADVANCED">Advanced</SelectItem>
                  <SelectItem value="EXPERT">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimatedTime" className="flex items-center gap-2">
                Time (minutes) *
                {formData.estimatedTime && (
                  <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 px-2 py-1 rounded">
                    Analyzed
                  </span>
                )}
              </Label>
              <Input
                id="estimatedTime"
                type="number"
                value={formData.estimatedTime}
                onChange={(e) => handleInputChange('estimatedTime', e.target.value)}
                placeholder="30"
                min="1"
                required
                className={formData.estimatedTime ? "border-green-300 focus:border-green-500 focus:ring-green-500" : ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="source" className="flex items-center gap-2">
                Source
                {formData.source && (
                  <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 px-2 py-1 rounded">
                    Analyzed
                  </span>
                )}
              </Label>
              <Input
                id="source"
                value={formData.source}
                onChange={(e) => handleInputChange('source', e.target.value)}
                placeholder="e.g., React.dev, YouTube"
                className={formData.source ? "border-green-300 focus:border-green-500 focus:ring-green-500" : ""}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags" className="flex items-center gap-2">
              Tags
              {formData.tags && (
                <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 px-2 py-1 rounded">
                  Analyzed
                </span>
              )}
            </Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => handleInputChange('tags', e.target.value)}
              placeholder="React, JavaScript, Frontend (comma-separated)"
              className={formData.tags ? "border-green-300 focus:border-green-500 focus:ring-green-500" : ""}
            />
            <p className="text-xs text-gray-500">
              Separate tags with commas (e.g., React, JavaScript, Frontend)
            </p>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Resource'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
