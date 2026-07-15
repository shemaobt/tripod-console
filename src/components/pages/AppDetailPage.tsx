import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router"
import {
  ArrowLeft,
  AppWindow,
  ExternalLink,
  KeyRound,
  Pencil,
  Plus,
  Trash2,
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
import { ImageUpload } from "@/components/common/ImageUpload"
import { PlatformMultiSelect } from "@/components/common/PlatformMultiSelect"
import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { platformLabel } from "@/constants/platforms"
import { Switch } from "@/components/ui/switch"

import { formatDate } from "@/utils/format"

function AppInfoCard({
  app,
  onEdit,
}: {
  app: AppResponse
  onEdit: () => void
}) {
  return (
    <div className={`${card.base} p-4 sm:p-6`}>
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
        {app.platforms.map((platform) => (
          <Badge key={platform} variant="default">{platformLabel(platform)}</Badge>
        ))}
        <Badge variant={app.is_active ? "active" : "inactive"}>
          {app.is_active ? "Active" : "Inactive"}
        </Badge>
        <Badge variant={app.auto_approve ? "active" : "inactive"}>
          {app.auto_approve ? "Auto-approve: on" : "Auto-approve: off"}
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
  onAddRole,
  onDeleteRole,
}: {
  roles: AppRoleResponse[]
  loading: boolean
  onAddRole: () => void
  onDeleteRole: (role: AppRoleResponse) => void
}) {
  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-preto tracking-tight flex items-center">
          Roles
          <InfoTooltip content="Roles define permission levels within this app. System roles are built-in and cannot be removed." />
        </h3>
        <Button size="sm" onClick={onAddRole}>
          <Plus className="h-4 w-4" />
          Add Role
        </Button>
      </div>

      {roles.length === 0 ? (
        <EmptyState
          icon={KeyRound}
          title="No roles defined"
          description="This app has no roles configured yet. Add a role to define permission levels for users."
          actionLabel="Add Role"
          onAction={onAddRole}
        />
      ) : (
        <div className={`${card.base} overflow-hidden`}>
          <table className="w-full">
            <thead>
              <tr className="bg-surface-alt/40">
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-verde/70 text-xs font-medium tracking-wider uppercase">
                  Role Key
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-verde/70 text-xs font-medium tracking-wider uppercase">
                  Label
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-verde/70 text-xs font-medium tracking-wider uppercase hidden md:table-cell">
                  Description
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-verde/70 text-xs font-medium tracking-wider uppercase hidden sm:table-cell">
                  <span className="inline-flex items-center">
                    Type
                    <InfoTooltip content="System roles are built-in and managed by the platform. They cannot be deleted." />
                  </span>
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-right text-verde/70 text-xs font-medium tracking-wider uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr
                  key={role.id}
                  className="border-t border-areia/10 hover:bg-surface-alt/30"
                >
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-preto font-mono">
                    {role.role_key}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-preto">
                    {role.label}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-verde hidden md:table-cell">
                    {role.description || "\u2014"}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm hidden sm:table-cell">
                    {role.is_system ? (
                      <Badge variant="default">System</Badge>
                    ) : (
                      <Badge variant="active">Custom</Badge>
                    )}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-right">
                    {!role.is_system && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteRole(role)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                      </Button>
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
  platforms: string[]
  icon_url: string
  app_url: string
  ios_url: string
  android_url: string
  is_active: boolean
  auto_approve: boolean
}

function formFromApp(app: AppResponse): AppFormState {
  return {
    name: app.name,
    description: app.description ?? "",
    platforms: app.platforms,
    icon_url: app.icon_url ?? "",
    app_url: app.app_url ?? "",
    ios_url: app.ios_url ?? "",
    android_url: app.android_url ?? "",
    is_active: app.is_active,
    auto_approve: app.auto_approve,
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
    platforms: ["web"],
    icon_url: "",
    app_url: "",
    ios_url: "",
    android_url: "",
    is_active: true,
    auto_approve: false,
  })
  const [saving, setSaving] = useState(false)

  const [addRoleDialogOpen, setAddRoleDialogOpen] = useState(false)
  const [roleForm, setRoleForm] = useState({ role_key: "", label: "", description: "" })
  const [addingRole, setAddingRole] = useState(false)
  const [deletingRole, setDeletingRole] = useState<AppRoleResponse | null>(null)

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
    if (form.platforms.length === 0) {
      toast.error("Select at least one platform")
      return
    }
    setSaving(true)
    try {
      const { data } = await appsAPI.update(appId, {
        name: form.name.trim(),
        description: form.description.trim() || null,
        platforms: form.platforms,
        icon_url: form.icon_url.trim() || null,
        app_url: form.app_url.trim() || null,
        ios_url: form.ios_url.trim() || null,
        android_url: form.android_url.trim() || null,
        is_active: form.is_active,
        auto_approve: form.auto_approve,
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

  async function handleAddRole() {
    if (!appId || !roleForm.role_key.trim() || !roleForm.label.trim()) return
    setAddingRole(true)
    try {
      await appsAPI.createRole(appId, {
        role_key: roleForm.role_key.trim(),
        label: roleForm.label.trim(),
        description: roleForm.description.trim() || null,
      })
      toast.success("Role created")
      setAddRoleDialogOpen(false)
      setRoleForm({ role_key: "", label: "", description: "" })
      await fetchRoles()
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status
      if (status === 409) {
        toast.error("A role with this key already exists")
      } else {
        toast.error("Failed to create role")
      }
    } finally {
      setAddingRole(false)
    }
  }

  async function handleDeleteRole() {
    if (!appId || !deletingRole) return
    try {
      await appsAPI.deleteRole(appId, deletingRole.id)
      toast.success("Role deleted")
      setDeletingRole(null)
      await fetchRoles()
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      toast.error(detail || "Failed to delete role")
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
    <div className="p-6 md:p-8 lg:p-10 space-y-6">
      <div>
        <button
          onClick={() => navigate("/app/apps")}
          className="inline-flex items-center gap-1 text-sm text-verde/60 hover:text-preto transition-colors mb-4"
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

      <AppRolesTable
        roles={roles}
        loading={rolesLoading}
        onAddRole={() => { setRoleForm({ role_key: "", label: "", description: "" }); setAddRoleDialogOpen(true) }}
        onDeleteRole={setDeletingRole}
      />

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit App</DialogTitle>
            <DialogDescription>
              Update this app's configuration and metadata.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 pt-1">
            {/* Identity */}
            <div className="space-y-4">
              <p className="text-xs font-medium text-verde/60 tracking-wider uppercase">Identity</p>
              <div className="space-y-1.5">
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
              <div className="space-y-1.5">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
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
            </div>

            <div className="border-t border-areia/10" />

            {/* Platform & Icon */}
            <div className="space-y-4">
              <p className="text-xs font-medium text-verde/60 tracking-wider uppercase">Platform & Icon</p>
              <div className="space-y-1.5">
                <Label htmlFor="edit-platform">
                  <span className="inline-flex items-center">
                    Platforms
                    <InfoTooltip content="The platforms this app targets. Select one or more (Web, Android, iOS)." />
                  </span>
                </Label>
                <PlatformMultiSelect
                  id="edit-platform"
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
            </div>

            <div className="border-t border-areia/10" />

            {/* Links */}
            <div className="space-y-4">
              <p className="text-xs font-medium text-verde/60 tracking-wider uppercase">Links</p>
              <div className="space-y-1.5">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-ios-url">iOS URL</Label>
                  <Input
                    id="edit-ios-url"
                    placeholder="apps.apple.com/..."
                    value={form.ios_url}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, ios_url: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-android-url">Android URL</Label>
                  <Input
                    id="edit-android-url"
                    placeholder="play.google.com/..."
                    value={form.android_url}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, android_url: e.target.value }))
                    }
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-areia/10" />

            {/* Status */}
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl bg-surface-alt/40 px-4 py-3">
                <div>
                  <Label htmlFor="edit-is-active" className="mb-0">Active</Label>
                  <p className="text-xs text-verde/50 mt-0.5">Users can access this app when active</p>
                </div>
                <Switch
                  id="edit-is-active"
                  checked={form.is_active}
                  onCheckedChange={(checked) =>
                    setForm((f) => ({ ...f, is_active: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between rounded-xl bg-surface-alt/40 px-4 py-3">
                <div className="pr-4">
                  <Label htmlFor="edit-auto-approve" className="mb-0">Auto-approve access requests</Label>
                  <p className="text-xs text-verde/50 mt-0.5">
                    When enabled, new signups skip manual review and are granted the default role immediately. Currently pending requests are approved when you turn this on.
                  </p>
                </div>
                <Switch
                  id="edit-auto-approve"
                  checked={form.auto_approve}
                  onCheckedChange={(checked) =>
                    setForm((f) => ({ ...f, auto_approve: checked }))
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter className="border-t border-areia/10 pt-4 mt-2">
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

      <Dialog open={addRoleDialogOpen} onOpenChange={setAddRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Role</DialogTitle>
            <DialogDescription>
              Create a new custom role for this app.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <Label htmlFor="role-key">
                <span className="inline-flex items-center">
                  Role Key
                  <InfoTooltip content="A unique identifier for this role (e.g. editor, reviewer). Use snake_case." />
                </span>
              </Label>
              <Input
                id="role-key"
                placeholder="e.g. editor"
                value={roleForm.role_key}
                onChange={(e) => setRoleForm((f) => ({ ...f, role_key: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="role-label">Label</Label>
              <Input
                id="role-label"
                placeholder="e.g. Editor"
                value={roleForm.label}
                onChange={(e) => setRoleForm((f) => ({ ...f, label: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="role-description">Description (optional)</Label>
              <Textarea
                id="role-description"
                placeholder="What this role can do..."
                value={roleForm.description}
                onChange={(e) => setRoleForm((f) => ({ ...f, description: e.target.value }))}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter className="border-t border-areia/10 pt-4 mt-2">
            <Button variant="outline" onClick={() => setAddRoleDialogOpen(false)} disabled={addingRole}>
              Cancel
            </Button>
            <Button
              onClick={handleAddRole}
              disabled={addingRole || !roleForm.role_key.trim() || !roleForm.label.trim()}
            >
              {addingRole ? "Creating..." : "Create Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deletingRole !== null}
        onOpenChange={(open) => { if (!open) setDeletingRole(null) }}
        title="Delete Role"
        description={`Are you sure you want to delete the "${deletingRole?.label}" (${deletingRole?.role_key}) role? Users with this role will lose their assignment.`}
        confirmLabel="Delete Role"
        variant="destructive"
        onConfirm={handleDeleteRole}
      />
    </div>
  )
}
