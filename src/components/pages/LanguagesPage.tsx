import { useEffect, useState } from "react"
import { Languages, Plus } from "lucide-react"
import { toast } from "sonner"
import { languagesAPI } from "@/services/api"
import type { LanguageResponse } from "@/types"
import { card } from "@/styles"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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

export default function LanguagesPage() {
  const [languages, setLanguages] = useState<LanguageResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState("")
  const [code, setCode] = useState("")

  async function fetchLanguages() {
    try {
      const { data } = await languagesAPI.list()
      setLanguages(data)
    } catch {
      toast.error("Failed to load languages")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLanguages()
  }, [])

  function openDialog() {
    setName("")
    setCode("")
    setDialogOpen(true)
  }

  async function handleCreate() {
    if (!name.trim() || code.trim().length !== 3) return
    setCreating(true)
    try {
      await languagesAPI.create({ name: name.trim(), code: code.trim().toLowerCase() })
      toast.success("Language created")
      setDialogOpen(false)
      await fetchLanguages()
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status
      if (status === 409) {
        toast.error("A language with this code already exists")
      } else {
        toast.error("Failed to create language")
      }
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-preto tracking-tight flex items-center">
          Languages
          <InfoTooltip content="Manage the translation target languages for your projects." />
        </h1>
        <Button onClick={openDialog}>
          <Plus className="h-4 w-4" />
          New Language
        </Button>
      </div>

      {languages.length === 0 ? (
        <EmptyState
          icon={Languages}
          title="No languages yet"
          description="Languages define the translation targets for your projects. Create one to get started."
          actionLabel="Create Language"
          onAction={openDialog}
        />
      ) : (
        <div className={`${card.base} overflow-hidden`}>
          <table className="w-full">
            <thead>
              <tr className="bg-surface-alt">
                <th className="px-4 py-3 text-left text-verde text-sm font-medium">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-verde text-sm font-medium">
                  <span className="inline-flex items-center">
                    Code
                    <InfoTooltip content="Exactly 3 characters, ISO 639-3." />
                  </span>
                </th>
                <th className="px-4 py-3 text-left text-verde text-sm font-medium">
                  Created
                </th>
              </tr>
            </thead>
            <tbody>
              {languages.map((lang) => (
                <tr
                  key={lang.id}
                  className="border-t border-areia/20 hover:bg-surface-alt/50"
                >
                  <td className="px-4 py-3 text-sm text-preto font-medium">
                    {lang.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-preto font-mono">
                    {lang.code}
                  </td>
                  <td className="px-4 py-3 text-sm text-verde">
                    {formatDate(lang.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Language</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="lang-name">Name</Label>
              <Input
                id="lang-name"
                placeholder="e.g. English"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lang-code">
                <span className="inline-flex items-center">
                  Code
                  <InfoTooltip content="Exactly 3 characters, ISO 639-3." />
                </span>
              </Label>
              <Input
                id="lang-code"
                placeholder="e.g. eng"
                maxLength={3}
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <p className="text-xs text-verde/60">
                Must be exactly 3 characters (ISO 639-3)
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={creating || !name.trim() || code.trim().length !== 3}
            >
              {creating ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
