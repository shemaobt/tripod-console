export interface LanguageResponse {
  id: string
  name: string
  code: string
  created_by: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface LanguageProjectRef {
  id: string
  name: string
}

export interface LanguageStatsResponse {
  language_id: string
  project_count: number
  projects: LanguageProjectRef[]
}

export interface LanguageCreate {
  name: string
  code: string
}

export interface LanguageUpdate {
  name?: string
  code?: string
}
