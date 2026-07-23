import { useState } from "react"
import { toast } from "sonner"
import { projectsAPI } from "@/services/api"
import type { ProjectResponse, LanguageResponse } from "@/types"
import { card } from "@/styles"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ProjectInfoFormProps {
  project: ProjectResponse
  languages: LanguageResponse[]
  languagesLoading: boolean
  onSaved: (project: ProjectResponse) => void
}

export function ProjectInfoForm({
  project,
  languages,
  languagesLoading,
  onSaved,
}: ProjectInfoFormProps) {
  const [name, setName] = useState(project.name)
  const [description, setDescription] = useState(project.description ?? "")
  const [languageId, setLanguageId] = useState(project.language_id)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!name.trim() || !languageId) return
    setSaving(true)
    try {
      const { data } = await projectsAPI.update(project.id, {
        name: name.trim(),
        description: description.trim() || null,
        language_id: languageId,
      })
      onSaved(data)
      toast.success("Project updated")
    } catch {
      toast.error("Failed to update project")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={`${card.base} p-5 sm:p-6 flex flex-col gap-5`}>
      <h4 className="text-[0.96875rem] font-semibold text-fg-strong">
        Project information
      </h4>
      <div className="space-y-1.5">
        <Label htmlFor="pj-name">Name</Label>
        <Input
          id="pj-name"
          placeholder="Project name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="pj-description">Description</Label>
        <Textarea
          id="pj-description"
          placeholder="Brief description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>
      <div className="space-y-1.5">
        <Label>Language</Label>
        {languagesLoading ? (
          <p className="text-sm text-fg-muted">Loading languages...</p>
        ) : (
          <Select value={languageId} onValueChange={setLanguageId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a language" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.id} value={lang.id}>
                  {lang.name} ({lang.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving || !name.trim() || !languageId}
        >
          {saving ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </div>
  )
}
