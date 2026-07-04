import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router"
import {
  ArrowLeft,
  Building2,
  Pencil,
  Plus,
  Trash2,
  User as UserIcon,
  Users,
} from "lucide-react"
import { toast } from "sonner"
import { orgsAPI, usersAPI } from "@/services/api"
import type {
  OrganizationResponse,
  OrganizationMemberResponse,
  UserListResponse,
} from "@/types"
import { card } from "@/styles"
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
import { LoadingSpinner } from "@/components/common/LoadingSpinner"
import { EmptyState } from "@/components/common/EmptyState"
import { InfoTooltip } from "@/components/common/InfoTooltip"
import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { ImageUpload } from "@/components/common/ImageUpload"
import { UserSearchPicker } from "@/components/common/UserSearchPicker"

import { formatDate } from "@/utils/format"

function OrgInfoCard({
  org,
  managerUser,
  onEdit,
}: {
  org: OrganizationResponse
  managerUser: UserListResponse | null
  onEdit: () => void
}) {
  return (
    <div className={`${card.base} p-4 sm:p-6`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-xl bg-azul/20 flex items-center justify-center overflow-hidden shrink-0">
            {org.logo_url ? (
              <img src={org.logo_url} alt="" className="h-full w-full object-cover rounded-xl" />
            ) : (
              <Building2 className="h-7 w-7 text-azul" />
            )}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-preto">{org.name}</h2>
            <p className="text-sm text-verde font-mono">{org.slug}</p>
            {org.description && (
              <p className="text-sm text-verde/70 mt-2 max-w-xl">{org.description}</p>
            )}
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onEdit}>
          <Pencil className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex flex-wrap gap-6 mt-4 text-sm">
        {managerUser && (
          <div>
            <span className="text-verde/70 text-xs uppercase tracking-wider font-medium">Manager</span>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center justify-center h-6 w-6 rounded-full bg-azul/20 overflow-hidden shrink-0">
                {managerUser.avatar_url ? (
                  <img src={managerUser.avatar_url} alt="" className="h-full w-full object-cover rounded-full" />
                ) : (
                  <UserIcon className="h-3 w-3 text-verde/30" />
                )}
              </div>
              <span className="text-preto font-medium">{managerUser.display_name || managerUser.email}</span>
            </div>
          </div>
        )}
        <div>
          <span className="text-verde/70 text-xs uppercase tracking-wider font-medium">Created</span>
          <p className="text-preto font-medium mt-1">{formatDate(org.created_at)}</p>
        </div>
      </div>
    </div>
  )
}

