'use client'

import { Bell, Settings, Sun, Moon, Monitor, LogOut, User, Menu, Palette, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/contexts/theme-context'
import { presetThemes } from '@/lib/theme-config'
import { useAuth } from '@/contexts/auth-context'
import { useUserStats } from '@/contexts/user-stats-context'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface HeaderProps {
  title: string
  children?: React.ReactNode
  onMenuClick?: () => void
  showMenuButton?: boolean
}



export function Header({ title, children, onMenuClick, showMenuButton }: HeaderProps) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [showThemeDropdown, setShowThemeDropdown] = useState(false)
  const { user, logout } = useAuth()
  const { stats, loading } = useUserStats()
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showThemeDropdown) {
        setShowThemeDropdown(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showThemeDropdown])



  const cycleTheme = () => {
    if (theme === 'light') {
      setTheme('dark')
    } else {
      setTheme('light')
    }
  }

  const getThemeIcon = () => {
    if (resolvedTheme === 'dark') {
      return <Moon className="h-4 w-4" />
    } else {
      return <Sun className="h-4 w-4" />
    }
  }

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 lg:px-6 py-4 w-full">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center space-x-2 lg:space-x-4 min-w-0 flex-1">
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">{title}</h1>
          {children}
        </div>
        
        <div className="flex items-center space-x-2 lg:space-x-3">
          <div className="relative">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowThemeDropdown(!showThemeDropdown)}
              title={`Current theme: ${theme} (${resolvedTheme})`}
              className="cursor-pointer"
            >
              <Palette className="h-4 w-4" />
            </Button>
            
            {showThemeDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                <div className="p-2 space-y-1">
                  <div className="px-2 py-1 text-sm font-medium text-gray-700 dark:text-gray-300">Base Theme</div>
                  {(['light', 'dark', 'system'] as const).map((themeOption) => (
                    <button
                      key={themeOption}
                      onClick={() => {
                        setTheme(themeOption)
                        setShowThemeDropdown(false)
                      }}
                      className={`w-full text-left px-2 py-1 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 ${
                        theme === themeOption ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {themeOption === 'light' && <Sun className="h-3 w-3" />}
                      {themeOption === 'dark' && <Moon className="h-3 w-3" />}
                      {themeOption === 'system' && <Monitor className="h-3 w-3" />}
                      {themeOption.charAt(0).toUpperCase() + themeOption.slice(1)}
                    </button>
                  ))}
                  
                  <hr className="my-2 border-gray-200 dark:border-gray-600" />
                  
                  <Link href="/settings">
                    <button
                      onClick={() => setShowThemeDropdown(false)}
                      className="w-full text-left px-2 py-1 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-300"
                    >
                      <Settings className="h-3 w-3" />
                      Customize Themes
                    </button>
                  </Link>
                </div>
              </div>
            )}
          </div>
          
          {user ? (
            <>
              <Button variant="ghost" size="sm" className="relative cursor-pointer">
                <Bell className="h-5 w-5" />
              </Button>
              
              {/* Hide stats on mobile - they'll be in the sidebar */}
              <div className="hidden lg:flex items-center space-x-3">
                {loading ? (
                  <>
                    <div className="flex items-center space-x-2 bg-gray-100 dark:bg-green-900/20 px-3 py-1 rounded-full">
                      <div className="w-2 h-2 bg-gray-600 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-gray-800 dark:text-green-300 w-20 h-4 bg-gray-200 dark:bg-green-800/30 rounded animate-pulse"></span>
                    </div>
                    
                    <div className="flex items-center space-x-2 bg-gray-100 dark:bg-blue-900/20 px-3 py-1 rounded-full">
                      <span className="text-sm font-medium text-gray-800 dark:text-blue-300 w-16 h-4 bg-gray-200 dark:bg-blue-800/30 rounded animate-pulse"></span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center space-x-2 bg-gray-100 dark:bg-green-900/20 px-3 py-1 rounded-full">
                      <span className="text-sm font-medium text-gray-800 dark:text-green-300">{stats?.currentStreak || 0} day streak</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 bg-gray-100 dark:bg-blue-900/20 px-3 py-1 rounded-full">
                      <span className="text-sm font-medium text-gray-800 dark:text-blue-300">{(stats?.totalXp || 0).toLocaleString()} XP</span>
                    </div>
                  </>
                )}
                
                <div className="flex items-center space-x-2">
                  <Link href="/dashboard">
                    <span className="text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 cursor-pointer">
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