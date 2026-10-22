import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"

interface LanguagesHeaderProps {
  languageCount: number | null
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
    <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-1">
        <span className="text-[0.8125rem] font-semibold tracking-[0.14em] uppercase text-fg-muted">Content</span>
        <h3 className="text-[1.5625rem] font-bold text-fg-strong tracking-tight">Languages</h3>
        <span className="text-[0.78125rem] text-fg-subtle">
          {languageCount === null
            ? "—"
            : `${languageCount} language${languageCount !== 1 ? "s" : ""}`}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-[1.125rem]">
        {isPlatformAdmin && (
          <div className="flex items-center gap-[0.5625rem]">
            <Switch id="languages-include-inactive" checked={showInactive} onCheckedChange={onShowInactiveChange} />
            <label
              htmlFor="languages-include-inactive"
              className="text-[0.8125rem] text-fg-muted cursor-pointer select-none py-2"
            >
              Include inactive
            </label>
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
