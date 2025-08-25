'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { JobApplicationModal } from '@/components/job-application-modal'
import { useToast } from '@/hooks/use-toast'
import { 
  BriefcaseIcon, 
  Plus, 
  Search, 
  Filter, 
  MapPin, 
  Calendar,
  TrendingUp,
  Building,
  DollarSign,
  Edit,
  Trash2
} from 'lucide-react'

import { JobApplication, JobApplicationWithId, ApplicationStatus } from '@/types/job'

export default function JobsPage() {
  const [loading, setLoading] = useState(true)
  const [applications, setApplications] = useState<JobApplicationWithId[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingApplication, setEditingApplication] = useState<JobApplicationWithId | null>(null)
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (!user) {
      router.push('/')
      return
    }
  }, [user, router])

  useEffect(() => {
    if (user) {
      fetchApplications()
    }
  }, [user])

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/jobs', {
        headers: {
          'Authorization': `Bearer ${user?.id}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setApplications(data)
      } else {
        console.error('Failed to fetch applications')
        toast({
          title: "Error",
          description: "Failed to load job applications",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
      toast({
        title: "Error",
        description: "Failed to load job applications",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddApplication = async (applicationData: Omit<JobApplication, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.id}`
        },
        body: JSON.stringify(applicationData)
      })

      if (response.ok) {
        const result = await response.json()
        setApplications(prev => [result.application, ...prev])
        toast({
          title: "Success",
          description: "Job application added successfully",
          variant: "default"
        })
        setIsModalOpen(false)
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to add application",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error adding application:', error)
      toast({
        title: "Error",
        description: "Failed to add application",
        variant: "destructive"
      })
    }
  }

  const handleUpdateApplication = async (applicationData: JobApplication) => {
    if (!applicationData.id) {
      toast({
        title: "Error",
        description: "Application ID is required for updates",
        variant: "destructive"
      })
      return
    }
    
    try {
      const response = await fetch(`/api/jobs/${applicationData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.id}`
        },
        body: JSON.stringify(applicationData)
      })

      if (response.ok) {
        const result = await response.json()
        setApplications(prev => prev.map(app => 
          app.id === applicationData.id ? result.application : app
        ))
        toast({
          title: "Success",
          description: "Job application updated successfully",
          variant: "default"
        })
        setIsModalOpen(false)
        setEditingApplication(null)
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to update application",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error updating application:', error)
      toast({
        title: "Error",
        description: "Failed to update application",
        variant: "destructive"
      })
    }
  }

  const handleDeleteApplication = async (applicationId: string) => {
    if (!confirm('Are you sure you want to delete this application?')) {
      return
    }

    try {
      const response = await fetch(`/api/jobs/${applicationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.id}`
        }
      })

      if (response.ok) {
        setApplications(prev => prev.filter(app => app.id !== applicationId))
        toast({
          title: "Success",
          description: "Job application deleted successfully",
          variant: "default"
        })
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to delete application",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error deleting application:', error)
      toast({
        title: "Error",
        description: "Failed to delete application",
        variant: "destructive"
      })
    }
  }

  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case 'APPLIED': return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'SCREENING': return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      case 'INTERVIEW': return 'bg-green-50 text-green-700 border-green-200'
      case 'OFFER': return 'bg-purple-50 text-purple-700 border-purple-200'
      case 'REJECTED': return 'bg-red-50 text-red-700 border-red-200'
      case 'WITHDRAWN': return 'bg-gray-50 text-gray-700 border-gray-200'
      default: return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const getStatusLabel = (status: ApplicationStatus) => {
    switch (status) {
      case 'APPLIED': return 'Applied'
      case 'SCREENING': return 'Screening'
      case 'INTERVIEW': return 'Interview'
      case 'OFFER': return 'Offer'
      case 'REJECTED': return 'Rejected'
      case 'WITHDRAWN': return 'Withdrawn'
      default: return status
    }
  }

  const filteredApplications = applications.filter(app =>
    app.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.location?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const stats = {
    total: applications.length,
    inProgress: applications.filter(app => ['APPLIED', 'SCREENING', 'INTERVIEW'].includes(app.status)).length,
    interviews: applications.filter(app => app.status === 'INTERVIEW').length,
    responseRate: applications.length > 0 
      ? Math.round((applications.filter(app => app.status !== 'APPLIED').length / applications.length) * 100)
      : 0
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return 'Applied today'
    if (diffDays === 2) return 'Applied yesterday'
    if (diffDays <= 7) return `Applied ${diffDays - 1} days ago`
    if (diffDays <= 30) return `Applied ${Math.floor((diffDays - 1) / 7)} weeks ago`
    return `Applied ${Math.floor((diffDays - 1) / 30)} months ago`
  }

  if (loading || authLoading) {
    return (
      <DashboardLayout title="Job Applications">
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-16 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Job Applications">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Your Job Applications
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Track and manage your job search progress
            </p>
          </div>
          <Button 
            className="flex items-center gap-2"
            onClick={() => {
              setEditingApplication(null)
              setIsModalOpen(true)
            }}
          >
            <Plus className="h-4 w-4" />
            Add Application
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Applications
                  </p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <BriefcaseIcon className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    In Progress
                  </p>
                  <p className="text-2xl font-bold">{stats.inProgress}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Interviews
                  </p>
                  <p className="text-2xl font-bold">{stats.interviews}</p>
                </div>
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Response Rate
                  </p>
                  <p className="text-2xl font-bold">{stats.responseRate}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search applications..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Applications List */}
        <div className="space-y-4">
          {filteredApplications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BriefcaseIcon className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {applications.length === 0 ? 'No job applications yet' : 'No applications found'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
                  {applications.length === 0 
                    ? 'Start tracking your job applications to see your progress here.'
                    : 'Try adjusting your search terms.'
                  }
                </p>
                {applications.length === 0 && (
                  <Button 
                    className="flex items-center gap-2"
                    onClick={() => {
                      setEditingApplication(null)
                      setIsModalOpen(true)
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    Add Your First Application
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredApplications.map((application) => (
              <Card key={application.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Building className="h-5 w-5" />
                        {application.role}
                      </CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {application.company}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getStatusColor(application.status)}>
                        {getStatusLabel(application.status)}
                      </Badge>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingApplication(application)
                            setIsModalOpen(true)
                          }}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteApplication(application.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                    {application.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {application.location}
                      </div>
                    )}
                    {application.salary && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        {application.salary}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(application.appliedDate)}
                    </div>
                  </div>
                  {application.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      {application.description}
                    </p>
                  )}
                  {application.notes && (
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-2 italic">
                      Notes: {application.notes}
                    </p>
                  )}
                  {application.nextAction && (
                    <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                      Next: {application.nextAction}
                    </p>
                  )}
                  <div className="flex gap-2 mt-4">
                    {application.jobUrl && (
                      <a 
                        href={application.jobUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
                      >
                        View Job
                      </a>
                    )}
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setEditingApplication(application)
                        setIsModalOpen(true)
                      }}
                    >
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <JobApplicationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingApplication(null)
        }}
        application={editingApplication}
        onSave={handleAddApplication}
        onUpdate={handleUpdateApplication}
      />
    </DashboardLayout>
  )
}