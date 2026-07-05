# [US-12.8 / OBT-238] Restrict project Access role changes to platform admins

## Summary
On the project Access tab, the per-user Role selector was interactive for everyone. This makes it editable only by platform admins; other users (including managers) see the role as read-only text. The backend is the source of truth (US-11.9).

## Changes

### 1. Gate the role selector on platform admin
`src/components/pages/ProjectAccessTab.tsx` — `ProjectAccessTab` reads `isPlatformAdmin` from `useAuth()` and passes it to `UserAccessSection`. The per-user Role `<Select>` (member/manager) renders only for platform admins; non-admins see `user.role` as read-only text. `handleRoleChange` / `projectsAPI.updateUserRole` are unchanged. Grant/revoke visibility is unchanged.

## Type of Change
- [x] Feature (UI-level authorization)
- [x] Behavior change (non-admins can view but not change roles on the Access tab)

## Testing
- `npm run typecheck` and `npm run build` — pass.
- As a platform admin — the Role selector is interactive and updates persist.
- As a non-admin with project access — the Role is shown as read-only text.
- Backend still enforces the rule (US-11.9): a non-admin PATCH to the role endpoint returns 403.
