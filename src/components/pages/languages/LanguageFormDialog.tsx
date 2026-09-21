import type { LanguageResponse } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { InfoTooltip } from "@/components/common/InfoTooltip"

export interface LanguageFormState {
  name: string
  code: string
  description: string
}

interface LanguageFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editing: LanguageResponse | null
  isPlatformAdmin: boolean
  form: LanguageFormState
  setForm: React.Dispatch<React.SetStateAction<LanguageFormState>>
  saving: boolean
  onSave: () => void
}

export function LanguageFormDialog({
  open,
  onOpenChange,
  editing,
  isPlatformAdmin,
  form,
  setForm,
  saving,
  onSave,
}: LanguageFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editing
              ? isPlatformAdmin
                ? "Edit Language"
                : "Request Language Edit"
              : isPlatformAdmin
                ? "Create Language"
                : "Request New Language"}
          </DialogTitle>
          <DialogDescription>
            {isPlatformAdmin
              ? editing
                ? "Update the language name or code."
                : "Add a new target language for your translation projects."
              : "Your request will be sent to a platform admin to review before it is applied."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5 pt-1">
          <div className="space-y-1.5">
            <Label htmlFor="lang-name">Name</Label>
            <Input
              id="lang-name"
              placeholder="e.g. English"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lang-code">
              <span className="inline-flex items-center">
                Code
                <InfoTooltip content="Exactly 3 characters, ISO 639-3." />
              </span>
            </Label>
            <Input
              id="lang-code"
              placeholder="e.g. eng"
              maxLength={3}
              value={form.code}
              onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value }))}
            />
            <p className="text-xs text-fg-subtle mt-1.5">
              Must be exactly 3 characters (ISO 639-3)
            </p>
          </div>
          {!isPlatformAdmin && !editing && (
            <div className="space-y-1.5">
              <Label htmlFor="lang-description">
                Description <span className="font-normal text-fg-subtle">(optional)</span>
              </Label>
              <Textarea
                id="lang-description"
                placeholder="Where it is spoken, communities, dialects…"
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                rows={2}
              />
            </div>
          )}
        </div>
        <DialogFooter className="border-t border-line pt-4 mt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={onSave}
            disabled={saving || !form.name.trim() || form.code.trim().length !== 3}
          >
            {saving
              ? !isPlatformAdmin
                ? "Submitting..."
                : editing
                  ? "Saving..."
                  : "Creating..."
              : !isPlatformAdmin
                ? "Submit Request"
                : editing
                  ? "Save Changes"
                  : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
