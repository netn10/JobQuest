'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy } from 'lucide-react'

interface AchievementsPageProps {
  navigate: (route: string) => void
}

export default function AchievementsPage({ navigate }: AchievementsPageProps) {
  return (
    <DashboardLayout title="Achievements" navigate={navigate}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Achievements</h1>
          <p className="text-gray-600 dark:text-gray-400">Track your progress and unlock rewards</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Achievements</CardTitle>
            <CardDescription>Unlock achievements by completing missions and challenges</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No achievements unlocked yet</p>
              <p className="text-sm">Complete missions and challenges to earn your first achievement</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
