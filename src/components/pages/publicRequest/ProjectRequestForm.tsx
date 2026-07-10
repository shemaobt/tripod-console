import { useState } from "react"
import { toast } from "sonner"
import { publicAPI } from "@/services/api"
import type { PublicLanguageOption } from "@/types"
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
import { InfoTooltip } from "@/components/common/InfoTooltip"
import { ReCaptcha } from "@/components/common/ReCaptcha"
import { Loader2 } from "lucide-react"

interface ProjectRequestFormProps {
  requesterName: string
  requesterEmail: string
  requesterValid: boolean
  languages: PublicLanguageOption[]
  languagesLoading: boolean
  onSuccess: () => void
}

export function ProjectRequestForm({
  requesterName,
  requesterEmail,
  requesterValid,
  languages,
  languagesLoading,
  onSuccess,
}: ProjectRequestFormProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [languageId, setLanguageId] = useState("")
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [captchaEpoch, setCaptchaEpoch] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const canSubmit =
    requesterValid &&
    name.trim().length > 0 &&
    languageId.length > 0 &&
    !!captchaToken &&
    !submitting

  function resetCaptcha() {
    setCaptchaToken(null)
    setCaptchaEpoch((epoch) => epoch + 1)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit || !captchaToken) return
    setSubmitting(true)
    try {
      await publicAPI.requestProject({
        requester_name: requesterName.trim(),
        requester_email: requesterEmail.trim(),
        name: name.trim(),
        description: description.trim() || undefined,
        language_id: languageId,
        recaptcha_token: captchaToken,
      })
      onSuccess()
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status
      if (status === 400) {
        toast.error("reCAPTCHA verification failed. Please try again.")
      } else {
        toast.error("Failed to submit the request")
      }
      resetCaptcha()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="request-project-name">Project name</Label>
        <Input
          id="request-project-name"
          placeholder="e.g. Arara Language Documentation"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="request-project-description">Description</Label>
        <Textarea
          id="request-project-description"
          placeholder="Brief description of this project"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>
      <div className="space-y-2">
        <Label>
          <span className="inline-flex items-center">
            Language
            <InfoTooltip content="Every project is tied to a language already registered in the system. If yours is missing, request it on the Language tab first." />
          </span>
        </Label>
        {languagesLoading ? (
          <p className="text-sm text-verde">Loading languages...</p>
        ) : languages.length === 0 ? (
          <p className="text-sm text-verde/60">
            No languages registered yet. Request a language first using the Language tab.
          </p>
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
      <ReCaptcha key={captchaEpoch} onChange={setCaptchaToken} />
      <Button type="submit" className="w-full h-11 rounded-xl" disabled={!canSubmit}>
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {submitting ? "Submitting..." : "Submit project request"}
      </Button>
    </form>
  )
}
