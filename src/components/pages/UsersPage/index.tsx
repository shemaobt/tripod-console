import { useEffect, useState, useMemo } from "react"
import { Users, Inbox } from "lucide-react"
import { toast } from "sonner"
import { usersAPI, appsAPI } from "@/services/api"
import type { UserListResponse, UserRoleResponse, AppResponse } from "@/types"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { LoadingSpinner } from "@/components/common/LoadingSpinner"
import { EmptyState } from "@/components/common/EmptyState"
import { FilterBar } from "@/components/common/FilterBar"
import { InfoTooltip } from "@/components/common/InfoTooltip"
import { AccessRequestsSection } from "@/components/pages/AccessRequestsSection"
import { UserCard } from "./UserCard"

export default function UsersPage() {
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
            <FilterBar
              search={{
                value: search,
                onChange: setSearch,
                placeholder: "Search by email or name...",
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
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredUsers.map((user) => (
                  <UserCard
                    key={user.id}
                    user={user}
                    roles={userRolesMap.get(user.id) ?? []}
                    apps={apps}
                  />
                ))}
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
