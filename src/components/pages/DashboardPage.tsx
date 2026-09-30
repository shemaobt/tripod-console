import { useCallback, useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { appsAPI, projectsAPI } from "@/services/api"
import type { UserAppResponse, ProjectResponse } from "@/types"
import { LoadingSpinner } from "@/components/common/LoadingSpinner"
import { LoadFailed } from "@/components/common/LoadFailed"
import { MyAppsCard } from "@/components/pages/dashboard/MyAppsCard"
import { MapPreview } from "@/components/pages/dashboard/MapPreview"
import { AdminStatsRow } from "@/components/pages/dashboard/AdminStatsRow"
import { NeedsReviewPanel } from "@/components/pages/dashboard/NeedsReviewPanel"
import { useAdminDashboardData } from "@/components/pages/dashboard/useAdminDashboardData"

export default function DashboardPage() {
  const { user, isPlatformAdmin } = useAuth()
  const [apps, setApps] = useState<UserAppResponse[] | null>([])
  const [projects, setProjects] = useState<ProjectResponse[] | null>([])
  const [loading, setLoading] = useState(true)
  const {
    data: adminData,
    languages,
    loading: adminLoading,
    failed: adminFailed,
    pendingFailed,
    retry: retryAdmin,
    retryLanguages,
  } = useAdminDashboardData(isPlatformAdmin)

  const loadApps = useCallback(
    () => appsAPI.myApps().then(({ data }) => setApps(data), () => setApps(null)),
    [],
  )
  const loadProjects = useCallback(
    () => projectsAPI.list().then(({ data }) => setProjects(data), () => setProjects(null)),
    [],
  )

  useEffect(() => {
    Promise.all([loadApps(), loadProjects()]).finally(() => setLoading(false))
  }, [loadApps, loadProjects])

  if (loading) {
    return <LoadingSpinner />
  }

  const firstName = user?.display_name?.split(" ")[0]
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  return (
    <div className="max-w-[77.5rem] mx-auto px-6 sm:px-10 pt-8 pb-14 flex flex-col gap-[1.125rem]">
      <div className="flex items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-[0.8125rem] font-semibold tracking-[0.14em] uppercase text-fg-muted">
            Overview
          </span>
          <h3 className="text-[1.5625rem] font-bold text-fg-strong tracking-tight">
            Welcome back{firstName ? `, ${firstName}` : ""}.
          </h3>
        </div>
        <span className="hidden sm:block font-serif italic text-[0.84375rem] text-fg-subtle">{today}</span>
      </div>

      {isPlatformAdmin &&
        (adminFailed ? (
          <LoadFailed what="the platform overview" onRetry={retryAdmin} />
        ) : adminData ? (
          <AdminStatsRow
            data={adminData}
            projects={projects}
            languages={languages}
            onRetryLanguages={retryLanguages}
            pendingFailed={pendingFailed}
          />
        ) : (
          <LoadingSpinner size="sm" />
        ))}

      {isPlatformAdmin ? (
        <div className="grid grid-cols-1 lg:grid-cols-[1.65fr_1fr] gap-[1.125rem] items-start">
          <div className="flex flex-col gap-[1.125rem] min-w-0">
            <MyAppsCard apps={apps} onRetry={loadApps} showManageLink />
            <MapPreview projects={projects} onRetry={loadProjects} />
          </div>
          <NeedsReviewPanel
            data={adminData}
            loading={adminLoading}
            failed={adminFailed || pendingFailed}
            onRetry={retryAdmin}
          />
        </div>
      ) : (
        <>
          <MyAppsCard apps={apps} onRetry={loadApps} showManageLink={false} />
          <MapPreview projects={projects} onRetry={loadProjects} />
        </>
      )}
    </div>
  )
}
