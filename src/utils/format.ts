export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export function formatStatusTimestamp(dateStr: string): string {
  const d = new Date(dateStr)
  const mins = Math.round((Date.now() - d.getTime()) / 60_000)
  const abs = `${MONTHS[d.getMonth()]} ${d.getDate()}, ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
  let rel = "just now"
  if (mins >= 1440) {
    const days = Math.round(mins / 1440)
    rel = `${days} ${days === 1 ? "day" : "days"} ago`
  } else if (mins >= 60) {
    const hours = Math.round(mins / 60)
    rel = `${hours} ${hours === 1 ? "hour" : "hours"} ago`
  } else if (mins >= 1) {
    rel = `${mins} ${mins === 1 ? "min" : "mins"} ago`
  }
  return `${rel} · ${abs}`
}

export function timeAgo(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = now - then
  const diffMins = Math.floor(diffMs / 60_000)
  if (diffMins < 1) return "just now"
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHrs = Math.floor(diffMins / 60)
  if (diffHrs < 24) return `${diffHrs}h ago`
  const diffDays = Math.floor(diffHrs / 24)
  return `${diffDays}d ago`
}
