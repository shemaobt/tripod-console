export type ChangeRequestKind = "create_project" | "create_language" | "edit_language"

export interface ChangeRequestResponse {
  id: string
  kind: ChangeRequestKind
  requester_user_id: string
  requester_display_name: string | null
  requester_email: string
  status: "pending" | "approved" | "rejected"
  name: string | null
  code: string | null
  description: string | null
  language_id: string | null
  new_language_name: string | null
  new_language_code: string | null
  grant_manager_access: boolean
  reviewed_by: string | null
  reviewed_at: string | null
  review_reason: string | null
  created_entity_id: string | null
  requested_at: string
}

export interface ChangeRequestCreate {
  kind: ChangeRequestKind
  name?: string
  code?: string
  description?: string
  language_id?: string
  new_language_name?: string
  new_language_code?: string
}

export interface ChangeRequestReview {
  status: "approved" | "rejected"
  reason?: string | null
  grant_manager_access?: boolean
}
