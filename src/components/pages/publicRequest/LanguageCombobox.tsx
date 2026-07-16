import { useMemo, useState } from "react"
import { ChevronDown } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { cn } from "@/utils/cn"
import type { PublicLanguageOption } from "@/types"

export const NEW_LANGUAGE = "__new__"

interface LanguageComboboxProps {
  languages: PublicLanguageOption[]
  value: string
  onChange: (value: string) => void
}

export function LanguageCombobox({ languages, value, onChange }: LanguageComboboxProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return languages
    return languages.filter(
      (lang) => lang.name.toLowerCase().includes(q) || lang.code.toLowerCase().includes(q),
    )
  }, [languages, query])

  const selected = languages.find((lang) => lang.id === value)
  const triggerLabel = selected ? `${selected.name} (${selected.code})` : "Select a language"

  function select(next: string) {
    onChange(next)
    setOpen(false)
    setQuery("")
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          className="flex w-full items-center justify-between gap-2.5 border-b-[1.5px] border-input-border py-[9px] text-[15px] text-fg-strong"
        >
          <span className={cn("truncate", !selected && "text-fg-subtle")}>{triggerLabel}</span>
          <ChevronDown className="h-4 w-4 shrink-0 text-fg-subtle" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="p-1.5"
        style={{ width: "var(--radix-popover-trigger-width)" }}
      >
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or code..."
          className="mb-2 text-sm"
          autoFocus
        />
        <div className="max-h-[230px] overflow-y-auto">
          {filtered.map((lang) => (
            <button
              key={lang.id}
              type="button"
              onClick={() => select(lang.id)}
              className="flex w-full items-center justify-between gap-2.5 rounded-lg px-2.5 py-[9px] text-left text-[14px] text-fg hover:bg-muted"
            >
              <span className="truncate">{lang.name}</span>
              <span className="font-mono text-[11.5px] text-fg-subtle">{lang.code}</span>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="px-2.5 py-[9px] text-sm text-fg-subtle">No language matches "{query}"</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
