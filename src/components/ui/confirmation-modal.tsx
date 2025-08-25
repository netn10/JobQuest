'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AlertTriangle, X } from 'lucide-react'

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  requireTextConfirmation?: string
  destructive?: boolean
  isLoading?: boolean
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  requireTextConfirmation,
  destructive = false,
  isLoading = false
}: ConfirmationModalProps) {
  const [inputValue, setInputValue] = useState('')

  if (!isOpen) return null

  const handleConfirm = () => {
    if (requireTextConfirmation && inputValue !== requireTextConfirmation) {
      return
    }
    onConfirm()
  }

  const handleClose = () => {
    setInputValue('')
    onClose()
  }

  const isConfirmDisabled = requireTextConfirmation ? inputValue !== requireTextConfirmation : false

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          disabled={isLoading}
        >
          <X className="h-5 w-5" />
        </button>

        {/* Icon and title */}
        <div className="flex items-start space-x-3 mb-4">
          {destructive && (
            <div className="flex-shrink-0">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">
            {description}
          </p>
        </div>

        {/* Text confirmation input */}
        {requireTextConfirmation && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Type "{requireTextConfirmation}" to confirm:
            </label>
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={requireTextConfirmation}
              className="w-full"
              disabled={isLoading}
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant={destructive ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={isConfirmDisabled || isLoading}
            className={destructive ? "bg-red-600 hover:bg-red-700" : undefined}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Processing...
              </>
            ) : (
              confirmText
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}