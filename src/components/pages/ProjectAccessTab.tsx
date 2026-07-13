import { useEffect, useState } from "react"
import { Plus, Trash2, Users, Building2 } from "lucide-react"
import { toast } from "sonner"
import { projectsAPI, orgsAPI } from "@/services/api"
import type {
  ProjectUserAccessDetailResponse,
  ProjectOrganizationAccessDetailResponse,
  OrganizationResponse,
  UserListResponse,
} from "@/types"
import { card } from "@/styles"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { LoadingSpinner } from "@/components/common/LoadingSpinner"
import { EmptyState } from "@/components/common/EmptyState"
import { InfoTooltip } from "@/components/common/InfoTooltip"
import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { FeatureSpotlight } from "@/components/common/FeatureSpotlight"
import { UserSearchPicker } from "@/components/common/UserSearchPicker"

import { formatDate } from "@/utils/format"

function UserAccessSection({
  users,
  loading,
  onGrant,
  onRevoke,
  onRoleChange,
}: {
  users: ProjectUserAccessDetailResponse[]
  loading: boolean
  onGrant: () => void
  onRevoke: (user: ProjectUserAccessDetailResponse) => void
  onRoleChange: (userId: string, newRole: string) => void
}) {
  if (loading) {
    return <LoadingSpinner size="sm" />
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-preto tracking-tight flex items-center">
          Users with Access
          <InfoTooltip content="Individual users who have been granted direct access to this project." />
        </h3>
        <Button size="sm" onClick={onGrant}>
          <Plus className="h-4 w-4" />
          Grant User
        </Button>
      </div>

      {users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No users with direct access"
          description="Grant individual users access to this project. Users can also gain access through their organization membership."
          actionLabel="Grant User Access"
          onAction={onGrant}
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
                  Role
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-verde/70 text-xs font-medium tracking-wider uppercase hidden md:table-cell">
                  Granted
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-right text-verde/70 text-xs font-medium tracking-wider uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-t border-areia/10 hover:bg-surface-alt/30"
                >
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-preto">
                    {user.email}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-preto hidden sm:table-cell">
                    {user.display_name || "\u2014"}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm">
                    <Select
                      value={user.role}
                      onValueChange={(value) => onRoleChange(user.user_id, value)}
                    >
                      <SelectTrigger className="w-[120px] h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-verde hidden md:table-cell">
                    {formatDate(user.granted_at)}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRevoke(user)}
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

function OrgAccessSection({
  orgs,
  loading,
  onGrant,
  onRevoke,
}: {
  orgs: ProjectOrganizationAccessDetailResponse[]
  loading: boolean
  onGrant: () => void
  onRevoke: (org: ProjectOrganizationAccessDetailResponse) => void
}) {
  if (loading) {
    return <LoadingSpinner size="sm" />
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-preto tracking-tight flex items-center">
          Organizations with Access
          <InfoTooltip content="Organizations whose members all have access to this project." />
        </h3>
        <Button size="sm" onClick={onGrant}>
          <Plus className="h-4 w-4" />
          Grant Organization
        </Button>
      </div>

      {orgs.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No organizations with access"
          description="Grant an organization access to this project. All members of the organization will then be able to access this project."
          actionLabel="Grant Organization Access"
          onAction={onGrant}
        />
      ) : (
        <div className={`${card.base} overflow-hidden`}>
          <table className="w-full">
            <thead>
              <tr className="bg-surface-alt/40">
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-verde/70 text-xs font-medium tracking-wider uppercase">
                  Name
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-verde/70 text-xs font-medium tracking-wider uppercase hidden sm:table-cell">
                  Slug
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-verde/70 text-xs font-medium tracking-wider uppercase hidden md:table-cell">
                  Granted
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-right text-verde/70 text-xs font-medium tracking-wider uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {orgs.map((org) => (
                <tr
                  key={org.id}
                  className="border-t border-areia/10 hover:bg-surface-alt/30"
                >
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-preto">{org.name}</td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-verde font-mono hidden sm:table-cell">
                    {org.slug}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-verde hidden md:table-cell">
                    {formatDate(org.granted_at)}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRevoke(org)}
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

export function ProjectAccessTab({ projectId }: { projectId: string }) {
  const [userAccess, setUserAccess] = useState<
    ProjectUserAccessDetailResponse[]
  >([])
  const [orgAccess, setOrgAccess] = useState<
    ProjectOrganizationAccessDetailResponse[]
  >([])
  const [usersLoading, setUsersLoading] = useState(true)
  const [orgsLoading, setOrgsLoading] = useState(true)

  const [grantUserOpen, setGrantUserOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserListResponse | null>(null)
  const [grantRole, setGrantRole] = useState("member")
  const [grantingUser, setGrantingUser] = useState(false)

  const [grantOrgOpen, setGrantOrgOpen] = useState(false)
  const [grantOrgId, setGrantOrgId] = useState("")
  const [grantingOrg, setGrantingOrg] = useState(false)
  const [availableOrgs, setAvailableOrgs] = useState<OrganizationResponse[]>([])
  const [orgsListLoading, setOrgsListLoading] = useState(false)

  const [revokingUser, setRevokingUser] =
    useState<ProjectUserAccessDetailResponse | null>(null)
  const [revokingOrg, setRevokingOrg] =
    useState<ProjectOrganizationAccessDetailResponse | null>(null)

  async function fetchUserAccess() {
    try {
      const { data } = await projectsAPI.listUserAccess(projectId)
      setUserAccess(data)
    } catch {
      toast.error("Failed to load user access")
    } finally {
      setUsersLoading(false)
    }
  }

  async function fetchOrgAccess() {
    try {
      const { data } = await projectsAPI.listOrgAccess(projectId)
      setOrgAccess(data)
    } catch {
      toast.error("Failed to load organization access")
    } finally {
      setOrgsLoading(false)
    }
  }

  useEffect(() => {
    fetchUserAccess()
    fetchOrgAccess()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId])

  function openGrantUser() {
    setSelectedUser(null)
    setGrantRole("member")
    setGrantUserOpen(true)
  }

  async function openGrantOrg() {
    setGrantOrgId("")
    setGrantOrgOpen(true)
    if (availableOrgs.length === 0) {
      setOrgsListLoading(true)
      try {
        const { data } = await orgsAPI.list()
        setAvailableOrgs(data)
      } catch {
        toast.error("Failed to load organizations")
      } finally {
        setOrgsListLoading(false)
      }
    }
  }

  async function handleGrantUser() {
    if (!selectedUser) return
    setGrantingUser(true)
    try {
      await projectsAPI.grantUser(projectId, {
        user_id: selectedUser.id,
        role: grantRole,
      })
      toast.success("User access granted")
      setGrantUserOpen(false)
      await fetchUserAccess()
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response
        ?.status
      if (status === 409) {
        toast.error("This user already has access to the project")
      } else if (status === 400) {
        toast.error("Platform admins can't be added to a project")
      } else {
        toast.error("Failed to grant user access")
      }
    } finally {
      setGrantingUser(false)
    }
  }

  async function handleGrantOrg() {
    if (!grantOrgId) return
    setGrantingOrg(true)
    try {
      await projectsAPI.grantOrg(projectId, { organization_id: grantOrgId })
      toast.success("Organization access granted")
      setGrantOrgOpen(false)
      await fetchOrgAccess()
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response
        ?.status
      if (status === 409) {
        toast.error("This organization already has access to the project")
      } else {
        toast.error("Failed to grant organization access")
      }
    } finally {
      setGrantingOrg(false)
    }
  }

  async function handleRoleChange(userId: string, newRole: string) {
    try {
      await projectsAPI.updateUserRole(projectId, userId, { role: newRole })
      toast.success("Role updated")
      await fetchUserAccess()
    } catch {
      toast.error("Failed to update role")
    }
  }

  async function handleRevokeUser() {
    if (!revokingUser) return
    try {
      await projectsAPI.revokeUser(projectId, revokingUser.user_id)
      toast.success("User access revoked")
      setRevokingUser(null)
      await fetchUserAccess()
    } catch {
      toast.error("Failed to revoke user access")
    }
  }

  async function handleRevokeOrg() {
    if (!revokingOrg) return
    try {
      await projectsAPI.revokeOrg(projectId, revokingOrg.organization_id)
      toast.success("Organization access revoked")
      setRevokingOrg(null)
      await fetchOrgAccess()
    } catch {
      toast.error("Failed to revoke organization access")
    }
  }

  return (
    <FeatureSpotlight
      featureKey="project-access-first-visit"
      title="Project Access Management"
      description="Control who can access this project by granting access to individual users or entire organizations."
    >
      <div className="space-y-8">
        <UserAccessSection
          users={userAccess}
          loading={usersLoading}
          onGrant={openGrantUser}
          onRevoke={setRevokingUser}
          onRoleChange={handleRoleChange}
        />

        <OrgAccessSection
          orgs={orgAccess}
          loading={orgsLoading}
          onGrant={openGrantOrg}
          onRevoke={setRevokingOrg}
        />

        <Dialog open={grantUserOpen} onOpenChange={setGrantUserOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Grant User Access</DialogTitle>
              <DialogDescription>
                Give a specific user direct access to this project.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-5 pt-1">
              <UserSearchPicker
                selectedUser={selectedUser}
                onSelect={setSelectedUser}
                excludeIds={userAccess.map((u) => u.user_id)}
                excludePlatformAdmins
                label="User"
                placeholder="Search users by email or name..."
              />
              <div className="space-y-1.5">
                <Label>
                  <span className="inline-flex items-center">
                    Role
                    <InfoTooltip content="The role this user will have within the project." />
                  </span>
                </Label>
                <Select value={grantRole} onValueChange={setGrantRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="border-t border-areia/10 pt-4 mt-2">
              <Button
                variant="outline"
                onClick={() => setGrantUserOpen(false)}
                disabled={grantingUser}
              >
                Cancel
              </Button>
              <Button
                onClick={handleGrantUser}
                disabled={grantingUser || !selectedUser}
              >
                {grantingUser ? "Granting..." : "Grant Access"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={grantOrgOpen} onOpenChange={setGrantOrgOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Grant Organization Access</DialogTitle>
              <DialogDescription>
                All members of the selected organization will gain access to this project.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-5 pt-1">
              <div className="space-y-1.5">
                <Label>
                  <span className="inline-flex items-center">
                    Organization
                    <InfoTooltip content="Select the organization to grant project access." />
                  </span>
                </Label>
                {orgsListLoading ? (
                  <p className="text-sm text-verde">
                    Loading organizations...
                  </p>
                ) : (
                  <Select value={grantOrgId} onValueChange={setGrantOrgId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an organization" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableOrgs.map((org) => (
                        <SelectItem key={org.id} value={org.id}>
                          {org.name} ({org.slug})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
            <DialogFooter className="border-t border-areia/10 pt-4 mt-2">
              <Button
                variant="outline"
                onClick={() => setGrantOrgOpen(false)}
                disabled={grantingOrg}
              >
                Cancel
              </Button>
              <Button
                onClick={handleGrantOrg}
                disabled={grantingOrg || !grantOrgId}
              >
                {grantingOrg ? "Granting..." : "Grant Access"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <ConfirmDialog
          open={revokingUser !== null}
          onOpenChange={(open) => {
            if (!open) setRevokingUser(null)
          }}
          title="Revoke User Access"
          description={`Are you sure you want to revoke access for ${revokingUser?.email ?? "this user"}? They will no longer be able to access this project directly.`}
          confirmLabel="Revoke"
          variant="destructive"
          onConfirm={handleRevokeUser}
        />

        <ConfirmDialog
          open={revokingOrg !== null}
          onOpenChange={(open) => {
            if (!open) setRevokingOrg(null)
          }}
          title="Revoke Organization Access"
          description={`Are you sure you want to revoke access for ${revokingOrg?.name ?? "this organization"}? Members will lose access to this project through this organization.`}
          confirmLabel="Revoke"
          variant="destructive"
          onConfirm={handleRevokeOrg}
        />
      </div>
    </FeatureSpotlight>
  )
}
