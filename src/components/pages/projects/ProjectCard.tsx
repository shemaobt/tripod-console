import { Pencil, MapPin } from "lucide-react"
import type { ProjectResponse } from "@/types"
import { UserAvatar } from "@/components/common/UserAvatar"
import { avatarColors, initialsOf } from "@/utils/avatar"
import { formatDate } from "@/utils/format"
import { cn } from "@/utils/cn"

const MEMBER_STYLES = ["bg-azul", "bg-verde-claro", "bg-quiet"]

interface ProjectCardProps {
  project: ProjectResponse
  langName?: string
  langCode?: string
  onOpen: () => void
  onEdit: (e: React.MouseEvent) => void
}

export function ProjectCard({ project, langName, langCode, onOpen, onEdit }: ProjectCardProps) {
  const tile = avatarColors(project.id, project.name)
  const locationText =
    project.location_display_name ||
    (project.latitude != null && project.longitude != null
      ? `${project.latitude.toFixed(2)}, ${project.longitude.toFixed(2)}`
      : null)
  const memberCount = project.team_size
  const dots = Math.min(memberCount, 3)
  const preview = project.members_preview?.slice(0, 4) ?? []
  const phasesTotal = project.phases_total
  const phasesDone = project.phases_completed ?? 0
  const pct = phasesTotal ? Math.round((phasesDone / phasesTotal) * 100) : 0

  return (
    <article
      onClick={onOpen}
      className="group relative flex cursor-pointer flex-col gap-2.5 rounded-[18px] bg-elevated p-5 shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]"
    >
      <button
        type="button"
        onClick={onEdit}
        aria-label={`Edit ${project.name}`}
        className="absolute right-2.5 top-2.5 grid h-[30px] w-[30px] place-items-center rounded-[9px] bg-elevated text-fg-subtle opacity-0 shadow-[var(--shadow-sm)] transition-all hover:bg-muted hover:text-fg-strong group-hover:opacity-100"
      >
        <Pencil className="h-[15px] w-[15px]" strokeWidth={1.75} />
      </button>

      <div className="flex items-start justify-between gap-2.5">
        <div className="flex min-w-0 items-center gap-2.5">
          {project.image_url ? (
            <img
              src={project.image_url}
              alt=""
              className="h-10 w-10 flex-none rounded-[12px] object-cover"
            />
          ) : (
            <span
              className="grid h-10 w-10 flex-none place-items-center rounded-[12px] text-xs font-bold"
              style={{ backgroundColor: tile.bg, color: tile.fg }}
            >
              {initialsOf(project.name)}
            </span>
          )}
          <span className="text-[15px] font-semibold leading-snug text-fg-strong">
            {project.name}
          </span>
        </div>
        <span className="flex-none rounded-md bg-muted px-2 py-0.5 font-mono text-[11.5px] text-fg-muted">
          {langCode || "—"}
        </span>
      </div>

      <span className="inline-flex items-center gap-1.5 text-xs text-fg-subtle">
        <MapPin className="h-[13px] w-[13px] flex-none" strokeWidth={1.75} />
        {locationText || "No location set"} · {langName ?? "—"}
      </span>

      <p className="line-clamp-2 text-[13px] leading-relaxed text-fg-muted">
        {project.description || "No description yet."}
      </p>

      {phasesTotal != null && (
        <div className="mt-0.5 flex flex-col gap-1.5">
          <div className="h-[6px] overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-verde-claro"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-[11.5px] text-fg-subtle">
            {phasesTotal === 0
              ? "No phases attached"
              : `${phasesDone}/${phasesTotal} phases completed`}
          </span>
        </div>
      )}

      <div className="mt-1 flex items-center justify-between border-t border-line pt-3">
        <div className="flex items-center gap-2">
          {preview.length > 0 ? (
            <div className="flex items-center">
              {preview.map((member) => (
                <UserAvatar
                  key={member.user_id}
                  id={member.user_id}
                  name={member.display_name}
                  email={member.display_name ?? member.user_id}
                  avatarUrl={member.avatar_url}
                  size="xs"
                  className="-ml-2 h-[26px] w-[26px] border-2 border-elevated text-[9.5px] first:ml-0"
                />
              ))}
            </div>
          ) : (
            dots > 0 && (
              <div className="flex">
                {Array.from({ length: dots }).map((_, i) => (
                  <span
                    key={i}
                    className={cn(
                      "-ml-2 h-[26px] w-[26px] rounded-full border-2 border-elevated first:ml-0",
                      MEMBER_STYLES[i % MEMBER_STYLES.length]
                    )}
                  />
                ))}
              </div>
            )
          )}
          <span className="text-[11.5px] text-fg-subtle">
            {memberCount} member{memberCount !== 1 ? "s" : ""}
          </span>
        </div>
        <span className="text-[11px] text-fg-subtle">Updated {formatDate(project.updated_at)}</span>
      </div>
    </article>
  )
}
