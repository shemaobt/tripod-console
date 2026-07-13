import axios from "axios"
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "@/constants/app"
import type {
  AuthResponse,
  TokenResponse,
  User,
  MyRoleResponse,
  MyManagedOrgsResponse,
  MyManagedProjectsResponse,
  UserListResponse,
  UserUpdate,
  UserRoleUpdate,
  UserRoleResponse,
  AppResponse,
  AppCreate,
  AppUpdate,
  UserAppResponse,
  AppRoleResponse,
  LanguageResponse,
  LanguageCreate,
  LanguageUpdate,
  LanguageStatsResponse,
  OrganizationResponse,
  OrganizationCreate,
  OrganizationUpdate,
  OrganizationMemberAdd,
  OrganizationMemberResponse,
  ProjectResponse,
  ProjectCreate,
  ProjectUpdate,
  ProjectLocationUpdate,
  ProjectUserAccessResponse,
  ProjectOrganizationAccessResponse,
  ProjectGrantUserAccess,
  ProjectGrantOrganizationAccess,
  ProjectUserAccessDetailResponse,
  ProjectOrganizationAccessDetailResponse,
  ProjectUserAccessRoleUpdate,
  RoleAssignRequest,
  RoleRevokeRequest,
  RoleAssignmentResponse,
  RoleCheckResponse,
  AccessRequestResponse,
  AccessRequestReview,
  ChangeRequestResponse,
  ChangeRequestCreate,
  ChangeRequestReview,
  PhaseResponse,
  PhaseCreate,
  PhaseUpdate,
  PhaseDependencyResponse,
  ProjectPhaseResponse,
  PhaseStatus,
  PublicLanguageOption,
  PublicLanguageRequestCreate,
  PublicProjectRequestCreate,
  PublicRequestResponse,
} from "@/types"

const api = axios.create({
  baseURL: "/api",
})

const PUBLIC_PATHS = ["/request"]

