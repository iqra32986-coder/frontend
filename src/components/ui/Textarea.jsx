import * as React from "react"
import { cn } from "@/lib/utils"

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-2xl border border-input bg-transparent px-5 py-4 text-sm text-foreground shadow-sm placeholder:text-muted-foreground/50 transition-all outline-none disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:border-primary/40 focus-visible:ring-4 focus-visible:ring-primary/10",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
