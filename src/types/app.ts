export interface AppResponse {
  id: string
  app_key: string
  name: string
  description: string | null
  icon_url: string | null
  app_url: string | null
  ios_url: string | null
  android_url: string | null
  platform: string | null
  is_active: boolean
  auto_approve: boolean
  created_at: string
}

export interface AppCreate {
  app_key: string
  name: string
  description?: string | null
  icon_url?: string | null
  app_url?: string | null
  ios_url?: string | null
  android_url?: string | null
  platform?: string | null
  is_active?: boolean
  auto_approve?: boolean
}

export interface AppUpdate {
  name?: string
  description?: string | null
  icon_url?: string | null
  app_url?: string | null
  ios_url?: string | null
  android_url?: string | null
  platform?: string | null
  is_active?: boolean
  auto_approve?: boolean
}

export interface UserAppResponse {
  id: string
  app_key: string
  name: string
  description: string | null
  icon_url: string | null
  app_url: string | null
  ios_url: string | null
  android_url: string | null
  platform: string | null
  is_active: boolean
  created_at: string
  roles: string[]
  is_platform_admin: boolean
}

export interface AppRoleResponse {
  id: string
  role_key: string
  label: string
  description: string | null
  is_system: boolean
  created_at: string
}
