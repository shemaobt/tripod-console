export interface OrganizationResponse {
  id: string
  name: string
  slug: string
  description: string | null
  logo_url: string | null
  manager_id: string | null
  created_at: string
  updated_at: string
}

export interface OrganizationCreate {
  name: string
  slug: string
  description?: string | null
  logo_url?: string | null
  manager_id?: string | null
}

export interface OrganizationUpdate {
  name?: string
  slug?: string
  description?: string | null
  logo_url?: string | null
  manager_id?: string | null
}

export interface OrganizationMemberAdd {
  user_id: string
  role?: string
}

export interface OrganizationMemberResponse {
  id: string
  user_id: string
  organization_id: string
  role: string
  joined_at: string
  email: string
  display_name: string | null
}
