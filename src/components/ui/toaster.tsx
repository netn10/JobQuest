'use client'

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export function Toaster() {
  const { toasts } = useToast()
  const router = useRouter()

  const handleToastClick = (actionUrl?: string) => {
    if (actionUrl) {
      router.push(actionUrl)
    }
  }

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, actionUrl, ...props }) {
        return (
          <Toast 
            key={id} 
            {...props}
            className={actionUrl ? "cursor-pointer" : undefined}
            onClick={() => handleToastClick(actionUrl)}
          >
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
