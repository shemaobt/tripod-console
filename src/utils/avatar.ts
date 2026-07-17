const AVATAR_PALETTE: Array<[string, string]> = [
  ["#C5C29F", "#3F3E20"],
  ["#6F7440", "#F6F5EB"],
  ["#89AAA3", "#33321A"],
  ["#BE4A01", "#F6F5EB"],
  ["#52776F", "#F6F5EB"],
  ["#3F3E20", "#F6F5EB"],
]

function hashString(value: string) {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

export function avatarColors(id: string, name?: string | null) {
  const [bg, fg] = AVATAR_PALETTE[hashString(`${id}${name ?? ""}`) % AVATAR_PALETTE.length]
  return { bg, fg }
}

export function initialsOf(value: string | null | undefined) {
  const initials = (value || "?")
    .split(/[\s@]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("")
  return initials || "?"
}
