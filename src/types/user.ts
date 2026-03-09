export interface UserListResponse {
  id: string
  email: string
  display_name: string | null
  avatar_url: string | null
  is_active: boolean
  is_platform_admin: boolean
  created_at: string
}

export interface UserUpdate {
  is_active?: boolean
  is_platform_admin?: boolean
  avatar_url?: string | null
}

export interface UserRoleResponse {
  app_key: string
  role_key: string
  granted_at: string
}
