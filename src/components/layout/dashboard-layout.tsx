'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from './sidebar'
import { Header } from './header'
import { HydrationSafe } from '@/components/ui/hydration-safe'
import { BlockedNotification } from '@/components/blocked-notification'
import { AchievementNotification } from '@/components/achievement-notification'

interface DashboardLayoutProps {
  children: React.ReactNode
  title: string
  headerChildren?: React.ReactNode
}

export function DashboardLayout({ children, title, headerChildren }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()

  return (
    <HydrationSafe
      fallback={
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </div>
      }
    >
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <div className={`
          fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <Sidebar 
            onClose={() => setSidebarOpen(false)}
            navigate={(route) => router.push(route)}
          />
        </div>
        
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
          <Header 
            title={title} 
            onMenuClick={() => setSidebarOpen(true)}
            showMenuButton={true}
          >
            {headerChildren}
          </Header>
          
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-4 lg:p-6">
            {children}
          </main>
        </div>
        
        <BlockedNotification />
        <AchievementNotification />
      </div>
    </HydrationSafe>
  )
}