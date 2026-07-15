export const PLATFORM_OPTIONS = [
  { value: "web", label: "Web" },
  { value: "android", label: "Android" },
  { value: "ios", label: "iOS" },
]

const PLATFORM_LABELS: Record<string, string> = Object.fromEntries(
  PLATFORM_OPTIONS.map((o) => [o.value, o.label]),
)

export function platformLabel(platform: string): string {
  return PLATFORM_LABELS[platform] ?? platform
}
