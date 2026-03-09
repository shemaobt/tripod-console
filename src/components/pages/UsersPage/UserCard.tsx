import { useNavigate } from "react-router"
import { Calendar, Shield, ChevronRight } from "lucide-react"
import type { UserListResponse, UserRoleResponse, AppResponse } from "@/types"
import { cn } from "@/utils/cn"
import { Badge } from "@/components/ui/badge"
import { card } from "@/styles"
import { formatDate } from "@/utils/format"
import { UserAvatar } from "./UserAvatar"

interface UserCardProps {
  user: UserListResponse
  roles: UserRoleResponse[]
  apps: AppResponse[]
}

function getUniqueApps(roles: UserRoleResponse[], apps: AppResponse[]) {
  const appKeys = [...new Set(roles.map((r) => r.app_key))]
  return appKeys.map((key) => {
    const app = apps.find((a) => a.app_key === key)
    return { key, name: app?.name ?? key }
  })
}

export function UserCard({ user, roles, apps }: UserCardProps) {
  const navigate = useNavigate()
  const userApps = getUniqueApps(roles, apps)

  return (
    <div
      className={cn(card.interactive, "p-5 group")}
      onClick={() => navigate(`/app/users/${user.id}`)}
    >
      <div className="flex items-start gap-4">
        <UserAvatar
          name={user.display_name}
          email={user.email}
          avatarUrl={user.avatar_url}
          size="lg"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="text-sm font-semibold text-preto truncate">
              {user.display_name || user.email}
            </h3>
            <ChevronRight className="h-3.5 w-3.5 text-verde/30 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          </div>

          {user.display_name && (
            <p className="text-xs text-verde/50 truncate">{user.email}</p>
          )}

          <div className="flex items-center gap-2 mt-2.5">
            <Badge variant={user.is_active ? "active" : "inactive"}>
              {user.is_active ? "Active" : "Inactive"}
            </Badge>
            {user.is_platform_admin && (
              <Badge variant="admin">
                <Shield className="h-3 w-3 mr-1" />
                Admin
              </Badge>
            )}
          </div>
        </div>
      </div>

      {userApps.length > 0 && (
        <div className="mt-4 pt-3.5 border-t border-areia/15">
          <p className="text-[10px] uppercase tracking-widest text-verde/40 font-medium mb-2">
            App Access
          </p>
          <div className="flex flex-wrap gap-1.5">
            {userApps.map((app) => (
              <span
                key={app.key}
                className="inline-flex items-center rounded-md bg-azul/10 px-2 py-0.5 text-[11px] font-medium text-azul dark:bg-azul/20 dark:text-azul"
              >
                {app.name}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-1.5 mt-3 text-[11px] text-verde/40">
        <Calendar className="h-3 w-3" />
        Joined {formatDate(user.created_at)}
      </div>
    </div>
  )
}
