'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X, Link, Loader2 } from 'lucide-react'
import { getAuthHeaders } from '@/lib/auth'
import { useToast } from '@/hooks/use-toast'
import { JobApplication, ApplicationStatus } from '@/types/job'

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
  const [importedFields, setImportedFields] = useState<Set<string>>(new Set())
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
      // Clear imported fields when editing an existing application
      setImportedFields(new Set())
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
      // Clear imported fields when creating a new application
      setImportedFields(new Set())
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
          
          // Validate and clean the imported data
          const cleanedData = {
            company: jobData.company?.trim() || '',
            role: jobData.role?.trim() || '',
            location: jobData.location?.trim() || '',
            salary: jobData.salary?.trim() || '',
            description: jobData.description?.trim() || '',
            jobUrl: jobData.jobUrl?.trim() || linkedinUrl.trim()
          }
          
          // Track which fields were actually imported (not empty)
          const importedFieldNames = new Set<string>()
          if (cleanedData.company) importedFieldNames.add('company')
          if (cleanedData.role) importedFieldNames.add('role')
          if (cleanedData.location) importedFieldNames.add('location')
          if (cleanedData.salary) importedFieldNames.add('salary')
          if (cleanedData.description) importedFieldNames.add('description')
          if (cleanedData.jobUrl) importedFieldNames.add('jobUrl')
          
          setFormData(prev => ({
            ...prev,
            ...cleanedData
          }))
          
          setImportedFields(importedFieldNames)
          setLinkedinUrl('')
          
          // Show appropriate toast based on data completeness
          if (result.partial) {
            toast({
              title: "Partial Import Successful!",
              description: `Extracted job title: "${cleanedData.role}". Please complete the company name and other details manually.`,
              variant: "default",
            })
          } else {
            toast({
              title: "LinkedIn Import Successful!",
              description: `Successfully extracted: ${cleanedData.role} at ${cleanedData.company}${cleanedData.location ? ` in ${cleanedData.location}` : ''}`,
              variant: "default",
            })
          }
          
          // Highlight the imported fields briefly
          setTimeout(() => {
            const companyInput = document.querySelector('input[placeholder="Company name"]') as HTMLInputElement
            const roleInput = document.querySelector('input[placeholder="Job title"]') as HTMLInputElement
            if (companyInput) companyInput.focus()
            if (roleInput) roleInput.focus()
          }, 100)
        } else {
          toast({
            title: "Import Failed",
            description: "No job data found. Please check the URL and try again.",
            variant: "destructive",
          })
        }
      } else {
        const error = await response.json()
        
        // Check if it's a LinkedIn scraping failure and provide helpful guidance
        if (response.status === 400 && error.error && error.error.includes('manual entry')) {
          toast({
            title: "LinkedIn Import Unavailable",
            description: "LinkedIn is blocking automated access. Please enter the job details manually below.",
            variant: "destructive",
          })
          
          // Pre-fill the job URL field with the LinkedIn URL
          setFormData(prev => ({
            ...prev,
            jobUrl: linkedinUrl.trim()
          }))
        } else {
          toast({
            title: "Import Failed",
            description: error.error || 'Failed to import job data. Please check the URL format.',
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "Network error. Please check your connection and try again.",
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
              <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                <Link className="h-4 w-4" />
                Import from LinkedIn (Real Data)
              </h3>
              <div className="flex gap-2">
                <Input
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://www.linkedin.com/jobs/view/..."
                  className="flex-1"
                  disabled={isImporting}
                />
                <Button
                  type="button"
                  onClick={handleImportFromLinkedIn}
                  disabled={!linkedinUrl.trim() || isImporting}
                  className="bg-blue-600 hover:bg-blue-700 text-white min-w-[100px]"
                >
                  {isImporting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Scraping...
                    </>
                  ) : (
                    <>
                      <Link className="h-4 w-4 mr-2" />
                      Import
                    </>
                  )}
                </Button>
              </div>
              
              <div className="mt-2 space-y-1">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Paste a LinkedIn job URL to extract real job data from the posting
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  Supported format: https://www.linkedin.com/jobs/view/[job-id]
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  🔍 Real data extraction from LinkedIn job postings
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  💡 If import fails, you can still enter job details manually below
                </p>
                {linkedinUrl && !linkedinUrl.includes('linkedin.com/jobs/view/') && (
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    ⚠️ Please ensure the URL is a valid LinkedIn job posting
                  </p>
                )}
                {importedFields.size > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({
                          company: '',
                          role: '',
                          location: '',
                          salary: '',
                          appliedDate: new Date().toISOString().split('T')[0],
                          status: 'APPLIED',
                          description: '',
                          notes: formData.notes,
                          nextAction: formData.nextAction,
                          jobUrl: ''
                        })
                        setImportedFields(new Set())
                        toast({
                          title: "Form Cleared",
                          description: "Imported data has been cleared. You can now enter information manually.",
                          variant: "default",
                        })
                      }}
                      className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 underline"
                    >
                      Clear imported data
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                  Company *
                  {importedFields.has('company') && (
                    <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 px-2 py-1 rounded">
                      Imported
                    </span>
                  )}
                </label>
                <Input
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Company name"
                  required
                  className={importedFields.has('company') ? "border-green-300 focus:border-green-500 focus:ring-green-500" : ""}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                  Role *
                  {importedFields.has('role') && (
                    <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 px-2 py-1 rounded">
                      Imported
                    </span>
                  )}
                </label>
                <Input
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="Job title"
                  required
                  className={importedFields.has('role') ? "border-green-300 focus:border-green-500 focus:ring-green-500" : ""}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                  Location
                  {importedFields.has('location') && (
                    <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 px-2 py-1 rounded">
                      Imported
                    </span>
                  )}
                </label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="City, State or Remote"
                  className={importedFields.has('location') ? "border-green-300 focus:border-green-500 focus:ring-green-500" : ""}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                  Salary
                  {importedFields.has('salary') && (
                    <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 px-2 py-1 rounded">
                      Imported
                    </span>
                  )}
                </label>
                <Input
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                  placeholder="e.g., $80k - $120k"
                  className={importedFields.has('salary') ? "border-green-300 focus:border-green-500 focus:ring-green-500" : ""}
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
              <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                Description
                {importedFields.has('description') && (
                  <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 px-2 py-1 rounded">
                    Imported
                  </span>
                )}
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the role..."
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  importedFields.has('description')
                    ? "border-green-300 focus:ring-green-500" 
                    : "border-gray-300 focus:ring-blue-500"
                }`}
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
