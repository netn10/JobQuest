'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  BriefcaseIcon, 
  Plus, 
  Search, 
  Filter, 
  MapPin, 
  Calendar,
  TrendingUp,
  Building,
  DollarSign
} from 'lucide-react'

export default function JobsPage() {
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push('/')
      return
    }
    setLoading(false)
  }, [router])

  if (loading) {
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
          <Button className="flex items-center gap-2">
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
                  <p className="text-2xl font-bold">12</p>
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
                  <p className="text-2xl font-bold">8</p>
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
                  <p className="text-2xl font-bold">3</p>
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
                  <p className="text-2xl font-bold">67%</p>
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
          {/* Sample Application Cards */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Senior Software Engineer
                  </CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    TechCorp Inc.
                  </p>
                </div>
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                  Interview Scheduled
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  San Francisco, CA
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  $120k - $160k
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Applied 5 days ago
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button size="sm">View Details</Button>
                <Button size="sm" variant="outline">Update Status</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Product Manager
                  </CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    StartupXYZ
                  </p>
                </div>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  Applied
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  Remote
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  $90k - $130k
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Applied 2 days ago
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button size="sm">View Details</Button>
                <Button size="sm" variant="outline">Update Status</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Frontend Developer
                  </CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    DesignCo Agency
                  </p>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Offer Received
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  New York, NY
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  $85k - $110k
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Applied 3 weeks ago
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button size="sm">View Offer</Button>
                <Button size="sm" variant="outline">Negotiate</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Empty State for when no applications */}
        {/* Uncomment this when there are no applications */}
        {/*
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BriefcaseIcon className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No job applications yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
              Start tracking your job applications to see your progress here.
            </p>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Your First Application
            </Button>
          </CardContent>
        </Card>
        */}
      </div>
    </DashboardLayout>
  )
}