import { useNavigate } from "react-router"
import type { ProjectResponse, ProjectPhaseResponse } from "@/types"
import { PHASE_STATUS_CONFIG } from "@/constants/phaseStatus"
import { cn } from "@/utils/cn"

export const TELHA = "#BE4A01"

const MAX_CHIPS = 4

export function ProjectPopupContent({
  project,
  languageName,
  phases,
}: {
  project: ProjectResponse
  languageName: string | null
  phases: ProjectPhaseResponse[]
}) {
  const navigate = useNavigate()

  const coords =
    project.latitude != null && project.longitude != null
      ? `${project.latitude.toFixed(2)}, ${project.longitude.toFixed(2)}`
      : null
  const locationLine = [project.location_display_name, coords].filter(Boolean).join(" · ")

  const completed = phases.filter((p) => p.status === "completed").length
  const shownPhases = phases.slice(0, MAX_CHIPS)
  const hiddenPhases = phases.length - shownPhases.length

  const meta = [
    languageName,
    `${project.team_size} team`,
    phases.length > 0 ? `${completed}/${phases.length} completed` : null,
  ]
    .filter(Boolean)
    .join(" · ")

  return (
    <div className="min-w-[210px] max-w-[250px] font-sans">
      <h3 className="text-[14px] font-semibold leading-snug text-fg-strong">{project.name}</h3>

      {locationLine && <p className="mt-0.5 text-[11px] text-fg-subtle">{locationLine}</p>}

      {project.description && (
        <p className="mt-1.5 line-clamp-3 text-[12px] leading-relaxed text-fg-muted">
          {project.description}
        </p>
      )}

      {phases.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {shownPhases.map((phase) => {
            const status = PHASE_STATUS_CONFIG[phase.status]
            return (
              <span
                key={phase.phase_id}
                title={status.label}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2 py-[3px] text-[10.5px] font-semibold",
                  status.pill,
                )}
              >
                <span className={cn("h-1.5 w-1.5 flex-none rounded-full", status.dot)} />
                {phase.phase_name}
              </span>
            )
          })}
          {hiddenPhases > 0 && (
            <span className="inline-flex items-center rounded-full bg-muted px-2 py-[3px] text-[10.5px] font-semibold text-fg-muted">
              +{hiddenPhases}
            </span>
          )}
        </div>
      )}

      <p className="mt-2 text-[11px] text-fg-subtle">{meta}</p>

      <button
        type="button"
        onClick={() => navigate(`/app/projects/${project.id}`)}
        className="mt-2.5 rounded-full bg-accent px-3.5 py-[7px] text-[12px] font-semibold text-white transition-colors hover:bg-accent-hover"
      >
        Open project
      </button>
    </div>
  )
}
