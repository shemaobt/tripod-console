import { AppWindow, Pencil, Trash2 } from "lucide-react"
import type { AppResponse } from "@/types"
import { cn } from "@/utils/cn"
import { avatarColors, initialsOf } from "@/utils/avatar"
import { platformLabel } from "@/constants/platforms"

export function AppCard({
  app,
  onOpen,
  onEdit,
  onDelete,
}: {
  app: AppResponse
  onOpen: () => void
  onEdit: (e: React.MouseEvent) => void
  onDelete: (e: React.MouseEvent) => void
}) {
  const initials = app.name.trim() ? initialsOf(app.name) : ""
  const tile = avatarColors(app.id, app.name)
  const platforms =
    app.platforms.length > 0
      ? app.platforms.map(platformLabel).join(" · ")
      : "No platforms"

  return (
    <div
      onClick={onOpen}
      className={cn(
        "group relative bg-elevated rounded-[1rem] shadow-[var(--shadow-card)] p-[1.125rem] flex flex-col gap-3 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]",
        !app.is_active && "opacity-70",
      )}
    >
      <div className="flex items-center gap-3">
        {app.icon_url ? (
          <img
            src={app.icon_url}
            alt={app.name}
            className="w-11 h-11 rounded-[0.75rem] object-cover shrink-0"
          />
        ) : (
          <span
            className="w-11 h-11 rounded-[0.75rem] grid place-items-center text-sm font-bold shrink-0"
            style={{ backgroundColor: tile.bg, color: tile.fg }}
          >
            {initials || <AppWindow className="w-5 h-5" strokeWidth={1.75} />}
          </span>
        )}
        <div className="flex flex-col gap-px min-w-0">
          <span className="text-[0.90625rem] font-semibold text-fg-strong truncate">
            {app.name}
          </span>
          <span className="font-mono text-[0.6875rem] text-fg-subtle truncate">
            {app.app_key}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 border-t border-line pt-3">
        <span className="inline-flex items-center gap-1.5 text-xs text-fg-muted">
          <span
            className={cn(
              "w-[0.4375rem] h-[0.4375rem] rounded-full",
              app.is_active ? "bg-st-ok" : "bg-st-idle",
            )}
          />
          {app.is_active ? "Active" : "Inactive"}
        </span>
        <span className="text-xs text-fg-subtle ml-auto truncate">{platforms}</span>
      </div>

      {app.auto_approve && (
        <span className="self-start text-[0.65625rem] font-bold tracking-[0.08em] uppercase text-st-ok bg-muted rounded-full px-2.5 py-[0.1875rem]">
          Auto-approve on
        </span>
      )}

      <div className="absolute top-2.5 right-2.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onEdit}
          title="Edit app"
          className="w-[1.875rem] h-[1.875rem] rounded-[0.5625rem] grid place-items-center text-fg-subtle hover:bg-muted hover:text-fg-strong transition-colors"
        >
          <Pencil className="w-[0.9375rem] h-[0.9375rem]" strokeWidth={1.75} />
        </button>
        <button
          onClick={onDelete}
          title="Delete app"
          className="w-[1.875rem] h-[1.875rem] rounded-[0.5625rem] grid place-items-center text-fg-subtle hover:bg-accent-soft hover:text-on-accent-soft transition-colors"
        >
          <Trash2 className="w-[0.9375rem] h-[0.9375rem]" strokeWidth={1.75} />
        </button>
      </div>
    </div>
  )
}
