'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, Plus } from 'lucide-react'

interface LearningPageProps {
  navigate: (route: string) => void
}

export default function LearningPage({ navigate }: LearningPageProps) {
  return (
    <DashboardLayout title="Learning" navigate={navigate}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Learning Resources</h1>
            <p className="text-gray-600 dark:text-gray-400">Improve your skills with curated resources</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Resource
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Learning Path</CardTitle>
            <CardDescription>Track your learning progress and discover new resources</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No learning resources yet</p>
              <p className="text-sm">Start your learning journey by adding your first resource</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
