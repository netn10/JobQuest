'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Settings } from 'lucide-react'

interface SettingsPageProps {
  navigate: (route: string) => void
}

export default function SettingsPage({ navigate }: SettingsPageProps) {
  return (
    <DashboardLayout title="Settings" navigate={navigate}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">Customize your JobQuest experience</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>Manage your account preferences and settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Settings className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Settings coming soon</p>
              <p className="text-sm">Customization options will be available here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
