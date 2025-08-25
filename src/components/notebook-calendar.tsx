'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { generateCalendarData } from '@/lib/utils'

interface NotebookCalendarProps {
  activeDates: Date[]
  selectedDate: string
  className?: string
  userTimezone?: string
  onDateSelect?: (date: Date) => void
}

export function NotebookCalendar({ activeDates, selectedDate, className = '', userTimezone, onDateSelect }: NotebookCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  
  // Update current month when userTimezone changes to ensure we're showing the right month
  useEffect(() => {
    if (userTimezone) {
      setCurrentMonth(new Date())
    }
  }, [userTimezone])
  
  // Regenerate calendar data when userTimezone changes
  const calendar = generateCalendarData(activeDates, currentMonth, userTimezone)
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  
  const goToPreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }
  
  const goToNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }
  
  const goToCurrentMonth = () => {
    setCurrentMonth(new Date())
  }
  
  const handleDayClick = (day: any) => {
    if (day && !isFutureDate(day) && onDateSelect) {
      onDateSelect(day.date)
    }
  }

  const isFutureDate = (day: any) => {
    if (!day) return false
    const now = new Date()
    const dayDate = new Date(day.date)
    
    // Get today's date in user's timezone
    let today: Date
    if (userTimezone && userTimezone !== 'UTC') {
      const dateParts = now.toLocaleDateString('en-CA', { timeZone: userTimezone }).split('-')
      today = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]))
    } else {
      today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    }
    
    // Set time to start of day for accurate comparison
    today.setHours(0, 0, 0, 0)
    dayDate.setHours(0, 0, 0, 0)
    
    return dayDate > today
  }
  
  const isSelected = (day: any) => {
    if (!day) return false
    // Use the same timezone-aware approach for date comparison
    const dayStr = userTimezone && userTimezone !== 'UTC'
      ? day.date.toLocaleDateString('en-CA', { timeZone: userTimezone })
      : day.date.toLocaleDateString('en-CA')
    return dayStr === selectedDate
  }
  
  const isTodaySelected = (day: any) => {
    return isSelected(day) && day.isToday
  }
  
  return (
    <Card className={`${className} flex flex-col`}>
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousMonth}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToCurrentMonth}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextMonth}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="space-y-2">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1">
            {dayNames.map(day => (
              <div
                key={day}
                className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-1"
              >
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar grid */}
          <div className="space-y-1">
            {calendar.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-7 gap-1">
                {week.map((day, dayIndex) => (
                  <div
                    key={dayIndex}
                    className={`
                      aspect-square rounded-md text-xs font-medium flex items-center justify-center transition-colors
                      ${day === null 
                        ? 'bg-transparent cursor-default' 
                        : isTodaySelected(day)
                        ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border-2 border-orange-300 dark:border-orange-600 cursor-pointer'
                        : isSelected(day)
                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-2 border-purple-300 dark:border-purple-600 cursor-pointer'
                        : day.isToday
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-2 border-blue-300 dark:border-blue-600 hover:bg-blue-200 dark:hover:bg-blue-900/50 cursor-pointer'
                        : isFutureDate(day)
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                        : day.isActive
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50 cursor-pointer'
                        : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer'
                      }
                    `}
                    onClick={() => handleDayClick(day)}
                  >
                    {day?.day || ''}
                  </div>
                ))}
              </div>
            ))}
          </div>
          
          {/* Legend */}
          <div className="flex items-center justify-center space-x-2 pt-2 text-xs flex-wrap gap-2">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-gray-50 dark:bg-gray-800 rounded"></div>
              <span className="text-gray-500 dark:text-gray-400">Available</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-100 dark:bg-green-900/30 rounded"></div>
              <span className="text-gray-500 dark:text-gray-400">Has entry</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-600 rounded"></div>
              <span className="text-gray-500 dark:text-gray-400">Today</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-orange-100 dark:bg-orange-900/30 border border-orange-300 dark:border-orange-600 rounded"></div>
              <span className="text-gray-500 dark:text-gray-400">Today (Selected)</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-purple-100 dark:bg-purple-900/30 border border-purple-300 dark:border-purple-600 rounded"></div>
              <span className="text-gray-400">Selected</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-gray-100 dark:bg-gray-700 rounded"></div>
              <span className="text-gray-500 dark:text-gray-400">Future</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}