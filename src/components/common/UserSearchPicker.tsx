import { useEffect, useState, useCallback, useRef } from "react"
import { Search, User as UserIcon } from "lucide-react"
import { usersAPI } from "@/services/api"
import type { UserListResponse } from "@/types"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { LoadingSpinner } from "@/components/common/LoadingSpinner"
import { InfoTooltip } from "@/components/common/InfoTooltip"

export function UserSearchPicker({
  selectedUser,
  onSelect,
  excludeIds,
  excludePlatformAdmins,
  label,
  placeholder,
}: {
  selectedUser: UserListResponse | null
  onSelect: (user: UserListResponse | null) => void
  excludeIds?: string[]
  excludePlatformAdmins?: boolean
  label?: string
  placeholder?: string
}) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<UserListResponse[]>([])
  const [searching, setSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([])
      return
    }
    setSearching(true)
    try {
      const { data } = await usersAPI.search(q)
      setResults(data)
    } catch {
    } finally {
      setSearching(false)
    }
  }, [])

  function handleInputChange(value: string) {
    setQuery(value)
    setShowResults(true)
    if (selectedUser) onSelect(null)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(value), 300)
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const filtered = results.filter(
    (u) =>
      !(excludePlatformAdmins && u.is_platform_admin) &&
      !excludeIds?.includes(u.id),
  )

  return (
    <div ref={containerRef} className="space-y-1.5">
      {label && (
        <Label>
          <span className="inline-flex items-center">
            {label}
            <InfoTooltip content="Search by email or display name to find a user." />
          </span>
        </Label>
      )}
      {selectedUser ? (
        <div className="flex items-center gap-3 rounded-2xl bg-muted px-3 py-2.5">
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-azul/20 overflow-hidden shrink-0">
            {selectedUser.avatar_url ? (
              <img src={selectedUser.avatar_url} alt="" className="h-full w-full object-cover rounded-full" />
            ) : (
              <UserIcon className="h-4 w-4 text-fg-subtle" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-fg-strong truncate">{selectedUser.email}</p>
            {selectedUser.display_name && (
              <p className="text-xs text-fg-subtle truncate">{selectedUser.display_name}</p>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              onSelect(null)
              setQuery("")
              setResults([])
            }}
            className="text-xs text-fg-muted"
          >
            Change
          </Button>
        </div>
      ) : (
        <div className="relative">
          <div className="flex items-center gap-2 bg-muted rounded-full px-4 py-2.5">
            <Search className="h-4 w-4 text-fg-subtle shrink-0" />
            <input
              value={query}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={() => query.trim() && setShowResults(true)}
              placeholder={placeholder || "Search users by email or name..."}
              className="flex-1 bg-transparent border-0 outline-none text-sm text-fg-strong placeholder:text-fg-subtle"
            />
          </div>
          {showResults && (query.trim().length > 0) && (
            <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-elevated rounded-xl shadow-[var(--shadow-lg)] p-1.5 max-h-52 overflow-y-auto">
              {searching ? (
                <div className="flex items-center justify-center py-4">
                  <LoadingSpinner size="sm" />
                </div>
              ) : filtered.length === 0 ? (
                <p className="text-sm text-fg-subtle text-center py-4">
                  {results.length > 0
                    ? "All matching users are already added or unavailable"
                    : "No users found"}
                </p>
              ) : (
                filtered.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => {
                      onSelect(user)
                      setShowResults(false)
                      setQuery("")
                    }}
                    className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg hover:bg-muted transition-colors text-left"
                  >
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-azul/20 overflow-hidden shrink-0">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt="" className="h-full w-full object-cover rounded-full" />
                      ) : (
                        <UserIcon className="h-4 w-4 text-fg-subtle" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-fg-strong truncate">{user.email}</p>
                      {user.display_name && (
                        <p className="text-xs text-fg-subtle truncate">{user.display_name}</p>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
