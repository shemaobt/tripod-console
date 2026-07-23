import type { ReactNode } from "react"
import { Search } from "lucide-react"
import { cn } from "@/utils/cn"
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
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      {search && (
        <div className="flex items-center gap-2 bg-muted rounded-full px-4 py-2.5 flex-1 min-w-0 sm:min-w-[15rem] sm:max-w-[17.5rem]">
          <Search className="h-[0.9375rem] w-[0.9375rem] text-fg-subtle shrink-0" strokeWidth={2} />
          <input
            placeholder={search.placeholder ?? "Search..."}
            value={search.value}
            onChange={(e) => search.onChange(e.target.value)}
            className="bg-transparent border-0 outline-none text-[0.84375rem] text-fg-strong placeholder:text-fg-subtle w-full"
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
                "w-full sm:w-48 rounded-full bg-muted shadow-none",
                active && "text-accent",
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
        <span className="text-xs text-fg-subtle tabular-nums ml-auto">{resultLabel}</span>
      )}
    </div>
  )
}
