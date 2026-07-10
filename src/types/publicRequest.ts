export interface PublicLanguageOption {
  id: string
  name: string
  code: string
}

export interface PublicLanguageRequestCreate {
  requester_name: string
  requester_email: string
  name: string
  code: string
  recaptcha_token?: string
}

export interface PublicProjectRequestCreate {
  requester_name: string
  requester_email: string
  name: string
  description?: string | null
  language_id?: string
  new_language_name?: string
  new_language_code?: string
  recaptcha_token?: string
}

export interface PublicRequestResponse {
  id: string
  kind: string
  status: string
  requester_name: string
  requester_email: string
  name: string
  code: string | null
  description: string | null
  language_id: string | null
  new_language_name: string | null
  new_language_code: string | null
  requested_at: string
}
