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
  Clock,
  Award
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/auth-context'
import { useUserStats } from '@/contexts/user-stats-context'
import { Button } from '@/components/ui/button'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { name: 'Focus Missions', href: '/missions', icon: Target },
  { name: 'Daily Challenges', href: '/daily-challenges', icon: Award },
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
      "flex h-full flex-col bg-[#020617] border-r border-[#1E293B] text-white transition-all duration-300 select-none shadow-elevated",
      collapsed ? "lg:w-16 w-64" : "w-64"
    )}
    style={{
      userSelect: 'none',
      WebkitUserSelect: 'none',
      MozUserSelect: 'none',
      msUserSelect: 'none'
    }}
    onDragStart={(e) => e.preventDefault()}
    >
      <div className="flex h-16 items-center justify-between px-6 border-b border-[#1E293B]">
        <button 
          onClick={() => navigate('/dashboard')} 
          className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          draggable="false"
        >
          <Zap className="h-8 w-8 text-[#3B82F6]" />
          {!collapsed && <span className="font-bold text-lg text-[#F8FAFC]">JobQuest</span>}
        </button>
        <div className="flex items-center space-x-2">
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="lg:hidden text-[#94A3B8] hover:text-white"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
      
      {/* Mobile-only user stats section */}
      {onClose && user && (
        <div className="lg:hidden px-4 py-3 border-b border-[#1E293B] bg-[#0F172A]">
          <div className="space-y-3">
            {loading ? (
              <>
                <div className="flex items-center space-x-2 bg-[#1E293B] px-3 py-2 rounded-lg">
                  <div className="w-2 h-2 bg-[#64748B] rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-[#64748B] w-20 h-4 bg-[#334155] rounded animate-pulse"></span>
                </div>
                
                <div className="flex items-center space-x-2 bg-[#1E293B] px-3 py-2 rounded-lg">
                  <span className="text-sm font-medium text-[#64748B] w-16 h-4 bg-[#334155] rounded animate-pulse"></span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center space-x-2 bg-[#1E293B] px-3 py-2 rounded-lg">
                  <span className="text-sm font-medium text-[#F1F5F9]">{stats?.currentStreak || 0} day streak</span>
                </div>
                
                <div className="flex items-center space-x-2 bg-[#1E293B] px-3 py-2 rounded-lg">
                  <span className="text-sm font-medium text-[#F1F5F9]">{(stats?.totalXp || 0).toLocaleString()} XP</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <button
              key={item.name}
              onClick={() => {
                navigate(item.href)
                handleNavigation()
              }}
              className={cn(
                'group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg cursor-pointer w-full text-left transition-all duration-200',
                isActive 
                  ? 'bg-[#3B82F6] text-white shadow-professional' 
                  : 'text-[#F1F5F9] hover:bg-[#1E293B] hover:text-white',
                collapsed && 'justify-center'
              )}
              title={collapsed ? item.name : undefined}
              draggable="false"
            >
              <Icon className={cn(
                'h-5 w-5',
                !collapsed && 'mr-3',
                isActive ? 'text-white' : 'text-[#64748B] group-hover:text-[#F1F5F9]'
              )} />
              {!collapsed && item.name}
            </button>
          )
        })}
      </nav>
      
      <div className="flex-shrink-0 px-4 py-4 border-t border-[#1E293B] bg-[#0F172A]">
        {user ? (
          <div className="space-y-3">
            <div className={cn("flex items-center", collapsed && "justify-center")}>
              <div className="h-8 w-8 rounded-full bg-[#3B82F6] flex items-center justify-center shadow-professional">
                <span className="text-sm font-medium text-white">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </span>
              </div>
              {!collapsed && (
                <div className="ml-3">
                  <p className="text-sm font-medium text-[#F8FAFC]">
                    {user?.name || user?.email || 'User'}
                  </p>
                  <p className="text-xs text-[#64748B]">Level {user?.level || 1}</p>
                </div>
              )}
            </div>
            
            {/* Mobile-only logout button */}
            {onClose && !collapsed && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="w-full justify-start text-[#F1F5F9] hover:bg-[#1E293B] hover:text-white"
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
                className="w-full justify-start text-[#F1F5F9] hover:bg-[#1E293B] hover:text-white"
                onClick={() => {
                  navigate('/login')
                  handleNavigation()
                }}
              >
                Sign In
              </Button>
              <Button 
                size="sm" 
                className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white"
                onClick={() => {
                  navigate('/register')
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