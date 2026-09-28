import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"

interface LanguagesHeaderProps {
  languageCount: number
  isPlatformAdmin: boolean
  showInactive: boolean
  onShowInactiveChange: (value: boolean) => void
  onCreate: () => void
}

export function LanguagesHeader({
  languageCount,
  isPlatformAdmin,
  showInactive,
  onShowInactiveChange,
  onCreate,
}: LanguagesHeaderProps) {
  return (
    <div className="flex items-end justify-between gap-4 mb-5">
      <div className="flex flex-col gap-1">
        <span className="text-[0.8125rem] font-semibold tracking-[0.14em] uppercase text-fg-muted">Content</span>
        <h3 className="text-[1.5625rem] font-bold text-fg-strong tracking-tight">Languages</h3>
        <span className="text-[0.78125rem] text-fg-subtle">
          {languageCount} language{languageCount !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="flex items-center gap-[1.125rem]">
        {isPlatformAdmin && (
          <div className="flex items-center gap-[0.5625rem]">
            <Switch checked={showInactive} onCheckedChange={onShowInactiveChange} aria-label="Include inactive" />
            <span
              className="text-[0.8125rem] text-fg-muted cursor-pointer select-none"
              onClick={() => onShowInactiveChange(!showInactive)}
            >
              Include inactive
            </span>
          </div>
        )}
        <Button onClick={onCreate}>
          <Plus className="w-4 h-4" />
          {isPlatformAdmin ? "New language" : "Request language"}
        </Button>
      </div>
    </div>
  )
}
