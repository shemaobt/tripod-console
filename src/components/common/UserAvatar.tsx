import { useState } from "react"
import { cn } from "@/utils/cn"
import { avatarColors, initialsOf } from "@/utils/avatar"

const sizeClasses = {
  xs: "h-8 w-8 text-[11px]",
  sm: "h-9 w-9 text-xs",
  md: "h-11 w-11 text-sm",
  lg: "h-14 w-14 text-base",
} as const

interface UserAvatarProps {
  id?: string
  name: string | null
  email: string
  avatarUrl: string | null
  size?: keyof typeof sizeClasses
  className?: string
}

export function UserAvatar({ id, name, email, avatarUrl, size = "md", className }: UserAvatarProps) {
  const [imgError, setImgError] = useState(false)
  const displayName = name || email
  const showImage = Boolean(avatarUrl) && !imgError
  const colors = avatarColors(id ?? "", displayName)

  return (
    <div
      className={cn(
        "rounded-full shrink-0 overflow-hidden grid place-items-center font-bold",
        sizeClasses[size],
        className,
      )}
      style={showImage ? undefined : { backgroundColor: colors.bg, color: colors.fg }}
    >
      {showImage ? (
        <img
          src={avatarUrl ?? undefined}
          alt={displayName}
          className="h-full w-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <span>{initialsOf(displayName)}</span>
      )}
    </div>
  )
}
