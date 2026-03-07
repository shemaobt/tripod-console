import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router"
import {
  ArrowLeft,
  AppWindow,
  ExternalLink,
  KeyRound,
  Pencil,
} from "lucide-react"
import { toast } from "sonner"
import { appsAPI } from "@/services/api"
import type { AppResponse, AppRoleResponse } from "@/types"
import { card } from "@/styles"
import { cn } from "@/utils/cn"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function AppInfoCard({
  app,
  onEdit,
}: {
  app: AppResponse
  onEdit: () => void
}) {
  return (
    <div className={`${card.base} p-6`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {app.icon_url ? (
            <img
              src={app.icon_url}
              alt={`${app.name} icon`}
              className="h-10 w-10 rounded-lg object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded-lg bg-azul/20 flex items-center justify-center">
              <AppWindow className="h-5 w-5 text-azul" />
            </div>
          )}
          <div>
            <h2 className="text-lg font-semibold text-preto">{app.name}</h2>
            <p className="text-sm text-verde font-mono">{app.app_key}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onEdit}>
          <Pencil className="h-4 w-4" />
        </Button>
      </div>

      {app.description && (
        <p className="text-sm text-verde mb-4">{app.description}</p>
      )}

      <div className="flex flex-wrap gap-3 mb-4">
        <Badge variant="default">{app.platform ?? "web"}</Badge>
        <Badge variant={app.is_active ? "active" : "inactive"}>
          {app.is_active ? "Active" : "Inactive"}
        </Badge>
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-verde">
        {app.app_url && (
          <a
            href={app.app_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 hover:text-telha transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Web App
          </a>
        )}
        {app.ios_url && (
          <a
            href={app.ios_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 hover:text-telha transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            iOS
          </a>
        )}
        {app.android_url && (
          <a
            href={app.android_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 hover:text-telha transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Android
          </a>
        )}
      </div>

      <div className="mt-3 text-sm text-verde">
        Created {formatDate(app.created_at)}
      </div>
    </div>
  )
}

function AppRolesTable({
  roles,
  loading,
}: {
  roles: AppRoleResponse[]
  loading: boolean
}) {
  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-preto tracking-tight flex items-center">
        Roles
        <InfoTooltip content="Roles define permission levels within this app. System roles are built-in and cannot be removed." />
      </h3>

      {roles.length === 0 ? (
        <EmptyState
          icon={KeyRound}
          title="No roles defined"
          description="This app has no roles configured yet. Roles are typically created via the backend and define permission levels for users."
        />
      ) : (
        <div className={`${card.base} overflow-hidden`}>
          <table className="w-full">
            <thead>
              <tr className="bg-surface-alt">
                <th className="px-4 py-3 text-left text-verde text-sm font-medium">
                  Role Key
                </th>
                <th className="px-4 py-3 text-left text-verde text-sm font-medium">
                  Label
                </th>
                <th className="px-4 py-3 text-left text-verde text-sm font-medium">
                  Description
                </th>
                <th className="px-4 py-3 text-left text-verde text-sm font-medium">
                  <span className="inline-flex items-center">
                    System
                    <InfoTooltip content="System roles are built-in and managed by the platform. They cannot be deleted." />
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr
                  key={role.id}
                  className="border-t border-areia/20 hover:bg-surface-alt/50"
                >
                  <td className="px-4 py-3 text-sm text-preto font-mono">
                    {role.role_key}
                  </td>
                  <td className="px-4 py-3 text-sm text-preto">
                    {role.label}
                  </td>
                  <td className="px-4 py-3 text-sm text-verde">
                    {role.description || "\u2014"}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {role.is_system ? (
                      <Badge variant="default">System</Badge>
                    ) : (
                      <span className="text-verde">\u2014</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

interface AppFormState {
  name: string
  description: string
  platform: string
  icon_url: string
  app_url: string
  ios_url: string
  android_url: string
  is_active: boolean
}

function formFromApp(app: AppResponse): AppFormState {
  return {
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

export default function AppDetailPage() {
  const { appId } = useParams<{ appId: string }>()
  const navigate = useNavigate()

  const [app, setApp] = useState<AppResponse | null>(null)
  const [appLoading, setAppLoading] = useState(true)
  const [roles, setRoles] = useState<AppRoleResponse[]>([])
  const [rolesLoading, setRolesLoading] = useState(true)

  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [form, setForm] = useState<AppFormState>({
    name: "",
    description: "",
    platform: "web",
    icon_url: "",
    app_url: "",
    ios_url: "",
    android_url: "",
    is_active: true,
  })
  const [saving, setSaving] = useState(false)

  async function fetchApp() {
    if (!appId) return
    try {
      const { data } = await appsAPI.get(appId)
      setApp(data)
    } catch {
      toast.error("Failed to load app")
    } finally {
      setAppLoading(false)
    }
  }

  async function fetchRoles() {
    if (!appId) return
    try {
      const { data } = await appsAPI.listRoles(appId)
      setRoles(data)
    } catch {
      toast.error("Failed to load roles")
    } finally {
      setRolesLoading(false)
    }
  }

  useEffect(() => {
    fetchApp()
    fetchRoles()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appId])

  function openEditDialog() {
    if (!app) return
    setForm(formFromApp(app))
    setEditDialogOpen(true)
  }

  async function handleSave() {
    if (!appId || !form.name.trim()) return
    setSaving(true)
    try {
      const { data } = await appsAPI.update(appId, {
        name: form.name.trim(),
        description: form.description.trim() || null,
        platform: form.platform,
        icon_url: form.icon_url.trim() || null,
        app_url: form.app_url.trim() || null,
        ios_url: form.ios_url.trim() || null,
        android_url: form.android_url.trim() || null,
        is_active: form.is_active,
      })
      setApp(data)
      toast.success("App updated")
      setEditDialogOpen(false)
    } catch {
      toast.error("Failed to update app")
    } finally {
      setSaving(false)
    }
  }

  if (appLoading) {
    return <LoadingSpinner />
  }

  if (!app) {
    return (
      <div className="p-6 md:p-8">
        <p className="text-verde">App not found.</p>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <button
          onClick={() => navigate("/app/apps")}
          className="inline-flex items-center gap-1 text-sm text-verde hover:text-preto transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Apps
        </button>
        <h1 className="text-2xl font-semibold text-preto tracking-tight flex items-center">
          {app.name}
          <InfoTooltip content="View app details, metadata, and the roles defined for this app." />
        </h1>
      </div>

      <AppInfoCard app={app} onEdit={openEditDialog} />

      <AppRolesTable roles={roles} loading={rolesLoading} />

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit App</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-app-key">
                <span className="inline-flex items-center">
                  App Key
                  <InfoTooltip content="The app key cannot be changed after creation." />
                </span>
              </Label>
              <Input
                id="edit-app-key"
                value={app.app_key}
                disabled
                className={cn("opacity-60")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-platform">
                <span className="inline-flex items-center">
                  Platform
                  <InfoTooltip content="The platform this app targets: web, mobile, or both." />
                </span>
              </Label>
              <Select
                value={form.platform}
                onValueChange={(v) => setForm((f) => ({ ...f, platform: v }))}
              >
                <SelectTrigger id="edit-platform">
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
              <Label htmlFor="edit-icon-url">Icon URL</Label>
              <Input
                id="edit-icon-url"
                placeholder="https://..."
                value={form.icon_url}
                onChange={(e) =>
                  setForm((f) => ({ ...f, icon_url: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-app-url">App URL (Web)</Label>
              <Input
                id="edit-app-url"
                placeholder="https://..."
                value={form.app_url}
                onChange={(e) =>
                  setForm((f) => ({ ...f, app_url: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-ios-url">iOS URL</Label>
              <Input
                id="edit-ios-url"
                placeholder="https://apps.apple.com/..."
                value={form.ios_url}
                onChange={(e) =>
                  setForm((f) => ({ ...f, ios_url: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-android-url">Android URL</Label>
              <Input
                id="edit-android-url"
                placeholder="https://play.google.com/..."
                value={form.android_url}
                onChange={(e) =>
                  setForm((f) => ({ ...f, android_url: e.target.value }))
                }
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                id="edit-is-active"
                type="checkbox"
                checked={form.is_active}
                onChange={(e) =>
                  setForm((f) => ({ ...f, is_active: e.target.checked }))
                }
                className="h-4 w-4 rounded border-areia text-telha focus:ring-telha"
              />
              <Label htmlFor="edit-is-active">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !form.name.trim()}
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
