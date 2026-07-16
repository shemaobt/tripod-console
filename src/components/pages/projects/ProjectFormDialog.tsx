import { useEffect, useState } from "react"
import { toast } from "sonner"
import { projectsAPI, changeRequestsAPI, languagesAPI } from "@/services/api"
import type { ProjectResponse } from "@/types"
import { useLanguagesStore } from "@/stores/languagesStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { InfoTooltip } from "@/components/common/InfoTooltip"

const NEW_LANGUAGE = "__new__"

interface ProjectFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingProject: ProjectResponse | null
  isPlatformAdmin: boolean
  onSaved: () => void
}

export function ProjectFormDialog({
  open,
  onOpenChange,
  editingProject,
  isPlatformAdmin,
  onSaved,
}: ProjectFormDialogProps) {
  const {
    languages,
    loading: languagesLoading,
    fetch: fetchLanguages,
    invalidate,
  } = useLanguagesStore()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [languageId, setLanguageId] = useState("")
  const [newLangName, setNewLangName] = useState("")
  const [newLangCode, setNewLangCode] = useState("")
  const [saving, setSaving] = useState(false)

  const isEditing = editingProject !== null
  const wantsNewLanguage = languageId === NEW_LANGUAGE

  useEffect(() => {
    if (!open) return
    fetchLanguages()
    if (editingProject) {
      setName(editingProject.name)
      setDescription(editingProject.description ?? "")
      setLanguageId(editingProject.language_id)
    } else {
      setName("")
      setDescription("")
      setLanguageId("")
    }
    setNewLangName("")
    setNewLangCode("")
  }, [open, editingProject, fetchLanguages])

  const newLangValid = newLangName.trim().length > 0 && newLangCode.trim().length === 3
  const languageValid = wantsNewLanguage
    ? newLangValid
    : languageId.length > 0 && languageId !== NEW_LANGUAGE
  const canSave = name.trim().length > 0 && languageValid && !saving

  async function handleSave() {
    if (!canSave) return
    setSaving(true)
    try {
      if (isEditing) {
        await projectsAPI.update(editingProject.id, {
          name: name.trim(),
          description: description.trim() || null,
          language_id: languageId,
        })
        toast.success("Project updated")
      } else if (isPlatformAdmin) {
        let projectLanguageId = languageId
        if (wantsNewLanguage) {
          const { data: lang } = await languagesAPI.create({
            name: newLangName.trim(),
            code: newLangCode.trim().toLowerCase(),
          })
          projectLanguageId = lang.id
          setLanguageId(lang.id)
          invalidate()
          await fetchLanguages()
        }
        await projectsAPI.create({
          name: name.trim(),
          description: description.trim() || undefined,
          language_id: projectLanguageId,
        })
        toast.success("Project created")
      } else {
        await changeRequestsAPI.create({
          kind: "create_project",
          name: name.trim(),
          description: description.trim() || undefined,
          ...(wantsNewLanguage
            ? {
                new_language_name: newLangName.trim(),
                new_language_code: newLangCode.trim().toLowerCase(),
              }
            : { language_id: languageId }),
        })
        toast.success("Request submitted for a platform admin to review")
      }
      onOpenChange(false)
      onSaved()
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status
      if (status === 409) {
        toast.error(
          wantsNewLanguage
            ? "A project or language with this name or code already exists"
            : "A project with this name already exists",
        )
      } else {
        toast.error(isEditing ? "Failed to update project" : "Failed to create project")
      }
    } finally {
      setSaving(false)
    }
  }

  const title = isEditing
    ? "Edit Project"
    : isPlatformAdmin
      ? "Create Project"
      : "Request New Project"
  const submitLabel = saving
    ? isEditing
      ? "Saving..."
      : isPlatformAdmin
        ? "Creating..."
        : "Submitting..."
    : isEditing
      ? "Save"
      : isPlatformAdmin
        ? "Create"
        : "Submit Request"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update this project's details."
              : isPlatformAdmin
                ? "Projects represent translation or documentation efforts tied to a language."
                : "Your request will be sent to a platform admin to review before the project is created."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5 pt-1">
          <div className="space-y-1.5">
            <Label htmlFor="project-name">Name</Label>
            <Input
              id="project-name"
              placeholder="e.g. Arara Language Documentation"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="project-description">Description</Label>
            <Textarea
              id="project-description"
              placeholder="Brief description of this project"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-1.5">
            <Label>
              <span className="inline-flex items-center">
                Language
                {!isEditing && (
                  <InfoTooltip content="Pick an existing language, or choose 'Create a new language' to request one alongside the project." />
                )}
              </span>
            </Label>
            {languagesLoading && languages.length === 0 ? (
              <p className="text-sm text-fg-muted">Loading languages...</p>
            ) : (
              <Select value={languageId} onValueChange={setLanguageId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a language" />
                </SelectTrigger>
                <SelectContent>
                  {!isEditing && (
                    <SelectItem value={NEW_LANGUAGE}>+ Create a new language</SelectItem>
                  )}
                  {languages.map((lang) => (
                    <SelectItem key={lang.id} value={lang.id}>
                      {lang.name} ({lang.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          {wantsNewLanguage && !isEditing && (
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 rounded-[14px] border border-line bg-muted p-3">
              <div className="space-y-1.5">
                <Label htmlFor="new-lang-name">New language name</Label>
                <Input
                  id="new-lang-name"
                  placeholder="e.g. Arara"
                  value={newLangName}
                  onChange={(e) => setNewLangName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="new-lang-code">
                  <span className="inline-flex items-center">
                    Code
                    <InfoTooltip content="Exactly 3 characters, ISO 639-3." />
                  </span>
                </Label>
                <Input
                  id="new-lang-code"
                  className="sm:w-24"
                  placeholder="ara"
                  maxLength={3}
                  value={newLangCode}
                  onChange={(e) => setNewLangCode(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
        <DialogFooter className="border-t border-line pt-4 mt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!canSave}>
            {submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
