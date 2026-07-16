import { useNavigate } from "react-router"
import type { UserListResponse, UserRoleResponse, AppResponse, UserRole } from "@/types"
import { cn } from "@/utils/cn"
import { Badge } from "@/components/ui/badge"
import { card } from "@/styles"
import { UserAvatar } from "./UserAvatar"

interface UserCardProps {
  user: UserListResponse
  roles: UserRoleResponse[]
  apps: AppResponse[]
}

const roleMeta: Record<UserRole, { variant: "admin" | "manager" | "member"; label: string }> = {
  platform_admin: { variant: "admin", label: "Admin" },
  manager: { variant: "manager", label: "Manager" },
  member: { variant: "member", label: "Member" },
}

function getAppsLine(roles: UserRoleResponse[], apps: AppResponse[]) {
  const appKeys = [...new Set(roles.map((r) => r.app_key))]
  if (appKeys.length === 0) return "No app access"
  if (appKeys.length <= 2) {
    return appKeys.map((key) => apps.find((a) => a.app_key === key)?.name ?? key).join(", ")
  }
  return `${appKeys.length} apps`
}

export function UserCard({ user, roles, apps }: UserCardProps) {
  const navigate = useNavigate()
  const role = user.role ?? (user.is_platform_admin ? "platform_admin" : "member")
  const { variant, label } = roleMeta[role]
  const appsLine = getAppsLine(roles, apps)

  return (
    <div
      className={cn(card.interactive, "p-4 flex items-center gap-3")}
      onClick={() => navigate(`/app/users/${user.id}`)}
    >
      <UserAvatar
        name={user.display_name}
        email={user.email}
        avatarUrl={user.avatar_url}
        size="md"
      />

      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        <span className="text-sm font-semibold text-fg-strong truncate">
          {user.display_name || user.email}
        </span>
        {user.display_name && (
          <span className="text-[11.5px] text-fg-subtle truncate">{user.email}</span>
        )}

        <div className="flex items-center gap-2 mt-1 min-w-0">
          <Badge variant={variant}>{label}</Badge>
          <span className="text-[11px] text-fg-subtle truncate">{appsLine}</span>
          {!user.is_active && (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-st-warn shrink-0">
              <span className="w-[7px] h-[7px] rounded-full bg-st-warn" />
              Inactive
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
