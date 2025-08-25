'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/contexts/auth-context'
import { 
  GraduationCap, 
  Play, 
  BookOpen, 
  Video, 
  FileText,
  X,
  Plus
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
  const [loading, setLoading] = useState(false)
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
      } else {
        console.error('Failed to add resource:', data.error)
      }
    } catch (error) {
      console.error('Error adding resource:', error)
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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Add Learning Resource</span>
          </DialogTitle>
          <DialogDescription>
            Add a new learning resource to your collection. Fill in the details below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., Advanced React Patterns"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                <SelectTrigger>
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
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Brief description of what you'll learn..."
              rows={3}
              required
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
                <SelectTrigger>
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
              <Label htmlFor="estimatedTime">Time (minutes) *</Label>
              <Input
                id="estimatedTime"
                type="number"
                value={formData.estimatedTime}
                onChange={(e) => handleInputChange('estimatedTime', e.target.value)}
                placeholder="30"
                min="1"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="source">Source</Label>
              <Input
                id="source"
                value={formData.source}
                onChange={(e) => handleInputChange('source', e.target.value)}
                placeholder="e.g., React.dev, YouTube"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => handleInputChange('tags', e.target.value)}
              placeholder="React, JavaScript, Frontend (comma-separated)"
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
