import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { LayoutGrid, Globe } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { appsAPI, projectsAPI } from "@/services/api"
import type { UserAppResponse, ProjectResponse } from "@/types"
import { LoadingSpinner } from "@/components/common/LoadingSpinner"
import { EmptyState } from "@/components/common/EmptyState"
import { AppCard } from "@/components/pages/dashboard/AppCard"
import { AdminDashboard } from "@/components/pages/dashboard/AdminDashboard"

export default function DashboardPage() {
  const { user, isPlatformAdmin } = useAuth()
  const navigate = useNavigate()
  const [apps, setApps] = useState<UserAppResponse[]>([])
  const [projects, setProjects] = useState<ProjectResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [appsRes, projectsRes] = await Promise.allSettled([
          appsAPI.myApps(),
          projectsAPI.list(),
        ])
        if (appsRes.status === "fulfilled") setApps(appsRes.value.data)
        if (projectsRes.status === "fulfilled") setProjects(projectsRes.value.data)
      } catch {
        setApps([])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return <LoadingSpinner />
  }

  const activeApps = apps.filter((a) => a.is_active)
  const locatedProjects = projects.filter((p) => p.latitude != null && p.longitude != null)
  const firstName = user?.display_name?.split(" ")[0]
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  return (
    <div className="max-w-[1240px] mx-auto px-6 sm:px-10 pt-8 pb-14 flex flex-col gap-[18px]">
      <div className="flex items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-[13px] font-semibold tracking-[0.14em] uppercase text-fg-muted">
            Overview
          </span>
          <h3 className="text-[25px] font-bold text-fg-strong tracking-tight">
            Welcome back{firstName ? `, ${firstName}` : ""}.
          </h3>
        </div>
        <span className="hidden sm:block font-serif italic text-[13.5px] text-fg-subtle">{today}</span>
      </div>

      <div className="bg-elevated rounded-[18px] shadow-[var(--shadow-card)] p-5">
        <div className="flex items-center justify-between mb-3.5">
          <h4 className="text-[15.5px] font-semibold text-fg-strong">My apps</h4>
          {isPlatformAdmin && (
            <Link to="/app/apps" className="text-[12.5px] font-semibold text-accent hover:underline">
              Manage apps →
            </Link>
          )}
        </div>
        {activeApps.length === 0 ? (
          <EmptyState
            icon={LayoutGrid}
            title="You don't have access to any apps yet"
            description="Contact your administrator to request access. Once you're granted a role, your apps will appear here."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {activeApps.map((app) => (
              <AppCard key={app.id} app={app} />
            ))}
          </div>
        )}
      </div>

      <button
        onClick={() => navigate("/app/map")}
        className="relative overflow-hidden rounded-[18px] shadow-[var(--shadow-card)] h-[200px] bg-inverse text-on-dark text-left transition-all duration-200 hover:shadow-[var(--shadow-md)]"
      >
        <Globe
          className="absolute -right-6 -bottom-8 w-56 h-56 text-[#F6F5EB]/5"
          strokeWidth={1}
        />
        <div className="absolute left-3.5 bottom-3.5 z-10 bg-elevated rounded-[12px] shadow-[var(--shadow-md)] px-3.5 py-2.5 flex items-center gap-3.5">
          <span className="text-[12.5px] text-fg-muted">
            <strong className="text-fg-strong">{locatedProjects.length}</strong> projects with field locations
          </span>
          <span className="bg-accent text-white rounded-full px-3.5 py-1.5 text-xs font-semibold">
            Open map
          </span>
        </div>
      </button>

      {isPlatformAdmin && <AdminDashboard />}
    </div>
  )
}
