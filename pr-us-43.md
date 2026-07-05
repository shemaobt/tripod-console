## Summary

US-4.3 / OBT-206 — Let admins select any combination of platforms (Web, Android, iOS) independently when creating or editing an app, replacing the single Web/Mobile/Both dropdown.

## Changes

1. New `src/components/common/PlatformMultiSelect.tsx` — a reusable toggle-button group (Web, Android, iOS) styled with Shema tokens; active options use the telha accent.
2. `AppsPage.tsx`: form state is now `platforms: string[]`; the create/edit dialog uses `PlatformMultiSelect`; requires at least one platform (toast on empty); sends the array to the API. Removed the transitional legacy bridge.
3. `AppDetailPage.tsx`: same treatment for the edit dialog; editing pre-selects the app's current platforms.

## Type of Change

- [x] Feature

## Testing

- `npm run typecheck` — pass
- `npm run lint` — 0 errors (pre-existing ProjectsPage warning only)
- `npm run build` — pass

> **Stacked on US-4.2 / OBT-205 (#15).** Merge #15 first, then this PR.
> Depends on backend US-4.1 / OBT-204 (PR #94) for runtime validation.
