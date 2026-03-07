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
        <div className="relative inline-block ring-2 ring-telha/30 animate-pulse rounded-lg">
          {children}
        </div>
      </PopoverTrigger>
      <PopoverContent side={side} className="w-72">
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-preto">{title}</h4>
          <p className="text-sm text-verde">{description}</p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => dismiss(featureKey)}
          >
            Got it
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
