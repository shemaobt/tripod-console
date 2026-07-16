import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Users, UserCheck, FolderOpen, Clock } from "lucide-react"
import {
  usersAPI,
  projectsAPI,
  accessRequestsAPI,
  changeRequestsAPI,
} from "@/services/api"
import type {
  UserListResponse,
  AccessRequestResponse,
  ChangeRequestResponse,
} from "@/types"
import { StatCard } from "@/components/common/StatCard"
import { timeAgo } from "@/utils/format"

interface AdminData {
  users: UserListResponse[]
  projectCount: number
  pendingRequests: AccessRequestResponse[]
  pendingChangeRequests: ChangeRequestResponse[]
}

export function AdminDashboard() {
  const [data, setData] = useState<AdminData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [usersRes, projectsRes, accessRes, changeRes] = await Promise.all([
          usersAPI.list(),
          projectsAPI.list(),
          accessRequestsAPI
            .list({ status: "pending" })
            .catch(() => ({ data: [] as AccessRequestResponse[] })),
          changeRequestsAPI
            .list({ status: "pending" })
            .catch(() => ({ data: [] as ChangeRequestResponse[] })),
        ])
        setData({
          users: usersRes.data,
          projectCount: projectsRes.data.length,
          pendingRequests: accessRes.data,
          pendingChangeRequests: changeRes.data,
        })
      } catch {
        setData(null)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading || !data) return null

  const activeUsers = data.users.filter((u) => u.is_active).length
  const userMap = new Map(data.users.map((u) => [u.id, u]))
  const totalPending = data.pendingRequests.length + data.pendingChangeRequests.length
  const recent = data.pendingRequests.slice(0, 5)

  return (
    <div className="flex flex-col gap-4">
      <span className="text-[13px] font-semibold tracking-[0.14em] uppercase text-fg-muted">
        Platform overview
      </span>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <StatCard icon={Users} label="Total users" value={data.users.length} />
        <StatCard
          icon={UserCheck}
          label="Active users"
          value={activeUsers}
          subtitle={`${data.users.length > 0 ? Math.round((activeUsers / data.users.length) * 100) : 0}% of total`}
        />
        <StatCard icon={FolderOpen} label="Projects" value={data.projectCount} />
        <StatCard
          icon={Clock}
          label="Pending requests"
          value={totalPending}
          highlight={totalPending > 0}
        />
      </div>

      <div className="bg-elevated rounded-[18px] shadow-[var(--shadow-card)] p-5">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-[15.5px] font-semibold text-fg-strong">Needs review</h4>
          <Link
            to="/app/users"
            className="text-[12.5px] font-semibold text-accent hover:underline"
          >
            All requests →
          </Link>
        </div>
        {recent.length > 0 ? (
          <div className="flex flex-col">
            {recent.map((req) => {
              const user = userMap.get(req.user_id)
              const initial = (user?.email?.[0] ?? "?").toUpperCase()
              return (
                <div
                  key={req.id}
                  className="flex items-center gap-[11px] py-[11px] border-b border-line last:border-b-0"
                >
                  <span className="w-8 h-8 rounded-full bg-inverse text-on-dark grid place-items-center text-[11px] font-bold shrink-0">
                    {initial}
                  </span>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-[13.5px] font-semibold text-fg-strong truncate">
                      {user?.email ?? req.user_id}
                    </span>
                    <span className="text-[11.5px] text-fg-subtle truncate">
                      Access to {req.app_key}
                      {req.note ? ` · ${req.note}` : ""} · {timeAgo(req.requested_at)}
                    </span>
                  </div>
                  <Link
                    to="/app/users"
                    className="text-[12.5px] font-semibold text-accent hover:underline shrink-0"
                  >
                    Review →
                  </Link>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-[13px] text-fg-subtle">
            Nothing pending. New app access requests will appear here.
          </p>
        )}
      </div>
    </div>
  )
}
