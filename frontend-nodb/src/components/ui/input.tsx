import * as React from "react"
import { cn } from "../../lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-vault-text ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-vault-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-vault-accent focus-visible:border-vault-accent disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
