'use client'

import { Bell, Settings, LogOut, User, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { useUserStats } from '@/contexts/user-stats-context'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { NotificationCenter } from '@/components/notification-center'

interface HeaderProps {
  title: string
  children?: React.ReactNode
  onMenuClick?: () => void
  showMenuButton?: boolean
}



export function Header({ title, children, onMenuClick, showMenuButton }: HeaderProps) {
  const { user, logout } = useAuth()
  const { stats, loading } = useUserStats()


  return (
    <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4 w-full">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center space-x-2 lg:space-x-4 min-w-0 flex-1">
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900 truncate">{title}</h1>
          {children}
        </div>
        
        <div className="flex items-center space-x-2 lg:space-x-3">
          
          {user ? (
            <>
              <NotificationCenter />
              
              {/* Hide stats on mobile - they'll be in the sidebar */}
              <div className="hidden lg:flex items-center space-x-3">
                {loading ? (
                  <>
                    <div className="flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded-full">
                      <div className="w-2 h-2 bg-gray-600 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-gray-800 w-20 h-4 bg-gray-200 rounded animate-pulse"></span>
                    </div>
                    
                    <div className="flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded-full">
                      <span className="text-sm font-medium text-gray-800 w-16 h-4 bg-gray-200 rounded animate-pulse"></span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded-full">
                      <span className="text-sm font-medium text-gray-800">{stats?.currentStreak || 0} day streak</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded-full">
                      <span className="text-sm font-medium text-gray-800">{(stats?.totalXp || 0).toLocaleString()} XP</span>
                    </div>
                  </>
                )}
                
                <div className="flex items-center space-x-2">
                  <Link href="/dashboard">
                    <span className="text-sm text-gray-700 hover:text-gray-900 cursor-pointer">
                      {user?.name || user?.email || 'User'}
                    </span>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={logout} className="cursor-pointer">
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="hidden lg:flex items-center space-x-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="cursor-pointer">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="cursor-pointer">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
          
          {/* Hamburger menu on the right */}
          {showMenuButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuClick}
              className="lg:hidden cursor-pointer"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}