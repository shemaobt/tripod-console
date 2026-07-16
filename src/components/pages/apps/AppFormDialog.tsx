import type { AppResponse } from "@/types"
import { cn } from "@/utils/cn"
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
import { ImageUpload } from "@/components/common/ImageUpload"
import { PlatformMultiSelect } from "@/components/common/PlatformMultiSelect"
import { Switch } from "@/components/ui/switch"

export interface AppFormState {
  app_key: string
  name: string
  description: string
  platforms: string[]
  icon_url: string
  app_url: string
  ios_url: string
  android_url: string
  is_active: boolean
}

function FormSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <p className="text-[11px] font-semibold text-fg-subtle tracking-[0.1em] uppercase">{label}</p>
      {children}
    </div>
  )
}

export function AppFormDialog({
  open,
  onOpenChange,
  editing,
  form,
  setForm,
  saving,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  editing: AppResponse | null
  form: AppFormState
  setForm: React.Dispatch<React.SetStateAction<AppFormState>>
  saving: boolean
  onSave: () => void
}) {
  const isValid = form.name.trim() && (editing || form.app_key.trim())

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit App" : "Create App"}</DialogTitle>
          <DialogDescription>
            {editing
              ? "Update this app's configuration and metadata."
              : "Register a new app in the platform to manage access and roles."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 pt-1">
          <FormSection label="Identity">
            <div className="space-y-1.5">
              <Label htmlFor="app-key">
                <span className="inline-flex items-center">
                  App Key
                  <InfoTooltip content="A unique identifier for this app. Cannot be changed after creation." />
                </span>
              </Label>
              <Input
                id="app-key"
                placeholder="e.g. meaning-map-generator"
                value={form.app_key}
                onChange={(e) =>
                  setForm((f) => ({ ...f, app_key: e.target.value }))
                }
                disabled={!!editing}
                className={cn(editing && "opacity-60")}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="app-name">Name</Label>
              <Input
                id="app-name"
                placeholder="e.g. Meaning Map Generator"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="app-description">Description</Label>
              <Textarea
                id="app-description"
                placeholder="Brief description of the app"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                rows={2}
              />
            </div>
          </FormSection>

          <div className="border-t border-line" />

          <FormSection label="Platform & Icon">
            <div className="space-y-1.5">
              <Label htmlFor="app-platform">
                <span className="inline-flex items-center">
                  Platforms
                  <InfoTooltip content="The platforms this app targets. Select one or more (Web, Android, iOS)." />
                </span>
              </Label>
              <PlatformMultiSelect
                id="app-platform"
                value={form.platforms}
                onChange={(platforms) => setForm((f) => ({ ...f, platforms }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>App Icon</Label>
              <ImageUpload
                value={form.icon_url || null}
                onChange={(url) => setForm((f) => ({ ...f, icon_url: url ?? "" }))}
                folder="app-icons"
                shape="square"
                size="md"
              />
            </div>
          </FormSection>

          <div className="border-t border-line" />

          <FormSection label="Links">
            <div className="space-y-1.5">
              <Label htmlFor="app-app-url">App URL (Web)</Label>
              <Input
                id="app-app-url"
                placeholder="https://..."
                value={form.app_url}
                onChange={(e) =>
                  setForm((f) => ({ ...f, app_url: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="app-ios-url">iOS URL</Label>
                <Input
                  id="app-ios-url"
                  placeholder="apps.apple.com/..."
                  value={form.ios_url}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, ios_url: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="app-android-url">Android URL</Label>
                <Input
                  id="app-android-url"
                  placeholder="play.google.com/..."
                  value={form.android_url}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, android_url: e.target.value }))
                  }
                />
              </div>
            </div>
          </FormSection>

          <div className="border-t border-line" />

          <div className="flex items-center justify-between rounded-[14px] bg-muted px-4 py-3">
            <div>
              <Label htmlFor="app-is-active" className="mb-0">Active</Label>
              <p className="text-xs text-fg-subtle mt-0.5">Users can access this app when active</p>
            </div>
            <Switch
              id="app-is-active"
              checked={form.is_active}
              onCheckedChange={(checked) =>
                setForm((f) => ({ ...f, is_active: checked }))
              }
            />
          </div>
        </div>
        <DialogFooter className="border-t border-line pt-4 mt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button onClick={onSave} disabled={saving || !isValid}>
            {saving
              ? editing
                ? "Saving..."
                : "Creating..."
              : editing
                ? "Save"
                : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
