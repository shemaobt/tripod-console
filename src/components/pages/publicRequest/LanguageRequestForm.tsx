import { useState } from "react"
import { toast } from "sonner"
import { publicAPI } from "@/services/api"
import type { PublicLanguageOption } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { InfoTooltip } from "@/components/common/InfoTooltip"
import { ReCaptcha } from "@/components/common/ReCaptcha"
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
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [captchaEpoch, setCaptchaEpoch] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const normalizedCode = code.trim().toLowerCase()
  const codeExists = languages.some((lang) => lang.code === normalizedCode)
  const canSubmit =
    requesterValid &&
    name.trim().length > 0 &&
    normalizedCode.length === 3 &&
    !codeExists &&
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
      await publicAPI.requestLanguage({
        requester_name: requesterName.trim(),
        requester_email: requesterEmail.trim(),
        name: name.trim(),
        code: normalizedCode,
        recaptcha_token: captchaToken,
      })
      onSuccess()
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status
      if (status === 409) {
        toast.error("A language with this code already exists or was already requested")
      } else if (status === 400) {
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
        <Label htmlFor="request-lang-name">Language name</Label>
        <Input
          id="request-lang-name"
          placeholder="e.g. Arara"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="request-lang-code">
          <span className="inline-flex items-center">
            Code
            <InfoTooltip content="Exactly 3 characters, ISO 639-3." />
          </span>
        </Label>
        <Input
          id="request-lang-code"
          placeholder="e.g. ara"
          maxLength={3}
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        {codeExists ? (
          <p className="text-xs text-red-600 dark:text-red-400">
            This language is already registered in the system.
          </p>
        ) : (
          <p className="text-xs text-verde/50">Must be exactly 3 characters (ISO 639-3)</p>
        )}
      </div>
      <ReCaptcha key={captchaEpoch} onChange={setCaptchaToken} />
      <Button type="submit" className="w-full h-11 rounded-xl" disabled={!canSubmit}>
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {submitting ? "Submitting..." : "Submit language request"}
      </Button>
    </form>
  )
}