function redirectToLoginUnlessPublic() {
  const { pathname } = window.location
  const isPublic = PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  )
  if (!isPublic) {
    window.location.href = "/login"
  }
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (error: unknown) => void
}> = []

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
    } else {
      resolve(token!)
    }
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`
        return api(originalRequest)
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
    if (!refreshToken) {
      isRefreshing = false
      localStorage.removeItem(ACCESS_TOKEN_KEY)
      localStorage.removeItem(REFRESH_TOKEN_KEY)
      redirectToLoginUnlessPublic()
      return Promise.reject(error)
    }

    try {
      const { data } = await axios.post<TokenResponse>("/api/auth/refresh", {
        refresh_token: refreshToken,
      })
      localStorage.setItem(ACCESS_TOKEN_KEY, data.access_token)
      localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token)
      processQueue(null, data.access_token)
      originalRequest.headers.Authorization = `Bearer ${data.access_token}`
      return api(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError, null)
      localStorage.removeItem(ACCESS_TOKEN_KEY)
      localStorage.removeItem(REFRESH_TOKEN_KEY)
      redirectToLoginUnlessPublic()
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)

export const authAPI = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>("/auth/login", { email, password }),
  logout: (refresh_token: string) =>
    api.post("/auth/logout", { refresh_token }),
  refresh: (refresh_token: string) =>
    api.post<TokenResponse>("/auth/refresh", { refresh_token }),
  me: () => api.get<User>("/auth/me"),
  updateMe: (data: { display_name?: string; avatar_url?: string | null }) =>
    api.patch<User>("/auth/me", data),
  myRoles: () => api.get<MyRoleResponse[]>("/auth/my-roles"),
  myManagedOrgs: () => api.get<MyManagedOrgsResponse>("/auth/my-managed-orgs"),
  myManagedProjects: () =>
    api.get<MyManagedProjectsResponse>("/auth/my-managed-projects"),
}

export const usersAPI = {
  list: () => api.get<UserListResponse[]>("/users"),
  search: (q: string) => api.get<UserListResponse[]>("/users/search", { params: { q } }),
  get: (userId: string) => api.get<UserListResponse>(`/users/${userId}`),
  update: (userId: string, data: UserUpdate) =>
    api.patch<UserListResponse>(`/users/${userId}`, data),
  updateRole: (userId: string, data: UserRoleUpdate) =>
    api.put<UserListResponse>(`/users/${userId}/role`, data),
  delete: (userId: string) => api.delete(`/users/${userId}`),
  listRoles: (userId: string) =>
    api.get<UserRoleResponse[]>(`/users/${userId}/roles`),
}

export const appsAPI = {
  list: () => api.get<AppResponse[]>("/apps"),
  myApps: () => api.get<UserAppResponse[]>("/apps/my-apps"),
  create: (data: AppCreate) => api.post<AppResponse>("/apps", data),
  get: (appId: string) => api.get<AppResponse>(`/apps/${appId}`),
  update: (appId: string, data: AppUpdate) =>
    api.patch<AppResponse>(`/apps/${appId}`, data),
  delete: (appId: string) => api.delete(`/apps/${appId}`),
  listRoles: (appId: string) =>
    api.get<AppRoleResponse[]>(`/apps/${appId}/roles`),
  createRole: (appId: string, data: { role_key: string; label: string; description?: string | null }) =>
    api.post<AppRoleResponse>(`/apps/${appId}/roles`, data),
  deleteRole: (appId: string, roleId: string) =>
    api.delete(`/apps/${appId}/roles/${roleId}`),
}

export const languagesAPI = {
  list: () => api.get<LanguageResponse[]>("/languages"),
  create: (data: LanguageCreate) =>
    api.post<LanguageResponse>("/languages", data),
  update: (languageId: string, data: LanguageUpdate) =>
    api.put<LanguageResponse>(`/languages/${languageId}`, data),
  delete: (languageId: string) =>
    api.delete<void>(`/languages/${languageId}`),
  stats: (languageId: string) =>
    api.get<LanguageStatsResponse>(`/languages/${languageId}/stats`),
  get: (languageId: string) =>
    api.get<LanguageResponse>(`/languages/${languageId}`),
  getByCode: (code: string) =>
    api.get<LanguageResponse>(`/languages/code/${code}`),
}

export const orgsAPI = {
  list: () => api.get<OrganizationResponse[]>("/organizations"),
  create: (data: OrganizationCreate) =>
    api.post<OrganizationResponse>("/organizations", data),
  get: (orgId: string) =>
    api.get<OrganizationResponse>(`/organizations/${orgId}`),
  update: (orgId: string, data: OrganizationUpdate) =>
    api.patch<OrganizationResponse>(`/organizations/${orgId}`, data),
  listMembers: (orgId: string) =>
    api.get<OrganizationMemberResponse[]>(`/organizations/${orgId}/members`),
  addMember: (orgId: string, data: OrganizationMemberAdd) =>
    api.post<OrganizationMemberResponse>(
      `/organizations/${orgId}/members`,
      data,
    ),
  removeMember: (orgId: string, userId: string) =>
    api.delete(`/organizations/${orgId}/members/${userId}`),
}

export const projectsAPI = {
  list: (params?: { organization_id?: string }) =>
    api.get<ProjectResponse[]>("/projects", { params }),
  create: (data: ProjectCreate) =>
    api.post<ProjectResponse>("/projects", data),
  get: (projectId: string) =>
    api.get<ProjectResponse>(`/projects/${projectId}`),
  update: (projectId: string, data: ProjectUpdate) =>
    api.patch<ProjectResponse>(`/projects/${projectId}`, data),
  updateLocation: (projectId: string, data: ProjectLocationUpdate) =>
    api.patch<ProjectResponse>(`/projects/${projectId}/location`, data),
  listUserAccess: (projectId: string) =>
    api.get<ProjectUserAccessDetailResponse[]>(
      `/projects/${projectId}/access/users`,
    ),
  listOrgAccess: (projectId: string) =>
    api.get<ProjectOrganizationAccessDetailResponse[]>(
      `/projects/${projectId}/access/organizations`,
    ),
  grantUser: (projectId: string, data: ProjectGrantUserAccess) =>
    api.post<ProjectUserAccessResponse>(
      `/projects/${projectId}/access/users`,
      data,
    ),
  grantOrg: (projectId: string, data: ProjectGrantOrganizationAccess) =>
    api.post<ProjectOrganizationAccessResponse>(
      `/projects/${projectId}/access/organizations`,
      data,
    ),
  updateUserRole: (projectId: string, userId: string, data: ProjectUserAccessRoleUpdate) =>
    api.patch<ProjectUserAccessResponse>(
      `/projects/${projectId}/access/users/${userId}`,
      data,
    ),
  revokeUser: (projectId: string, userId: string) =>
    api.delete(`/projects/${projectId}/access/users/${userId}`),
  revokeOrg: (projectId: string, orgId: string) =>
    api.delete(`/projects/${projectId}/access/organizations/${orgId}`),
  listPhases: (projectId: string) =>
    api.get<ProjectPhaseResponse[]>(`/projects/${projectId}/phases`),
  updatePhaseStatus: (projectId: string, phaseId: string, status: PhaseStatus) =>
    api.patch<ProjectPhaseResponse>(`/projects/${projectId}/phases/${phaseId}`, { status }),
  listPhasesWithDeps: (projectId: string) =>
    api.get<{ phases: ProjectPhaseResponse[]; dependencies: Record<string, string[]> }>(`/projects/${projectId}/phases-with-deps`),
}

export const phasesAPI = {
  list: (projectId?: string) =>
    api.get<PhaseResponse[]>("/phases", { params: projectId ? { project_id: projectId } : {} }),
  create: (data: PhaseCreate) =>
    api.post<PhaseResponse>("/phases", data),
  get: (phaseId: string) =>
    api.get<PhaseResponse>(`/phases/${phaseId}`),
  update: (phaseId: string, data: PhaseUpdate) =>
    api.patch<PhaseResponse>(`/phases/${phaseId}`, data),
  delete: (phaseId: string) =>
    api.delete(`/phases/${phaseId}`),
  listDependencies: (phaseId: string) =>
    api.get<PhaseDependencyResponse[]>(`/phases/${phaseId}/dependencies`),
  addDependency: (phaseId: string, dependsOnId: string) =>
    api.post<PhaseDependencyResponse>(`/phases/${phaseId}/dependencies`, { depends_on_id: dependsOnId }),
  removeDependency: (phaseId: string, dependsOnId: string) =>
    api.delete(`/phases/${phaseId}/dependencies/${dependsOnId}`),
  listWithDependencies: () =>
    api.get<{ phases: PhaseResponse[]; dependencies: Record<string, string[]> }>("/phases/with-dependencies"),
}

export const accessRequestsAPI = {
  list: (params?: { app_key?: string; status?: string }) =>
    api.get<AccessRequestResponse[]>("/access-requests", { params }),
  review: (requestId: string, data: AccessRequestReview) =>
    api.patch<AccessRequestResponse>(
      `/access-requests/${requestId}/review`,
      data,
    ),
}

export const changeRequestsAPI = {
  list: (params?: { kind?: string; status?: string }) =>
    api.get<ChangeRequestResponse[]>("/change-requests", { params }),
  mine: () => api.get<ChangeRequestResponse[]>("/change-requests/mine"),
  create: (data: ChangeRequestCreate) =>
    api.post<ChangeRequestResponse>("/change-requests", data),
  review: (requestId: string, data: ChangeRequestReview) =>
    api.patch<ChangeRequestResponse>(
      `/change-requests/${requestId}/review`,
      data,
    ),
}

export const rolesAPI = {
  assign: (data: RoleAssignRequest) =>
    api.post<RoleAssignmentResponse>("/roles/assign", data),
  revoke: (data: RoleRevokeRequest) =>
    api.post<RoleAssignmentResponse>("/roles/revoke", data),
  check: (userId: string, appKey: string, roleKey: string) =>
    api.get<RoleCheckResponse>("/roles/check", {
      params: { user_id: userId, app_key: appKey, role_key: roleKey },
    }),
}

export const placesAPI = {
  autocomplete: (q: string) =>
    api.get<{ suggestions: Array<{ placePrediction: { placeId: string; text: { text: string }; structuredFormat: { mainText: { text: string }; secondaryText: { text: string } } } }> }>("/places/autocomplete", { params: { q } }),
  details: (placeId: string) =>
    api.get<{ location?: { latitude: number; longitude: number }; formattedAddress?: string; displayName?: { text: string } }>("/places/details", { params: { place_id: placeId } }),
}

export const uploadsAPI = {
  image: (file: File, folder: string = "images") => {
    const formData = new FormData()
    formData.append("file", file)
    return api.post<{ url: string }>(`/uploads/image?folder=${encodeURIComponent(folder)}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  },
}

export const publicAPI = {
  listLanguages: () => api.get<PublicLanguageOption[]>("/public/languages"),
  requestLanguage: (data: PublicLanguageRequestCreate) =>
    api.post<PublicRequestResponse>("/public/requests/language", data),
  requestProject: (data: PublicProjectRequestCreate) =>
    api.post<PublicRequestResponse>("/public/requests/project", data),
}

export default api
