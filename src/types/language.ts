export interface LanguageResponse {
  id: string
  name: string
  code: string
  created_at: string
  updated_at: string
}

export interface LanguageCreate {
  name: string
  code: string
}

export interface LanguageUpdate {
  name?: string
  code?: string
}
