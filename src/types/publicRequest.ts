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
  description?: string | null
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

export type PublicRequestKind = "create_language" | "create_project"

export type PublicRequestStatus = "pending" | "approved" | "rejected"

export interface PublicRequestResponse {
  id: string
  kind: PublicRequestKind
  status: PublicRequestStatus
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

export interface PublicRequestAdminResponse extends PublicRequestResponse {
  reviewed_by: string | null
  reviewed_at: string | null
  review_reason: string | null
  created_entity_id: string | null
}

export interface PublicRequestReview {
  status: "approved" | "rejected"
  reason?: string | null
}
