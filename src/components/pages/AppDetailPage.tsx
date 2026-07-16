import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { appsAPI } from "@/services/api"
import type { AppResponse, AppRoleResponse } from "@/types"
import { cn } from "@/utils/cn"
import { Switch } from "@/components/ui/switch"
import { LoadingSpinner } from "@/components/common/LoadingSpinner"
import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { DetailsCard, type AppFormState } from "./apps/DetailsCard"
import { AutoApproveCard } from "./apps/AutoApproveCard"
import { DangerZoneCard } from "./apps/DangerZoneCard"
import { RolesCard } from "./apps/RolesCard"

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

  const [roleForm, setRoleForm] = useState({ role_key: "", label: "", description: "" })
  const [addingRole, setAddingRole] = useState(false)
  const [deletingRole, setDeletingRole] = useState<AppRoleResponse | null>(null)
  const [confirmDeleteApp, setConfirmDeleteApp] = useState(false)

  async function fetchApp() {
    if (!appId) return
    try {
      const { data } = await appsAPI.get(appId)
      setApp(data)
      setForm(formFromApp(data))
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

  async function handleDeleteApp() {
    if (!appId) return
    try {
      await appsAPI.delete(appId)
      toast.success("App deleted")
      setConfirmDeleteApp(false)
      navigate("/app/apps")
    } catch {
      toast.error("Failed to delete app")
    }
  }

  if (appLoading) {
    return <LoadingSpinner />
  }

  if (!app) {
    return (
      <div className="max-w-[1240px] mx-auto px-6 sm:px-10 pt-8">
        <p className="text-fg-muted">App not found.</p>
      </div>
    )
  }

  const initials = app.name.slice(0, 2).toUpperCase()

  return (
    <div className="max-w-[1240px] mx-auto px-6 sm:px-10 pt-7 pb-14">
      <button
        onClick={() => navigate("/app/apps")}
        className="inline-flex items-center gap-[7px] text-[13px] font-semibold text-fg-muted hover:text-fg-strong transition-colors mb-4"
      >
        <ArrowLeft className="w-[15px] h-[15px]" strokeWidth={1.75} />
        Manage apps
      </button>

      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3.5">
          {app.icon_url ? (
            <img
              src={app.icon_url}
              alt={app.name}
              className="w-[52px] h-[52px] rounded-[14px] object-cover shrink-0"
            />
          ) : (
            <span className="w-[52px] h-[52px] rounded-[14px] bg-inverse text-on-dark grid place-items-center text-base font-bold shrink-0">
              {initials}
            </span>
          )}
          <div className="flex flex-col gap-[3px] min-w-0">
            <h3 className="text-[23px] font-bold text-fg-strong tracking-tight truncate">{app.name}</h3>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-mono text-[11.5px] bg-muted rounded-md px-2 py-[3px] text-fg-muted">
                {app.app_key}
              </span>
              <span className="text-[11px] text-fg-subtle">app_key is immutable</span>
              <span className="inline-flex items-center gap-1.5 text-[12.5px] text-fg-muted">
                <span
                  className={cn(
                    "w-[7px] h-[7px] rounded-full",
                    app.is_active ? "bg-st-ok" : "bg-st-idle",
                  )}
                />
                {app.is_active ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <span className="text-[13px] text-fg-muted">Active</span>
          <Switch
            checked={form.is_active}
            onCheckedChange={(checked) => setForm((f) => ({ ...f, is_active: checked }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-[18px] items-start mb-[18px]">
        <DetailsCard form={form} setForm={setForm} saving={saving} onSave={handleSave} />

        <div className="flex flex-col gap-[18px]">
          <AutoApproveCard form={form} setForm={setForm} />
          <DangerZoneCard onDelete={() => setConfirmDeleteApp(true)} />
        </div>
      </div>

      <RolesCard
        roles={roles}
        loading={rolesLoading}
        roleForm={roleForm}
        setRoleForm={setRoleForm}
        adding={addingRole}
        onAdd={handleAddRole}
        onDelete={setDeletingRole}
      />

      <ConfirmDialog
        open={deletingRole !== null}
        onOpenChange={(open) => { if (!open) setDeletingRole(null) }}
        title="Delete Role"
        description={`Are you sure you want to delete the "${deletingRole?.label}" (${deletingRole?.role_key}) role? Users with this role will lose their assignment.`}
        confirmLabel="Delete Role"
        variant="destructive"
        onConfirm={handleDeleteRole}
      />

      <ConfirmDialog
        open={confirmDeleteApp}
        onOpenChange={setConfirmDeleteApp}
        title="Delete App"
        description={`Are you sure you want to delete "${app.name}"? This will permanently remove the app and all associated roles and access. This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDeleteApp}
      />
    </div>
  )
}
