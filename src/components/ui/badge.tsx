import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 shadow-professional hover:shadow-elevated",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[#3B82F6] text-white hover:bg-[#2563EB]",
        secondary:
          "border-transparent bg-[#1E293B] text-[#F8FAFC] hover:bg-[#334155]",
        destructive:
          "border-transparent bg-[#EF4444] text-white hover:bg-[#DC2626]",
        success:
          "border-transparent bg-[#10B981] text-white hover:bg-[#059669]",
        warning:
          "border-transparent bg-[#F59E0B] text-white hover:bg-[#D97706]",
        outline: "text-[#F8FAFC] border-[#1E293B] bg-transparent hover:bg-[#1E293B]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }