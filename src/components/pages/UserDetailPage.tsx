import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router"
import { ArrowLeft, KeyRound, Plus, Trash2, User as UserIcon } from "lucide-react"
import { toast } from "sonner"
import { usersAPI, appsAPI, rolesAPI } from "@/services/api"
import type {
  UserListResponse,
  UserRoleResponse,
  AppResponse,
  AppRoleResponse,
} from "@/types"
import { card } from "@/styles"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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

import { formatDate } from "@/utils/format"

function UserInfoCard({
  user,
  onToggleActive,
  onToggleAdmin,
  onDelete,
}: {
  user: UserListResponse
  onToggleActive: () => void
  onToggleAdmin: () => void
  onDelete: () => void
}) {
  return (
    <div className={`${card.base} p-4 sm:p-6`}>
      <div className="flex items-start gap-3 sm:gap-4 mb-4">
        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-azul/20 overflow-hidden shrink-0">
          {user.avatar_url ? (
            <img src={user.avatar_url} alt="" className="h-full w-full object-cover rounded-full" />
          ) : (
            <UserIcon className="h-8 w-8 text-verde/30" />
          )}
        </div>
        <div className="flex-1 pt-2">
          <h2 className="text-lg font-semibold text-preto">{user.email}</h2>
          <p className="text-sm text-verde">
            {user.display_name || "No display name"}
          </p>
        </div>
        <Button
          variant="outline-destructive"
          size="sm"
          className="shrink-0"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4 mr-1.5" />
          Delete User
        </Button>
      </div>
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-verde">Status:</span>
          <Badge variant={user.is_active ? "active" : "inactive"}>
            {user.is_active ? "Active" : "Inactive"}
          </Badge>
          <Button variant="outline" size="sm" onClick={onToggleActive}>
            {user.is_active ? "Deactivate" : "Activate"}
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-verde">
            <span className="inline-flex items-center">
              Platform Admin
              <InfoTooltip content="Platform admins have full access to all resources including user management and app configuration." />
            </span>
          </span>
          {user.is_platform_admin ? (
            <Badge variant="success">Yes</Badge>
          ) : (
            <Badge variant="default">No</Badge>
          )}
          <Button variant="outline" size="sm" onClick={onToggleAdmin}>
            {user.is_platform_admin ? "Remove Admin" : "Make Admin"}
          </Button>
        </div>
      </div>
      <div className="mt-3 text-sm text-verde">
        Created {formatDate(user.created_at)}
      </div>
    </div>
  )
}

