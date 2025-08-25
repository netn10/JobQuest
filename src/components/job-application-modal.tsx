'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X, Link, Loader2 } from 'lucide-react'
import { getAuthHeaders } from '@/lib/auth'
import { useToast } from '@/hooks/use-toast'

type ApplicationStatus = 'APPLIED' | 'SCREENING' | 'INTERVIEW' | 'OFFER' | 'REJECTED' | 'WITHDRAWN'

interface JobApplication {
  id?: string
  company: string
  role: string
  location?: string
  salary?: string
  appliedDate: string
  status: ApplicationStatus
  description?: string
  notes?: string
  nextAction?: string
  jobUrl?: string
}

interface JobApplicationModalProps {
  isOpen: boolean
  onClose: () => void
  application?: JobApplication | null
  onSave: (application: Omit<JobApplication, 'id'>) => void
  onUpdate?: (application: JobApplication) => void
}

export function JobApplicationModal({
  isOpen,
  onClose,
  application,
  onSave,
  onUpdate
}: JobApplicationModalProps) {
  const [formData, setFormData] = useState<Omit<JobApplication, 'id'>>({
    company: '',
    role: '',
    location: '',
    salary: '',
    appliedDate: new Date().toISOString().split('T')[0], // Format as YYYY-MM-DD string
    status: 'APPLIED',
    description: '',
    notes: '',
    nextAction: '',
    jobUrl: ''
  })
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [isImporting, setIsImporting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (application) {
      setFormData({
        company: application.company,
        role: application.role,
        location: application.location || '',
        salary: application.salary || '',
        appliedDate: application.appliedDate,
        status: application.status,
        description: application.description || '',
        notes: application.notes || '',
        nextAction: application.nextAction || '',
        jobUrl: application.jobUrl || ''
      })
    } else {
      setFormData({
        company: '',
        role: '',
        location: '',
        salary: '',
        appliedDate: new Date().toISOString().split('T')[0], // Format as YYYY-MM-DD string
        status: 'APPLIED',
        description: '',
        notes: '',
        nextAction: '',
        jobUrl: ''
      })
    }
  }, [application, isOpen])

  const handleImportFromLinkedIn = async () => {
    if (!linkedinUrl.trim()) return

    setIsImporting(true)
    
    try {
      const response = await fetch('/api/jobs/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ linkedinUrl: linkedinUrl.trim() })
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          const jobData = result.data
          setFormData(prev => ({
            ...prev,
            company: jobData.company || prev.company,
            role: jobData.role || prev.role,
            location: jobData.location || prev.location,
            salary: jobData.salary || prev.salary,
            description: jobData.description || prev.description,
            jobUrl: jobData.jobUrl || prev.jobUrl
          }))
          setLinkedinUrl('')
          toast({
            title: "Import Successful",
            description: `Job data for ${jobData.role} at ${jobData.company} has been imported.`,
            variant: "default",
          })
        }
      } else {
        const error = await response.json()
        toast({
          title: "Import Failed",
          description: error.error || 'Failed to import job data',
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error importing from LinkedIn:', error)
      toast({
        title: "Import Failed",
        description: "Network error. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsImporting(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const applicationData = {
      ...formData
    }
    
    if (application?.id && onUpdate) {
      onUpdate({ ...applicationData, id: application.id })
    } else {
      onSave(applicationData)
    }
    
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>
            {application ? 'Edit Application' : 'Add New Application'}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* LinkedIn Import Section */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                Import from LinkedIn
              </h3>
              <div className="flex gap-2">
                <Input
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="Paste LinkedIn job URL here..."
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={handleImportFromLinkedIn}
                  disabled={!linkedinUrl.trim() || isImporting}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isImporting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Link className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                Paste a LinkedIn job URL to automatically fill in job details
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Company *</label>
                <Input
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Company name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role *</label>
                <Input
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="Job title"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="City, State or Remote"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Salary</label>
                <Input
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                  placeholder="e.g., $80k - $120k"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as ApplicationStatus })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="APPLIED">Applied</option>
                  <option value="SCREENING">Screening</option>
                  <option value="INTERVIEW">Interview</option>
                  <option value="OFFER">Offer</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="WITHDRAWN">Withdrawn</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Applied Date</label>
                <Input
                  type="date"
                  value={formData.appliedDate}
                  onChange={(e) => setFormData({ ...formData, appliedDate: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Job URL</label>
              <Input
                type="url"
                value={formData.jobUrl}
                onChange={(e) => setFormData({ ...formData, jobUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the role..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any additional notes..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Next Action</label>
              <Input
                value={formData.nextAction}
                onChange={(e) => setFormData({ ...formData, nextAction: e.target.value })}
                placeholder="e.g., Follow up in 3 days, Prepare for interview"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {application ? 'Update' : 'Add'} Application
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
