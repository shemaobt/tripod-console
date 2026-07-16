import { useState } from "react"
import { toast } from "sonner"
import { publicAPI } from "@/services/api"
import type { PublicLanguageOption } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { ReCaptcha, RECAPTCHA_ENABLED } from "@/components/common/ReCaptcha"
import { LanguageCombobox, NEW_LANGUAGE } from "./LanguageCombobox"
import { Loader2 } from "lucide-react"

interface ProjectRequestFormProps {
  requesterName: string
  requesterEmail: string
  requesterValid: boolean
  languages: PublicLanguageOption[]
  languagesLoading: boolean
  languagesError: boolean
  onRetryLanguages: () => void
  onSuccess: () => void
}

export function ProjectRequestForm({
  requesterName,
  requesterEmail,
  requesterValid,
  languages,
  languagesLoading,
  languagesError,
  onRetryLanguages,
  onSuccess,
}: ProjectRequestFormProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [languageId, setLanguageId] = useState("")
  const [newLangName, setNewLangName] = useState("")
  const [newLangCode, setNewLangCode] = useState("")
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [captchaEpoch, setCaptchaEpoch] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const wantsNewLanguage = languageId === NEW_LANGUAGE
  const normalizedNewName = newLangName.trim().toLowerCase()
  const normalizedNewCode = newLangCode.trim().toLowerCase()
  const newNameExists = languages.some((lang) => lang.name.toLowerCase() === normalizedNewName)
  const newCodeExists = languages.some((lang) => lang.code.toLowerCase() === normalizedNewCode)
  const newLangValid =
    newLangName.trim().length > 0 &&
    /^[A-Za-z]{3}$/.test(newLangCode.trim()) &&
    !newNameExists &&
    !newCodeExists
  const languageValid = wantsNewLanguage
    ? newLangValid
    : languageId.length > 0 && languageId !== NEW_LANGUAGE
  const canSubmit =
    requesterValid &&
    name.trim().length > 0 &&
    languageValid &&
    (!RECAPTCHA_ENABLED || !!captchaToken) &&
    !submitting

  function resetCaptcha() {
    setCaptchaToken(null)
    setCaptchaEpoch((epoch) => epoch + 1)
  }

  function toggleProposeNew(next: boolean) {
    setLanguageId(next ? NEW_LANGUAGE : "")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)
    try {
      await publicAPI.requestProject({
        requester_name: requesterName.trim(),
        requester_email: requesterEmail.trim(),
        name: name.trim(),
        description: description.trim() || undefined,
        language_id: wantsNewLanguage ? undefined : languageId,
        new_language_name: wantsNewLanguage ? newLangName.trim() : undefined,
        new_language_code: wantsNewLanguage ? normalizedNewCode : undefined,
        recaptcha_token: captchaToken ?? undefined,
      })
      onSuccess()
    } catch (err: unknown) {
      const response = (err as { response?: { status?: number; data?: { detail?: string } } })
        ?.response
      const detail = typeof response?.data?.detail === "string" ? response.data.detail : null
      if (response?.status === 409) {
        toast.error(detail || "This language already exists or was already requested")
      } else if (response?.status === 429) {
        toast.error("Too many requests. Please wait a moment and try again.")
      } else if (response?.status === 422) {
        toast.error("Please check your email address and the form fields.")
      } else if (response?.status === 400) {
        toast.error(detail || "The request was rejected. Please try again.")
      } else {
        toast.error("Failed to submit the request")
      }
      resetCaptcha()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col">
        <Label htmlFor="request-project-name">Project name</Label>
        <Input
          id="request-project-name"
          placeholder="e.g. Apurinã Luke — Audio"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="flex flex-col">
        <Label htmlFor="request-project-description">
          Description <span className="font-normal text-fg-subtle">(optional)</span>
        </Label>
        <Textarea
          id="request-project-description"
          placeholder="Communities, modality, scope…"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
        />
      </div>
      {!wantsNewLanguage && (
        <div className="flex flex-col">
          <Label>Target language</Label>
          {languagesLoading ? (
            <p className="text-sm text-fg-muted">Loading languages...</p>
          ) : languagesError ? (
            <div className="flex items-center gap-3">
              <p className="text-sm text-st-warn">Failed to load languages.</p>
              <Button type="button" variant="outline" size="sm" onClick={onRetryLanguages}>
                Retry
              </Button>
            </div>
          ) : (
            <LanguageCombobox languages={languages} value={languageId} onChange={setLanguageId} />
          )}
        </div>
      )}
      <div className="flex items-center gap-3">
        <Switch
          id="propose-new-language"
          checked={wantsNewLanguage}
          onCheckedChange={toggleProposeNew}
        />
        <Label htmlFor="propose-new-language" className="mb-0 text-sm font-normal text-fg">
          Propose a new language instead
        </Label>
      </div>
      {wantsNewLanguage && (
        <div className="grid grid-cols-1 sm:grid-cols-[1.4fr_1fr] gap-5 bg-muted rounded-[14px] p-[18px]">
          <div className="flex flex-col">
            <Label htmlFor="request-new-lang-name">Language name</Label>
            <Input
              id="request-new-lang-name"
              placeholder="e.g. Apurinã"
              value={newLangName}
              onChange={(e) => setNewLangName(e.target.value)}
            />
            {newNameExists && (
              <p className="text-xs text-st-warn mt-1">This language name is already registered.</p>
            )}
          </div>
          <div className="flex flex-col">
            <Label htmlFor="request-new-lang-code">Code</Label>
            <Input
              id="request-new-lang-code"
              className="font-mono"
              placeholder="3 letters"
              maxLength={3}
              value={newLangCode}
              onChange={(e) => setNewLangCode(e.target.value)}
            />
            {newCodeExists && (
              <p className="text-xs text-st-warn mt-1">This code is already registered.</p>
            )}
          </div>
          <span className="sm:col-span-2 text-[11.5px] text-fg-subtle">
            Code: exactly 3 letters (ISO 639-3 style). Checked against existing languages and
            pending requests.
          </span>
        </div>
      )}
      <ReCaptcha key={captchaEpoch} onChange={setCaptchaToken} />
      <div className="flex items-center justify-between gap-3.5 border-t border-line pt-5">
        <span className="text-[11.5px] text-fg-subtle">Rate limited — 5 submissions per minute.</span>
        <Button type="submit" disabled={!canSubmit}>
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitting ? "Submitting..." : "Submit request"}
        </Button>
      </div>
    </form>
  )
}
