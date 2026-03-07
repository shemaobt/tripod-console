export interface LanguageResponse {
  id: string
  name: string
  code: string
  created_at: string
}

export interface LanguageCreate {
  name: string
  code: string
}
