import { useEffect, useState, useMemo } from "react"
import { useNavigate } from "react-router"
import { Users, Inbox, Search, Filter } from "lucide-react"
import { toast } from "sonner"
import { usersAPI, appsAPI } from "@/services/api"
import type { UserListResponse, UserRoleResponse, AppResponse } from "@/types"
import { cn } from "@/utils/cn"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { LoadingSpinner } from "@/components/common/LoadingSpinner"
import { EmptyState } from "@/components/common/EmptyState"
import { InfoTooltip } from "@/components/common/InfoTooltip"
import { AccessRequestsSection } from "@/components/pages/AccessRequestsSection"

import { formatDate } from "@/utils/format"

function UserAvatar({ email, className }: { email: string; className?: string }) {
  const initial = email[0]?.toUpperCase() ?? "?"
  return (
    <div className={cn(
      "h-9 w-9 rounded-full bg-gradient-to-br from-azul/30 to-azul/10 flex items-center justify-center ring-1 ring-areia/15 shrink-0",
      className,
    )}>
      <span className="text-xs font-semibold text-azul">{initial}</span>
    </div>
  )
}

export default function UsersPage() {
  const navigate = useNavigate()
  const [users, setUsers] = useState<UserListResponse[]>([])
  const [apps, setApps] = useState<AppResponse[]>([])
  const [userRolesMap, setUserRolesMap] = useState<Map<string, UserRoleResponse[]>>(new Map())
  const [loading, setLoading] = useState(true)
  const [filterApp, setFilterApp] = useState("all")
  const [search, setSearch] = useState("")

  useEffect(() => {
    async function fetchData() {
      try {
        const [usersRes, appsRes] = await Promise.all([
          usersAPI.list(),
          appsAPI.list(),
        ])
        setUsers(usersRes.data)
        setApps(appsRes.data)

        const rolesEntries = await Promise.all(
          usersRes.data.map(async (u) => {
            try {
              const { data } = await usersAPI.listRoles(u.id)
              return [u.id, data] as [string, UserRoleResponse[]]
            } catch {
              return [u.id, [] as UserRoleResponse[]] as [string, UserRoleResponse[]]
            }
          }),
        )
        setUserRolesMap(new Map(rolesEntries))
      } catch {
        toast.error("Failed to load users")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const filteredUsers = useMemo(() => users.filter((u) => {
    const matchesApp =
      filterApp === "all" ||
      (userRolesMap.get(u.id) ?? []).some((r) => r.app_key === filterApp)
    const matchesSearch =
      !search ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.display_name?.toLowerCase().includes(search.toLowerCase())
    return matchesApp && matchesSearch
  }), [users, userRolesMap, filterApp, search])

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="p-6 md:p-8 lg:p-10 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-preto tracking-tight flex items-center">
          Users
          <InfoTooltip content="View and manage all registered users in the platform." />
        </h1>
        <p className="text-sm text-verde/60 mt-1">
          {users.length} registered user{users.length !== 1 ? "s" : ""}
        </p>
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-1.5" />
            Users
          </TabsTrigger>
          <TabsTrigger value="requests">
            <Inbox className="h-4 w-4 mr-1.5" />
            Access Requests
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <div className="space-y-5">
            {/* Filter bar */}
            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-areia/15 bg-surface-alt/30 p-3.5">
              <div className="relative flex-1 min-w-0 sm:min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-verde/30" />
                <Input
                  placeholder="Search by email or name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-surface border-areia/20"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-verde/30" />
                <Select value={filterApp} onValueChange={setFilterApp}>
                  <SelectTrigger className="w-full sm:w-48 bg-surface">
                    <SelectValue placeholder="All Apps" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Apps</SelectItem>
                    {apps.map((app) => (
                      <SelectItem key={app.id} value={app.app_key}>
                        {app.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <span className="text-xs text-verde/50 tabular-nums ml-auto">
                {filteredUsers.length} result{filteredUsers.length !== 1 ? "s" : ""}
              </span>
            </div>

            {filteredUsers.length === 0 ? (
              <EmptyState
                icon={Users}
                title={filterApp === "all" && !search ? "No users found" : "No matching users"}
                description={
                  filterApp === "all" && !search
                    ? "There are no registered users in the system yet."
                    : "Try adjusting your search or filter criteria."
                }
              />
            ) : (
              <div className="rounded-2xl border border-areia/20 bg-surface shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-surface-alt/40">
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-verde/70 tracking-wider uppercase">
                        User
                      </th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-verde/70 tracking-wider uppercase">
                        <span className="inline-flex items-center">
                          Status
                          <InfoTooltip content="Whether the user can log in and access the platform." />
                        </span>
                      </th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-verde/70 tracking-wider uppercase">
                        <span className="inline-flex items-center">
                          Role
                          <InfoTooltip content="Platform admins have full access to manage users, apps, and all system settings." />
                        </span>
                      </th>
                      {filterApp !== "all" && (
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-verde/70 tracking-wider uppercase">
                          App Roles
                        </th>
                      )}
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-verde/70 tracking-wider uppercase hidden md:table-cell">
                        Joined
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => {
                      const roles = userRolesMap.get(user.id) ?? []
                      const appRoles =
                        filterApp !== "all"
                          ? roles.filter((r) => r.app_key === filterApp)
                          : []
                      return (
                        <tr
                          key={user.id}
                          className="border-t border-areia/10 hover:bg-surface-alt/30 cursor-pointer transition-colors"
                          onClick={() => navigate(`/app/users/${user.id}`)}
                        >
                          <td className="px-3 sm:px-6 py-3 sm:py-4">
                            <div className="flex items-center gap-3">
                              <UserAvatar email={user.email} />
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-preto truncate">
                                  {user.display_name || user.email}
                                </p>
                                {user.display_name && (
                                  <p className="text-xs text-verde/50 truncate mt-0.5">{user.email}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4">
                            <Badge variant={user.is_active ? "active" : "inactive"}>
                              {user.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4">
                            {user.is_platform_admin ? (
                              <Badge variant="success">Admin</Badge>
                            ) : (
                              <span className="text-xs text-verde/40">Member</span>
                            )}
                          </td>
                          {filterApp !== "all" && (
                            <td className="px-3 sm:px-6 py-3 sm:py-4">
                              <div className="flex flex-wrap gap-1">
                                {appRoles.map((r) => (
                                  <Badge key={r.role_key} variant="success">
                                    {r.role_key}
                                  </Badge>
                                ))}
                              </div>
                            </td>
                          )}
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-verde/60 tabular-nums hidden md:table-cell">
                            {formatDate(user.created_at)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="requests">
          <AccessRequestsSection users={users} apps={apps} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
