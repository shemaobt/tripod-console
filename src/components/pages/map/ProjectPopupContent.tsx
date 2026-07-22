import { useNavigate } from "react-router"
import { MapPin, ArrowRight } from "lucide-react"
import type { PhaseStatus, ProjectResponse, ProjectPhaseResponse } from "@/types"

export const TELHA = "#BE4A01"

const PHASE_DOT: Record<PhaseStatus, string> = {
  not_started: "bg-st-idle",
  in_progress: "bg-st-info",
  completed: "bg-st-ok",
  blocked: "bg-st-warn",
}

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

  const activePhaseId = phases.find((p) => p.status === "in_progress")?.phase_id
  const completed = phases.filter((p) => p.status === "completed").length

  const meta = [
    languageName,
    `${project.team_size} team`,
    phases.length > 0 ? `${completed}/${phases.length} completed` : null,
  ]
    .filter(Boolean)
    .join(" · ")

  return (
    <div className="w-[252px] max-w-full font-sans">
      <h3 className="text-[15px] font-bold leading-snug text-fg-strong">{project.name}</h3>

      {locationLine && (
        <div className="mt-1 flex items-center gap-1.5 text-[12px] text-fg-muted">
          <MapPin className="h-[13px] w-[13px] flex-none" strokeWidth={1.75} />
          <span className="truncate">{locationLine}</span>
        </div>
      )}

      {project.description && (
        <p className="mt-2.5 line-clamp-3 text-[12.5px] leading-relaxed text-fg-muted">
          {project.description}
        </p>
      )}

      {phases.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {phases.map((phase) => {
            const active = phase.phase_id === activePhaseId
            return (
              <span
                key={phase.phase_id}
                className={
                  active
                    ? "inline-flex items-center gap-1.5 rounded-full bg-accent px-2.5 py-1 text-[11px] font-semibold text-white"
                    : "inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-fg"
                }
              >
                <span
                  className={`h-1.5 w-1.5 flex-none rounded-full ${
                    active ? "bg-white/85" : PHASE_DOT[phase.status]
                  }`}
                />
                {phase.phase_name}
              </span>
            )
          })}
        </div>
      )}

      <p className="mt-3 border-t border-line pt-2.5 text-[12px] text-fg-subtle">{meta}</p>

      <button
        type="button"
        onClick={() => navigate(`/app/projects/${project.id}`)}
        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-[12px] bg-accent px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-accent-hover"
      >
        Open project
        <ArrowRight className="h-[15px] w-[15px]" strokeWidth={2} />
      </button>
    </div>
  )
}
