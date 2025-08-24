'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Coffee, Play, Square, Clock } from 'lucide-react'

interface BreakTimerProps {
  isActive: boolean
  duration: number // in minutes
  onComplete: () => void
  onSkip: () => void
  onStart: () => void
  type: 'short' | 'long'
  autoStart?: boolean
}

export function BreakTimer({ 
  isActive, 
  duration, 
  onComplete, 
  onSkip, 
  onStart, 
  type,
  autoStart = false
}: BreakTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(duration * 60) // convert to seconds
  const [isStarted, setIsStarted] = useState(false)

  useEffect(() => {
    if (isActive && !isStarted) {
      setTimeRemaining(duration * 60)
      
      // Auto-start the timer if autoStart is enabled
      if (autoStart) {
        setIsStarted(true)
        onStart()
      }
    }
  }, [isActive, duration, isStarted, autoStart, onStart])

  useEffect(() => {
    if (!isActive || !isStarted) return

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setIsStarted(false)
          onComplete()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isActive, isStarted, onComplete])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleStart = () => {
    setIsStarted(true)
    onStart()
  }

  const handleSkip = () => {
    setIsStarted(false)
    setTimeRemaining(0)
    onSkip()
  }

  const progress = duration > 0 ? Math.max(0, 100 - (timeRemaining / (duration * 60) * 100)) : 0

  if (!isActive) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <Card className="w-full max-w-md mx-4 border-green-300 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-green-500 dark:bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Coffee className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-green-800 dark:text-green-200">
            {type === 'short' ? 'Short Break' : 'Long Break'}
          </CardTitle>
          <CardDescription className="text-green-600 dark:text-green-400">
            Time for a well-deserved break! Take {duration} minutes to recharge.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {!isStarted ? (
            <div className="text-center space-y-4">
              <div className="text-4xl font-bold text-green-800 dark:text-green-200">
                {formatTime(timeRemaining)}
              </div>
              <p className="text-sm text-green-600 dark:text-green-400">
                {autoStart ? `Your ${type} break will start automatically` : `Ready to start your ${type} break?`}
              </p>
              {!autoStart && (
                <div className="flex space-x-3 justify-center">
                  <Button 
                    onClick={handleStart}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Break
                  </Button>
                  <Button 
                    onClick={handleSkip}
                    variant="outline"
                    className="border-green-300 text-green-700 hover:bg-green-100 dark:border-green-600 dark:text-green-300 dark:hover:bg-green-800"
                  >
                    Skip Break
                  </Button>
                </div>
              )}
              {autoStart && (
                <div className="flex justify-center">
                  <Button 
                    onClick={handleSkip}
                    variant="outline"
                    className="border-green-300 text-green-700 hover:bg-green-100 dark:border-green-600 dark:text-green-300 dark:hover:bg-green-800"
                  >
                    Skip Break
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="w-full bg-green-200 dark:bg-green-800/50 rounded-full h-4 mb-4">
                <div 
                  className="bg-green-500 dark:bg-green-400 h-4 rounded-full transition-all duration-1000" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              
              <div className="text-4xl font-bold text-green-800 dark:text-green-200">
                {formatTime(timeRemaining)}
              </div>
              
              <p className="text-sm text-green-600 dark:text-green-400">
                {Math.round(progress)}% complete • {type === 'short' ? 'Take a stretch' : 'Get some fresh air'}
              </p>
              
              <Button 
                onClick={handleSkip}
                variant="outline"
                size="sm"
                className="border-green-300 text-green-700 hover:bg-green-100 dark:border-green-600 dark:text-green-300 dark:hover:bg-green-800"
              >
                <Square className="h-4 w-4 mr-2" />
                End Break Early
              </Button>
            </div>
          )}
          
          <div className="text-center">
            <div className="flex items-center justify-center text-xs text-green-600 dark:text-green-400">
              <Clock className="h-3 w-3 mr-1" />
              {type === 'short' ? 'Recommended: Light stretching or hydration' : 'Recommended: Walk, fresh air, or meditation'}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}