import axios from "axios"
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "@/constants/app"
import type {
  AuthResponse,
  TokenResponse,
  User,
  MyRoleResponse,
  UserListResponse,
  UserUpdate,
  UserRoleResponse,
  AppResponse,
  AppCreate,
  AppUpdate,
  UserAppResponse,
  AppRoleResponse,
  LanguageResponse,
  LanguageCreate,
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
  RoleAssignRequest,
  RoleRevokeRequest,
  RoleAssignmentResponse,
  RoleCheckResponse,
} from "@/types"

const api = axios.create({
  baseURL: "/api",
})

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
      window.location.href = "/login"
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
      window.location.href = "/login"
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)

export const authAPI = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>("/auth/login", { email, password }),
  logout: () => api.post("/auth/logout"),
  refresh: (refresh_token: string) =>
    api.post<TokenResponse>("/auth/refresh", { refresh_token }),
  me: () => api.get<User>("/auth/me"),
  myRoles: () => api.get<MyRoleResponse[]>("/auth/my-roles"),
}

export const usersAPI = {
  list: () => api.get<UserListResponse[]>("/users"),
  get: (userId: string) => api.get<UserListResponse>(`/users/${userId}`),
  update: (userId: string, data: UserUpdate) =>
    api.patch<UserListResponse>(`/users/${userId}`, data),
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
  listRoles: (appId: string) =>
    api.get<AppRoleResponse[]>(`/apps/${appId}/roles`),
}

export const languagesAPI = {
  list: () => api.get<LanguageResponse[]>("/languages"),
  create: (data: LanguageCreate) =>
    api.post<LanguageResponse>("/languages", data),
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
  list: () => api.get<ProjectResponse[]>("/projects"),
  create: (data: ProjectCreate) =>
    api.post<ProjectResponse>("/projects", data),
  get: (projectId: string) =>
    api.get<ProjectResponse>(`/projects/${projectId}`),
  update: (projectId: string, data: ProjectUpdate) =>
    api.patch<ProjectResponse>(`/projects/${projectId}`, data),
  updateLocation: (projectId: string, data: ProjectLocationUpdate) =>
    api.patch<ProjectResponse>(`/projects/${projectId}/location`, data),
  listUserAccess: (projectId: string) =>
    api.get<ProjectUserAccessResponse[]>(
      `/projects/${projectId}/access/users`,
    ),
  listOrgAccess: (projectId: string) =>
    api.get<ProjectOrganizationAccessResponse[]>(
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
  revokeUser: (projectId: string, userId: string) =>
    api.delete(`/projects/${projectId}/access/users/${userId}`),
  revokeOrg: (projectId: string, orgId: string) =>
    api.delete(`/projects/${projectId}/access/organizations/${orgId}`),
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

export default api
