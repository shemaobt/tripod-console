import { Button } from "@/components/ui/button"

export function DangerZoneCard({ onDelete }: { onDelete: () => void }) {
  return (
    <div className="bg-elevated rounded-[18px] shadow-[var(--shadow-card)] p-[22px] flex flex-col gap-2.5">
      <span className="text-[13px] font-semibold text-on-accent-soft">Danger zone</span>
      <span className="text-xs text-fg-subtle leading-relaxed">
        Deleting removes the app and all associated roles and access.
      </span>
      <Button
        variant="default"
        size="sm"
        className="self-start"
        onClick={onDelete}
      >
        Delete app…
      </Button>
    </div>
  )
}
