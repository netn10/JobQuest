'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronLeft, ChevronRight, X, Target, Trophy, BriefcaseIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { generateCalendarData } from '@/lib/utils'

interface Activity {
  type: 'mission' | 'achievement' | 'application'
  title: string
  description: string
  timestamp: string
  icon: string
}

interface CalendarProps {
  activeDates: Date[]
  activities: Activity[]
  className?: string
}

export function Calendar({ activeDates, activities, className = '' }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showActivities, setShowActivities] = useState(false)
  
  const calendar = generateCalendarData(activeDates, currentMonth)
  
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
    if (day && day.isActive) {
      setSelectedDate(day.date)
      setShowActivities(true)
    }
  }
  
  const closeActivities = () => {
    setShowActivities(false)
    setSelectedDate(null)
  }
  
  const getActivitiesForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return activities.filter(activity => {
      const activityDate = new Date(activity.timestamp).toISOString().split('T')[0]
      return activityDate === dateStr
    })
  }
  
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'target': return Target
      case 'trophy': return Trophy
      case 'briefcase': return BriefcaseIcon
      default: return Target
    }
  }
  
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Activity Calendar</CardTitle>
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
      <CardContent>
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
                       aspect-square rounded-md text-xs font-medium flex items-center justify-center cursor-pointer transition-colors
                       ${day === null 
                         ? 'bg-transparent cursor-default' 
                         : day.isToday
                         ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-2 border-blue-300 dark:border-blue-600 hover:bg-blue-200 dark:hover:bg-blue-900/50'
                         : day.isActive
                         ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50'
                         : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
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
          <div className="flex items-center justify-center space-x-4 pt-2 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-gray-50 dark:bg-gray-800 rounded"></div>
              <span className="text-gray-500 dark:text-gray-400">No activity</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-100 dark:bg-green-900/30 rounded"></div>
              <span className="text-gray-500 dark:text-gray-400">Active day</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-600 rounded"></div>
              <span className="text-gray-500 dark:text-gray-400">Today</span>
            </div>
                     </div>
         </div>
       </CardContent>
       
       {/* Activities Modal */}
       {showActivities && selectedDate && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
           <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-96 overflow-hidden">
             <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
               <h3 className="text-lg font-semibold">
                 Activities for {selectedDate.toLocaleDateString('en-US', { 
                   weekday: 'long', 
                   year: 'numeric', 
                   month: 'long', 
                   day: 'numeric' 
                 })}
               </h3>
               <Button
                 variant="ghost"
                 size="sm"
                 onClick={closeActivities}
                 className="h-8 w-8 p-0"
               >
                 <X className="h-4 w-4" />
               </Button>
             </div>
             <div className="p-4 overflow-y-auto max-h-64">
               {(() => {
                 const dayActivities = getActivitiesForDate(selectedDate)
                 if (dayActivities.length === 0) {
                   return (
                     <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                       <p>No activities found for this day</p>
                     </div>
                   )
                 }
                 return (
                   <div className="space-y-3">
                     {dayActivities.map((activity, index) => {
                       const IconComponent = getIconComponent(activity.icon)
                       return (
                         <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                           <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center flex-shrink-0">
                             <IconComponent className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                           </div>
                           <div className="flex-1 min-w-0">
                             <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                               {activity.title}
                             </p>
                             <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                               {activity.description}
                             </p>
                           </div>
                         </div>
                       )
                     })}
                   </div>
                 )
               })()}
             </div>
           </div>
         </div>
       )}
     </Card>
   )
 }
