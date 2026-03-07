import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { Users } from "lucide-react"
import { toast } from "sonner"
import { usersAPI } from "@/services/api"
import type { UserListResponse } from "@/types"
import { card } from "@/styles"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/common/LoadingSpinner"
import { EmptyState } from "@/components/common/EmptyState"
import { InfoTooltip } from "@/components/common/InfoTooltip"

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export default function UsersPage() {
  const navigate = useNavigate()
  const [users, setUsers] = useState<UserListResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUsers() {
      try {
        const { data } = await usersAPI.list()
        setUsers(data)
      } catch {
        toast.error("Failed to load users")
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [])

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-preto tracking-tight flex items-center">
          Users
          <InfoTooltip content="View and manage all registered users in the platform." />
        </h1>
      </div>

      {users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No users found"
          description="There are no registered users in the system yet. Users are created when they sign up or are provisioned by an administrator."
        />
      ) : (
        <div className={`${card.base} overflow-hidden`}>
          <table className="w-full">
            <thead>
              <tr className="bg-surface-alt">
                <th className="px-4 py-3 text-left text-verde text-sm font-medium">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-verde text-sm font-medium">
                  Display Name
                </th>
                <th className="px-4 py-3 text-left text-verde text-sm font-medium">
                  <span className="inline-flex items-center">
                    Active
                    <InfoTooltip content="Whether the user can log in and access the platform." />
                  </span>
                </th>
                <th className="px-4 py-3 text-left text-verde text-sm font-medium">
                  <span className="inline-flex items-center">
                    Platform Admin
                    <InfoTooltip content="Platform admins have full access to manage users, apps, and all system settings." />
                  </span>
                </th>
                <th className="px-4 py-3 text-left text-verde text-sm font-medium">
                  Created
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-t border-areia/20 hover:bg-surface-alt/50 cursor-pointer"
                  onClick={() => navigate(`/app/users/${user.id}`)}
                >
                  <td className="px-4 py-3 text-sm text-preto font-medium">
                    {user.email}
                  </td>
                  <td className="px-4 py-3 text-sm text-preto">
                    {user.display_name || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={user.is_active ? "active" : "inactive"}>
                      {user.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    {user.is_platform_admin && (
                      <Badge variant="success">Admin</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-verde">
                    {formatDate(user.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
