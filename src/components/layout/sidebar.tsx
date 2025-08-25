'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { 
  Target, 
  Trophy, 
  BookOpen, 
  BriefcaseIcon, 
  GraduationCap, 
  BarChart3, 
  Settings,
  Zap,
  X,
  LogOut,
  Info,
  ChevronLeft,
  ChevronRight,
  Clock
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/auth-context'
import { useUserStats } from '@/contexts/user-stats-context'
import { Button } from '@/components/ui/button'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { name: 'Focus Missions', href: '/missions', icon: Target },
  { name: 'Job Tracker', href: '/jobs', icon: BriefcaseIcon },
  { name: 'Daily Notebook', href: '/notebook', icon: BookOpen },
  { name: 'Learning', href: '/learning', icon: GraduationCap },
  { name: 'Achievements', href: '/achievements', icon: Trophy },
  { name: 'Activity History', href: '/activities', icon: Clock },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'About', href: '/about', icon: Info },
]

interface SidebarProps {
  onClose?: () => void
  navigate: (route: string) => void
  collapsed?: boolean
  onToggleCollapse?: () => void
}



export function Sidebar({ onClose, navigate, collapsed = false, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { stats, loading } = useUserStats()

  const handleNavigation = () => {
    // Close mobile menu when navigating
    if (onClose) {
      onClose()
    }
  }

  const handleLogout = () => {
    logout()
    if (onClose) {
      onClose()
    }
  }

  return (
    <div className={cn(
      "flex h-full flex-col bg-gray-900 dark:bg-gray-950 text-white transition-all duration-300",
      collapsed ? "lg:w-16 w-64" : "w-64"
    )}>
      <div className="flex h-16 items-center justify-between px-6">
        <button 
          onClick={() => navigate('dashboard')} 
          className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
        >
          <Zap className="h-8 w-8 text-yellow-400" />
          {!collapsed && <span className="font-bold text-lg">JobQuest</span>}
        </button>
        <div className="flex items-center space-x-2">
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
      
      {/* Mobile-only user stats section */}
      {onClose && user && (
        <div className="lg:hidden px-4 py-3 border-b border-gray-700">
          <div className="space-y-3">
            {loading ? (
              <>
                <div className="flex items-center space-x-2 bg-gray-700 px-3 py-2 rounded-md">
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-300 w-20 h-4 bg-gray-600 rounded animate-pulse"></span>
                </div>
                
                <div className="flex items-center space-x-2 bg-gray-700 px-3 py-2 rounded-md">
                  <span className="text-sm font-medium text-gray-300 w-16 h-4 bg-gray-600 rounded animate-pulse"></span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center space-x-2 bg-gray-700 px-3 py-2 rounded-md">
                  <span className="text-sm font-medium text-gray-300">{stats?.currentStreak || 0} day streak</span>
                </div>
                
                <div className="flex items-center space-x-2 bg-gray-700 px-3 py-2 rounded-md">
                  <span className="text-sm font-medium text-gray-300">{(stats?.totalXp || 0).toLocaleString()} XP</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => {
          const Icon = item.icon
          const route = item.href.slice(1) // Remove leading slash
          const isActive = pathname === item.href
          
          return (
            <button
              key={item.name}
              onClick={() => {
                navigate(route)
                handleNavigation()
              }}
              className={cn(
                'group flex items-center px-2 py-2 text-sm font-medium rounded-md cursor-pointer w-full text-left',
                isActive 
                  ? 'bg-gray-800 text-white' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                collapsed && 'justify-center'
              )}
              title={collapsed ? item.name : undefined}
            >
              <Icon className={cn(
                'h-6 w-6',
                !collapsed && 'mr-3',
                isActive ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-300'
              )} />
              {!collapsed && item.name}
            </button>
          )
        })}
      </nav>
      
      <div className="flex-shrink-0 px-4 py-4">
        {user ? (
          <div className="space-y-3">
            <div className={cn("flex items-center", collapsed && "justify-center")}>
              <div className="h-8 w-8 rounded-full bg-gray-600 flex items-center justify-center">
                <span className="text-sm font-medium">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </span>
              </div>
              {!collapsed && (
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">
                    {user?.name || user?.email || 'User'}
                  </p>
                  <p className="text-xs text-gray-400">Level {user?.level || 1}</p>
                </div>
              )}
            </div>
            
            {/* Mobile-only logout button */}
            {onClose && !collapsed && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="w-full justify-start text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                <LogOut className="mr-3 h-4 w-4" />
                Sign Out
              </Button>
            )}
          </div>
        ) : (
          !collapsed && (
            <div className="space-y-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full justify-start text-gray-300 hover:bg-gray-700 hover:text-white"
                onClick={() => {
                  navigate('login')
                  handleNavigation()
                }}
              >
                Sign In
              </Button>
              <Button 
                size="sm" 
                className="w-full"
                onClick={() => {
                  navigate('register')
                  handleNavigation()
                }}
              >
                Sign Up
              </Button>
            </div>
          )
        )}
      </div>
    </div>
  )
}