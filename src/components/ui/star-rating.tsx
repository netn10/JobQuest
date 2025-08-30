'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  rating: number
  onRatingChange?: (rating: number) => void
  readonly?: boolean
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
  className?: string
}

export function StarRating({ 
  rating, 
  onRatingChange, 
  readonly = false, 
  size = 'md',
  showValue = false,
  className 
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0)
  const [isHovering, setIsHovering] = useState(false)

  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  }

  const handleMouseEnter = (starValue: number) => {
    if (!readonly) {
      setHoverRating(starValue)
      setIsHovering(true)
    }
  }

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(0)
      setIsHovering(false)
    }
  }

  const handleClick = (starValue: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(starValue)
    }
  }

  const displayRating = isHovering ? hoverRating : rating

  return (
    <div className={cn("flex items-center space-x-1", className)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => handleClick(star)}
          onMouseEnter={() => handleMouseEnter(star)}
          onMouseLeave={handleMouseLeave}
          className={cn(
            "transition-colors duration-200",
            !readonly && "hover:scale-110 cursor-pointer",
            readonly && "cursor-default"
          )}
        >
          <Star
            className={cn(
              sizeClasses[size],
              star <= displayRating 
                ? "text-yellow-400 fill-current" 
                : "text-gray-300 dark:text-gray-600"
            )}
          />
        </button>
      ))}
      {showValue && (
        <span className="text-xs text-gray-600 dark:text-gray-400 ml-1">
          ({rating}/5)
        </span>
      )}
    </div>
  )
}
