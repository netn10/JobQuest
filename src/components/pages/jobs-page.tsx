'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BriefcaseIcon, Plus } from 'lucide-react'

interface JobsPageProps {
  navigate: (route: string) => void
}

export default function JobsPage({ navigate }: JobsPageProps) {
  return (
    <DashboardLayout title="Job Tracker" navigate={navigate}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Job Applications</h1>
            <p className="text-gray-600 dark:text-gray-400">Track your job search progress</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Application
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Applications</CardTitle>
            <CardDescription>Manage and track your job applications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <BriefcaseIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No job applications yet</p>
              <p className="text-sm">Start tracking your job search by adding your first application</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
