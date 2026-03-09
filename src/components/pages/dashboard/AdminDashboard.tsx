import { useEffect, useState } from "react"
import {
  Users,
  UserCheck,
  FolderOpen,
  Building2,
  Clock,
  ArrowRight,
  Bell,
} from "lucide-react"
import { usersAPI, projectsAPI, orgsAPI, accessRequestsAPI } from "@/services/api"
import type { UserListResponse, AccessRequestResponse } from "@/types"
import { Badge } from "@/components/ui/badge"
import { StatCard } from "@/components/common/StatCard"
import { InfoTooltip } from "@/components/common/InfoTooltip"

import { timeAgo } from "@/utils/format"

interface AdminData {
  users: UserListResponse[]
  projectCount: number
  projectsWithLocation: number
  orgCount: number
  pendingRequests: AccessRequestResponse[]
}

export function AdminDashboard() {
  const [data, setData] = useState<AdminData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [usersRes, projectsRes, orgsRes, requestsRes] = await Promise.all([
          usersAPI.list(),
          projectsAPI.list(),
          orgsAPI.list(),
          accessRequestsAPI.list({ status: "pending" }),
        ])
        setData({
          users: usersRes.data,
          projectCount: projectsRes.data.length,
          projectsWithLocation: projectsRes.data.filter(
            (p) => p.latitude != null && p.longitude != null,
          ).length,
          orgCount: orgsRes.data.length,
          pendingRequests: requestsRes.data,
        })
      } catch {
        // Stats are non-critical
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading || !data) return null

  const activeUsers = data.users.filter((u) => u.is_active).length
  const userMap = new Map(data.users.map((u) => [u.id, u]))

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-areia/20" />
        <h2 className="text-xs font-semibold text-verde/60 tracking-widest uppercase flex items-center gap-1.5 px-3">
          Platform Overview
          <InfoTooltip content="Aggregate counts across the entire platform. Visible to admins only." />
        </h2>
        <div className="h-px flex-1 bg-areia/20" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <StatCard
          icon={Users}
          label="Total Users"
          value={data.users.length}
          iconBg="bg-azul/15"
          iconColor="text-azul"
          accent="from-azul/5 to-transparent"
        />
        <StatCard
          icon={UserCheck}
          label="Active Users"
          value={activeUsers}
          subtitle={`${data.users.length > 0 ? Math.round((activeUsers / data.users.length) * 100) : 0}% of total`}
          iconBg="bg-verde-claro/15"
          iconColor="text-verde-claro"
          accent="from-verde-claro/5 to-transparent"
        />
        <StatCard
          icon={FolderOpen}
          label="Projects"
          value={data.projectCount}
          iconBg="bg-telha/10"
          iconColor="text-telha"
          accent="from-telha/5 to-transparent"
        />
        <StatCard
          icon={Building2}
          label="Organizations"
          value={data.orgCount}
          iconBg="bg-verde-claro/15"
          iconColor="text-verde-claro"
          accent="from-verde-claro/5 to-transparent"
        />
        <StatCard
          icon={Clock}
          label="Pending Requests"
          value={data.pendingRequests.length}
          iconBg="bg-telha/10"
          iconColor="text-telha"
          accent="from-telha/5 to-transparent"
          highlight={data.pendingRequests.length > 0}
        />
      </div>

      {data.pendingRequests.length > 0 && (
        <div className="rounded-2xl border border-areia/20 bg-surface shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-areia/10">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-telha/10 p-2.5">
                <Bell className="h-4 w-4 text-telha" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-preto">Pending Access Requests</h3>
                <p className="text-xs text-verde/50 mt-0.5">
                  {data.pendingRequests.length} request{data.pendingRequests.length !== 1 ? "s" : ""} awaiting review
                </p>
              </div>
            </div>
            <a
              href="/app/users"
              className="text-sm text-telha hover:text-telha/80 font-medium inline-flex items-center gap-1.5 transition-colors"
            >
              Manage
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
          <div className="divide-y divide-areia/8">
            {data.pendingRequests.slice(0, 5).map((req) => {
              const user = userMap.get(req.user_id)
              const initial = (user?.email?.[0] ?? "?").toUpperCase()
              return (
                <div
                  key={req.id}
                  className="flex items-center justify-between gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4 hover:bg-surface-alt/30 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-azul/30 to-azul/10 flex items-center justify-center shrink-0 ring-1 ring-areia/15">
                      <span className="text-sm font-semibold text-azul">
                        {initial}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-preto truncate">
                        {user?.email ?? req.user_id}
                      </p>
                      {req.note && (
                        <p className="text-xs text-verde/50 truncate max-w-[160px] sm:max-w-[240px] mt-0.5">
                          {req.note}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge variant="default">{req.app_key}</Badge>
                    <span className="text-xs text-verde/40 tabular-nums">
                      {timeAgo(req.requested_at)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
