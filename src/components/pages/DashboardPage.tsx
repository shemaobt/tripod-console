import { useEffect, useState } from "react"
import { LayoutGrid, ExternalLink, Smartphone, Users, FolderOpen, Building2 } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { appsAPI, usersAPI, projectsAPI, orgsAPI } from "@/services/api"
import type { UserAppResponse } from "@/types"
import { cn } from "@/utils/cn"
import { card } from "@/styles"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/common/LoadingSpinner"
import { EmptyState } from "@/components/common/EmptyState"
import { InfoTooltip } from "@/components/common/InfoTooltip"

function platformLabel(platform: string | null): string {
  switch (platform) {
    case "ios":
      return "iOS"
    case "android":
      return "Android"
    case "mobile":
      return "Mobile"
    case "both":
      return "Web + Mobile"
    default:
      return "Web"
  }
}

function AppCard({ app }: { app: UserAppResponse }) {
  return (
    <div className={cn(card.base, card.hover, "p-6 flex flex-col gap-4")}>
      <div className="flex items-start gap-4">
        {app.icon_url ? (
          <img
            src={app.icon_url}
            alt={app.name}
            className="h-12 w-12 rounded-lg object-cover border border-areia/20"
          />
        ) : (
          <div className="h-12 w-12 rounded-lg bg-azul/20 flex items-center justify-center">
            <LayoutGrid className="h-6 w-6 text-azul" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-preto tracking-tight truncate">
            {app.name}
          </h3>
          {app.description && (
            <p className="text-sm text-verde mt-1 line-clamp-2">{app.description}</p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {app.roles.map((role) => (
          <Badge key={role} variant="default">{role}</Badge>
        ))}
        <Badge variant="success">{platformLabel(app.platform)}</Badge>
      </div>

      <div className="flex items-center gap-2 mt-auto pt-2">
        {app.app_url && (
          <a
            href={app.app_url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ size: "sm" }))}
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Launch
          </a>
        )}
        {app.ios_url && (
          <a
            href={app.ios_url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            <Smartphone className="h-3.5 w-3.5" />
            iOS
          </a>
        )}
        {app.android_url && (
          <a
            href={app.android_url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            <Smartphone className="h-3.5 w-3.5" />
            Android
          </a>
        )}
        {!app.app_url && !app.ios_url && !app.android_url && (
          <span className="text-xs text-verde/60">No launch links available</span>
        )}
      </div>
    </div>
  )
}

function AdminStats() {
  const [counts, setCounts] = useState<{ users: number; projects: number; organizations: number } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCounts() {
      try {
        const [usersRes, projectsRes, orgsRes] = await Promise.all([
          usersAPI.list(),
          projectsAPI.list(),
          orgsAPI.list(),
        ])
        setCounts({
          users: usersRes.data.length,
          projects: projectsRes.data.length,
          organizations: orgsRes.data.length,
        })
      } catch {
        // Stats are non-critical
      } finally {
        setLoading(false)
      }
    }
    fetchCounts()
  }, [])

  if (loading || !counts) return null

  const stats = [
    { label: "Users", value: counts.users, icon: Users },
    { label: "Projects", value: counts.projects, icon: FolderOpen },
    { label: "Organizations", value: counts.organizations, icon: Building2 },
  ]

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-preto tracking-tight flex items-center">
        Platform Overview
        <InfoTooltip content="Aggregate counts across the entire platform. Visible to admins only." />
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-verde text-sm font-medium">
                <stat.icon className="h-4 w-4" />
                {stat.label}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-preto tracking-tight">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { isPlatformAdmin } = useAuth()
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

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-preto tracking-tight flex items-center">
          My Apps
          <InfoTooltip content="Apps you have access to and your roles within each one." />
        </h1>
      </div>

      {apps.length === 0 ? (
        <EmptyState
          icon={LayoutGrid}
          title="You don't have access to any apps yet"
          description="Contact your administrator to request access to an application. Once you're granted a role, your apps will appear here."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apps.map((app) => (
            <AppCard key={app.id} app={app} />
          ))}
        </div>
      )}

      {isPlatformAdmin && <AdminStats />}
    </div>
  )
}
