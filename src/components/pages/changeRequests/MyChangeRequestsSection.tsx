import { useCallback, useEffect, useState } from "react"
import { Inbox } from "lucide-react"
import { toast } from "sonner"
import { changeRequestsAPI } from "@/services/api"
import type { ChangeRequestKind, ChangeRequestResponse } from "@/types"
import { useLanguagesStore } from "@/stores/languagesStore"
import { LoadingSpinner } from "@/components/common/LoadingSpinner"
import { EmptyState } from "@/components/common/EmptyState"
import { FilterBar } from "@/components/common/FilterBar"
import { ChangeRequestCard } from "@/components/pages/changeRequests/ChangeRequestCard"

interface MyChangeRequestsSectionProps {
  kinds?: ChangeRequestKind[]
}

export function MyChangeRequestsSection({ kinds }: MyChangeRequestsSectionProps) {
  const kindKey = kinds ? kinds.join(",") : ""
  const fetchLanguages = useLanguagesStore((s) => s.fetch)
  const [requests, setRequests] = useState<ChangeRequestResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState("all")

  const fetchRequests = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await changeRequestsAPI.mine()
      const allowed = kindKey ? new Set(kindKey.split(",")) : null
      setRequests(allowed ? data.filter((r) => allowed.has(r.kind)) : data)
    } catch {
      toast.error("Failed to load your requests")
    } finally {
      setLoading(false)
    }
  }, [kindKey])

  useEffect(() => {
    fetchLanguages()
    fetchRequests()
  }, [fetchLanguages, fetchRequests])

  const visible =
    filterStatus === "all" ? requests : requests.filter((r) => r.status === filterStatus)

  return (
    <div className="space-y-4">
      <FilterBar
        filters={[
          {
            key: "status",
            label: "All Statuses",
            value: filterStatus,
            onChange: setFilterStatus,
            className: "w-full sm:w-44",
            options: [
              { value: "all", label: "All Statuses" },
              { value: "pending", label: "Pending" },
              { value: "approved", label: "Approved" },
              { value: "rejected", label: "Rejected" },
            ],
          },
        ]}
        resultLabel={loading ? "..." : `${visible.length} request${visible.length !== 1 ? "s" : ""}`}
      />

      {loading ? (
        <LoadingSpinner />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No requests yet"
          description="When you request a new project or language, or an edit, it appears here with its status. Once a platform admin reviews it, their notes show up too."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {visible.map((req) => (
            <ChangeRequestCard key={req.id} req={req} showStatus />
          ))}
        </div>
      )}
    </div>
  )
}
