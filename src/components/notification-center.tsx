'use client'

import { useState } from 'react'
import { Bell, X, CheckCircle, AlertTriangle, Trophy, Zap, Calendar, Briefcase, BookOpen, Flame } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from 'date-fns'
import { useNotificationStore } from '@/contexts/notification-store-context'
import { useNotificationHelpers } from '@/contexts/notification-store-context'

export interface NotificationItem {
  id: string
  type: 'achievement' | 'mission' | 'streak' | 'job_application' | 'learning' | 'daily_challenge' | 'system'
  title: string
  message: string
  timestamp: Date
  read: boolean
  actionUrl?: string
}

interface NotificationCenterProps {
  onNotificationClick?: (notification: NotificationItem) => void
}

export function NotificationCenter({ onNotificationClick }: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { 
    notifications, 
    unreadCount, 
    markAsRead: storeMarkAsRead, 
    markAllAsRead: storeMarkAllAsRead, 
    deleteNotification: storeDeleteNotification 
  } = useNotificationStore()
  
  const { addAchievementNotification, addMissionNotification, addStreakNotification } = useNotificationHelpers()

  const handleDropdownOpen = () => {
    setIsOpen(true)
    // Mark all notifications as read when user views them
    if (unreadCount > 0) {
      storeMarkAllAsRead()
    }
  }

  const getNotificationIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'achievement':
        return <Trophy className="h-4 w-4 text-yellow-500" />
      case 'mission':
        return <Zap className="h-4 w-4 text-blue-500" />
      case 'streak':
        return <Flame className="h-4 w-4 text-orange-500" />
      case 'job_application':
        return <Briefcase className="h-4 w-4 text-green-500" />
      case 'learning':
        return <BookOpen className="h-4 w-4 text-purple-500" />
      case 'daily_challenge':
        return <Calendar className="h-4 w-4 text-indigo-500" />
      case 'system':
        return <AlertTriangle className="h-4 w-4 text-gray-500" />
      default:
        return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  const handleNotificationClick = (notification: NotificationItem) => {
    storeMarkAsRead(notification.id)
    if (onNotificationClick) {
      onNotificationClick(notification)
    }
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl
    }
  }

  return (
    <div className="relative">
      {/* Bell Button */}
      <Button 
        variant="ghost" 
        size="sm" 
        className="relative cursor-pointer"
        onClick={() => isOpen ? setIsOpen(false) : handleDropdownOpen()}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </h3>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No notifications yet
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {notification.title}
                        </p>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              storeDeleteNotification(notification.id)
                            }}
                            className="opacity-0 group-hover:opacity-100 hover:opacity-100 p-1 h-auto"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
            {notifications.length > 0 ? (
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-sm"
                onClick={() => {
                  setIsOpen(false)
                  // Navigate to full notifications page if it exists
                }}
              >
                View all notifications
              </Button>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-2">
                  Test notifications (development only)
                </p>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs flex-1"
                    onClick={() => {
                      addAchievementNotification('Test Achievement', 'You completed a test task', 50)
                    }}
                  >
                    🏆 Achievement
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs flex-1"
                    onClick={() => {
                      addMissionNotification('Test Mission', 'completed')
                    }}
                  >
                    ⚡ Mission
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs flex-1"
                    onClick={() => {
                      addStreakNotification(7, 'milestone')
                    }}
                  >
                    🔥 Streak
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}