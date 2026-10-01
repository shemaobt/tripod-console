import { ArrowUpRight } from "lucide-react"
import type { UserAppResponse } from "@/types"
import { cn } from "@/utils/cn"
import { avatarColors, initialsOf } from "@/utils/avatar"
import { platformLabel } from "@/constants/platforms"

interface LaunchLink {
  label: string
  href: string
}

export function AppCard({ app }: { app: UserAppResponse }) {
  const tile = avatarColors(app.id, app.name)
  const roleLabel = app.is_platform_admin
    ? "Platform admin"
    : app.roles.length > 0
      ? app.roles.join(" · ")
      : null

  const launchLinks: LaunchLink[] = []
  if (app.is_active) {
    if (app.app_url) launchLinks.push({ label: "Web", href: app.app_url })
    if (app.ios_url) launchLinks.push({ label: "iOS", href: app.ios_url })
    if (app.android_url) launchLinks.push({ label: "Android", href: app.android_url })
  }

  return (
    <div
      className={cn(
        "border border-line rounded-[0.875rem] p-3.5 flex flex-col gap-2.5",
        !app.is_active && "opacity-60",
      )}
    >
      <div className="flex items-center gap-[0.6875rem]">
        {app.icon_url ? (
          <img
            src={app.icon_url}
            alt={app.name}
            className="w-[2.625rem] h-[2.625rem] rounded-[0.75rem] object-cover shrink-0"
          />
        ) : (
          <span
            className="w-[2.625rem] h-[2.625rem] rounded-[0.75rem] grid place-items-center text-[0.8125rem] font-bold shrink-0"
            style={{ backgroundColor: tile.bg, color: tile.fg }}
          >
            {initialsOf(app.name)}
          </span>
        )}
        <div className="flex flex-col min-w-0 gap-px">
          <span className="text-sm font-semibold text-fg-strong truncate">{app.name}</span>
          <span className="text-[0.71875rem] text-fg-subtle truncate">
            {app.platforms.length > 0
              ? app.platforms.map(platformLabel).join(" · ")
              : "No platforms"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {launchLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 bg-inverse text-on-dark rounded-full px-2.5 py-1 text-[0.6875rem] font-semibold hover:bg-preto transition-colors"
          >
            {link.label}
            <ArrowUpRight className="w-2.5 h-2.5" strokeWidth={2.4} />
          </a>
        ))}
        {roleLabel && (
          <span className="text-[0.6875rem] font-semibold text-fg-muted bg-muted rounded-full px-2.5 py-1">
            {roleLabel}
          </span>
        )}
        {!app.is_active && (
          <span className="text-[0.6875rem] font-semibold text-st-warn">App disabled</span>
        )}
      </div>
    </div>
  )
}
