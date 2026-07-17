import type { UserListResponse, UserRole } from "@/types"

export const roleMeta: Record<
  UserRole,
  { variant: "admin" | "manager" | "member"; label: string }
> = {
  platform_admin: { variant: "admin", label: "Platform admin" },
  manager: { variant: "manager", label: "Manager" },
  member: { variant: "member", label: "Member" },
}

export const roleChoices: {
  value: UserRole
  label: string
  dot: string
  desc: string
}[] = [
  { value: "member", label: "Member", dot: "bg-verde-claro", desc: "Basic access to the apps they are granted." },
  { value: "manager", label: "Manager", dot: "bg-accent", desc: "Oversees one or more specific projects." },
  { value: "platform_admin", label: "Admin", dot: "bg-inverse", desc: "Full access to every resource in the console." },
]

export function getUserRole(user: UserListResponse): UserRole {
  return user.role ?? (user.is_platform_admin ? "platform_admin" : "member")
}
