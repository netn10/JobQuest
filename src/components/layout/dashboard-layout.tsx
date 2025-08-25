'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from './sidebar'
import { Header } from './header'
import { HydrationSafe } from '@/components/ui/hydration-safe'
import { BlockedNotification } from '@/components/blocked-notification'
import { AchievementNotification } from '@/components/achievement-notification'
import { cn } from '@/lib/utils'

interface DashboardLayoutProps {
  children: React.ReactNode
  title: string
  headerChildren?: React.ReactNode
}

export function DashboardLayout({ children, title, headerChildren }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const router = useRouter()

  // Load sidebar collapse state from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebar-collapsed')
      if (saved !== null) {
        setSidebarCollapsed(JSON.parse(saved))
      }
      setIsLoaded(true)
    }
  }, [])

  const handleSidebarToggle = () => {
    const newState = !sidebarCollapsed
    setSidebarCollapsed(newState)
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebar-collapsed', JSON.stringify(newState))
    }
  }

  // Show loading state until sidebar state is loaded
  if (!isLoaded) {
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
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </div>
      </HydrationSafe>
    )
  }

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
          fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          ${sidebarCollapsed ? 'w-16' : 'w-64'}
        `}>
          <Sidebar 
            onClose={() => setSidebarOpen(false)}
            navigate={(route) => router.push(route)}
            collapsed={sidebarCollapsed}
            onToggleCollapse={handleSidebarToggle}
          />
        </div>
        
        <div className={cn(
          "flex-1 flex flex-col overflow-hidden transition-all duration-300",
          sidebarCollapsed ? "lg:ml-16" : "lg:ml-0"
        )}>
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