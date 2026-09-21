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
  const [failed, setFailed] = useState(false)
  const [pendingFailed, setPendingFailed] = useState(false)
  const languages = useLanguagesStore((s) => s.languages)
  const fetchLanguages = useLanguagesStore((s) => s.fetch)

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    async function fetchData() {
      const [usersRes, appsRes, accessRes, changeRes, publicRes] = await Promise.allSettled([
        usersAPI.list(),
        appsAPI.list(),
        accessRequestsAPI.list({ status: "pending" }),
        changeRequestsAPI.list({ status: "pending" }),
        publicRequestsAPI.list({ status: "pending" }),
      ])
      if (cancelled) return

      setPendingFailed(
        accessRes.status === "rejected" ||
          changeRes.status === "rejected" ||
          publicRes.status === "rejected",
      )

      if (usersRes.status === "rejected") {
        setData(null)
        setFailed(true)
        return
      }
      setData({
        users: usersRes.value.data,
        apps: appsRes.status === "fulfilled" ? appsRes.value.data : [],
        pendingAccess: accessRes.status === "fulfilled" ? accessRes.value.data : [],
        pendingChange: changeRes.status === "fulfilled" ? changeRes.value.data : [],
        pendingPublic: publicRes.status === "fulfilled" ? publicRes.value.data : [],
      })
      setFailed(false)
    }
    fetchData()
    fetchLanguages()
    return () => {
      cancelled = true
    }
  }, [enabled, fetchLanguages])

  return { data, languages, loading: enabled && !data && !failed, failed, pendingFailed }
}
