'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, getAuthHeaders } from '@/lib/auth'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { CalendarDays, Plus, Save, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react'

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
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [entries, setEntries] = useState<NotebookEntry[]>([])
  const [currentEntry, setCurrentEntry] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push('/')
      return
    }
    
    // Load existing entries from API
    loadEntries()
  }, [router])

  const loadEntries = async () => {
    try {
      const response = await fetch('/api/notebook', {
        headers: getAuthHeaders()
      })
      
      if (response.ok) {
        const data = await response.json()
        setEntries(data)
      }
    } catch (error) {
      console.error('Failed to load entries:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Load entry for selected date
    const entry = entries.find(e => {
      const entryDate = new Date(e.createdAt).toISOString().split('T')[0]
      return entryDate === selectedDate
    })
    setCurrentEntry(entry?.content || '')
  }, [selectedDate, entries])

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
        // Show success feedback
        setTimeout(() => setIsSaving(false), 500)
      } else {
        throw new Error('Failed to save entry')
      }
    } catch (error) {
      console.error('Failed to save entry:', error)
      setIsSaving(false)
    }
  }

  const navigateDate = (direction: 'prev' | 'next') => {
    const currentDate = new Date(selectedDate)
    const newDate = new Date(currentDate)
    
    if (direction === 'prev') {
      newDate.setDate(currentDate.getDate() - 1)
    } else {
      newDate.setDate(currentDate.getDate() + 1)
    }
    
    setSelectedDate(newDate.toISOString().split('T')[0])
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

  if (loading) {
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
      <div className="space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <BookOpen className="h-6 w-6" />
              Daily Notebook
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-300">
              Capture your thoughts, reflections, and daily insights
            </p>
          </CardHeader>
        </Card>

        {/* Date Navigation */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateDate('prev')}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              
              <div className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-blue-600" />
                <span className="text-lg font-semibold">
                  {formatDate(selectedDate)}
                </span>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateDate('next')}
                disabled={selectedDate >= new Date().toISOString().split('T')[0]}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
              className="w-full"
            >
              Jump to Today
            </Button>
          </CardContent>
        </Card>

        {/* Main Writing Area */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Journal Entry</span>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                size="sm"
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
          <CardContent>
            <Textarea
              placeholder="What's on your mind today? Reflect on your job search progress, learnings, challenges, or any thoughts you'd like to capture..."
              value={currentEntry}
              onChange={(e) => setCurrentEntry(e.target.value)}
              className="min-h-[300px] resize-none"
            />
            <div className="mt-2 text-sm text-gray-500 flex justify-between">
              <span>{currentEntry.length} characters</span>
              <span>Click save to persist changes</span>
            </div>
          </CardContent>
        </Card>

        {/* Recent Entries Preview */}
        {entries.length > 0 && (
          <Card>
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
    </DashboardLayout>
  )
}