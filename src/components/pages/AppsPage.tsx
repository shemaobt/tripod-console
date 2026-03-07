import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { AppWindow, Plus, Pencil } from "lucide-react"
import { toast } from "sonner"
import { appsAPI } from "@/services/api"
import type { AppResponse } from "@/types"
import { card } from "@/styles"
import { cn } from "@/utils/cn"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { LoadingSpinner } from "@/components/common/LoadingSpinner"
import { EmptyState } from "@/components/common/EmptyState"
import { InfoTooltip } from "@/components/common/InfoTooltip"
import { FeatureSpotlight } from "@/components/common/FeatureSpotlight"

interface AppFormState {
  app_key: string
  name: string
  description: string
  platform: string
  icon_url: string
  app_url: string
  ios_url: string
  android_url: string
  is_active: boolean
}

const emptyForm: AppFormState = {
  app_key: "",
  name: "",
  description: "",
  platform: "web",
  icon_url: "",
  app_url: "",
  ios_url: "",
  android_url: "",
  is_active: true,
}

function formFromApp(app: AppResponse): AppFormState {
  return {
    app_key: app.app_key,
    name: app.name,
    description: app.description ?? "",
    platform: app.platform ?? "web",
    icon_url: app.icon_url ?? "",
    app_url: app.app_url ?? "",
    ios_url: app.ios_url ?? "",
    android_url: app.android_url ?? "",
    is_active: app.is_active,
  }
}

export default function AppsPage() {
  const navigate = useNavigate()
  const [apps, setApps] = useState<AppResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingApp, setEditingApp] = useState<AppResponse | null>(null)
  const [form, setForm] = useState<AppFormState>(emptyForm)

  async function fetchApps() {
    try {
      const { data } = await appsAPI.list()
      setApps(data)
    } catch {
      toast.error("Failed to load apps")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApps()
  }, [])

  function openCreateDialog() {
    setEditingApp(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  function openEditDialog(e: React.MouseEvent, app: AppResponse) {
    e.stopPropagation()
    setEditingApp(app)
    setForm(formFromApp(app))
    setDialogOpen(true)
  }

  async function handleSave() {
    if (!form.name.trim() || (!editingApp && !form.app_key.trim())) return
    setSaving(true)
    try {
      if (editingApp) {
        await appsAPI.update(editingApp.id, {
          name: form.name.trim(),
          description: form.description.trim() || null,
          platform: form.platform,
          icon_url: form.icon_url.trim() || null,
          app_url: form.app_url.trim() || null,
          ios_url: form.ios_url.trim() || null,
          android_url: form.android_url.trim() || null,
          is_active: form.is_active,
        })
        toast.success("App updated")
      } else {
        await appsAPI.create({
          app_key: form.app_key.trim(),
          name: form.name.trim(),
          description: form.description.trim() || null,
          platform: form.platform,
          icon_url: form.icon_url.trim() || null,
          app_url: form.app_url.trim() || null,
          ios_url: form.ios_url.trim() || null,
          android_url: form.android_url.trim() || null,
          is_active: form.is_active,
        })
        toast.success("App created")
      }
      setDialogOpen(false)
      await fetchApps()
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response
        ?.status
      if (status === 409) {
        toast.error("An app with this key already exists")
      } else {
        toast.error(
          editingApp ? "Failed to update app" : "Failed to create app",
        )
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-preto tracking-tight flex items-center">
          Manage Apps
          <InfoTooltip content="Apps are the software products users can access. Manage their metadata, platform, and status here." />
        </h1>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4" />
          New App
        </Button>
      </div>

      <FeatureSpotlight
        featureKey="apps-admin-first-visit"
        title="Apps Management"
        description="Register and configure the apps in your platform. Each app can have roles assigned to users for access control."
      >
        {apps.length === 0 ? (
          <EmptyState
            icon={AppWindow}
            title="No apps registered"
            description="Apps represent the software products in your platform. Register an app to start assigning user roles and managing access."
            actionLabel="Create App"
            onAction={openCreateDialog}
          />
        ) : (
          <div className={`${card.base} overflow-hidden`}>
            <table className="w-full">
              <thead>
                <tr className="bg-surface-alt">
                  <th className="px-4 py-3 text-left text-verde text-sm font-medium">
                    <span className="inline-flex items-center">
                      App Key
                      <InfoTooltip content="A unique identifier used to reference this app in roles and access control." />
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left text-verde text-sm font-medium">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-verde text-sm font-medium">
                    <span className="inline-flex items-center">
                      Platform
                      <InfoTooltip content="The platform this app targets: web, mobile (iOS/Android), or both." />
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left text-verde text-sm font-medium">
                    <span className="inline-flex items-center">
                      Active
                      <InfoTooltip content="Whether this app is currently active and available to users." />
                    </span>
                  </th>
                  <th className="px-4 py-3 text-right text-verde text-sm font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {apps.map((app) => (
                  <tr
                    key={app.id}
                    className="border-t border-areia/20 hover:bg-surface-alt/50 cursor-pointer"
                    onClick={() => navigate(`/app/apps/${app.id}`)}
                  >
                    <td className="px-4 py-3 text-sm text-preto font-mono">
                      {app.app_key}
                    </td>
                    <td className="px-4 py-3 text-sm text-preto font-medium">
                      {app.name}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Badge variant="default">
                        {app.platform ?? "web"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Badge variant={app.is_active ? "active" : "inactive"}>
                        {app.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => openEditDialog(e, app)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </FeatureSpotlight>

      <AppFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editingApp}
        form={form}
        setForm={setForm}
        saving={saving}
        onSave={handleSave}
      />
    </div>
  )
}

function AppFormDialog({
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
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit App" : "Create App"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
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
          <div className="space-y-2">
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
          <div className="space-y-2">
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
          <div className="space-y-2">
            <Label htmlFor="app-platform">
              <span className="inline-flex items-center">
                Platform
                <InfoTooltip content="The platform this app targets: web, mobile, or both." />
              </span>
            </Label>
            <Select
              value={form.platform}
              onValueChange={(v) => setForm((f) => ({ ...f, platform: v }))}
            >
              <SelectTrigger id="app-platform">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="web">Web</SelectItem>
                <SelectItem value="mobile">Mobile</SelectItem>
                <SelectItem value="both">Both</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="app-icon-url">Icon URL</Label>
            <Input
              id="app-icon-url"
              placeholder="https://..."
              value={form.icon_url}
              onChange={(e) =>
                setForm((f) => ({ ...f, icon_url: e.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
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
          <div className="space-y-2">
            <Label htmlFor="app-ios-url">iOS URL</Label>
            <Input
              id="app-ios-url"
              placeholder="https://apps.apple.com/..."
              value={form.ios_url}
              onChange={(e) =>
                setForm((f) => ({ ...f, ios_url: e.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="app-android-url">Android URL</Label>
            <Input
              id="app-android-url"
              placeholder="https://play.google.com/..."
              value={form.android_url}
              onChange={(e) =>
                setForm((f) => ({ ...f, android_url: e.target.value }))
              }
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              id="app-is-active"
              type="checkbox"
              checked={form.is_active}
              onChange={(e) =>
                setForm((f) => ({ ...f, is_active: e.target.checked }))
              }
              className="h-4 w-4 rounded border-areia text-telha focus:ring-telha"
            />
            <Label htmlFor="app-is-active">Active</Label>
          </div>
        </div>
        <DialogFooter>
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
