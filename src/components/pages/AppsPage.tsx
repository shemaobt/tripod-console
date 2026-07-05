import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { AppWindow, Plus, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { appsAPI } from "@/services/api"
import type { AppResponse } from "@/types"
import { cn } from "@/utils/cn"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { LoadingSpinner } from "@/components/common/LoadingSpinner"
import { EmptyState } from "@/components/common/EmptyState"
import { InfoTooltip } from "@/components/common/InfoTooltip"
import { FeatureSpotlight } from "@/components/common/FeatureSpotlight"
import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { ImageUpload } from "@/components/common/ImageUpload"
import { PlatformMultiSelect } from "@/components/common/PlatformMultiSelect"
import { Switch } from "@/components/ui/switch"
import { platformLabel } from "@/constants/platforms"

interface AppFormState {
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

const emptyForm: AppFormState = {
  app_key: "",
  name: "",
  description: "",
  platforms: ["web"],
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
    platforms: app.platforms,
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
  const [deletingApp, setDeletingApp] = useState<AppResponse | null>(null)

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
    if (form.platforms.length === 0) {
      toast.error("Select at least one platform")
      return
    }
    setSaving(true)
    try {
      if (editingApp) {
        await appsAPI.update(editingApp.id, {
          name: form.name.trim(),
          description: form.description.trim() || null,
          platforms: form.platforms,
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
          platforms: form.platforms,
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

  async function handleDelete() {
    if (!deletingApp) return
    try {
      await appsAPI.delete(deletingApp.id)
      toast.success("App deleted")
      setDeletingApp(null)
      await fetchApps()
    } catch {
      toast.error("Failed to delete app")
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="p-6 md:p-8 lg:p-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-preto tracking-tight flex items-center">
            Manage Apps
            <InfoTooltip content="Apps are the software products users can access. Manage their metadata, platform, and status here." />
          </h1>
          <p className="text-sm text-verde/60 mt-1">
            {apps.length} app{apps.length !== 1 ? "s" : ""} registered
          </p>
        </div>
        <Button onClick={openCreateDialog} className="rounded-xl">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {apps.map((app) => (
              <div
                key={app.id}
                className={cn(
                  "group relative rounded-2xl border bg-surface p-5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer",
                  app.is_active ? "border-areia/20 hover:border-telha/30" : "border-areia/10 opacity-70"
                )}
                onClick={() => navigate(`/app/apps/${app.id}`)}
              >
                <div className="flex items-start gap-3.5 mb-3">
                  {app.icon_url ? (
                    <img
                      src={app.icon_url}
                      alt={`${app.name} icon`}
                      className="w-11 h-11 rounded-xl object-cover shrink-0 ring-1 ring-areia/10"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-azul/15 to-azul/5 shrink-0">
                      <AppWindow className="h-5 w-5 text-azul" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-preto truncate">{app.name}</p>
                    <p className="text-xs text-verde/50 font-mono mt-0.5 truncate">{app.app_key}</p>
                  </div>
                </div>
                {app.description && (
                  <p className="text-xs text-verde/60 line-clamp-2 mb-3">{app.description}</p>
                )}
                <div className="flex flex-wrap items-center gap-2">
                  {app.platforms.map((platform) => (
                    <Badge key={platform} variant="default">{platformLabel(platform)}</Badge>
                  ))}
                  <Badge variant={app.is_active ? "active" : "inactive"}>
                    {app.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                {/* Hover actions */}
                <div className="absolute top-3 right-3 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={(e) => openEditDialog(e, app)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={(e) => { e.stopPropagation(); setDeletingApp(app) }}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
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

      <ConfirmDialog
        open={!!deletingApp}
        onOpenChange={(open) => { if (!open) setDeletingApp(null) }}
        title="Delete App"
        description={`Are you sure you want to delete "${deletingApp?.name}"? This will permanently remove the app and all associated roles and access. This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
      />
    </div>
  )
}

function FormSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <p className="text-xs font-medium text-verde/60 tracking-wider uppercase">{label}</p>
      {children}
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

          <div className="border-t border-areia/10" />

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

          <div className="border-t border-areia/10" />

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

          <div className="border-t border-areia/10" />

          <div className="flex items-center justify-between rounded-xl bg-surface-alt/40 px-4 py-3">
            <div>
              <Label htmlFor="app-is-active" className="mb-0">Active</Label>
              <p className="text-xs text-verde/50 mt-0.5">Users can access this app when active</p>
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
        <DialogFooter className="border-t border-areia/10 pt-4 mt-2">
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
