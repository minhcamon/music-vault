import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-vault-accent disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-vault-accent text-white shadow-lg shadow-vault-accent/30 hover:bg-vault-accent/90",
        destructive: "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30",
        outline: "border border-vault-border bg-white/5 text-vault-text hover:bg-white/10 hover:text-white",
        secondary: "bg-white/10 text-vault-text hover:bg-white/15",
        ghost: "hover:bg-white/10 text-vault-muted hover:text-vault-text",
        link: "text-vault-accent underline-offset-4 hover:underline",
        glass: "bg-white/5 border border-white/10 text-vault-text hover:bg-white/10 backdrop-blur-md",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-2xl px-6 text-base",
        icon: "h-10 w-10 p-0 rounded-xl flex items-center justify-center",
        "icon-sm": "h-8 w-8 p-0 rounded-lg flex items-center justify-center",
        "icon-lg": "h-12 w-12 p-0 rounded-2xl flex items-center justify-center",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
