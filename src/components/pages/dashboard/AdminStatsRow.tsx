import type { ProjectResponse, LanguageResponse } from "@/types"
import { StatCard } from "@/components/common/StatCard"
import type { AdminDashboardData } from "./useAdminDashboardData"

export function AdminStatsRow({
  data,
  projects,
  languages,
}: {
  data: AdminDashboardData
  projects: ProjectResponse[]
  languages: LanguageResponse[]
}) {
  const activeCount = data.users.filter((u) => u.is_active).length
  const withLocation = projects.filter(
    (p) => p.latitude != null && p.longitude != null,
  ).length
  const accessCount = data.pendingAccess.length
  const changeCount = data.pendingChange.length + data.pendingPublic.length
  const totalPending = accessCount + changeCount

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
      <StatCard label="Users" value={data.users.length} subtitle={`${activeCount} active`} />
      <StatCard
        label="Projects"
        value={projects.length}
        subtitle={`${withLocation} with location`}
      />
      <StatCard label="Languages" value={languages.length} subtitle="in the catalog" />
      <StatCard
        label="Pending reviews"
        value={totalPending}
        subtitle={`${accessCount} access · ${changeCount} change`}
      />
    </div>
  )
}
