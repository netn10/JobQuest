'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, Plus } from 'lucide-react'

interface NotebookPageProps {
  navigate: (route: string) => void
}

export default function NotebookPage({ navigate }: NotebookPageProps) {
  return (
    <DashboardLayout title="Daily Notebook" navigate={navigate}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Daily Notebook</h1>
            <p className="text-gray-600 dark:text-gray-400">Track your daily progress and thoughts</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Entry
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Notes</CardTitle>
            <CardDescription>Record your daily progress and reflections</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No notes yet</p>
              <p className="text-sm">Start documenting your journey by creating your first note</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
