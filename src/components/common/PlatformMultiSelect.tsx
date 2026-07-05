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
              "px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-200 active:scale-[0.98]",
              active
                ? "bg-telha text-white border-telha"
                : "bg-surface text-preto border-areia hover:bg-branco",
            )}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
