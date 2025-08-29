'use client'

import { useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
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
              className="h-7 w-7 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-all duration-200"
            >
              <ChevronDown className={cn(
                "h-4 w-4 transition-transform duration-300 ease-in-out",
                isExpanded ? "rotate-0" : "-rotate-90"
              )} />
            </Button>
            <CardTitle className="flex items-center gap-3 text-xl font-bold">
              {Icon && <Icon className="h-6 w-6 text-blue-600" />}
              {title}
            </CardTitle>
          </div>
          {headerChildren}
        </div>
        {description && (
          <CardDescription className="ml-8 text-base">{description}</CardDescription>
        )}
      </CardHeader>
      <div className={cn(
        "overflow-hidden transition-all duration-300 ease-in-out",
        isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
      )}>
        <CardContent className="pt-0">
          {children}
        </CardContent>
      </div>
    </Card>
  )
}
