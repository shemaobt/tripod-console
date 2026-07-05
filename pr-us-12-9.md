# [US-12.9 / OBT-240] Align the frontend manager model to per-project scoping

## Summary
The backend pivoted "manager" to a per-project role (`ProjectUserAccess.role == "manager"`) and now scopes all console data by the caller's managed projects (US-11.6/11.8). The frontend still derived `isManager` from managed **organizations**, so a user who manages projects but no organization passed the backend guard yet was wrongly denied by the console shell gate (US-12.6). This aligns the frontend to the backend model by consuming the new `my-managed-projects` endpoint.

## Changes

### 1. Add the managed-projects API type and method
`src/types/auth.ts` + `src/types/index.ts` — new `MyManagedProjectsResponse` (`managed_project_ids: string[]`), re-exported from `@/types`. `src/services/api.ts` — `authAPI.myManagedProjects()` calling `GET /auth/my-managed-projects` (US-11.10).

### 2. Expose managed projects and derive isManager from them
`src/contexts/AuthContext.tsx` — fetches `myManagedProjects()` alongside `myManagedOrgs()` on login and session restore, stores `managedProjectIds`, exposes it on the context, and resets it on logout. `isManager` is now `managedProjectIds.length > 0 || managedOrgIds.length > 0`, mirroring the backend guard (admin / org-manager / project-manager). Existing `managedOrgIds` / `managedOrgId` are kept for the org-based project filter.

## Type of Change
- [x] Feature (frontend consumes the per-project manager data)
- [x] Behavior change (a project-only manager is now recognized as a manager; the console gate/nav no longer denies them)

## Testing
- `npm run typecheck` and `npm run build` — pass.
- Log in as a user who manages a project (but no organization) — the console shell (US-12.6) grants access and the content navigation (US-12.2) shows Projects/Languages/Phases/Map.
- Log in as a plain member (no managed org/project) — still denied by the console gate.
- Platform admins and organization-based managers — unchanged.
