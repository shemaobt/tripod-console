import { useEffect, useState, useCallback, useRef } from "react"
import { useParams, useNavigate } from "react-router"
import {
  ArrowLeft,
  Building2,
  Pencil,
  Plus,
  Search,
  Trash2,
  User as UserIcon,
  Users,
} from "lucide-react"
import { toast } from "sonner"
import { orgsAPI, usersAPI } from "@/services/api"
import { useAuth } from "@/contexts/AuthContext"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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

import { formatDate } from "@/utils/format"

function UserSearchPicker({
  selectedUser,
  onSelect,
  excludeIds,
  label,
  placeholder,
}: {
  selectedUser: UserListResponse | null
  onSelect: (user: UserListResponse | null) => void
  excludeIds?: string[]
  label?: string
  placeholder?: string
}) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<UserListResponse[]>([])
  const [searching, setSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([])
      return
    }
    setSearching(true)
    try {
      const { data } = await usersAPI.search(q)
      setResults(data)
    } catch {
      // silent
    } finally {
      setSearching(false)
    }
  }, [])

  function handleInputChange(value: string) {
    setQuery(value)
    setShowResults(true)
    if (selectedUser) onSelect(null)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(value), 300)
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const filtered = excludeIds
    ? results.filter((u) => !excludeIds.includes(u.id))
    : results

  return (
    <div ref={containerRef} className="space-y-1.5">
      {label && (
        <Label>
          <span className="inline-flex items-center">
            {label}
            <InfoTooltip content="Search by email or display name to find a user." />
          </span>
        </Label>
      )}
      {selectedUser ? (
        <div className="flex items-center gap-3 rounded-lg border border-areia/30 bg-surface-alt/30 px-3 py-2.5">
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-azul/20 overflow-hidden shrink-0">
            {selectedUser.avatar_url ? (
              <img src={selectedUser.avatar_url} alt="" className="h-full w-full object-cover rounded-full" />
            ) : (
              <UserIcon className="h-4 w-4 text-verde/30" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-preto truncate">{selectedUser.email}</p>
            {selectedUser.display_name && (
              <p className="text-xs text-verde/60 truncate">{selectedUser.display_name}</p>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              onSelect(null)
              setQuery("")
              setResults([])
            }}
            className="text-xs text-verde/50"
          >
            Change
          </Button>
        </div>
      ) : (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-verde/40" />
          <Input
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => query.trim() && setShowResults(true)}
            placeholder={placeholder || "Search users by email or name..."}
            className="pl-9"
          />
          {showResults && (query.trim().length > 0) && (
            <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-surface border border-areia/30 rounded-lg shadow-lg max-h-52 overflow-y-auto">
              {searching ? (
                <div className="flex items-center justify-center py-4">
                  <LoadingSpinner size="sm" />
                </div>
              ) : filtered.length === 0 ? (
                <p className="text-sm text-verde/50 text-center py-4">
                  {results.length > 0 && excludeIds ? "All results already added" : "No users found"}
                </p>
              ) : (
                filtered.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => {
                      onSelect(user)
                      setShowResults(false)
                      setQuery("")
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-surface-alt/50 transition-colors text-left"
                  >
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-azul/20 overflow-hidden shrink-0">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt="" className="h-full w-full object-cover rounded-full" />
                      ) : (
                        <UserIcon className="h-4 w-4 text-verde/30" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-preto truncate">{user.email}</p>
                      {user.display_name && (
                        <p className="text-xs text-verde/60 truncate">{user.display_name}</p>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

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
  isPlatformAdmin,
  onRoleChange,
}: {
  members: OrganizationMemberResponse[]
  loading: boolean
  onAddMember: () => void
  onRemoveMember: (member: OrganizationMemberResponse) => void
  isPlatformAdmin: boolean
  onRoleChange: (member: OrganizationMemberResponse, role: string) => void
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
                    {isPlatformAdmin ? (
                      <Select
                        value={member.role}
                        onValueChange={(value) => onRoleChange(member, value)}
                      >
                        <SelectTrigger className="w-[120px] h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="member">member</SelectItem>
                          <SelectItem value="manager">manager</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      member.role
                    )}
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
  const { isPlatformAdmin } = useAuth()

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

  async function handleRoleChange(member: OrganizationMemberResponse, newRole: string) {
    if (!orgId || member.role === newRole) return
    try {
      await orgsAPI.updateMemberRole(orgId, member.user_id, {
        role: newRole as "member" | "manager",
      })
      toast.success("Role updated")
      await fetchMembers()
    } catch {
      toast.error("Failed to update role")
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
        isPlatformAdmin={isPlatformAdmin}
        onRoleChange={handleRoleChange}
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
