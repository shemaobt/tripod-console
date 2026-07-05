# [US-12.6 / OBT-235] Deny console access to users who are neither platform admin nor manager

## Summary
`AppShell` only redirected unauthenticated users, so any authenticated user (including plain members) could load the console. This gates the whole `/app` subtree so only platform admins and managers reach console content; everyone else sees an Access Denied page. Backend counterpart: US-11.8.

## Changes

### 1. Gate the console shell
`src/components/layout/AppShell.tsx` — after the authentication check, deny users where `!isPlatformAdmin && !isManager` by rendering the Access Denied page instead of the shell. `isLoading` and the unauthenticated `/login` redirect are unchanged.

### 2. Add a logout variant to the Access Denied page
`src/components/pages/AccessDeniedPage.tsx` — new `variant="logout"` that offers a Sign out action instead of the "Go to Dashboard" link, so a fully denied user is not looped back into the gated shell.

## Type of Change
- [x] Feature (route/shell-level access control)
- [x] Behavior change (plain members can no longer load the console)

## Testing
- `npm run typecheck` and `npm run build` — pass.
- Log in as a plain member (no admin, no managed org/project) — the console shows Access Denied with a Sign out action.
- Platform admins and managers load the console normally.
- Unauthenticated users are still redirected to `/login`.

> Note: consumes `isManager` from `AuthContext`. Combined with US-12.9 (project-based `isManager`), a project-only manager is correctly allowed.
