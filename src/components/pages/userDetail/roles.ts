import type { UserListResponse, UserRole } from "@/types"

// `dot` e a legenda do badge: cada valor tem que ser a MESMA classe de
// preenchimento que `badgeVariants[variant]` usa em ui/badge.tsx, senao a
// bolinha da legenda deixa de identificar o pill que ela explica.
export const roleMeta: Record<
  UserRole,
  { variant: "admin" | "manager" | "member"; label: string; dot: string }
> = {
  platform_admin: { variant: "admin", label: "Platform admin", dot: "bg-inverse" },
  manager: { variant: "manager", label: "Manager", dot: "bg-telha" },
  member: { variant: "member", label: "Member", dot: "bg-secondary-strong" },
}

const roleDescriptions: Record<UserRole, string> = {
  member: "Basic access to the apps they are granted.",
  manager: "Oversees one or more specific projects.",
  platform_admin: "Full access to every resource in the console.",
}

const rolePickerOrder: UserRole[] = ["member", "manager", "platform_admin"]

export const roleChoices: {
  value: UserRole
  label: string
  dot: string
  desc: string
}[] = rolePickerOrder.map((value) => ({
  value,
  label: roleMeta[value].label,
  dot: roleMeta[value].dot,
  desc: roleDescriptions[value],
}))

export function getUserRole(user: UserListResponse): UserRole {
  return user.role ?? (user.is_platform_admin ? "platform_admin" : "member")
}