function MembersTable({
  members,
  loading,
  onAddMember,
  onRemoveMember,
}: {
  members: OrganizationMemberResponse[]
  loading: boolean
  onAddMember: () => void
  onRemoveMember: (member: OrganizationMemberResponse) => void
}) {
  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-preto tracking-tight flex items-center">
          Members
          <InfoTooltip content="Users who belong to this organization. Members inherit project access granted to the organization." />
        </h3>
        <Button size="sm" onClick={onAddMember}>
          <Plus className="h-4 w-4" />
          Add Member
        </Button>
      </div>

      {members.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No members yet"
          description="Add users to this organization so they can inherit shared project access. Members can be assigned different roles within the organization."
          actionLabel="Add Member"
          onAction={onAddMember}
        />
      ) : (
        <div className={`${card.base} overflow-hidden`}>
          <table className="w-full">
            <thead>
              <tr className="bg-surface-alt/40">
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-verde/70 text-xs font-medium tracking-wider uppercase">
                  Email
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-verde/70 text-xs font-medium tracking-wider uppercase hidden sm:table-cell">
                  Display Name
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-verde/70 text-xs font-medium tracking-wider uppercase">
                  <span className="inline-flex items-center">
                    Role
                    <InfoTooltip content="The member's role within this organization." />
                  </span>
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-verde/70 text-xs font-medium tracking-wider uppercase hidden md:table-cell">
                  Joined
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-right text-verde/70 text-xs font-medium tracking-wider uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr
                  key={member.id}
                  className="border-t border-areia/10 hover:bg-surface-alt/30"
                >
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-preto">
                    {member.email}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-preto hidden sm:table-cell">
                    {member.display_name || "—"}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-preto">
                    {member.role}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-verde hidden md:table-cell">
                    {formatDate(member.joined_at)}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveMember(member)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </Button>
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

export default function OrganizationDetailPage() {
  const { orgId } = useParams<{ orgId: string }>()
  const navigate = useNavigate()

  const [org, setOrg] = useState<OrganizationResponse | null>(null)
  const [orgLoading, setOrgLoading] = useState(true)
  const [members, setMembers] = useState<OrganizationMemberResponse[]>([])
  const [membersLoading, setMembersLoading] = useState(true)
  const [managerUser, setManagerUser] = useState<UserListResponse | null>(null)

  // Add member dialog
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserListResponse | null>(null)
  const [role, setRole] = useState("member")
  const [adding, setAdding] = useState(false)

  // Edit org dialog
  const [editOpen, setEditOpen] = useState(false)
  const [editName, setEditName] = useState("")
  const [editSlug, setEditSlug] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editLogoUrl, setEditLogoUrl] = useState<string | null>(null)
  const [editManager, setEditManager] = useState<UserListResponse | null>(null)
  const [saving, setSaving] = useState(false)

  const [removingMember, setRemovingMember] =
    useState<OrganizationMemberResponse | null>(null)

  async function fetchOrg() {
    if (!orgId) return
    try {
      const { data } = await orgsAPI.get(orgId)
      setOrg(data)
      if (data.manager_id) {
        try {
          const { data: manager } = await usersAPI.get(data.manager_id)
          setManagerUser(manager)
        } catch {
          setManagerUser(null)
        }
      } else {
        setManagerUser(null)
      }
    } catch {
      toast.error("Failed to load organization")
    } finally {
      setOrgLoading(false)
    }
  }

  async function fetchMembers() {
    if (!orgId) return
    try {
      const { data } = await orgsAPI.listMembers(orgId)
      setMembers(data)
    } catch {
      toast.error("Failed to load members")
    } finally {
      setMembersLoading(false)
    }
  }

  useEffect(() => {
    fetchOrg()
    fetchMembers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId])

  function openAddDialog() {
    setSelectedUser(null)
    setRole("member")
    setAddDialogOpen(true)
  }

  function openEditDialog() {
    if (!org) return
    setEditName(org.name)
    setEditSlug(org.slug)
    setEditDescription(org.description ?? "")
    setEditLogoUrl(org.logo_url)
    setEditManager(managerUser)
    setEditOpen(true)
  }

  async function handleAddMember() {
    if (!orgId || !selectedUser) return
    setAdding(true)
    try {
      await orgsAPI.addMember(orgId, {
        user_id: selectedUser.id,
        role: role.trim() || "member",
      })
      toast.success("Member added")
      setAddDialogOpen(false)
      await fetchMembers()
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response
        ?.status
      if (status === 409) {
        toast.error("This user is already a member of the organization")
      } else {
        toast.error("Failed to add member")
      }
    } finally {
      setAdding(false)
    }
  }

  async function handleEditSave() {
    if (!orgId || !editName.trim() || !editSlug.trim()) return
    setSaving(true)
    try {
      const { data } = await orgsAPI.update(orgId, {
        name: editName.trim(),
        slug: editSlug.trim(),
        description: editDescription.trim() || null,
        logo_url: editLogoUrl,
        manager_id: editManager?.id ?? null,
      })
      setOrg(data)
      if (editManager) {
        setManagerUser(editManager)
      } else {
        setManagerUser(null)
      }
      toast.success("Organization updated")
      setEditOpen(false)
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response
        ?.status
      if (status === 409) {
        toast.error("This slug is already in use")
      } else {
        toast.error("Failed to update organization")
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleRemoveMember() {
    if (!orgId || !removingMember) return
    try {
      await orgsAPI.removeMember(orgId, removingMember.user_id)
      toast.success("Member removed")
      setRemovingMember(null)
      await fetchMembers()
    } catch {
      toast.error("Failed to remove member")
    }
  }

  if (orgLoading) {
    return <LoadingSpinner />
  }

  if (!org) {
    return (
      <div className="p-6 md:p-8">
        <p className="text-verde">Organization not found.</p>
      </div>
    )
  }

  const memberUserIds = members.map((m) => m.user_id)

  return (
    <div className="p-6 md:p-8 lg:p-10 space-y-6">
      <div>
        <button
          onClick={() => navigate("/app/organizations")}
          className="inline-flex items-center gap-1 text-sm text-verde/60 hover:text-preto transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Organizations
        </button>
        <h1 className="text-2xl font-semibold text-preto tracking-tight flex items-center">
          {org.name}
          <InfoTooltip content="View and manage this organization's details and members." />
        </h1>
      </div>

      <OrgInfoCard org={org} managerUser={managerUser} onEdit={openEditDialog} />

      <MembersTable
        members={members}
        loading={membersLoading}
        onAddMember={openAddDialog}
        onRemoveMember={setRemovingMember}
      />

      {/* Add Member Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Member</DialogTitle>
            <DialogDescription>
              Add a user to this organization. They will inherit any project access granted to the organization.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 pt-1">
            <UserSearchPicker
              selectedUser={selectedUser}
              onSelect={setSelectedUser}
              excludeIds={memberUserIds}
              label="User"
              placeholder="Search by email or name..."
            />
          </div>
          <DialogFooter className="border-t border-areia/10 pt-4 mt-2">
            <Button
              variant="outline"
              onClick={() => setAddDialogOpen(false)}
              disabled={adding}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddMember}
              disabled={adding || !selectedUser}
            >
              {adding ? "Adding..." : "Add Member"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Organization Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Organization</DialogTitle>
            <DialogDescription>
              Update this organization's details, logo, and manager.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 pt-1">
            <div className="flex justify-center py-2">
              <ImageUpload
                value={editLogoUrl}
                onChange={setEditLogoUrl}
                folder="org-logos"
                shape="square"
                size="lg"
                placeholder={<Building2 className="h-8 w-8 text-verde/30" />}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-org-name">Name</Label>
              <Input
                id="edit-org-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Organization name"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-org-slug">
                <span className="inline-flex items-center">
                  Slug
                  <InfoTooltip content="URL-friendly identifier. Use lowercase letters, numbers, and hyphens." />
                </span>
              </Label>
              <Input
                id="edit-org-slug"
                value={editSlug}
                onChange={(e) => setEditSlug(e.target.value)}
                placeholder="org-slug"
                className="font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-org-desc">Description</Label>
              <Textarea
                id="edit-org-desc"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Brief description of this organization"
                rows={3}
              />
            </div>
            <UserSearchPicker
              selectedUser={editManager}
              onSelect={setEditManager}
              label="Manager"
              placeholder="Search for a manager..."
            />
          </div>
          <DialogFooter className="border-t border-areia/10 pt-4 mt-2">
            <Button
              variant="outline"
              onClick={() => setEditOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditSave}
              disabled={saving || !editName.trim() || !editSlug.trim()}
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={removingMember !== null}
        onOpenChange={(open) => {
          if (!open) setRemovingMember(null)
        }}
        title="Remove Member"
        description={`Are you sure you want to remove ${removingMember?.email ?? "this member"} from the organization? They will lose any project access inherited through this organization.`}
        confirmLabel="Remove"
        variant="destructive"
        onConfirm={handleRemoveMember}
      />
    </div>
  )
}
