import { useState } from "react"
import { cn } from "@/utils/cn"

const sizeClasses = {
  sm: "h-9 w-9 text-xs",
  md: "h-11 w-11 text-sm",
  lg: "h-14 w-14 text-base",
} as const

interface UserAvatarProps {
  name: string | null
  email: string
  avatarUrl: string | null
  size?: keyof typeof sizeClasses
  className?: string
}

export function UserAvatar({ name, email, avatarUrl, size = "md", className }: UserAvatarProps) {
  const [imgError, setImgError] = useState(false)
  const displayName = name || email
  const initials = displayName
    .split(/[\s@]+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("")

  const showImage = avatarUrl && !imgError

  return (
    <div
      className={cn(
        "rounded-full shrink-0 overflow-hidden grid place-items-center font-bold",
        !showImage && "bg-muted text-fg-strong",
        sizeClasses[size],
        className,
      )}
    >
      {showImage ? (
        <img
          src={avatarUrl}
          alt={displayName}
          className="h-full w-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  )
}
