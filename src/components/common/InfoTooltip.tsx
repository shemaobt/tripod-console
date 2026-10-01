import { Info } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface InfoTooltipProps {
  content: string
  side?: "top" | "bottom" | "left" | "right"
}

export function InfoTooltip({ content, side = "top" }: InfoTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="ml-1 inline-flex items-center text-fg-subtle hover:text-fg-muted transition-colors"
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
