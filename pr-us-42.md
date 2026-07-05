## Summary

US-4.2 / OBT-205 — Update the TypeScript types to reflect the new `platforms: string[]` schema (US-4.1 backend), replacing the single `platform: string | null` field. The app compiles cleanly and every component that referenced the old field is adjusted.

## Changes

1. `src/types/app.ts`: replace `platform: string | null` with `platforms: string[]` in `AppResponse`, `AppCreate`, `AppUpdate`, and `UserAppResponse`.
2. `AppsPage.tsx` / `AppDetailPage.tsx`: keep the existing single-select forms working via a `legacyToPlatforms`/`platformsToLegacy` bridge — load maps the array back to the legacy value, save sends `platforms` as an array. App cards now read from the array.
3. `dashboard/AppCard.tsx`: badge now reads from `app.platforms`.

The proper multi-select UI (US-4.3) and per-platform badges (US-4.4) are stacked on top of this branch and remove the transitional bridge/label helpers.

## Type of Change

- [x] Refactor (type schema migration, behavior preserved)

## Testing

- `npm run typecheck` — pass
- `npm run lint` — 0 errors (only the pre-existing ProjectsPage warning)
- `npm run build` — pass

> Depends on backend US-4.1 / OBT-204 (PR #94, In Review) for runtime validation.
