'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Info } from 'lucide-react'

interface AboutPageProps {
  navigate: (route: string) => void
}

export default function AboutPage({ navigate }: AboutPageProps) {
  return (
    <DashboardLayout title="About" navigate={navigate}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">About JobQuest</h1>
          <p className="text-gray-600 dark:text-gray-400">Learn more about our mission and features</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Our Mission</CardTitle>
            <CardDescription>Helping professionals focus on their career journey</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                JobQuest is designed to help professionals stay focused, track their progress, and achieve their career goals through gamified productivity and learning.
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                Our platform combines focus missions, job tracking, learning resources, and achievement systems to create a comprehensive career development experience.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
