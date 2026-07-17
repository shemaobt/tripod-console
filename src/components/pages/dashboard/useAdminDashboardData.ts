import { useEffect, useState } from "react"
import {
  usersAPI,
  appsAPI,
  accessRequestsAPI,
  changeRequestsAPI,
  publicRequestsAPI,
} from "@/services/api"
import type {
  UserListResponse,
  AppResponse,
  AccessRequestResponse,
  ChangeRequestResponse,
  PublicRequestAdminResponse,
} from "@/types"
import { useLanguagesStore } from "@/stores/languagesStore"

export interface AdminDashboardData {
  users: UserListResponse[]
  apps: AppResponse[]
  pendingAccess: AccessRequestResponse[]
  pendingChange: ChangeRequestResponse[]
  pendingPublic: PublicRequestAdminResponse[]
}

export function useAdminDashboardData(enabled: boolean) {
  const [data, setData] = useState<AdminDashboardData | null>(null)
  const languages = useLanguagesStore((s) => s.languages)
  const fetchLanguages = useLanguagesStore((s) => s.fetch)

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    async function fetchData() {
      try {
        const [usersRes, appsRes, accessRes, changeRes, publicRes] = await Promise.all([
          usersAPI.list(),
          appsAPI.list().catch(() => ({ data: [] as AppResponse[] })),
          accessRequestsAPI
            .list({ status: "pending" })
            .catch(() => ({ data: [] as AccessRequestResponse[] })),
          changeRequestsAPI
            .list({ status: "pending" })
            .catch(() => ({ data: [] as ChangeRequestResponse[] })),
          publicRequestsAPI
            .list({ status: "pending" })
            .catch(() => ({ data: [] as PublicRequestAdminResponse[] })),
        ])
        if (!cancelled) {
          setData({
            users: usersRes.data,
            apps: appsRes.data,
            pendingAccess: accessRes.data,
            pendingChange: changeRes.data,
            pendingPublic: publicRes.data,
          })
        }
      } catch {
        if (!cancelled) setData(null)
      }
    }
    fetchData()
    fetchLanguages()
    return () => {
      cancelled = true
    }
  }, [enabled, fetchLanguages])

  return { data, languages }
}
