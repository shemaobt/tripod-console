import { useEffect, useState, useCallback, useRef } from "react"
import { Search, User as UserIcon } from "lucide-react"
import { usersAPI } from "@/services/api"
import type { UserListResponse } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoadingSpinner } from "@/components/common/LoadingSpinner"
import { InfoTooltip } from "@/components/common/InfoTooltip"

export function UserSearchPicker({
  selectedUser,
  onSelect,
  excludeIds,
  label,
  placeholder,
}: {
  selectedUser: UserListResponse | null
  onSelect: (user: UserListResponse | null) => void
  excludeIds?: string[]
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
      // silent
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

  const filtered = excludeIds
    ? results.filter((u) => !excludeIds.includes(u.id))
    : results

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
        <div className="flex items-center gap-3 rounded-lg border border-areia/30 bg-surface-alt/30 px-3 py-2.5">
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-azul/20 overflow-hidden shrink-0">
            {selectedUser.avatar_url ? (
              <img src={selectedUser.avatar_url} alt="" className="h-full w-full object-cover rounded-full" />
            ) : (
              <UserIcon className="h-4 w-4 text-verde/30" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-preto truncate">{selectedUser.email}</p>
            {selectedUser.display_name && (
              <p className="text-xs text-verde/60 truncate">{selectedUser.display_name}</p>
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
            className="text-xs text-verde/50"
          >
            Change
          </Button>
        </div>
      ) : (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-verde/40" />
          <Input
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => query.trim() && setShowResults(true)}
            placeholder={placeholder || "Search users by email or name..."}
            className="pl-9"
          />
          {showResults && (query.trim().length > 0) && (
            <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-surface border border-areia/30 rounded-lg shadow-lg max-h-52 overflow-y-auto">
              {searching ? (
                <div className="flex items-center justify-center py-4">
                  <LoadingSpinner size="sm" />
                </div>
              ) : filtered.length === 0 ? (
                <p className="text-sm text-verde/50 text-center py-4">
                  {results.length > 0 && excludeIds ? "All results already added" : "No users found"}
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
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-surface-alt/50 transition-colors text-left"
                  >
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-azul/20 overflow-hidden shrink-0">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt="" className="h-full w-full object-cover rounded-full" />
                      ) : (
                        <UserIcon className="h-4 w-4 text-verde/30" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-preto truncate">{user.email}</p>
                      {user.display_name && (
                        <p className="text-xs text-verde/60 truncate">{user.display_name}</p>
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
