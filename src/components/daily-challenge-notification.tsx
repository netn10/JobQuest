'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Trophy, X, CheckCircle } from 'lucide-react'

interface DailyChallengeNotificationProps {
  challenge: {
    title: string
    description: string
    xpReward: number
  }
  onClose: () => void
  onViewDetails: () => void
}

export function DailyChallengeNotification({ 
  challenge, 
  onClose, 
  onViewDetails 
}: DailyChallengeNotificationProps) {
  const [isVisible, setIsVisible] = useState(true)

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 300) // Wait for animation to complete
  }

  const handleViewDetails = () => {
    onViewDetails()
    handleClose()
  }

  if (!isVisible) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-full duration-300">
      <Card className="w-80 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <Trophy className="h-4 w-4 text-yellow-600" />
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                    Challenge Completed!
                  </h4>
                </div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
                  {challenge.title}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  {challenge.description}
                </p>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-xs">
                    +{challenge.xpReward} XP
                  </Badge>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={handleViewDetails}
                    className="text-xs h-6 px-2"
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Hook to manage daily challenge notifications
export function useDailyChallengeNotifications() {
  const [notifications, setNotifications] = useState<Array<{
    id: string
    challenge: {
      title: string
      description: string
      xpReward: number
    }
  }>>([])

  const addNotification = (challenge: {
    title: string
    description: string
    xpReward: number
  }) => {
    const id = Math.random().toString(36).substr(2, 9)
    setNotifications(prev => [...prev, { id, challenge }])
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  return {
    notifications,
    addNotification,
    removeNotification
  }
}
