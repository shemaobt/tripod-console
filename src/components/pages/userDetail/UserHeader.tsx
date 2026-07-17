import type { UserListResponse } from "@/types"
import { cn } from "@/utils/cn"
import { avatarColors, initialsOf } from "@/utils/avatar"
import { Badge } from "@/components/ui/badge"
import { getUserRole, roleMeta } from "./roles"

export function UserHeader({
  user,
  avatarUploading,
  onPickPhoto,
}: {
  user: UserListResponse
  avatarUploading: boolean
  onPickPhoto: () => void
}) {
  const { variant, label } = roleMeta[getUserRole(user)]
  const colors = avatarColors(user.id, user.display_name || user.email)
  return (
    <div className="flex items-center gap-4 mb-[22px]">
      <button
        type="button"
        title="Upload photo"
        disabled={avatarUploading}
        onClick={onPickPhoto}
        className={cn(
          "relative grid h-[54px] w-[54px] shrink-0 place-items-center overflow-hidden rounded-full",
          "text-[17px] font-bold transition-shadow",
          "hover:shadow-[0_0_0_3px_var(--color-accent-soft)] disabled:opacity-60",
          user.avatar_url && "bg-muted",
        )}
        style={user.avatar_url ? undefined : { backgroundColor: colors.bg, color: colors.fg }}
      >
        {user.avatar_url ? (
          <img
            src={user.avatar_url}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          initialsOf(user.display_name || user.email)
        )}
      </button>
      <div className="flex flex-col gap-[3px] min-w-0">
        <h3 className="text-[23px] font-bold text-fg-strong tracking-tight truncate">
          {user.display_name || user.email}
        </h3>
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-[13px] text-fg-muted">{user.email}</span>
          <Badge variant={variant} className="whitespace-nowrap">
            {label}
          </Badge>
          {!user.is_active && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-st-warn">
              <span className="h-[7px] w-[7px] rounded-full bg-st-warn" />
              Inactive
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
