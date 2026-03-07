export interface ProjectResponse {
  id: string
  name: string
  description: string | null
  language_id: string
  latitude: number | null
  longitude: number | null
  location_display_name: string | null
  created_at: string
  updated_at: string
}

export interface ProjectCreate {
  name: string
  description?: string | null
  language_id: string
  latitude?: number | null
  longitude?: number | null
  location_display_name?: string | null
}

export interface ProjectUpdate {
  name?: string
  description?: string | null
  language_id?: string
}

export interface ProjectLocationUpdate {
  latitude: number | null
  longitude: number | null
  location_display_name?: string | null
}

export interface ProjectUserAccessResponse {
  id: string
  project_id: string
  user_id: string
  granted_at: string
}

export interface ProjectOrganizationAccessResponse {
  id: string
  project_id: string
  organization_id: string
  granted_at: string
}

export interface ProjectGrantUserAccess {
  user_id: string
}

export interface ProjectGrantOrganizationAccess {
  organization_id: string
}
