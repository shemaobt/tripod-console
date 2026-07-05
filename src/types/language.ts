export interface LanguageResponse {
  id: string
  name: string
  code: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface LanguageStatsResponse {
  project_count: number
}

export interface LanguageCreate {
  name: string
  code: string
}

export interface LanguageUpdate {
  name?: string
  code?: string
}
