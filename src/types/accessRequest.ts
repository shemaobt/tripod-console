export interface AccessRequestResponse {
  id: string
  user_id: string
  app_key: string
  status: "pending" | "approved" | "rejected"
  note: string | null
  requested_at: string
  reviewed_by: string | null
  reviewed_at: string | null
  review_reason: string | null
}

export interface AccessRequestReview {
  status: "approved" | "rejected"
  reason?: string | null
}
