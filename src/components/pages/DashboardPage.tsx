import { useEffect, useState } from "react"
import { LayoutGrid, Sparkles } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { appsAPI } from "@/services/api"
import type { UserAppResponse } from "@/types"
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
  const [apps, setApps] = useState<UserAppResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchApps() {
      try {
        const { data } = await appsAPI.myApps()
        setApps(data)
      } catch {
        // Handled by empty state
      } finally {
        setLoading(false)
      }
    }
    fetchApps()
  }, [])

  if (loading) {
    return <LoadingSpinner />
  }

  const activeApps = apps.filter((a) => a.is_active)
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

      {isPlatformAdmin && <AdminDashboard />}
    </div>
  )
}
