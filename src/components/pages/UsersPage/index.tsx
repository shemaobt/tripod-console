import { useEffect, useState, useMemo } from "react"
import { Users } from "lucide-react"
import { toast } from "sonner"
import { usersAPI, appsAPI } from "@/services/api"
import type { UserListResponse, UserRoleResponse, AppResponse } from "@/types"
import { cn } from "@/utils/cn"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { LoadingSpinner } from "@/components/common/LoadingSpinner"
import { EmptyState } from "@/components/common/EmptyState"
import { FilterBar } from "@/components/common/FilterBar"
import { AccessRequestsSection } from "@/components/pages/AccessRequestsSection"
import { useRequestCountsStore } from "@/stores/requestCountsStore"
import { UserCard } from "./UserCard"

const roleLegend = [
  { label: "Platform admin", dot: "bg-inverse" },
  { label: "Manager", dot: "bg-telha" },
  { label: "Member", dot: "bg-verde-claro" },
]

export default function UsersPage() {
  const [users, setUsers] = useState<UserListResponse[]>([])
  const [apps, setApps] = useState<AppResponse[]>([])
  const [userRolesMap, setUserRolesMap] = useState<Map<string, UserRoleResponse[]>>(new Map())
  const [loading, setLoading] = useState(true)
  const [filterApp, setFilterApp] = useState("all")
  const [search, setSearch] = useState("")
  const accessCount = useRequestCountsStore((s) => s.counts.access)
  const fetchCounts = useRequestCountsStore((s) => s.fetch)
  const refreshCounts = useRequestCountsStore((s) => s.refresh)

  useEffect(() => {
    fetchCounts()
  }, [fetchCounts])

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
    <div className="max-w-[77.5rem] mx-auto px-6 sm:px-10 pt-8 pb-14">
      <Tabs defaultValue="users">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-5">
          <div className="flex flex-col gap-1">
            <span className="text-[0.8125rem] font-semibold tracking-[0.14em] uppercase text-fg-muted">
              Administration
            </span>
            <h3 className="text-[1.5625rem] font-bold text-fg-strong tracking-tight">Users</h3>
            <span className="text-[0.78125rem] text-fg-subtle">
              Global roles are derived from data — manager means managing at least one project.
            </span>
            <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5 mt-[0.1875rem]">
              {roleLegend.map((r) => (
                <span
                  key={r.label}
                  className="inline-flex items-center gap-1.5 text-[0.71875rem] text-fg-muted"
                >
                  <span className={cn("w-2 h-2 rounded-full shrink-0", r.dot)} />
                  {r.label}
                </span>
              ))}
            </div>
          </div>

          <TabsList className="self-start sm:self-auto">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="requests">
              Access requests
              {accessCount > 0 && (
                <span className="bg-telha text-on-dark rounded-full text-[0.625rem] font-bold px-1.5 py-px">
                  {accessCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="users">
          <div className="space-y-4">
            <FilterBar
              search={{
                value: search,
                onChange: setSearch,
                placeholder: "Search name or email…",
              }}
              filters={[
                {
                  key: "app",
                  label: "All Apps",
                  value: filterApp,
                  onChange: setFilterApp,
                  options: [
                    { value: "all", label: "All Apps" },
                    ...apps.map((app) => ({ value: app.app_key, label: app.name })),
                  ],
                },
              ]}
              resultLabel={`${filteredUsers.length} result${filteredUsers.length !== 1 ? "s" : ""}`}
            />

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
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
                {filteredUsers.map((user) => (
                  <UserCard
                    key={user.id}
                    user={user}
                    roles={userRolesMap.get(user.id) ?? []}
                  />
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="requests">
          <AccessRequestsSection users={users} apps={apps} onReviewed={refreshCounts} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
