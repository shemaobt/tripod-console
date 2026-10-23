import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { PageHeader } from "@/components/common/PageHeader"

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
    <PageHeader
      eyebrow="Content"
      title="Languages"
      subtitle={
        languageCount === null
          ? "—"
          : `${languageCount} language${languageCount !== 1 ? "s" : ""}`
      }
      actions={
        <>
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
        </>
      }
    />
  )
}
