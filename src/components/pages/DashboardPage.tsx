import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { LayoutGrid, Sparkles, Globe, MapPin, ArrowRight } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { appsAPI, projectsAPI } from "@/services/api"
import type { UserAppResponse, ProjectResponse } from "@/types"
import { LoadingSpinner } from "@/components/common/LoadingSpinner"
import { EmptyState } from "@/components/common/EmptyState"
import { InfoTooltip } from "@/components/common/InfoTooltip"
import { AppCard } from "@/components/pages/dashboard/AppCard"
import { AdminDashboard } from "@/components/pages/dashboard/AdminDashboard"

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 18) return "Good afternoon"
  return "Good evening"
}

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
        // Handled by empty state
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

  return (
    <div className="p-6 md:p-8 lg:p-10 space-y-10">
      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-verde/95 via-verde to-verde-claro/80 px-5 sm:px-8 py-8 sm:py-10 md:py-12 shadow-lg">
        <div className="absolute top-0 right-0 w-80 h-80 bg-branco/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-branco/5 rounded-full translate-y-1/2 -translate-x-1/4" />
        <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-branco/3 rounded-full" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-areia/60" />
            <span className="text-xs font-medium text-areia/70 tracking-widest uppercase">
              Dashboard
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-branco tracking-tight">
            {getGreeting()}{firstName ? `, ${firstName}` : ""}
          </h1>
          <p className="text-sm text-branco/60 mt-3 max-w-lg leading-relaxed">
            {activeApps.length > 0
              ? isPlatformAdmin
                ? `Managing ${activeApps.length} active app${activeApps.length !== 1 ? "s" : ""} across the platform.`
                : `You have access to ${activeApps.length} app${activeApps.length !== 1 ? "s" : ""}. Here's your workspace overview.`
              : "Welcome to Tripod Console. Your apps will appear here once you have access."}
          </p>
        </div>
      </div>

      {/* My Apps */}
      <div>
        <h2 className="text-lg font-semibold text-preto tracking-tight flex items-center mb-6">
          My Apps
          <InfoTooltip content="Apps you have access to and your roles within each one." />
        </h2>
        {activeApps.length === 0 ? (
          <EmptyState
            icon={LayoutGrid}
            title="You don't have access to any apps yet"
            description="Contact your administrator to request access to an application. Once you're granted a role, your apps will appear here."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {activeApps.map((app) => (
              <AppCard key={app.id} app={app} />
            ))}
          </div>
        )}
      </div>

      {/* Map Overview */}
      <div>
        <h2 className="text-lg font-semibold text-preto tracking-tight flex items-center mb-6">
          Project Map
          <InfoTooltip content="Geographic overview of all projects with location data." />
        </h2>
        <button
          onClick={() => navigate("/app/map")}
          className="w-full group relative overflow-hidden rounded-2xl transition-all duration-200 hover:shadow-lg text-left"
        >
          <div className="relative bg-gradient-to-br from-verde via-verde/95 to-azul/80 rounded-2xl px-6 sm:px-8 py-6 sm:py-8 overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-branco/5 rounded-full" />
            <div className="absolute -bottom-16 -left-8 w-40 h-40 bg-branco/5 rounded-full" />
            <div className="absolute top-1/3 right-1/3 w-24 h-24 bg-azul/10 rounded-full" />

            <div className="relative flex items-center gap-6 sm:gap-8">
              {/* Left: text content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-branco/10 backdrop-blur-sm">
                    <Globe className="h-5 w-5 text-branco/80" />
                  </div>
                  <span className="text-xs font-semibold text-areia/60 uppercase tracking-widest">
                    Global Overview
                  </span>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-branco tracking-tight">
                  Explore the Map
                </p>
                <p className="text-sm text-branco/50 mt-1.5 leading-relaxed max-w-sm">
                  {locatedProjects.length > 0
                    ? `${locatedProjects.length} project${locatedProjects.length !== 1 ? "s" : ""} pinned across the globe. See where translation work is happening.`
                    : "View the project map. Projects with coordinates will appear as pins."}
                </p>
                <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-branco/15 backdrop-blur-sm text-sm font-semibold text-branco group-hover:bg-branco/25 transition-colors duration-200">
                  View Map
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform duration-200" />
                </div>
              </div>

              {/* Right: mini map dots visualization */}
              <div className="hidden sm:flex items-center justify-center shrink-0">
                <div className="relative w-40 h-28 rounded-xl bg-branco/8 border border-branco/10 overflow-hidden">
                  {/* Grid */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 160 112" fill="none">
                    {[1, 2, 3, 4].map((i) => (
                      <line key={`h${i}`} x1="0" y1={i * 22.4} x2="160" y2={i * 22.4} stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
                    ))}
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <line key={`v${i}`} x1={i * 22.9} y1="0" x2={i * 22.9} y2="112" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
                    ))}
                  </svg>
                  {/* Project dots */}
                  {locatedProjects.slice(0, 12).map((p) => {
                    const x = ((p.longitude! + 180) / 360) * 100
                    const y = ((90 - p.latitude!) / 180) * 100
                    return (
                      <div
                        key={p.id}
                        className="absolute w-2 h-2 rounded-full bg-telha ring-2 ring-telha/30"
                        style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }}
                      />
                    )
                  })}
                  {locatedProjects.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-branco/15" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </button>
      </div>

      {isPlatformAdmin && <AdminDashboard />}
    </div>
  )
}
