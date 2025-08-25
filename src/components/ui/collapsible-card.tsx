'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CollapsibleCardProps {
  title: string
  description?: string
  icon?: React.ComponentType<{ className?: string }>
  defaultExpanded?: boolean
  children: React.ReactNode
  className?: string
  headerChildren?: React.ReactNode
  storageKey?: string
}

export function CollapsibleCard({
  title,
  description,
  icon: Icon,
  defaultExpanded = true,
  children,
  className,
  headerChildren,
  storageKey
}: CollapsibleCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const [isLoaded, setIsLoaded] = useState(false)

  // Generate a unique storage key if not provided
  const key = storageKey || `collapsible-${title.toLowerCase().replace(/\s+/g, '-')}`

  useEffect(() => {
    // Load saved state from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(key)
      if (saved !== null) {
        setIsExpanded(JSON.parse(saved))
      }
      setIsLoaded(true)
    }
  }, [key])

  const handleToggle = () => {
    const newState = !isExpanded
    setIsExpanded(newState)
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(newState))
    }
  }

  // Don't render until we've loaded the saved state to prevent flash
  if (!isLoaded) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
            {headerChildren}
          </div>
          {description && (
            <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse ml-8" />
          )}
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggle}
              className="h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
            <CardTitle className="flex items-center gap-2 text-lg">
              {Icon && <Icon className="h-5 w-5" />}
              {title}
            </CardTitle>
          </div>
          {headerChildren}
        </div>
        {description && (
          <CardDescription className="ml-8">{description}</CardDescription>
        )}
      </CardHeader>
      {isExpanded && (
        <CardContent className="pt-0">
          {children}
        </CardContent>
      )}
    </Card>
  )
}
