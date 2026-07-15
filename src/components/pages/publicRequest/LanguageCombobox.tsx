import { useMemo, useState } from "react"
import { Check, ChevronsUpDown, Plus } from "lucide-react"
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
  const triggerLabel =
    value === NEW_LANGUAGE
      ? "+ Create a new language"
      : selected
        ? `${selected.name} (${selected.code})`
        : "Select or search a language"

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
          className="flex h-10 w-full items-center justify-between rounded-lg border border-areia bg-surface px-3 py-2 text-sm text-preto focus:ring-2 focus:ring-telha focus:border-telha"
        >
          <span className={cn("truncate", !selected && value !== NEW_LANGUAGE && "text-areia")}>
            {triggerLabel}
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="p-2"
        style={{ width: "var(--radix-popover-trigger-width)" }}
      >
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or code..."
          className="h-9 mb-2"
          autoFocus
        />
        <div className="max-h-56 overflow-y-auto space-y-0.5">
          <button
            type="button"
            onClick={() => select(NEW_LANGUAGE)}
            className={cn(
              "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-telha hover:bg-areia/10",
              value === NEW_LANGUAGE && "bg-areia/10",
            )}
          >
            <Plus className="h-4 w-4 shrink-0" />
            Create a new language
          </button>
          {filtered.map((lang) => (
            <button
              key={lang.id}
              type="button"
              onClick={() => select(lang.id)}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-preto hover:bg-areia/10"
            >
              <Check
                className={cn(
                  "h-4 w-4 shrink-0 text-telha",
                  value === lang.id ? "opacity-100" : "opacity-0",
                )}
              />
              <span className="truncate">
                {lang.name} ({lang.code})
              </span>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="px-2 py-1.5 text-sm text-verde/50">No language matches "{query}"</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
