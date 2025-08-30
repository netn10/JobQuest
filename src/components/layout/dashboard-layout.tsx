'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from './sidebar'
import { Header } from './header'
import { HydrationSafe } from '@/components/ui/hydration-safe'
import { BlockedNotification } from '@/components/blocked-notification'
import { AchievementNotification } from '@/components/achievement-notification'
import { useFocusSession } from '@/contexts/focus-session-context'
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
  const [isDragging, setIsDragging] = useState(false)
  const [dragWidth, setDragWidth] = useState<number | null>(null)
  const router = useRouter()
  const dragHandleRef = useRef<HTMLDivElement>(null)
  const dragStateRef = useRef({
    isDragging: false,
    startX: 0,
    startCollapsed: false
  })
  const { focusSession } = useFocusSession()

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
          <div className="flex h-screen bg-[#0A0A0F]">
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3B82F6]"></div>
              </div>
            </div>
          </div>
        }
      >
        <div className="flex h-screen bg-[#0A0A0F]">
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3B82F6]"></div>
            </div>
          </div>
        </div>
      </HydrationSafe>
    )
  }

  return (
    <HydrationSafe
      fallback={
        <div className="flex h-screen bg-[#0A0A0F]">
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3B82F6]"></div>
            </div>
          </div>
        </div>
      }
    >
      <div className="flex h-screen bg-gradient-to-br from-[#0A0A0F] via-[#0F172A] to-[#1E293B]/20 w-full">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
            style={{ touchAction: 'none' }}
          />
        )}
        
        {/* Sidebar */}
        <div 
          className={cn(
            "fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 flex-shrink-0 group",
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
            sidebarCollapsed ? 'lg:w-16 w-64' : 'w-64',
            isDragging ? 'transition-none' : ''
          )}
          style={dragWidth ? { width: `${dragWidth}px` } : {}}
        >
          <Sidebar 
            onClose={() => setSidebarOpen(false)}
            navigate={(route) => router.push(route)}
            collapsed={dragWidth ? dragWidth < 160 : sidebarCollapsed}
            onToggleCollapse={handleSidebarToggle}
          />
          
          <div
            ref={dragHandleRef}
            className="hidden lg:block absolute top-0 -right-1 w-2 h-full bg-transparent hover:bg-[#3B82F6]/20 transition-colors group-hover:bg-[#3B82F6]/10"
          >
            <div className="w-0.5 h-full bg-[#475569] ml-0.75 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
        
        {/* Main content area */}
        <div 
          className={cn(
            "flex-1 flex flex-col overflow-hidden w-full",
            sidebarCollapsed ? "lg:ml-16" : "lg:ml-0",
            !isDragging && "transition-all duration-300"
          )}
          style={dragWidth ? { marginLeft: `${dragWidth}px` } : {}}
        >
          <Header 
            title={title} 
            onMenuClick={() => setSidebarOpen(true)}
            showMenuButton={true}
          >
            {headerChildren}
          </Header>
          
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-transparent p-3 lg:p-6 w-full">
            {children}
          </main>
        </div>
        
        <BlockedNotification />
        <AchievementNotification />
      </div>
    </HydrationSafe>
  )
}