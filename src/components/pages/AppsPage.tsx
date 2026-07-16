import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { AppWindow, Plus } from "lucide-react"
import { toast } from "sonner"
import { appsAPI } from "@/services/api"
import type { AppResponse } from "@/types"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/common/LoadingSpinner"
import { EmptyState } from "@/components/common/EmptyState"
import { InfoTooltip } from "@/components/common/InfoTooltip"
import { FeatureSpotlight } from "@/components/common/FeatureSpotlight"
import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { AppFormDialog, type AppFormState } from "./apps/AppFormDialog"
import { AppCard } from "./apps/AppCard"

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
    <div className="max-w-[1240px] mx-auto px-6 sm:px-10 pt-8 pb-14">
      <div className="flex items-end justify-between gap-4 mb-5">
        <div className="flex flex-col gap-1">
          <span className="text-[13px] font-semibold tracking-[0.14em] uppercase text-fg-muted">
            Administration
          </span>
          <h3 className="text-[25px] font-bold text-fg-strong tracking-tight flex items-center">
            Manage apps
            <InfoTooltip content="Apps are the software products users can access. Manage their metadata, platforms, roles and status here." />
          </h3>
          <span className="text-[12.5px] text-fg-subtle">
            Catalog of ecosystem apps — platforms, roles and auto-approval.
          </span>
        </div>
        <FeatureSpotlight
          featureKey="apps-admin-first-visit"
          title="Apps Management"
          description="Register and configure the apps in your platform. Each app can have roles assigned to users for access control."
        >
          <Button onClick={openCreateDialog}>
            <Plus className="w-[17px] h-[17px]" strokeWidth={1.75} />
            New app
          </Button>
        </FeatureSpotlight>
      </div>

      {apps.length === 0 ? (
        <EmptyState
          icon={AppWindow}
          title="No apps registered"
          description="Apps represent the software products in your platform. Register an app to start assigning user roles and managing access."
          actionLabel="Create App"
          onAction={openCreateDialog}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {apps.map((app) => (
            <AppCard
              key={app.id}
              app={app}
              onOpen={() => navigate(`/app/apps/${app.id}`)}
              onEdit={(e) => openEditDialog(e, app)}
              onDelete={(e) => {
                e.stopPropagation()
                setDeletingApp(app)
              }}
            />
          ))}
        </div>
      )}

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
