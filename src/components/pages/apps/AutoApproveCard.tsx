import { Switch } from "@/components/ui/switch"
import type { AppFormState } from "./DetailsCard"

export function AutoApproveCard({
  form,
  setForm,
}: {
  form: AppFormState
  setForm: React.Dispatch<React.SetStateAction<AppFormState>>
}) {
  return (
    <div className="bg-elevated rounded-[1.125rem] shadow-[var(--shadow-card)] p-[1.375rem] flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold text-fg-strong">Auto-approve requests</span>
          <span className="text-[0.71875rem] text-fg-subtle leading-relaxed">
            Turning on approves all pending requests retroactively and grants the default role — one transaction with the toggle. Turning off undoes nothing.
          </span>
        </div>
        <Switch
          checked={form.auto_approve}
          onCheckedChange={(checked) => setForm((f) => ({ ...f, auto_approve: checked }))}
          className="shrink-0"
        />
      </div>
      <div className="flex items-center justify-between border-t border-line pt-3">
        <span className="text-[0.78125rem] text-fg-muted">
          {form.auto_approve
            ? "New access requests are approved automatically."
            : "New access requests require manual review."}
        </span>
      </div>
    </div>
  )
}
