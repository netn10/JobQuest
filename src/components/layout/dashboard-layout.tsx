'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
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
  const [isDragging, setIsDragging] = useState(false)
  const [dragWidth, setDragWidth] = useState<number | null>(null)
  const router = useRouter()
  const dragHandleRef = useRef<HTMLDivElement>(null)
  const dragStateRef = useRef({
    isDragging: false,
    startX: 0,
    startCollapsed: false
  })

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

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Only enable drag on desktop (screen width >= 1024px)
    if (window.innerWidth < 1024) return
    
    e.preventDefault()
    dragStateRef.current = {
      isDragging: true,
      startX: e.clientX,
      startCollapsed: sidebarCollapsed
    }
    setIsDragging(true)
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragStateRef.current.isDragging) return
      
      const deltaX = e.clientX - dragStateRef.current.startX
      const minWidth = 64 // 16 * 4 (w-16)
      const maxWidth = 256 // 64 * 4 (w-64)
      
      let newWidth: number
      if (dragStateRef.current.startCollapsed) {
        // Starting from collapsed (64px), allow expansion
        newWidth = Math.max(minWidth, Math.min(maxWidth, minWidth + deltaX))
      } else {
        // Starting from expanded (256px), allow collapse
        newWidth = Math.max(minWidth, Math.min(maxWidth, maxWidth + deltaX))
      }
      
      setDragWidth(newWidth)
    }
    
    const handleMouseUp = () => {
      if (dragStateRef.current.isDragging) {
        const currentWidth = dragWidth || (dragStateRef.current.startCollapsed ? 64 : 256)
        const midPoint = (64 + 256) / 2 // 160px
        
        const shouldCollapse = currentWidth < midPoint
        setSidebarCollapsed(shouldCollapse)
        
        // Save to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('sidebar-collapsed', JSON.stringify(shouldCollapse))
        }
      }
      
      dragStateRef.current.isDragging = false
      setIsDragging(false)
      setDragWidth(null) // Reset to use CSS classes
      cleanup()
    }
    
    const cleanup = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [sidebarCollapsed, dragWidth])

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
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900 w-full">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            style={{ touchAction: 'none' }}
          />
        )}
        
        {/* Sidebar */}
        <div 
          className={`
            fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 flex-shrink-0 group
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            ${sidebarCollapsed ? 'lg:w-16 w-64' : 'w-64'}
            ${isDragging ? 'transition-none' : ''}
          `}
          style={dragWidth ? { width: `${dragWidth}px` } : {}}
        >
          <Sidebar 
            onClose={() => setSidebarOpen(false)}
            navigate={(route) => router.push(route)}
            collapsed={dragWidth ? dragWidth < 160 : sidebarCollapsed}
            onToggleCollapse={handleSidebarToggle}
          />
          
          {/* Drag handle - desktop only */}
          <div
            ref={dragHandleRef}
            className="hidden lg:block absolute top-0 -right-1 w-2 h-full cursor-col-resize bg-transparent hover:bg-blue-500/20 transition-colors group-hover:bg-blue-500/10"
            onMouseDown={handleMouseDown}
            title={sidebarCollapsed ? "Drag right to expand" : "Drag left to collapse"}
          >
            <div className="w-0.5 h-full bg-gray-300 dark:bg-gray-600 ml-0.75 opacity-0 group-hover:opacity-100 transition-opacity" />
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
          
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-3 lg:p-6 w-full">
            {children}
          </main>
        </div>
        
        <BlockedNotification />
        <AchievementNotification />
      </div>
    </HydrationSafe>
  )
}