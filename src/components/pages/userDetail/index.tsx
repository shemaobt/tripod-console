import { useEffect, useRef, useState } from "react"
import { useParams, useNavigate } from "react-router"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import {
  usersAPI,
  appsAPI,
  projectsAPI,
  rolesAPI,
  uploadsAPI,
} from "@/services/api"
import { useAuth } from "@/contexts/AuthContext"
import type {
  UserListResponse,
  UserRole,
  UserRoleUpdate,
  UserRoleResponse,
  AppResponse,
  AppRoleResponse,
  ProjectResponse,
} from "@/types"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { LoadingSpinner } from "@/components/common/LoadingSpinner"
import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { getUserRole, roleChoices } from "./roles"
import { UserHeader } from "./UserHeader"
import { AccountCard } from "./AccountCard"
import { GlobalRoleCard } from "./GlobalRoleCard"
import { AppRolesCard } from "./AppRolesCard"

export default function UserDetailPage() {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()

  const [user, setUser] = useState<UserListResponse | null>(null)
  const [userLoading, setUserLoading] = useState(true)
  const [roles, setRoles] = useState<UserRoleResponse[]>([])
  const [rolesLoading, setRolesLoading] = useState(true)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [avatarUploading, setAvatarUploading] = useState(false)

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

  const [managerDialogOpen, setManagerDialogOpen] = useState(false)
  const [projects, setProjects] = useState<ProjectResponse[]>([])
  const [projectsLoading, setProjectsLoading] = useState(false)
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([])
  const [roleSaving, setRoleSaving] = useState(false)
  const [memberConfirmOpen, setMemberConfirmOpen] = useState(false)

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
      toast.success(data.is_active ? "User activated" : "User deactivated")
    } catch {
      toast.error("Failed to update user")
    }
  }

  function pickPhoto() {
    fileInputRef.current?.click()
  }

  async function handleAvatarFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !userId) return
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"]
    if (!allowed.includes(file.type)) {
      toast.error("Please upload a JPG, PNG, WebP, or SVG image")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5 MB")
      return
    }
    setAvatarUploading(true)
    try {
      const { data } = await uploadsAPI.image(file, "user-avatars")
      const { data: updated } = await usersAPI.update(userId, {
        avatar_url: data.url,
      })
      setUser(updated)
      toast.success("Photo updated")
    } catch {
      toast.error("Failed to upload photo")
    } finally {
      setAvatarUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  async function handleRemovePhoto() {
    if (!userId) return
    setAvatarUploading(true)
    try {
      const { data } = await usersAPI.update(userId, { avatar_url: null })
      setUser(data)
      toast.success("Photo removed")
    } catch {
      toast.error("Failed to remove photo")
    } finally {
      setAvatarUploading(false)
    }
  }

  async function applyRoleUpdate(update: UserRoleUpdate) {
    if (!userId) return false
    setRoleSaving(true)
    try {
      await usersAPI.updateRole(userId, update)
      const roleLabel = roleChoices.find((o) => o.value === update.role)?.label
      toast.success(`User role updated to ${roleLabel}`)
      await fetchUser()
      return true
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })
        ?.response?.data?.detail
      toast.error(detail || "Failed to update role")
      return false
    } finally {
      setRoleSaving(false)
    }
  }

  async function openManagerDialog() {
    setSelectedProjectIds([])
    setManagerDialogOpen(true)
    if (projects.length === 0) {
      setProjectsLoading(true)
      try {
        const { data } = await projectsAPI.list()
        setProjects(data)
      } catch {
        toast.error("Failed to load projects")
      } finally {
        setProjectsLoading(false)
      }
    }
  }

  function handleRoleSelect(role: UserRole) {
    if (!user || role === getUserRole(user)) return
    if (role === "platform_admin") {
      applyRoleUpdate({ role: "platform_admin" })
    } else if (role === "manager") {
      openManagerDialog()
    } else {
      setMemberConfirmOpen(true)
    }
  }

  function toggleProjectSelection(projectId: string) {
    setSelectedProjectIds((prev) =>
      prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId],
    )
  }

  async function handleConfirmManager() {
    const ok = await applyRoleUpdate({
      role: "manager",
      project_ids: selectedProjectIds,
    })
    if (ok) setManagerDialogOpen(false)
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

  async function ensureAppsLoaded() {
    if (apps.length > 0) return
    try {
      const { data } = await appsAPI.list()
      setApps(data.filter((a) => a.is_active))
    } catch {
      toast.error("Failed to load apps")
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
      setSelectedAppKey("")
      setSelectedRoleKey("")
      setAvailableRoles([])
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
      <div className="mx-auto max-w-[1240px] px-6 pt-8 sm:px-10">
        <p className="text-fg-muted">User not found.</p>
      </div>
    )
  }

  const isSelf = currentUser?.id === userId

  return (
    <div className="mx-auto max-w-[1240px] px-6 pb-14 pt-8 sm:px-10">
      <button
        type="button"
        onClick={() => navigate("/app/users")}
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-fg-muted transition-colors hover:text-fg-strong"
      >
        <ArrowLeft className="h-[15px] w-[15px]" strokeWidth={1.75} />
        Users
      </button>

      <UserHeader
        user={user}
        avatarUploading={avatarUploading}
        onPickPhoto={pickPhoto}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/svg+xml"
        className="hidden"
        onChange={handleAvatarFile}
      />

      <div className="mb-[18px] grid grid-cols-1 items-start gap-[18px] lg:grid-cols-[1fr_1.3fr]">
        <AccountCard
          user={user}
          isSelf={isSelf}
          avatarUploading={avatarUploading}
          onToggleActive={handleToggleActive}
          onPickPhoto={pickPhoto}
          onRemovePhoto={handleRemovePhoto}
          onDelete={() => setDeleteConfirmOpen(true)}
        />
        <GlobalRoleCard
          currentRole={getUserRole(user)}
          isSelf={isSelf}
          roleSaving={roleSaving}
          onRoleSelect={handleRoleSelect}
        />
      </div>

      <AppRolesCard
        roles={roles}
        loading={rolesLoading}
        apps={apps}
        availableRoles={availableRoles}
        selectedAppKey={selectedAppKey}
        selectedRoleKey={selectedRoleKey}
        rolesForAppLoading={rolesForAppLoading}
        assigning={assigning}
        onEnsureApps={ensureAppsLoaded}
        onAppChange={handleAppChange}
        onRoleChange={setSelectedRoleKey}
        onAssign={handleAssignRole}
        onRevoke={setRevokingRole}
      />

      <Dialog open={managerDialogOpen} onOpenChange={setManagerDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select projects this user will manage</DialogTitle>
            <DialogDescription>
              Managers oversee specific projects. Select at least one project to
              grant this user the manager role.
            </DialogDescription>
          </DialogHeader>
          {projectsLoading ? (
            <p className="text-sm text-fg-muted">Loading projects...</p>
          ) : projects.length === 0 ? (
            <p className="text-sm text-fg-muted">
              No projects available. Create a project before assigning a manager.
            </p>
          ) : (
            <div className="max-h-64 divide-y divide-line overflow-y-auto rounded-xl border border-line">
              {projects.map((project) => (
                <label
                  key={project.id}
                  className="flex cursor-pointer items-center gap-3 px-3 py-2.5 hover:bg-muted"
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-accent"
                    checked={selectedProjectIds.includes(project.id)}
                    onChange={() => toggleProjectSelection(project.id)}
                  />
                  <span className="text-sm text-fg-strong">{project.name}</span>
                </label>
              ))}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setManagerDialogOpen(false)}
              disabled={roleSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmManager}
              disabled={roleSaving || selectedProjectIds.length === 0}
            >
              {roleSaving ? "Saving..." : "Make Manager"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={memberConfirmOpen}
        onOpenChange={setMemberConfirmOpen}
        title="Set Role to Member"
        description={`Are you sure you want to set "${user.display_name || user.email}" as a member? All projects this user currently manages will be demoted to member access.`}
        confirmLabel="Set as Member"
        variant="default"
        onConfirm={() => applyRoleUpdate({ role: "member" })}
      />

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
