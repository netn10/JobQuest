'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Target, Plus } from 'lucide-react'

interface MissionsPageProps {
  navigate: (route: string) => void
}

export default function MissionsPage({ navigate }: MissionsPageProps) {
  return (
    <DashboardLayout title="Focus Missions" navigate={navigate}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Focus Missions</h1>
            <p className="text-gray-600 dark:text-gray-400">Complete focused work sessions and earn XP</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Start Mission
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Available Missions</CardTitle>
            <CardDescription>Choose a mission to start your focused work session</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No missions available</p>
              <p className="text-sm">Check back later for new focus missions</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
