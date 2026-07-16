import { useCallback, useEffect, useState } from "react"
import { Inbox } from "lucide-react"
import { toast } from "sonner"
import { changeRequestsAPI } from "@/services/api"
import type { ChangeRequestKind, ChangeRequestResponse } from "@/types"
import { useLanguagesStore } from "@/stores/languagesStore"
import { cn } from "@/utils/cn"
import { LoadingSpinner } from "@/components/common/LoadingSpinner"
import { EmptyState } from "@/components/common/EmptyState"
import { ChangeRequestCard } from "@/components/pages/changeRequests/ChangeRequestCard"
import { fromChangeRequest } from "@/components/pages/changeRequests/reviewableRequest"

const statusChips = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
]

interface MyChangeRequestsSectionProps {
  kinds?: ChangeRequestKind[]
  emptyLabel?: string
}

export function MyChangeRequestsSection({ kinds, emptyLabel }: MyChangeRequestsSectionProps) {
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
      <div className="flex flex-wrap items-center gap-2">
        {statusChips.map((chip) => (
          <button
            key={chip.value}
            type="button"
            onClick={() => setFilterStatus(chip.value)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors",
              filterStatus === chip.value
                ? "bg-inverse text-on-dark"
                : "bg-muted text-fg-muted hover:text-fg-strong",
            )}
          >
            {chip.label}
          </button>
        ))}
        <span className="text-xs text-fg-subtle tabular-nums ml-auto">
          {loading ? "..." : `${visible.length} request${visible.length !== 1 ? "s" : ""}`}
        </span>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No requests yet"
          description={
            emptyLabel ??
            "When you submit a request, it appears here with its status. Once a platform admin reviews it, their notes show up too."
          }
        />
      ) : (
        <div className="bg-elevated rounded-[18px] shadow-[var(--shadow-card)] overflow-hidden">
          {visible.map((req) => (
            <ChangeRequestCard key={req.id} req={fromChangeRequest(req)} />
          ))}
        </div>
      )}
    </div>
  )
}
