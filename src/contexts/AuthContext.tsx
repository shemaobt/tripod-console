import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { authAPI } from "@/services/api"
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "@/constants/app"
import type { User, MyRoleResponse } from "@/types"

interface AuthContextValue {
  user: User | null
  isPlatformAdmin: boolean
  appRoles: MyRoleResponse[]
  managedOrgIds: string[]
  managedProjectIds: string[]
  isManager: boolean
  managedOrgId: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  isAppAdmin: (appKey: string) => boolean
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [appRoles, setAppRoles] = useState<MyRoleResponse[]>([])
  const [managedOrgIds, setManagedOrgIds] = useState<string[]>([])
  const [managedProjectIds, setManagedProjectIds] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  const isPlatformAdmin = useMemo(() => user?.is_platform_admin ?? false, [user])
  const isManager = useMemo(
    () => managedProjectIds.length > 0 || managedOrgIds.length > 0,
    [managedProjectIds, managedOrgIds],
  )
  const managedOrgId = useMemo(
    () => (managedOrgIds.length === 1 ? managedOrgIds[0] : null),
    [managedOrgIds],
  )

  const isAppAdmin = useCallback(
    (appKey: string) =>
      appRoles.some((r) => r.app_key === appKey && r.role_key === "admin"),
    [appRoles],
  )

  const login = useCallback(
    async (email: string, password: string) => {
      const { data } = await authAPI.login(email, password)
      localStorage.setItem(ACCESS_TOKEN_KEY, data.tokens.access_token)
      localStorage.setItem(REFRESH_TOKEN_KEY, data.tokens.refresh_token)
      setUser(data.user)

      const [rolesRes, managedOrgsRes, managedProjectsRes] = await Promise.all([
        authAPI.myRoles(),
        authAPI.myManagedOrgs(),
        authAPI.myManagedProjects(),
      ])
      setAppRoles(rolesRes.data)
      setManagedOrgIds(managedOrgsRes.data.managed_org_ids)
      setManagedProjectIds(managedProjectsRes.data.managed_project_ids)

      navigate("/app/dashboard")
    },
    [navigate],
  )

  const refreshUser = useCallback(async () => {
    const { data } = await authAPI.me()
    setUser(data)
  }, [])

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
    try {
      if (refreshToken) {
        await authAPI.logout(refreshToken)
      }
    } catch {
      // Ignore logout API errors — clear local state regardless
    }
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    setUser(null)
    setAppRoles([])
    setManagedOrgIds([])
    setManagedProjectIds([])
    navigate("/login")
  }, [navigate])

  useEffect(() => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY)
    if (!token) {
      setIsLoading(false)
      return
    }

    let cancelled = false

    async function restoreSession() {
      try {
        const [meRes, rolesRes, managedOrgsRes, managedProjectsRes] = await Promise.all([
          authAPI.me(),
          authAPI.myRoles(),
          authAPI.myManagedOrgs(),
          authAPI.myManagedProjects(),
        ])
        if (!cancelled) {
          setUser(meRes.data)
          setAppRoles(rolesRes.data)
          setManagedOrgIds(managedOrgsRes.data.managed_org_ids)
          setManagedProjectIds(managedProjectsRes.data.managed_project_ids)
        }
      } catch {
        if (!cancelled) {
          localStorage.removeItem(ACCESS_TOKEN_KEY)
          localStorage.removeItem(REFRESH_TOKEN_KEY)
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    restoreSession()
    return () => {
      cancelled = true
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ user, isPlatformAdmin, appRoles, managedOrgIds, managedProjectIds, isManager, managedOrgId, isLoading, login, logout, isAppAdmin, refreshUser }),
    [user, isPlatformAdmin, appRoles, managedOrgIds, managedProjectIds, isManager, managedOrgId, isLoading, login, logout, isAppAdmin, refreshUser],
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
