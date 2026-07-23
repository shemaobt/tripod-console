import * as React from "react"
import { cn } from "@/utils/cn"

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[5rem] w-full resize-y rounded-[0.625rem] border-[0.09375rem] border-input-border bg-transparent px-3 py-2.5 text-sm text-fg-strong placeholder:text-fg-subtle focus:outline-none focus:border-accent disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
