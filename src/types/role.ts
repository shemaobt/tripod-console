export interface RoleAssignRequest {
  target_user_id: string
  app_key: string
  role_key: string
}

export interface RoleRevokeRequest {
  target_user_id: string
  app_key: string
  role_key: string
}

export interface RoleAssignmentResponse {
  user_id: string
  app_key: string
  role_key: string
  granted_at: string
  revoked_at: string | null
}

export interface RoleCheckResponse {
  allowed: boolean
}
