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

interface SearchPillProps extends FilterSearchConfig {
  size?: "sm" | "md"
  className?: string
}

const pillSizes = {
  sm: {
    pill: "px-3.5 py-2",
    icon: "h-3.5 w-3.5",
    input: "text-[0.8125rem]",
  },
  md: {
    pill: "px-4 py-2.5",
    icon: "h-[0.9375rem] w-[0.9375rem]",
    input: "text-[0.84375rem]",
  },
}

export function SearchPill({
  value,
  onChange,
  placeholder = "Search...",
  size = "md",
  className,
}: SearchPillProps) {
  const sizing = pillSizes[size]
  return (
    <div className={cn("flex min-w-0 items-center gap-2 rounded-full bg-muted", sizing.pill, className)}>
      <Search className={cn("shrink-0 text-fg-subtle", sizing.icon)} strokeWidth={2} />
      <input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "w-full border-0 bg-transparent text-fg-strong outline-none placeholder:text-fg-subtle",
          sizing.input,
        )}
      />
    </div>
  )
}

interface FilterBarProps {
  filters?: FilterConfig[]
  search?: FilterSearchConfig
  resultLabel?: ReactNode
  className?: string
}

export function FilterBar({ filters = [], search, resultLabel, className }: FilterBarProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      {search && <SearchPill {...search} className="flex-1 sm:min-w-[15rem] sm:max-w-[17.5rem]" />}

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
