import { useState } from "react"
import { toast } from "sonner"
import { publicAPI } from "@/services/api"
import type { PublicLanguageOption } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ReCaptcha, RECAPTCHA_ENABLED } from "@/components/common/ReCaptcha"
import { Loader2 } from "lucide-react"

interface LanguageRequestFormProps {
  requesterName: string
  requesterEmail: string
  requesterValid: boolean
  languages: PublicLanguageOption[]
  onSuccess: () => void
}

export function LanguageRequestForm({
  requesterName,
  requesterEmail,
  requesterValid,
  languages,
  onSuccess,
}: LanguageRequestFormProps) {
  const [name, setName] = useState("")
  const [code, setCode] = useState("")
  const [description, setDescription] = useState("")
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [captchaEpoch, setCaptchaEpoch] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const normalizedCode = code.trim().toLowerCase()
  const normalizedName = name.trim().toLowerCase()
  const codeExists = languages.some((lang) => lang.code.toLowerCase() === normalizedCode)
  const nameExists = languages.some((lang) => lang.name.toLowerCase() === normalizedName)
  const canSubmit =
    requesterValid &&
    name.trim().length > 0 &&
    !nameExists &&
    /^[A-Za-z]{3}$/.test(code.trim()) &&
    !codeExists &&
    (!RECAPTCHA_ENABLED || !!captchaToken) &&
    !submitting

  function resetCaptcha() {
    setCaptchaToken(null)
    setCaptchaEpoch((epoch) => epoch + 1)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)
    try {
      await publicAPI.requestLanguage({
        requester_name: requesterName.trim(),
        requester_email: requesterEmail.trim(),
        name: name.trim(),
        code: normalizedCode,
        description: description.trim() || undefined,
        recaptcha_token: captchaToken ?? undefined,
      })
      onSuccess()
    } catch (err: unknown) {
      const response = (err as { response?: { status?: number; data?: { detail?: string } } })
        ?.response
      const detail = typeof response?.data?.detail === "string" ? response.data.detail : null
      if (response?.status === 409) {
        toast.error(detail || "A language with this name or code already exists")
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
      <div className="grid grid-cols-1 sm:grid-cols-[1.4fr_1fr] gap-5">
        <div className="flex flex-col">
          <Label htmlFor="request-lang-name">Language name</Label>
          <Input
            id="request-lang-name"
            placeholder="e.g. Apurinã"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {nameExists && (
            <p className="text-xs text-st-warn mt-1">
              This language name is already registered in the system.
            </p>
          )}
        </div>
        <div className="flex flex-col">
          <Label htmlFor="request-lang-code">Code</Label>
          <Input
            id="request-lang-code"
            className="font-mono"
            placeholder="3 letters"
            maxLength={3}
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          {codeExists ? (
            <p className="text-xs text-st-warn mt-1">
              This language is already registered in the system.
            </p>
          ) : (
            <p className="text-xs text-fg-subtle mt-1">Must be exactly 3 characters (ISO 639-3)</p>
          )}
        </div>
      </div>
      <div className="flex flex-col">
        <Label htmlFor="request-lang-description">
          Description <span className="font-normal text-fg-subtle">(optional)</span>
        </Label>
        <Textarea
          id="request-lang-description"
          placeholder="Where it is spoken, communities, dialects…"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
        />
      </div>
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
