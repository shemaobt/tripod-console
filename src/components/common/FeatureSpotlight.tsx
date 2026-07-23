import type { ReactNode } from "react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { useOnboardingStore } from "@/stores/onboardingStore"

interface FeatureSpotlightProps {
  featureKey: string
  title: string
  description: string
  side?: "top" | "bottom" | "left" | "right"
  children: ReactNode
}

export function FeatureSpotlight({
  featureKey,
  title,
  description,
  side = "bottom",
  children,
}: FeatureSpotlightProps) {
  const isDismissed = useOnboardingStore((s) => s.isDismissed(featureKey))
  const dismiss = useOnboardingStore((s) => s.dismiss)

  if (isDismissed) {
    return <>{children}</>
  }

  return (
    <Popover open>
      <PopoverTrigger asChild>
        <div className="relative inline-block ring-2 ring-accent/30 animate-pulse rounded-full">
          {children}
        </div>
      </PopoverTrigger>
      <PopoverContent side={side} className="w-[16.875rem] bg-inverse text-on-dark">
        <div className="flex flex-col gap-2">
          <h4 className="text-[0.8125rem] font-semibold text-on-dark">{title}</h4>
          <p className="text-xs text-on-dark/80 leading-relaxed">{description}</p>
          <Button
            size="sm"
            className="self-start"
            onClick={() => dismiss(featureKey)}
          >
            Got it
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
