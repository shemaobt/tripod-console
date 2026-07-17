import { useNavigate } from "react-router"
import type { UserListResponse, UserRoleResponse } from "@/types"
import { cn } from "@/utils/cn"
import { Badge } from "@/components/ui/badge"
import { card } from "@/styles"
import { UserAvatar } from "@/components/common/UserAvatar"
import { getUserRole, roleMeta } from "@/components/pages/userDetail/roles"

interface UserCardProps {
  user: UserListResponse
  roles: UserRoleResponse[]
}

export function UserCard({ user, roles }: UserCardProps) {
  const navigate = useNavigate()
  const { variant, label } = roleMeta[getUserRole(user)]

  return (
    <div
      className={cn(card.interactive, "p-4 flex items-center gap-3")}
      onClick={() => navigate(`/app/users/${user.id}`)}
    >
      <UserAvatar
        id={user.id}
        name={user.display_name}
        email={user.email}
        avatarUrl={user.avatar_url}
        className="h-[42px] w-[42px] text-[13px]"
      />

      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        <span className="text-sm font-semibold text-fg-strong truncate">
          {user.display_name || user.email}
        </span>
        {user.display_name && (
          <span className="text-[11.5px] text-fg-subtle truncate">{user.email}</span>
        )}

        <div className="flex items-center gap-2 mt-1 min-w-0">
          <Badge variant={variant} className="shrink-0 whitespace-nowrap">
            {label}
          </Badge>
          <span className="text-[11px] text-fg-subtle truncate">
            {roles.length} app role{roles.length === 1 ? "" : "s"}
          </span>
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
