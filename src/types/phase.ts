export interface PhaseResponse {
  id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
  project_ids?: string[]
}

export interface PhaseCreate {
  name: string
  description?: string | null
}

export interface PhaseUpdate {
  name?: string
  description?: string | null
}

export interface PhaseDependencyResponse {
  id: string
  phase_id: string
  depends_on_id: string
}

export interface ProjectPhaseResponse {
  id: string
  phase_id: string
  phase_name: string
  phase_description: string | null
  status: string
}
