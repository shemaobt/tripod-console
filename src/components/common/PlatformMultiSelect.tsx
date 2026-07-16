import { Check } from "lucide-react"
import { cn } from "@/utils/cn"
import { PLATFORM_OPTIONS } from "@/constants/platforms"

interface PlatformMultiSelectProps {
  value: string[]
  onChange: (platforms: string[]) => void
  id?: string
}

export function PlatformMultiSelect({ value, onChange, id }: PlatformMultiSelectProps) {
  function toggle(platform: string) {
    onChange(
      value.includes(platform)
        ? value.filter((p) => p !== platform)
        : [...value, platform],
    )
  }

  return (
    <div id={id} className="flex flex-wrap gap-2">
      {PLATFORM_OPTIONS.map((opt) => {
        const active = value.includes(opt.value)
        return (
          <button
            key={opt.value}
            type="button"
            role="checkbox"
            aria-checked={active}
            onClick={() => toggle(opt.value)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border-[1.5px] px-4 py-2 text-[13px] font-semibold text-fg-strong transition-colors active:scale-[0.98]",
              active
                ? "border-accent bg-accent-soft"
                : "border-input-border hover:bg-muted",
            )}
          >
            <span
              className={cn(
                "grid h-[14px] w-[14px] place-items-center rounded-[4px] border-[1.5px]",
                active ? "border-accent" : "border-input-border",
              )}
            >
              <Check
                className={cn("h-2.5 w-2.5 text-accent", active ? "opacity-100" : "opacity-0")}
                strokeWidth={3.4}
              />
            </span>
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
