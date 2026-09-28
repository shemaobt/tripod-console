import { useEffect, useState } from "react"
import { toast } from "sonner"
import { projectsAPI } from "@/services/api"
import type {
  ProjectUserAccessDetailResponse,
  UserListResponse,
} from "@/types"
import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { FeatureSpotlight } from "@/components/common/FeatureSpotlight"
import { LoadFailed } from "@/components/common/LoadFailed"
import { useAuth } from "@/contexts/AuthContext"
import { UserAccessSection } from "./projectAccess/UserAccessSection"
import { GrantUserDialog } from "./projectAccess/GrantUserDialog"

export function ProjectAccessTab({ projectId }: { projectId: string }) {
  const { isPlatformAdmin, managedProjectIds } = useAuth()
  const [userAccess, setUserAccess] = useState<
    ProjectUserAccessDetailResponse[] | null
  >([])
  const [usersLoading, setUsersLoading] = useState(true)

  const [grantUserOpen, setGrantUserOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserListResponse | null>(null)
  const [grantRole, setGrantRole] = useState("member")
  const [grantingUser, setGrantingUser] = useState(false)

  const [revokingUser, setRevokingUser] =
    useState<ProjectUserAccessDetailResponse | null>(null)

  async function fetchUserAccess() {
    try {
      const { data } = await projectsAPI.listUserAccess(projectId)
      setUserAccess(data)
    } catch {
      setUserAccess(null)
    } finally {
      setUsersLoading(false)
    }
  }

  useEffect(() => {
    fetchUserAccess()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId])

  function openGrantUser() {
    setSelectedUser(null)
    setGrantRole("member")
    setGrantUserOpen(true)
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

  const isProjectManager = managedProjectIds.includes(projectId)

  return (
    <FeatureSpotlight
      featureKey="project-access-first-visit"
      title="Project Access Management"
      description="Control who can access this project by granting access to individual people."
    >
      <div className="space-y-[1.125rem]">
        {userAccess === null ? (
          <LoadFailed what="who has access to this project" onRetry={fetchUserAccess} />
        ) : (
          <UserAccessSection
            users={userAccess}
            loading={usersLoading}
            isPlatformAdmin={isPlatformAdmin}
            isProjectManager={isProjectManager}
            onGrant={openGrantUser}
            onRevoke={setRevokingUser}
            onRoleChange={handleRoleChange}
          />
        )}

        <GrantUserDialog
          open={grantUserOpen}
          onOpenChange={setGrantUserOpen}
          selectedUser={selectedUser}
          onSelectUser={setSelectedUser}
          excludeIds={(userAccess ?? []).map((u) => u.user_id)}
          grantRole={grantRole}
          onGrantRoleChange={setGrantRole}
          canGrantManagerRole={isPlatformAdmin}
          granting={grantingUser}
          onGrant={handleGrantUser}
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

      </div>
    </FeatureSpotlight>
  )
}
