import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { Building2, Plus, Pencil } from "lucide-react"
import { toast } from "sonner"
import { orgsAPI } from "@/services/api"
import type { OrganizationResponse } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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

import { formatDate } from "@/utils/format"

export default function OrganizationsPage() {
  const navigate = useNavigate()
  const [orgs, setOrgs] = useState<OrganizationResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingOrg, setEditingOrg] = useState<OrganizationResponse | null>(
    null,
  )
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")

  async function fetchOrgs() {
    try {
      const { data } = await orgsAPI.list()
      setOrgs(data)
    } catch {
      toast.error("Failed to load organizations")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrgs()
  }, [])

  function openCreateDialog() {
    setEditingOrg(null)
    setName("")
    setSlug("")
    setDialogOpen(true)
  }

  function openEditDialog(e: React.MouseEvent, org: OrganizationResponse) {
    e.stopPropagation()
    setEditingOrg(org)
    setName(org.name)
    setSlug(org.slug)
    setDialogOpen(true)
  }

  async function handleSave() {
    if (!name.trim() || !slug.trim()) return
    setSaving(true)
    try {
      if (editingOrg) {
        await orgsAPI.update(editingOrg.id, {
          name: name.trim(),
          slug: slug.trim(),
        })
        toast.success("Organization updated")
      } else {
        await orgsAPI.create({ name: name.trim(), slug: slug.trim() })
        toast.success("Organization created")
      }
      setDialogOpen(false)
      await fetchOrgs()
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response
        ?.status
      if (status === 409) {
        toast.error("An organization with this slug already exists")
      } else {
        toast.error(
          editingOrg
            ? "Failed to update organization"
            : "Failed to create organization",
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
    <div className="p-6 md:p-8 lg:p-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-preto tracking-tight flex items-center">
            Organizations
            <InfoTooltip content="Organizations group users together for shared project access." />
          </h1>
          <p className="text-sm text-verde/60 mt-1">
            {orgs.length} organization{orgs.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={openCreateDialog} className="rounded-xl">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New Organization</span>
        </Button>
      </div>

      {orgs.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No organizations yet"
          description="Organizations group users together so you can grant project access to entire teams at once. Create one to get started."
          actionLabel="Create Organization"
          onAction={openCreateDialog}
        />
      ) : (
        <div className="space-y-3">
          {orgs.map((org) => (
            <div
              key={org.id}
              className="group flex items-center gap-4 rounded-2xl border border-areia/20 bg-surface px-5 py-4 shadow-sm hover:shadow-md hover:border-telha/30 transition-all duration-200 cursor-pointer"
              onClick={() => navigate(`/app/organizations/${org.id}`)}
            >
              <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-azul/15 to-azul/5 shrink-0 overflow-hidden">
                {org.logo_url ? (
                  <img src={org.logo_url} alt="" className="h-full w-full object-cover rounded-xl" />
                ) : (
                  <Building2 className="h-5 w-5 text-azul" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-preto truncate">{org.name}</p>
                <p className="text-xs text-verde/50 font-mono mt-0.5">{org.slug}</p>
              </div>
              <p className="text-xs text-verde/50 tabular-nums shrink-0 hidden sm:block">
                {formatDate(org.created_at)}
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                onClick={(e) => openEditDialog(e, org)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingOrg ? "Edit Organization" : "Create Organization"}
            </DialogTitle>
            <DialogDescription>
              {editingOrg
                ? "Update this organization's details."
                : "Organizations group users together for shared project access."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 pt-1">
            <div className="space-y-1.5">
              <Label htmlFor="org-name">Name</Label>
              <Input
                id="org-name"
                placeholder="e.g. Shema OBT"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="org-slug">
                <span className="inline-flex items-center">
                  Slug
                  <InfoTooltip content="A unique URL-friendly identifier. Use lowercase letters, numbers, and hyphens." />
                </span>
              </Label>
              <Input
                id="org-slug"
                placeholder="e.g. shema-obt"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
              <p className="text-xs text-verde/50 mt-1.5">
                Lowercase letters, numbers, and hyphens only
              </p>
            </div>
          </div>
          <DialogFooter className="border-t border-areia/10 pt-4 mt-2">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !name.trim() || !slug.trim()}
            >
              {saving
                ? editingOrg
                  ? "Saving..."
                  : "Creating..."
                : editingOrg
                  ? "Save"
                  : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
