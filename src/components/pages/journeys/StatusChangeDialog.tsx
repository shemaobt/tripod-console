import { useState } from "react"
import { ArrowRight } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { PhaseStatus } from "@/types"
import {
  JOURNEY_STATUS_CONFIG,
  NOTE_REQUIRED_STATUSES,
  STATUS_PROMPTS,
} from "@/constants/journeyStatus"

interface StatusChangeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  phaseName: string
  stepLabel: string
  from: PhaseStatus
  to: PhaseStatus
  onSave: (note: string) => void
}

export function StatusChangeDialog({
  open,
  onOpenChange,
  phaseName,
  stepLabel,
  from,
  to,
  onSave,
}: StatusChangeDialogProps) {
  const [note, setNote] = useState("")

  const fromConfig = JOURNEY_STATUS_CONFIG[from]
  const toConfig = JOURNEY_STATUS_CONFIG[to]
  const ToIcon = toConfig.icon
  const required = NOTE_REQUIRED_STATUSES.includes(to)
  const valid = !required || note.trim().length > 0
  const [prompt, placeholder] = STATUS_PROMPTS[to]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-label="Record status change" className="max-w-[30.625rem] gap-[0.9375rem]">
        <div className="flex flex-col gap-1">
          <div className="text-[0.625rem] font-bold uppercase tracking-[0.08em] text-fg-muted">
            Status change
          </div>
          <div className="flex items-baseline gap-2">
            <DialogTitle className="text-[1.0625rem] font-bold leading-[1.3] text-fg-strong">
              {phaseName}
            </DialogTitle>
            <span className="font-mono text-[0.65625rem] tracking-[0.1em] text-fg-subtle">
              {stepLabel}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2.5 rounded-[0.75rem] bg-muted px-3.5 py-2.5">
          <span className="flex items-center gap-[0.4375rem] text-[0.75rem] font-semibold text-fg-muted">
            <span
              className="h-[0.5625rem] w-[0.5625rem] rounded-full"
              style={{ background: fromConfig.solid }}
            />
            {fromConfig.label}
          </span>
          <ArrowRight className="h-[0.8125rem] w-[0.8125rem] flex-none text-fg-subtle" strokeWidth={2.2} />
          <span
            className="inline-flex items-center gap-[0.4375rem] rounded-full px-[0.6875rem] py-1 text-[0.75rem] font-bold"
            style={{ background: toConfig.soft, color: toConfig.text }}
          >
            <ToIcon className="h-3 w-3" strokeWidth={2.2} />
            {toConfig.label}
          </span>
        </div>
        <div>
          <label
            htmlFor="st_note"
            className="mb-[0.4375rem] block text-[0.78125rem] font-semibold text-fg-strong"
          >
            {prompt}
          </label>
          <textarea
            id="st_note"
            autoFocus
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={placeholder}
            className="min-h-[6.5rem] w-full resize-y rounded-[0.75rem] border border-line-strong bg-elevated px-[0.8125rem] py-[0.6875rem] text-[0.8125rem] leading-[1.6] text-fg placeholder:text-fg-subtle focus:border-accent focus:outline-none"
          />
          <div
            className={required ? "mt-1.5 text-[0.71875rem]" : "mt-1.5 text-[0.71875rem] text-fg-subtle"}
            style={required ? { color: "#8A6209" } : undefined}
          >
            {required
              ? "A note is required for this status."
              : "Optional — but it is what the team reads later."}
          </div>
        </div>
        <DialogFooter className="mt-2 border-t border-line pt-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={!valid} className="disabled:opacity-40" onClick={() => onSave(note)}>
            Save change
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
