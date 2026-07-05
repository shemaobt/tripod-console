# [US-12.5 / OBT-234] Remove the Organizations section from the console

## Summary
The 2026-07 rule change removes organizations from the console (role management moved to the project Access tab). This deletes the Organizations sidebar item, routes and page components so organizations are neither used nor reachable in the console. `orgsAPI` is kept because it is still used by the project Access tab and the admin dashboard.

## Changes

### 1. Remove the Organizations navigation entry
`src/components/layout/Sidebar.tsx` — drop the `Organizations` item from `contentNavItems` and its now-unused `Building2` icon import.

### 2. Remove the routes and page imports
`src/App.tsx` — remove the `/app/organizations` and `/app/organizations/:orgId` routes and the `OrganizationsPage` / `OrganizationDetailPage` imports. Unknown organization paths now fall through to the existing NotFound (404) page.

### 3. Delete the page components
Delete `src/components/pages/OrganizationsPage.tsx` and `src/components/pages/OrganizationDetailPage.tsx` (deletion, not commented out).

### 4. Keep orgsAPI
`src/services/api.ts` `orgsAPI` is left intact — still used by `ProjectAccessTab.tsx` (grant-organization dropdown) and `dashboard/AdminDashboard.tsx` (org count).

## Type of Change
- [x] Refactor (removal of a section)
- [x] Behavior change (Organizations is no longer reachable in the console)

## Testing
- `npm run typecheck`, `npm run lint`, `npm run build` — pass, no dead imports.
- Navigating to `/app/organizations` resolves to the 404 page.
- The project Access tab and admin dashboard still load (they keep using `orgsAPI`).
