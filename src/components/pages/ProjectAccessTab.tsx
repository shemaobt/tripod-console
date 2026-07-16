import { useEffect, useState } from "react"
import { toast } from "sonner"
import { projectsAPI, orgsAPI } from "@/services/api"
import type {
  ProjectUserAccessDetailResponse,
  ProjectOrganizationAccessDetailResponse,
  OrganizationResponse,
  UserListResponse,
} from "@/types"
import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { FeatureSpotlight } from "@/components/common/FeatureSpotlight"
import { useAuth } from "@/contexts/AuthContext"
import { UserAccessSection } from "./projectAccess/UserAccessSection"
import { OrgAccessSection } from "./projectAccess/OrgAccessSection"
import { GrantUserDialog } from "./projectAccess/GrantUserDialog"
import { GrantOrgDialog } from "./projectAccess/GrantOrgDialog"

export function ProjectAccessTab({ projectId }: { projectId: string }) {
  const { user, isPlatformAdmin } = useAuth()
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

  const isProjectManager = userAccess.some(
    (u) => u.user_id === user?.id && u.role === "manager",
  )

  return (
    <FeatureSpotlight
      featureKey="project-access-first-visit"
      title="Project Access Management"
      description="Control who can access this project by granting access to individual users or entire organizations."
    >
      <div className="space-y-[18px]">
        <UserAccessSection
          users={userAccess}
          loading={usersLoading}
          isPlatformAdmin={isPlatformAdmin}
          isProjectManager={isProjectManager}
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

        <GrantUserDialog
          open={grantUserOpen}
          onOpenChange={setGrantUserOpen}
          selectedUser={selectedUser}
          onSelectUser={setSelectedUser}
          excludeIds={userAccess.map((u) => u.user_id)}
          grantRole={grantRole}
          onGrantRoleChange={setGrantRole}
          granting={grantingUser}
          onGrant={handleGrantUser}
        />

        <GrantOrgDialog
          open={grantOrgOpen}
          onOpenChange={setGrantOrgOpen}
          orgs={availableOrgs}
          orgsLoading={orgsListLoading}
          orgId={grantOrgId}
          onOrgIdChange={setGrantOrgId}
          granting={grantingOrg}
          onGrant={handleGrantOrg}
        />

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
