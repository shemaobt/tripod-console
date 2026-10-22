import { useRef, useState } from "react"
import { Info } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { touch } from "@/styles"
import { cn } from "@/utils/cn"

interface InfoTooltipProps {
  content: string
  side?: "top" | "bottom" | "left" | "right"
}

/**
 * Radix opens a tooltip on hover and on any focus, and never on a tap. Two consequences here:
 * a dialog opened by mouse or tap hands its first focus to the (i), whose tooltip then covered
 * the dialog title; and on a phone the explanation could not be reached at all. Focus opens it
 * only when the focus came from the keyboard, and a tap toggles it.
 */
export function InfoTooltip({ content, side = "top" }: InfoTooltipProps) {
  const [open, setOpen] = useState(false)
  const ignoreOpen = useRef(false)
  const ignoreClose = useRef(false)
  const lastPointer = useRef<string | null>(null)

  const forThisEvent = (flag: { current: boolean }) => {
    flag.current = true
    queueMicrotask(() => {
      flag.current = false
    })
  }

  return (
    <TooltipProvider>
      <Tooltip
        open={open}
        onOpenChange={(next) => {
          if (next ? ignoreOpen.current : ignoreClose.current) return
          setOpen(next)
        }}
      >
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label="More information"
            onFocus={(e) => {
              if (!e.currentTarget.matches(":focus-visible")) forThisEvent(ignoreOpen)
            }}
            onPointerDown={(e) => {
              lastPointer.current = e.pointerType
            }}
            onClick={() => {
              if (lastPointer.current !== "touch") return
              setOpen((o) => !o)
              forThisEvent(ignoreClose)
            }}
            className={cn(touch.target, "ml-1 inline-flex items-center text-fg-subtle hover:text-fg-muted transition-colors")}
          >
            <Info className="h-3.5 w-3.5" strokeWidth={1.75} />
          </button>
        </TooltipTrigger>
        <TooltipContent side={side}>
          <p className="max-w-xs">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
