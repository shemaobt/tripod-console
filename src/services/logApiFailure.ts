import axios from "axios"

// Falha da API tem dois leitores. Quem usa a tela recebe uma frase simples
// (LoadFailed), sem status nem jargao; quem desenvolve precisa do que o
// tripod-api devolveu. Este e o unico lugar que escreve isso no console, e
// o interceptor do cliente chama para toda requisicao que falha.
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
