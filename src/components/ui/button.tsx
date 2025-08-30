import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning'
  size?: 'sm' | 'md' | 'lg'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variants = {
      primary: 'bg-[#3B82F6] text-white hover:bg-[#2563EB] focus:ring-[#3B82F6] shadow-lg hover:shadow-xl border border-[#3B82F6] hover:border-[#2563EB]',
      secondary: 'bg-[#1E293B] text-white hover:bg-[#334155] focus:ring-[#1E293B] shadow-lg hover:shadow-xl border border-[#334155] hover:border-[#475569]',
      outline: 'border-2 border-[#1E293B] text-[#F8FAFC] hover:bg-[#1E293B] focus:ring-[#3B82F6] hover:border-[#334155] bg-transparent',
      ghost: 'text-[#F8FAFC] hover:bg-[#1E293B] focus:ring-[#3B82F6] bg-transparent border border-transparent',
      danger: 'bg-[#EF4444] text-white hover:bg-[#DC2626] focus:ring-[#EF4444] shadow-lg hover:shadow-xl border border-[#EF4444] hover:border-[#DC2626]',
      success: 'bg-[#10B981] text-white hover:bg-[#059669] focus:ring-[#10B981] shadow-lg hover:shadow-xl border border-[#10B981] hover:border-[#059669]',
      warning: 'bg-[#F59E0B] text-white hover:bg-[#D97706] focus:ring-[#F59E0B] shadow-lg hover:shadow-xl border border-[#F59E0B] hover:border-[#D97706]'
    }
    
    const sizes = {
      sm: 'px-4 py-2 text-sm font-medium rounded-lg',
      md: 'px-6 py-3 text-sm font-semibold rounded-xl',
      lg: 'px-8 py-4 text-base font-semibold rounded-xl'
    }

    return (
      <button
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0A0A0F] disabled:opacity-50 disabled:pointer-events-none cursor-pointer hover:scale-[1.02] active:scale-[0.98] shadow-professional",
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

Button.displayName = "Button"

export { Button }