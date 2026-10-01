export interface PhaseResponse {
  id: string
  name: string
  description: string | null
  journey_id: string | null
  category_id: string | null
  sort_order: number
  icon_url: string | null
  created_at: string
  updated_at: string
  project_ids?: string[]
}

export interface PhaseCreate {
  name: string
  description?: string | null
  journey_id: string
  category_id?: string | null
}

export interface PhaseUpdate {
  name?: string
  description?: string | null
  category_id?: string | null
  icon_url?: string | null
}

export interface PhaseDependencyResponse {
  id: string
  phase_id: string
  depends_on_id: string
}

export type PhaseStatus =
  | "not_started"
  | "in_progress"
  | "delayed"
  | "blocked"
  | "completed"
  | "cancelled"

export const PHASE_STATUSES: PhaseStatus[] = [
  "not_started",
  "in_progress",
  "delayed",
  "blocked",
  "completed",
  "cancelled",
]

export interface ProjectPhaseResponse {
  id: string
  phase_id: string
  phase_name: string
  phase_description: string | null
  status: PhaseStatus
}
