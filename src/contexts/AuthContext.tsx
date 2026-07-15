import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { authAPI } from "@/services/api"
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "@/constants/app"
import { useLanguagesStore } from "@/stores/languagesStore"
import { usePhasesStore } from "@/stores/phasesStore"
import type { User, MyRoleResponse } from "@/types"

interface Session {
  user: User
  appRoles: MyRoleResponse[]
  managedOrgIds: string[]
}

interface AuthContextValue {
  user: User | null
  isPlatformAdmin: boolean
  appRoles: MyRoleResponse[]
  managedOrgIds: string[]
  isManager: boolean
  managedOrgId: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  isAppAdmin: (appKey: string) => boolean
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const EMPTY_ROLES: MyRoleResponse[] = []
const EMPTY_IDS: string[] = []

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}

function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

async function loadSession(knownUser?: User): Promise<Session> {
  const [user, rolesRes, managedRes] = await Promise.all([
    knownUser ? Promise.resolve(knownUser) : authAPI.me().then((res) => res.data),
    authAPI.myRoles(),
    authAPI.myManagedOrgs(),
  ])

  return {
    user,
    appRoles: rolesRes.data,
    managedOrgIds: managedRes.data.managed_org_ids,
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  const user = session?.user ?? null
  const appRoles = session?.appRoles ?? EMPTY_ROLES
  const managedOrgIds = session?.managedOrgIds ?? EMPTY_IDS

  const isPlatformAdmin = user?.is_platform_admin ?? false
  const isManager = managedOrgIds.length > 0
  const managedOrgId = managedOrgIds.length === 1 ? managedOrgIds[0] : null

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

      try {
        setSession(await loadSession(data.user))
      } catch (error) {
        clearTokens()
        throw error
      }

      navigate("/app/dashboard")
    },
    [navigate],
  )

  const refreshUser = useCallback(async () => {
    setSession(await loadSession())
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
    clearTokens()
    setSession(null)
    useLanguagesStore.getState().reset()
    usePhasesStore.getState().reset()
    navigate("/login")
  }, [navigate])

  useEffect(() => {
    if (!localStorage.getItem(ACCESS_TOKEN_KEY)) {
      setIsLoading(false)
      return
    }

    let cancelled = false

    async function restoreSession() {
      try {
        const restored = await loadSession()
        if (!cancelled) {
          setSession(restored)
        }
      } catch {
        if (!cancelled) {
          clearTokens()
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
    () => ({ user, isPlatformAdmin, appRoles, managedOrgIds, isManager, managedOrgId, isLoading, login, logout, isAppAdmin, refreshUser }),
    [user, isPlatformAdmin, appRoles, managedOrgIds, isManager, managedOrgId, isLoading, login, logout, isAppAdmin, refreshUser],
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
