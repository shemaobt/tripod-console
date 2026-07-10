import { useEffect, useRef } from "react"

const SCRIPT_ID = "recaptcha-api-script"
const SCRIPT_SRC = "https://www.google.com/recaptcha/api.js?render=explicit"
const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY ?? ""

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
      document.head.appendChild(script)
    }

    const interval = window.setInterval(() => {
      if (widgetIdRef.current !== null) {
        window.clearInterval(interval)
        return
      }
      if (!window.grecaptcha?.render || !containerRef.current) return
      window.clearInterval(interval)
      widgetIdRef.current = window.grecaptcha.render(containerRef.current, {
        sitekey: SITE_KEY,
        callback: (token) => onChangeRef.current(token),
        "expired-callback": () => onChangeRef.current(null),
        "error-callback": () => onChangeRef.current(null),
      })
    }, 150)

    return () => window.clearInterval(interval)
  }, [])

  if (!RECAPTCHA_ENABLED) return null

  return <div ref={containerRef} className="min-h-[78px]" />
}
