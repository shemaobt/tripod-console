import { useNavigate } from "react-router"
import type { PhaseStatus, ProjectResponse, ProjectPhaseResponse } from "@/types"
import { formatDate } from "@/utils/format"

export const TELHA = "#BE4A01"
const VERDE = "#3F3E20"
const AREIA = "#C5C29F"
const AZUL = "#89AAA3"

const PHASE_STATUS_COLORS: Record<PhaseStatus, { bg: string; text: string; dot: string }> = {
  not_started: { bg: `${AREIA}30`, text: VERDE, dot: `${AREIA}` },
  in_progress: { bg: `${AZUL}30`, text: AZUL, dot: AZUL },
  completed: { bg: "#777D4530", text: "#777D45", dot: "#777D45" },
  blocked: { bg: "#FEE2E2", text: "#B91C1C", dot: "#B91C1C" },
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

  return (
    <div style={{ minWidth: 220, maxWidth: 300, fontFamily: "Montserrat, sans-serif" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: `${AZUL}33`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={AZUL} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
            <path d="M9 2v4" />
            <path d="M15 2v4" />
            <path d="M9 14h.01" />
            <path d="M15 14h.01" />
            <path d="M9 18h.01" />
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#0A0703", lineHeight: 1.3 }}>
            {project.name}
          </div>
          {project.location_display_name && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontSize: 12,
                color: VERDE,
                marginTop: 2,
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={VERDE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {project.location_display_name}
            </div>
          )}
        </div>
      </div>

      {project.description && (
        <div
          style={{
            fontSize: 12,
            color: `${VERDE}B3`,
            lineHeight: 1.5,
            marginBottom: 10,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {project.description}
        </div>
      )}

      {phases.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <div style={{ fontSize: 10, color: `${VERDE}99`, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500 }}>
              Phases
            </div>
            <div style={{ fontSize: 10, color: "#777D45", fontWeight: 600 }}>
              {phases.filter((p) => p.status === "completed").length}/{phases.length} completed
            </div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {phases.map((p) => {
              const colors = PHASE_STATUS_COLORS[p.status]
              return (
                <span
                  key={p.phase_id}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "2px 8px",
                    borderRadius: 12,
                    background: colors.bg,
                    color: colors.text,
                    fontSize: 11,
                    fontWeight: 500,
                    lineHeight: 1.4,
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: colors.dot, flexShrink: 0 }} />
                  {p.phase_name}
                </span>
              )
            })}
          </div>
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "6px 12px",
          padding: "10px 0",
          borderTop: `1px solid ${AREIA}40`,
          borderBottom: `1px solid ${AREIA}40`,
          marginBottom: 12,
        }}
      >
        {languageName && (
          <div>
            <div style={{ fontSize: 10, color: `${VERDE}99`, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500 }}>
              Language
            </div>
            <div style={{ fontSize: 12, color: "#0A0703", fontWeight: 500, marginTop: 1 }}>
              {languageName}
            </div>
          </div>
        )}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: `${VERDE}99`, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={VERDE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Team
          </div>
          <div style={{ fontSize: 12, color: "#0A0703", fontWeight: 500, marginTop: 1 }}>
            {project.team_size} {project.team_size === 1 ? "member" : "members"}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: `${VERDE}99`, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500 }}>
            Coordinates
          </div>
          <div style={{ fontSize: 12, color: "#0A0703", fontFamily: "monospace", marginTop: 1 }}>
            {project.latitude?.toFixed(4)}, {project.longitude?.toFixed(4)}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: `${VERDE}99`, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500 }}>
            Created
          </div>
          <div style={{ fontSize: 12, color: "#0A0703", fontWeight: 500, marginTop: 1 }}>
            {formatDate(project.created_at)}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: `${VERDE}99`, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500 }}>
            Updated
          </div>
          <div style={{ fontSize: 12, color: "#0A0703", fontWeight: 500, marginTop: 1 }}>
            {formatDate(project.updated_at)}
          </div>
        </div>
      </div>

      <button
        onClick={() => navigate(`/app/projects/${project.id}`)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          width: "100%",
          padding: "8px 12px",
          borderRadius: 8,
          border: "none",
          background: TELHA,
          color: "#FFFFFF",
          fontSize: 13,
          fontWeight: 600,
          fontFamily: "Montserrat, sans-serif",
          cursor: "pointer",
          transition: "opacity 0.15s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.9" }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = "1" }}
      >
        Open Project
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      </button>
    </div>
  )
}
