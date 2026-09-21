import { useEffect, useRef, useState } from "react"

const SCRIPT_ID = "recaptcha-api-script"
const SCRIPT_SRC = "https://www.google.com/recaptcha/api.js?render=explicit"
const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY ?? ""
const POLL_INTERVAL_MS = 150
const MAX_POLL_ATTEMPTS = 100

export const RECAPTCHA_ENABLED = SITE_KEY.length > 0

interface GreCaptcha {
  render: (
    container: HTMLElement,
    params: {
      sitekey: string
      callback: (token: string) => void
      "expired-callback": () => void
      "error-callback": () => void
    },
  ) => number
  reset: (widgetId?: number) => void
}

declare global {
  interface Window {
    grecaptcha?: GreCaptcha
  }
}

interface ReCaptchaProps {
  onChange: (token: string | null) => void
}

export function ReCaptcha({ onChange }: ReCaptchaProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<number | null>(null)
  const onChangeRef = useRef(onChange)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    if (!RECAPTCHA_ENABLED) return

    if (!document.getElementById(SCRIPT_ID)) {
      const script = document.createElement("script")
      script.id = SCRIPT_ID
      script.src = SCRIPT_SRC
      script.async = true
      script.defer = true
      script.onerror = () => setFailed(true)
      document.head.appendChild(script)
    }

    let attempts = 0
    const interval = window.setInterval(() => {
      if (widgetIdRef.current !== null) {
        window.clearInterval(interval)
        return
      }
      if (window.grecaptcha?.render && containerRef.current) {
        window.clearInterval(interval)
        widgetIdRef.current = window.grecaptcha.render(containerRef.current, {
          sitekey: SITE_KEY,
          callback: (token) => onChangeRef.current(token),
          "expired-callback": () => onChangeRef.current(null),
          "error-callback": () => onChangeRef.current(null),
        })
        return
      }
      attempts += 1
      if (attempts >= MAX_POLL_ATTEMPTS) {
        window.clearInterval(interval)
        setFailed(true)
      }
    }, POLL_INTERVAL_MS)

    return () => window.clearInterval(interval)
  }, [])

  if (!RECAPTCHA_ENABLED) return null

  if (failed) {
    return (
      <p className="text-xs text-st-warn">
        Failed to load the reCAPTCHA verification. Check your connection and reload the page.
      </p>
    )
  }

  return <div ref={containerRef} className="min-h-[4.875rem]" />
}