function RolesTable({
  roles,
  loading,
  onAssignRole,
  onRevokeRole,
}: {
  roles: UserRoleResponse[]
  loading: boolean
  onAssignRole: () => void
  onRevokeRole: (role: UserRoleResponse) => void
}) {
  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-preto tracking-tight flex items-center">
          App Roles
          <InfoTooltip content="Roles assigned to this user across different apps. Each role grants specific permissions within that app." />
        </h3>
        <Button size="sm" onClick={onAssignRole}>
          <Plus className="h-4 w-4" />
          Assign Role
        </Button>
      </div>

      {roles.length === 0 ? (
        <EmptyState
          icon={KeyRound}
          title="No roles assigned"
          description="This user has no app roles. Assign a role to grant them access to an app with specific permissions."
          actionLabel="Assign Role"
          onAction={onAssignRole}
        />
      ) : (
        <div className={`${card.base} overflow-hidden`}>
          <table className="w-full">
            <thead>
              <tr className="bg-surface-alt/40">
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-verde/70 text-xs font-medium tracking-wider uppercase">
                  <span className="inline-flex items-center">
                    App Key
                    <InfoTooltip content="The unique identifier of the app this role belongs to." />
                  </span>
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-verde/70 text-xs font-medium tracking-wider uppercase">
                  <span className="inline-flex items-center">
                    Role Key
                    <InfoTooltip content="The permission level within the app (e.g. admin, member)." />
                  </span>
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-verde/70 text-xs font-medium tracking-wider uppercase hidden sm:table-cell">
                  Granted At
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-right text-verde/70 text-xs font-medium tracking-wider uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr
                  key={`${role.app_key}-${role.role_key}`}
                  className="border-t border-areia/10 hover:bg-surface-alt/30"
                >
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-preto font-mono">
                    {role.app_key}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-preto">
                    <Badge variant="default">{role.role_key}</Badge>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-verde hidden sm:table-cell">
                    {formatDate(role.granted_at)}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRevokeRole(role)}
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

export default function UserDetailPage() {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()

  const [user, setUser] = useState<UserListResponse | null>(null)
  const [userLoading, setUserLoading] = useState(true)
  const [roles, setRoles] = useState<UserRoleResponse[]>([])
  const [rolesLoading, setRolesLoading] = useState(true)

  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [apps, setApps] = useState<AppResponse[]>([])
  const [selectedAppKey, setSelectedAppKey] = useState("")
  const [selectedRoleKey, setSelectedRoleKey] = useState("")
  const [assigning, setAssigning] = useState(false)
  const [availableRoles, setAvailableRoles] = useState<AppRoleResponse[]>([])
  const [rolesForAppLoading, setRolesForAppLoading] = useState(false)

  const [revokingRole, setRevokingRole] = useState<UserRoleResponse | null>(
    null,
  )
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

  async function fetchUser() {
    if (!userId) return
    try {
      const { data } = await usersAPI.get(userId)
      setUser(data)
    } catch {
      toast.error("Failed to load user")
    } finally {
      setUserLoading(false)
    }
  }

  async function fetchRoles() {
    if (!userId) return
    try {
      const { data } = await usersAPI.listRoles(userId)
      setRoles(data)
    } catch {
      toast.error("Failed to load roles")
    } finally {
      setRolesLoading(false)
    }
  }

  useEffect(() => {
    fetchUser()
    fetchRoles()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  async function handleToggleActive() {
    if (!userId || !user) return
    try {
      const { data } = await usersAPI.update(userId, {
        is_active: !user.is_active,
      })
      setUser(data)
      toast.success(
        data.is_active ? "User activated" : "User deactivated",
      )
    } catch {
      toast.error("Failed to update user")
    }
  }

  async function handleToggleAdmin() {
    if (!userId || !user) return
    try {
      const { data } = await usersAPI.update(userId, {
        is_platform_admin: !user.is_platform_admin,
      })
      setUser(data)
      toast.success(
        data.is_platform_admin
          ? "User is now a platform admin"
          : "Platform admin removed",
      )
    } catch {
      toast.error("Failed to update user")
    }
  }

  async function handleDeleteUser() {
    if (!userId) return
    try {
      await usersAPI.delete(userId)
      toast.success("User deleted")
      navigate("/app/users")
    } catch {
      toast.error("Failed to delete user")
    }
  }

  async function openAssignDialog() {
    setSelectedAppKey("")
    setSelectedRoleKey("")
    setAssignDialogOpen(true)
    if (apps.length === 0) {
      try {
        const { data } = await appsAPI.list()
        setApps(data.filter((a) => a.is_active))
      } catch {
        toast.error("Failed to load apps")
      }
    }
  }

  async function handleAppChange(appKey: string) {
    setSelectedAppKey(appKey)
    setSelectedRoleKey("")
    setAvailableRoles([])
    const app = apps.find((a) => a.app_key === appKey)
    if (!app) return
    setRolesForAppLoading(true)
    try {
      const { data } = await appsAPI.listRoles(app.id)
      setAvailableRoles(data)
    } catch {
      toast.error("Failed to load roles for this app")
    } finally {
      setRolesForAppLoading(false)
    }
  }

  async function handleAssignRole() {
    if (!userId || !selectedAppKey || !selectedRoleKey) return
    setAssigning(true)
    try {
      await rolesAPI.assign({
        target_user_id: userId,
        app_key: selectedAppKey,
        role_key: selectedRoleKey,
      })
      toast.success("Role assigned")
      setAssignDialogOpen(false)
      await fetchRoles()
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response
        ?.status
      if (status === 409) {
        toast.error("This role is already assigned to the user")
      } else {
        toast.error("Failed to assign role")
      }
    } finally {
      setAssigning(false)
    }
  }

  async function handleRevokeRole() {
    if (!userId || !revokingRole) return
    try {
      await rolesAPI.revoke({
        target_user_id: userId,
        app_key: revokingRole.app_key,
        role_key: revokingRole.role_key,
      })
      toast.success("Role revoked")
      setRevokingRole(null)
      await fetchRoles()
    } catch {
      toast.error("Failed to revoke role")
    }
  }

  if (userLoading) {
    return <LoadingSpinner />
  }

  if (!user) {
    return (
      <div className="p-6 md:p-8">
        <p className="text-verde">User not found.</p>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 lg:p-10 space-y-6">
      <div>
        <button
          onClick={() => navigate("/app/users")}
          className="inline-flex items-center gap-1 text-sm text-verde/60 hover:text-preto transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Users
        </button>
        <h1 className="text-2xl font-semibold text-preto tracking-tight flex items-center">
          {user.display_name || user.email}
          <InfoTooltip content="View and manage this user's account settings and app role assignments." />
        </h1>
      </div>

      <UserInfoCard
        user={user}
        onToggleActive={handleToggleActive}
        onToggleAdmin={handleToggleAdmin}
        onDelete={() => setDeleteConfirmOpen(true)}
      />

      <RolesTable
        roles={roles}
        loading={rolesLoading}
        onAssignRole={openAssignDialog}
        onRevokeRole={setRevokingRole}
      />

      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Role</DialogTitle>
            <DialogDescription>
              Grant this user a role in one of the platform apps.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 pt-1">
            <div className="space-y-1.5">
              <Label>
                <span className="inline-flex items-center">
                  App
                  <InfoTooltip content="Select the app to assign a role for." />
                </span>
              </Label>
              <Select
                value={selectedAppKey}
                onValueChange={handleAppChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an app" />
                </SelectTrigger>
                <SelectContent>
                  {apps.map((app) => (
                    <SelectItem key={app.id} value={app.app_key}>
                      {app.name} ({app.app_key})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>
                <span className="inline-flex items-center">
                  Role
                  <InfoTooltip content="The permission level to grant within this app." />
                </span>
              </Label>
              {rolesForAppLoading ? (
                <p className="text-sm text-verde">Loading roles...</p>
              ) : (
                <Select
                  value={selectedRoleKey}
                  onValueChange={setSelectedRoleKey}
                  disabled={!selectedAppKey}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={selectedAppKey ? "Select a role" : "Select an app first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRoles.map((role) => (
                      <SelectItem key={role.id} value={role.role_key}>
                        {role.label} ({role.role_key})
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
              onClick={() => setAssignDialogOpen(false)}
              disabled={assigning}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssignRole}
              disabled={assigning || !selectedAppKey || !selectedRoleKey}
            >
              {assigning ? "Assigning..." : "Assign Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={revokingRole !== null}
        onOpenChange={(open) => {
          if (!open) setRevokingRole(null)
        }}
        title="Revoke Role"
        description={`Are you sure you want to revoke the "${revokingRole?.role_key}" role for "${revokingRole?.app_key}" from this user? They will lose all permissions associated with this role.`}
        confirmLabel="Revoke"
        variant="destructive"
        onConfirm={handleRevokeRole}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete User"
        description={`Are you sure you want to permanently delete "${user.display_name || user.email}"? This will remove the user and all their roles, tokens, and access requests. This action cannot be undone.`}
        confirmLabel="Delete User"
        variant="destructive"
        onConfirm={handleDeleteUser}
      />
    </div>
  )
}
