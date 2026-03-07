import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { Building2, Plus, Pencil } from "lucide-react"
import { toast } from "sonner"
import { orgsAPI } from "@/services/api"
import type { OrganizationResponse } from "@/types"
import { card } from "@/styles"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-preto tracking-tight flex items-center">
          Organizations
          <InfoTooltip content="Organizations group users together for shared project access." />
        </h1>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4" />
          New Organization
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
        <div className={`${card.base} overflow-hidden`}>
          <table className="w-full">
            <thead>
              <tr className="bg-surface-alt">
                <th className="px-4 py-3 text-left text-verde text-sm font-medium">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-verde text-sm font-medium">
                  <span className="inline-flex items-center">
                    Slug
                    <InfoTooltip content="A unique URL-friendly identifier for this organization." />
                  </span>
                </th>
                <th className="px-4 py-3 text-left text-verde text-sm font-medium">
                  Created
                </th>
                <th className="px-4 py-3 text-right text-verde text-sm font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {orgs.map((org) => (
                <tr
                  key={org.id}
                  className="border-t border-areia/20 hover:bg-surface-alt/50 cursor-pointer"
                  onClick={() => navigate(`/app/organizations/${org.id}`)}
                >
                  <td className="px-4 py-3 text-sm text-preto font-medium">
                    {org.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-preto font-mono">
                    {org.slug}
                  </td>
                  <td className="px-4 py-3 text-sm text-verde">
                    {formatDate(org.created_at)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => openEditDialog(e, org)}
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingOrg ? "Edit Organization" : "Create Organization"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="org-name">Name</Label>
              <Input
                id="org-name"
                placeholder="e.g. Shema OBT"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
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
            </div>
          </div>
          <DialogFooter>
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
