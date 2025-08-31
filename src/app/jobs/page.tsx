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
import { useUserStats } from '@/contexts/user-stats-context'
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
  const { addXp } = useUserStats()

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
        setApplications(Array.isArray(data) ? data : [])
      } else {
        toast({
          title: "Error",
          description: "Failed to load job applications",
          variant: "destructive"
        })
      }
    } catch (error) {
      setApplications([])
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
        
        // Check if a daily challenge was completed (returned directly from the API)
        if (result.challengeCompleted) {
          // Update XP immediately in the UI
          addXp(result.challengeCompleted.xpReward)
          
          toast({
            title: "🎉 Daily Challenge Completed!",
            description: `You completed "${result.challengeCompleted.title}" and earned ${result.challengeCompleted.xpReward} XP!`,
            variant: "default",
          })
        }
        
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
      toast({
        title: "Error",
        description: "Failed to delete application",
        variant: "destructive"
      })
    }
  }

  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case 'APPLIED': return 'bg-blue-50 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700'
      case 'SCREENING': return 'bg-yellow-50 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700'
      case 'INTERVIEW': return 'bg-green-50 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700'
      case 'OFFER': return 'bg-purple-50 dark:bg-purple-900 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-700'
      case 'REJECTED': return 'bg-red-50 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700'
      case 'WITHDRAWN': return 'bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600'
      default: return 'bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600'
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

  const filteredApplications = (Array.isArray(applications) ? applications : []).filter(app =>
    app.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.location?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const applicationsArray = Array.isArray(applications) ? applications : []
  const stats = {
    total: applicationsArray.length,
    inProgress: applicationsArray.filter(app => ['APPLIED', 'SCREENING', 'INTERVIEW'].includes(app.status)).length,
    interviews: applicationsArray.filter(app => app.status === 'INTERVIEW').length,
    responseRate: applicationsArray.length > 0 
      ? Math.round((applicationsArray.filter(app => app.status !== 'APPLIED').length / applicationsArray.length) * 100)
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
      <div className="space-y-8 max-w-7xl mx-auto px-4">
        {/* Header Section */}
        <div className="text-center space-y-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Job Applications
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Track and manage your job search progress with detailed insights and analytics
          </p>
        </div>

        {/* Enhanced Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 bg-teal-600/10 overflow-hidden relative">
            <div className="absolute inset-0 bg-teal-600/5 pointer-events-none"></div>
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wide">Total Applications</p>
                  <p className="text-3xl font-bold text-teal-900 dark:text-teal-100">{stats.total}</p>
                </div>
                <div className="w-14 h-14 bg-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <BriefcaseIcon className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-yellow-600/10 overflow-hidden relative">
            <div className="absolute inset-0 bg-yellow-600/5 pointer-events-none"></div>
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-yellow-600 dark:text-yellow-400 uppercase tracking-wide">In Progress</p>
                  <p className="text-3xl font-bold text-yellow-900 dark:text-yellow-100">{stats.inProgress}</p>
                </div>
                <div className="w-14 h-14 bg-yellow-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-green-600/10 overflow-hidden relative">
            <div className="absolute inset-0 bg-green-600/5 pointer-events-none"></div>
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">Interviews</p>
                  <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">{stats.interviews}</p>
                </div>
                <div className="w-14 h-14 bg-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Calendar className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-purple-600/10 overflow-hidden relative">
            <div className="absolute inset-0 bg-purple-600/5 pointer-events-none"></div>
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide">Response Rate</p>
                  <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">{stats.responseRate}%</p>
                </div>
                <div className="w-14 h-14 bg-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Action Button */}
        <div className="flex justify-center">
          <Button 
            className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
            onClick={() => {
              setEditingApplication(null)
              setIsModalOpen(true)
            }}
          >
            <Plus className="h-5 w-5" />
            Add Application
          </Button>
        </div>

        {/* Enhanced Search and Filter */}
        <Card className="border-0 shadow-xl overflow-hidden">
          <div className="absolute inset-0 bg-primary/5 pointer-events-none"></div>
          <CardHeader className="pb-6 relative">
            <CardTitle className="flex items-center space-x-3 text-gray-900 dark:text-gray-100">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Search className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold">Search & Filter</span>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-normal">Find your applications quickly</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 relative">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="relative w-full max-w-md group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
                <Input
                  placeholder="Search applications..."
                  className="pl-12 pr-4 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 placeholder-gray-400 dark:placeholder-gray-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" className="flex items-center gap-2 px-6 py-4 rounded-2xl border-2 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200">
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
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <BriefcaseIcon className="h-12 w-12 text-gray-400 mb-4 mx-auto" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {applicationsArray.length === 0 ? 'No job applications yet' : 'No applications found'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
                  {applicationsArray.length === 0 
                    ? 'Start tracking your job applications to see your progress here.'
                    : 'Try adjusting your search terms.'
                  }
                </p>
                {applicationsArray.length === 0 && (
                  <Button 
                    className="flex items-center gap-2 mx-auto"
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
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 leading-relaxed">
                          {application.description}
                        </p>
                      )}
                      {application.notes && (
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-3 italic leading-relaxed">
                          Notes: {application.notes}
                        </p>
                      )}
                      {application.nextAction && (
                        <p className="text-sm text-blue-600 dark:text-blue-400 mt-3">
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