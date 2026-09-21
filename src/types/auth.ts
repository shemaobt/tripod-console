export interface User {
  id: string
  email: string
  display_name: string | null
  avatar_url: string | null
  is_active: boolean
  is_platform_admin: boolean
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface AuthResponse {
  user: User
  tokens: TokenResponse
}

export interface LoginRequest {
  email: string
  password: string
}

export interface TokenRefreshRequest {
  refresh_token: string
}

export interface MyRoleResponse {
  app_key: string
  role_key: string
}

export interface MyManagedOrgsResponse {
  managed_org_ids: string[]
}

export interface MyManagedProjectsResponse {
  managed_project_ids: string[]
}
