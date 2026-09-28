import axios from "axios"

export function logApiFailure(error: unknown) {
  if (axios.isCancel(error) || !axios.isAxiosError(error)) return
  const { config, response, code, message } = error
  const where = `${config?.method?.toUpperCase() ?? "?"} ${config?.baseURL ?? ""}${config?.url ?? ""}`
  if (response) {
    console.error(`[api] ${where} -> ${response.status}`, response.data?.detail ?? response.data)
  } else {
    console.error(`[api] ${where} -> no response (${code ?? message})`)
  }
}
