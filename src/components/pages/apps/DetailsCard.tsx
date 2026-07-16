import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ImageUpload } from "@/components/common/ImageUpload"
import { PlatformMultiSelect } from "@/components/common/PlatformMultiSelect"

export interface AppFormState {
  name: string
  description: string
  platforms: string[]
  icon_url: string
  app_url: string
  ios_url: string
  android_url: string
  is_active: boolean
  auto_approve: boolean
}

export function DetailsCard({
  form,
  setForm,
  saving,
  onSave,
}: {
  form: AppFormState
  setForm: React.Dispatch<React.SetStateAction<AppFormState>>
  saving: boolean
  onSave: () => void
}) {
  return (
    <div className="bg-elevated rounded-[18px] shadow-[var(--shadow-card)] p-[22px] flex flex-col gap-[18px]">
      <h4 className="text-[15.5px] font-semibold text-fg-strong">Details</h4>

      <div className="space-y-1.5">
        <Label>App icon</Label>
        <ImageUpload
          value={form.icon_url || null}
          onChange={(url) => setForm((f) => ({ ...f, icon_url: url ?? "" }))}
          folder="app-icons"
          shape="square"
          size="md"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="f_ap_name">Name</Label>
        <Input
          id="f_ap_name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="f_ap_desc">Description</Label>
        <Textarea
          id="f_ap_desc"
          rows={2}
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <Label>
          Platforms <span className="font-normal text-fg-subtle">(minimum 1)</span>
        </Label>
        <PlatformMultiSelect
          value={form.platforms}
          onChange={(platforms) => setForm((f) => ({ ...f, platforms }))}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="f_ap_url">App URL (Web)</Label>
        <Input
          id="f_ap_url"
          placeholder="https://..."
          value={form.app_url}
          onChange={(e) => setForm((f) => ({ ...f, app_url: e.target.value }))}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="f_ap_ios">iOS URL</Label>
          <Input
            id="f_ap_ios"
            placeholder="apps.apple.com/..."
            value={form.ios_url}
            onChange={(e) => setForm((f) => ({ ...f, ios_url: e.target.value }))}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="f_ap_android">Android URL</Label>
          <Input
            id="f_ap_android"
            placeholder="play.google.com/..."
            value={form.android_url}
            onChange={(e) => setForm((f) => ({ ...f, android_url: e.target.value }))}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={onSave} disabled={saving || !form.name.trim()}>
          {saving ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </div>
  )
}
