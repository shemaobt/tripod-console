import type { ReactNode } from "react"
import { Search } from "lucide-react"
import { cn } from "@/utils/cn"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export interface FilterConfig {
  key: string
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  placeholder?: string
  inactiveValue?: string
  className?: string
}

export interface FilterSearchConfig {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

interface FilterBarProps {
  filters: FilterConfig[]
  search?: FilterSearchConfig
  resultLabel?: ReactNode
  className?: string
}

export function FilterBar({ filters, search, resultLabel, className }: FilterBarProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 rounded-2xl border border-areia/15 bg-surface-alt/30 p-3.5",
        className,
      )}
    >
      {search && (
        <div className="relative flex-1 min-w-0 sm:min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-verde/30" />
          <Input
            placeholder={search.placeholder ?? "Search..."}
            value={search.value}
            onChange={(e) => search.onChange(e.target.value)}
            className="pl-9 bg-surface border-areia/20"
          />
        </div>
      )}

      {filters.map((filter) => {
        const inactiveValue = filter.inactiveValue ?? "all"
        const active = filter.value !== inactiveValue
        return (
          <Select key={filter.key} value={filter.value} onValueChange={filter.onChange}>
            <SelectTrigger
              aria-label={filter.label}
              className={cn(
                "w-full sm:w-48 bg-surface",
                active && "border-telha text-telha ring-1 ring-telha/20",
                filter.className,
              )}
            >
              <SelectValue placeholder={filter.placeholder ?? filter.label} />
            </SelectTrigger>
            <SelectContent>
              {filter.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      })}

      {resultLabel != null && (
        <span className="text-xs text-verde/50 tabular-nums ml-auto">{resultLabel}</span>
      )}
    </div>
  )
}
