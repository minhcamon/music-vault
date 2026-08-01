import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-mono font-semibold transition-colors focus:outline-none focus:ring-1 focus:ring-vault-accent",
  {
    variants: {
      variant: {
        default:
          "bg-vault-accent/20 border border-vault-accent/40 text-vault-accent shadow-sm",
        secondary:
          "bg-white/10 border border-white/15 text-vault-text",
        bronze:
          "bronze-badge text-amber-200 border border-amber-500/30",
        outline:
          "border border-vault-border text-vault-muted",
        destructive:
          "bg-red-500/10 border border-red-500/30 text-red-400",
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
