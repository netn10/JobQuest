'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X, Target, Clock, Monitor, Globe } from 'lucide-react'
import { getAuthHeaders, getCurrentUser } from '@/lib/auth'
import { useToast } from '@/hooks/use-toast'

type MissionType = 'FOCUS' | 'LEARNING' | 'JOB_SEARCH' | 'CUSTOM'

interface Mission {
  id?: string
  title: string
  description?: string
  type: MissionType
  duration: number
  blockedApps?: string[]
  blockedWebsites?: string[]
  autoStart?: boolean
}

interface MissionCreationModalProps {
  isOpen: boolean
  onClose: () => void
  onMissionCreated: (mission: Mission) => void
}

export function MissionCreationModal({
  isOpen,
  onClose,
  onMissionCreated
}: MissionCreationModalProps) {
  const [formData, setFormData] = useState<Mission>({
    title: '',
    description: '',
    type: 'FOCUS',
    duration: 25,
    blockedApps: [],
    blockedWebsites: [],
    autoStart: false
  })
  const [blockedAppInput, setBlockedAppInput] = useState('')
  const [blockedWebsiteInput, setBlockedWebsiteInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: '',
        description: '',
        type: 'FOCUS',
        duration: 25,
        blockedApps: [],
        blockedWebsites: [],
        autoStart: false
      })
      setBlockedAppInput('')
      setBlockedWebsiteInput('')
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Mission title is required",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    
    try {
      const user = getCurrentUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      const response = await fetch('/api/missions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          ...formData,
          userId: user.id
        })
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          toast({
            title: "Mission Created",
            description: `"${formData.title}" has been created successfully!`,
            variant: "default",
          })
          onMissionCreated(result.mission)
          onClose()
        } else {
          throw new Error(result.error || 'Failed to create mission')
        }
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create mission')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to create mission',
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const addBlockedApp = () => {
    if (blockedAppInput.trim() && !formData.blockedApps?.includes(blockedAppInput.trim())) {
      setFormData(prev => ({
        ...prev,
        blockedApps: [...(prev.blockedApps || []), blockedAppInput.trim()]
      }))
      setBlockedAppInput('')
    }
  }

  const removeBlockedApp = (app: string) => {
    setFormData(prev => ({
      ...prev,
      blockedApps: prev.blockedApps?.filter(a => a !== app) || []
    }))
  }

  const addBlockedWebsite = () => {
    if (blockedWebsiteInput.trim() && !formData.blockedWebsites?.includes(blockedWebsiteInput.trim())) {
      setFormData(prev => ({
        ...prev,
        blockedWebsites: [...(prev.blockedWebsites || []), blockedWebsiteInput.trim()]
      }))
      setBlockedWebsiteInput('')
    }
  }

  const removeBlockedWebsite = (website: string) => {
    setFormData(prev => ({
      ...prev,
      blockedWebsites: prev.blockedWebsites?.filter(w => w !== website) || []
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Create New Mission
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Mission Title *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Complete project proposal"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description of what you want to accomplish..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Mission Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as MissionType })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="FOCUS">Focus Session</option>
                  <option value="LEARNING">Learning</option>
                  <option value="JOB_SEARCH">Job Search</option>
                  <option value="CUSTOM">Custom</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
                <Input
                  type="number"
                  min="1"
                  max="480"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 25 })}
                  className="flex items-center gap-2"
                />
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-500">
                    {formData.duration} minutes ({Math.floor(formData.duration / 60)}h {formData.duration % 60}m)
                  </span>
                </div>
              </div>
            </div>

            {/* Blocked Apps Section */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                Blocked Applications
              </label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={blockedAppInput}
                  onChange={(e) => setBlockedAppInput(e.target.value)}
                  placeholder="e.g., Discord, Slack"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBlockedApp())}
                />
                <Button type="button" onClick={addBlockedApp} variant="outline">
                  Add
                </Button>
              </div>
              {formData.blockedApps && formData.blockedApps.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.blockedApps.map((app, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm"
                    >
                      {app}
                      <button
                        type="button"
                        onClick={() => removeBlockedApp(app)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Blocked Websites Section */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Blocked Websites
              </label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={blockedWebsiteInput}
                  onChange={(e) => setBlockedWebsiteInput(e.target.value)}
                  placeholder="e.g., facebook.com, youtube.com"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBlockedWebsite())}
                />
                <Button type="button" onClick={addBlockedWebsite} variant="outline">
                  Add
                </Button>
              </div>
              {formData.blockedWebsites && formData.blockedWebsites.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.blockedWebsites.map((website, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm"
                    >
                      {website}
                      <button
                        type="button"
                        onClick={() => removeBlockedWebsite(website)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="autoStart"
                checked={formData.autoStart}
                onChange={(e) => setFormData({ ...formData, autoStart: e.target.checked })}
                className="rounded border-gray-300"
              />
              <label htmlFor="autoStart" className="text-sm font-medium">
                Start mission immediately after creation
              </label>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Mission'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
