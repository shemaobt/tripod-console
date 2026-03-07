import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router"
import { ArrowLeft, Building2, Plus, Trash2, Users } from "lucide-react"
import { toast } from "sonner"
import { orgsAPI } from "@/services/api"
import type {
  OrganizationResponse,
  OrganizationMemberResponse,
} from "@/types"
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
import { ConfirmDialog } from "@/components/common/ConfirmDialog"

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function OrgInfoCard({ org }: { org: OrganizationResponse }) {
  return (
    <div className={`${card.base} p-6`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-lg bg-azul/20 flex items-center justify-center">
          <Building2 className="h-5 w-5 text-azul" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-preto">{org.name}</h2>
          <p className="text-sm text-verde font-mono">{org.slug}</p>
        </div>
      </div>
      <div className="text-sm text-verde">
        Created {formatDate(org.created_at)}
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
              <tr className="bg-surface-alt">
                <th className="px-4 py-3 text-left text-verde text-sm font-medium">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-verde text-sm font-medium">
                  Display Name
                </th>
                <th className="px-4 py-3 text-left text-verde text-sm font-medium">
                  <span className="inline-flex items-center">
                    Role
                    <InfoTooltip content="The member's role within this organization." />
                  </span>
                </th>
                <th className="px-4 py-3 text-left text-verde text-sm font-medium">
                  Joined
                </th>
                <th className="px-4 py-3 text-right text-verde text-sm font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr
                  key={member.id}
                  className="border-t border-areia/20 hover:bg-surface-alt/50"
                >
                  <td className="px-4 py-3 text-sm text-preto">
                    {member.email}
                  </td>
                  <td className="px-4 py-3 text-sm text-preto">
                    {member.display_name || "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-preto">
                    {member.role}
                  </td>
                  <td className="px-4 py-3 text-sm text-verde">
                    {formatDate(member.joined_at)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveMember(member)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
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

  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [userId, setUserId] = useState("")
  const [role, setRole] = useState("member")
  const [adding, setAdding] = useState(false)

  const [removingMember, setRemovingMember] =
    useState<OrganizationMemberResponse | null>(null)

  async function fetchOrg() {
    if (!orgId) return
    try {
      const { data } = await orgsAPI.get(orgId)
      setOrg(data)
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
    setUserId("")
    setRole("member")
    setAddDialogOpen(true)
  }

  async function handleAddMember() {
    if (!orgId || !userId.trim()) return
    setAdding(true)
    try {
      await orgsAPI.addMember(orgId, {
        user_id: userId.trim(),
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

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <button
          onClick={() => navigate("/app/organizations")}
          className="inline-flex items-center gap-1 text-sm text-verde hover:text-preto transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Organizations
        </button>
        <h1 className="text-2xl font-semibold text-preto tracking-tight flex items-center">
          {org.name}
          <InfoTooltip content="View and manage this organization's details and members." />
        </h1>
      </div>

      <OrgInfoCard org={org} />

      <MembersTable
        members={members}
        loading={membersLoading}
        onAddMember={openAddDialog}
        onRemoveMember={setRemovingMember}
      />

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="member-user-id">
                <span className="inline-flex items-center">
                  User ID
                  <InfoTooltip content="The unique identifier of the user to add." />
                </span>
              </Label>
              <Input
                id="member-user-id"
                placeholder="Enter user ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="member-role">Role</Label>
              <Input
                id="member-role"
                placeholder="e.g. member, admin"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddDialogOpen(false)}
              disabled={adding}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddMember}
              disabled={adding || !userId.trim()}
            >
              {adding ? "Adding..." : "Add Member"}
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
