import type { PhaseStatus } from "./phase"

export interface Journey {
  id: string
  name: string
  description: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  phase_count: number
  project_count: number
}

export interface JourneyCreate {
  name: string
  description?: string | null
}

export interface JourneyUpdate {
  name?: string
  description?: string | null
}

export interface PhaseCategory {
  id: string
  name: string
  color: string
  icon: string
  phase_count: number
}

export interface PhaseCategoryCreate {
  name: string
  color: string
  icon: string
}

export interface PhaseCategoryUpdate {
  name?: string
  color?: string
  icon?: string
}

export type DerivedPhaseStatus = PhaseStatus | "ready" | "waiting"

export interface PhaseStatusLogEntry {
  id: string
  project_id: string
  phase_id: string
  from_status: PhaseStatus
  to_status: PhaseStatus
  note: string | null
  changed_by: string | null
  changed_by_name: string
  is_admin_author: boolean
  created_at: string
}
