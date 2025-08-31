'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, getAuthHeaders } from '@/lib/auth'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { CalendarDays, Plus, Save, BookOpen } from 'lucide-react'
import { NotebookCalendar } from '@/components/notebook-calendar'
import { getTodayInTimezone } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { useUserStats } from '@/contexts/user-stats-context'

interface NotebookEntry {
  id: string
  title?: string
  content: string
  tags?: string
  createdAt: string
  updatedAt: string
}

export default function NotebookPage() {
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(() => {
    // Initialize with today's date in local timezone
    const now = new Date()
    const localToday = now.toLocaleDateString('en-CA')
    return localToday
  })
  const [entries, setEntries] = useState<NotebookEntry[]>([])
  const [currentEntry, setCurrentEntry] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [activeDates, setActiveDates] = useState<Date[]>([])
  const [userTimezone, setUserTimezone] = useState<string>('UTC')
  const router = useRouter()
  const { toast } = useToast()
  const { addXp } = useUserStats()

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push('/')
      return
    }
    
    // Load existing entries from API
    loadEntries()
    
    // Use local timezone for now to avoid API dependency
    const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    setUserTimezone(localTimezone)
    const localToday = getTodayInTimezone(localTimezone)
    setSelectedDate(localToday)
  }, [router])

  const loadEntries = async () => {
    try {
      const response = await fetch('/api/notebook', {
        headers: getAuthHeaders()
      })
      
      if (response.ok) {
        const data = await response.json()
        setEntries(data)
        
        // Extract active dates from entries
        const dates = data.map((entry: NotebookEntry) => new Date(entry.createdAt))
        setActiveDates(dates)
      }
    } catch (error) {
      // Failed to load entries
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Load entry for selected date
    const entry = entries.find(e => {
      // Helper function to get date string in user's timezone
      const getDateInUserTimezone = (date: Date) => {
        if (userTimezone && userTimezone !== 'UTC') {
          const dateParts = date.toLocaleDateString('en-CA', { timeZone: userTimezone }).split('-')
          return `${dateParts[0]}-${dateParts[1]}-${dateParts[2]}`
        } else {
          return date.toISOString().split('T')[0]
        }
      }
      
      const entryDate = new Date(e.createdAt)
      const entryDateStr = getDateInUserTimezone(entryDate)
      return entryDateStr === selectedDate
    })
    setCurrentEntry(entry?.content || '')
  }, [selectedDate, entries, userTimezone])

  const handleSave = async () => {
    if (!currentEntry.trim()) {
      setIsSaving(false)
      return
    }
    
    setIsSaving(true)
    
    try {
      const response = await fetch('/api/notebook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          content: currentEntry,
          date: selectedDate
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        // Reload entries to get updated data
        await loadEntries()
        
        // Check if a daily challenge was completed (returned directly from the API)
        if (result.challengeCompleted) {
          // Update XP immediately in the UI
          addXp(result.challengeCompleted.xpReward)
          
          toast({
            title: "🎉 Daily Challenge Completed!",
            description: `You completed "${result.challengeCompleted.title}" and earned ${result.challengeCompleted.xpReward} XP!`,
            variant: "default",
          })
        } else {
          // Fallback: Check for daily challenge completion using refresh endpoint
          try {
            const challengeResponse = await fetch('/api/daily-challenges/refresh', {
              method: 'POST',
              headers: getAuthHeaders()
            })
            
            if (challengeResponse.ok) {
              const challengeResult = await challengeResponse.json()
              
              // Show toast notification if a challenge was completed
              if (challengeResult.newlyCompleted) {
                // Update XP immediately in the UI
                addXp(challengeResult.xpAwarded)
                
                toast({
                  title: "🎉 Daily Challenge Completed!",
                  description: `You completed "${challengeResult.newlyCompleted.title}" and earned ${challengeResult.xpAwarded} XP!`,
                  variant: "default",
                })
              }
            }
          } catch (challengeError) {
            console.error('Error checking daily challenges:', challengeError)
          }
        }
        
        // Show success feedback
        setTimeout(() => setIsSaving(false), 500)
      } else {
        throw new Error('Failed to save entry')
      }
    } catch (error) {
      setIsSaving(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00')
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading || !selectedDate) {
    return (
      <DashboardLayout title="Daily Notebook">
        <div className="space-y-6">
          <Card>
            <CardHeader className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mt-2"></div>
            </CardHeader>
            <CardContent className="animate-pulse">
              <div className="h-32 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Daily Notebook">
      <div className="space-y-8 max-w-7xl mx-auto px-4">
        {/* Header Section */}
        <div className="text-center space-y-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Daily Notebook
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Capture your thoughts, reflections, and daily insights in your personal journal
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* Left Column - Calendar */}
          <div className="lg:col-span-1">
            <NotebookCalendar 
              activeDates={activeDates}
              selectedDate={selectedDate}
              className="h-full"
              userTimezone={userTimezone}
              onDateSelect={(date) => {
                // Use the same timezone-aware approach for date selection
                const selectedDateStr = userTimezone && userTimezone !== 'UTC' 
                  ? date.toLocaleDateString('en-CA', { timeZone: userTimezone })
                  : date.toLocaleDateString('en-CA')
                setSelectedDate(selectedDateStr)
              }}
            />
          </div>

          {/* Right Column - Writing Area */}
          <div className="lg:col-span-2 flex flex-col">
            {/* Main Writing Area */}
            <Card className="flex-1 flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-gray-900 dark:text-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <span className="text-xl font-bold">Journal Entry</span>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-normal">for {selectedDate}</p>
                    </div>
                  </div>
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {isSaving ? (
                      <>Saving...</>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </>
                    )}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <Textarea
                  placeholder="What's on your mind today? Reflect on your job search progress, learnings, challenges, or any thoughts you'd like to capture..."
                  value={currentEntry}
                  onChange={(e) => setCurrentEntry(e.target.value)}
                  className="flex-1 resize-none border-2 border-gray-200 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-800 p-4 focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all duration-300 placeholder-gray-400 dark:placeholder-gray-500"
                />
                <div className="mt-2 text-sm text-gray-500 flex justify-between">
                  <span>{currentEntry.length} characters</span>
                  <span>Click save to persist changes</span>
                </div>
              </CardContent>
            </Card>

            {/* Recent Entries Preview */}
            {entries.length > 0 && (
              <Card className="mt-6 flex-shrink-0">
                <CardHeader>
                  <CardTitle>Recent Entries</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {entries
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .slice(0, 5)
                      .map((entry) => {
                        const entryDate = new Date(entry.createdAt).toISOString().split('T')[0]
                        return (
                          <div
                            key={entry.id}
                            className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            onClick={() => setSelectedDate(entryDate)}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-medium text-sm">
                                {formatDate(entryDate)}
                              </span>
                              <span className="text-xs text-gray-500">
                                {entry.content.length} chars
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                              {entry.content.substring(0, 150)}...
                            </p>
                          </div>
                        )
                      })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}