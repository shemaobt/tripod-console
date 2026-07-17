# Frontend Agent Guidelines (tripod-console)

This file defines **frontend-specific** conventions for LLM agents working in `tripod-console/`. Follow these instructions exactly as written.

---

## 1. Stack and Build

- **Framework**: React 18
- **Language**: TypeScript
- **Build / dev**: Vite (with `@vitejs/plugin-react` and `@tailwindcss/vite`)
- **Routing**: react-router-dom v7 (`BrowserRouter`; routes declared in `App.tsx`)
- **Styling**: **Tailwind CSS v4** only (no CSS-in-JS, no styled-components, no SASS)
- **UI primitives**: Radix UI (via shadcn-style components in `src/components/ui/`) — installed: dialog, label, popover, select, switch, tabs, tooltip
- **State**: **Zustand** for cross-page/application state; **React Context** for auth and UI state (e.g. sidebar, theme)
- **HTTP**: Axios (single client in `src/services/api.ts`) with JWT auth interceptors
- **Icons**: lucide-react (outline icons exclusively)
- **Toasts**: sonner
- **Utilities**: class-variance-authority (cva), clsx, tailwind-merge; use `cn()` from `src/utils/cn.ts` for merging class names
- **Maps**: react-leaflet + leaflet for the global project map

Use only these stack choices. Do not introduce Redux, MobX, or other state libraries; do not add a second styling system.

### Reference codebases (local paths)

When implementing, refer to these sibling projects for patterns and code to reuse:

- **Backend codebase:** `/Users/joao/Desktop/work/shema/shemaobt/tripod-backend/`
  - Models: `app/db/models/`
  - API routes: `app/api/`
  - Services: `app/services/`
  - Schemas: `app/models/`
  - CLAUDE.md: `CLAUDE.md`
- **Frontend reference (meaning-map-ui):** `/Users/joao/Desktop/work/shema/shemaobt/meaning-map-ui/`
  - UI primitives to copy: `src/components/ui/`
  - Styles to copy: `src/styles/`
  - Design tokens: `src/index.css`
  - Auth pattern: `src/contexts/AuthContext.tsx`
  - API client pattern: `src/services/api.ts`
  - Zustand stores: `src/stores/`
  - Common components: `src/components/common/`
  - CLAUDE.md: `CLAUDE.md`

---

## 2. Project Structure

```
src/
├── App.tsx                      # BrowserRouter, Toaster, ThemeProvider, AuthProvider
├── main.tsx                     # Entry point
├── index.css                    # Tailwind v4 @theme semantic design tokens (light + dark) + legacy Shema tokens
├── components/
│   ├── common/                  # Shared UI:
│   │                            #   LoadingSpinner, EmptyState, ConfirmDialog, ErrorBoundary
│   │                            #   InfoTooltip        — (i) icon with hover/tap explanation popover
│   │                            #   FeatureSpotlight   — one-time contextual highlight with dismiss
│   │                            #   FilterBar          — reusable search + filters row
│   │                            #   ImageUpload        — image picker with change/remove
│   │                            #   LocationSearchInput — geocoding autocomplete input
│   │                            #   PlatformMultiSelect — web/android/... platform picker
│   │                            #   ProfileDialog      — current-user profile editor
│   │                            #   ReCaptcha          — reCAPTCHA v2 widget (public request)
│   │                            #   StatCard           — dashboard metric card
│   │                            #   UserSearchPicker   — user search/select
│   ├── layout/                  # AppShell, AppHeader, Sidebar
│   ├── pages/                   # Full-page views + page-scoped sections:
│   │                            #   LoginPage
│   │                            #   DashboardPage (My Apps hub + Platform Overview)
│   │                            #     dashboard/   AdminDashboard, AppCard
│   │                            #   LanguagesPage
│   │                            #   ProjectsPage, ProjectDetailPage
│   │                            #     ProjectAccessTab, ProjectPhasesTab
│   │                            #     projects/      ProjectFormDialog
│   │                            #     projectAccess/ UserAccessSection, OrgAccessSection,
│   │                            #                    GrantUserDialog, GrantOrgDialog, RevokeButton, initials
│   │                            #   UsersPage/    index, UserCard, UserAvatar      [admin only]
│   │                            #   userDetail/   index (UserDetailPage), UserHeader, AccountCard,
│   │                            #                 GlobalRoleCard, AppRolesCard, roles [admin only]
│   │                            #   AppsPage, AppDetailPage                        [admin only]
│   │                            #     apps/        AppCard, AppFormDialog, DetailsCard,
│   │                            #                  RolesCard, AutoApproveCard, DangerZoneCard
│   │                            #   PhasesPage                                     [admin only]
│   │                            #     phases/      DependencyPanel, PhaseFlowGraph
│   │                            #   MapPage
│   │                            #     map/         FieldMapPanel, ProjectPopupContent
│   │                            #   PublicRequestPage                              [public /request]
│   │                            #     publicRequest/ index, LanguageCombobox,
│   │                            #                    LanguageRequestForm, ProjectRequestForm
│   │                            #   ChangeRequestsSection, AccessRequestsSection, ReviewDialog
│   │                            #     changeRequests/ ChangeRequestCard, MyChangeRequestsSection
│   │                            #   NotFoundPage, AccessDeniedPage
│   └── ui/                      # Primitives (Button, Badge, Card, Dialog, Input, Label,
│                                #   Select, Switch, Tabs, Textarea, Tooltip, Popover)
├── contexts/                    # AuthContext, ThemeContext
├── stores/                      # Zustand stores:
│                                #   onboardingStore — dismissed spotlights (localStorage persist)
│                                #   languagesStore  — languages cache (5-min TTL) + getLanguageName
│                                #   phasesStore     — phases + dependencies cache (2-min TTL)
├── services/                    # api.ts — Single Axios client with namespaced APIs
├── types/                       # TS interfaces (auth, user, app, language, organization, project,
│                                #   role, phase, accessRequest, changeRequest, publicRequest; index barrel)
├── constants/                   # app.ts (token keys), platforms.ts (PLATFORM_OPTIONS, platformLabel)
├── utils/                       # cn.ts (class merging), format.ts (formatDate, timeAgo)
└── styles/                      # Centralized style constants (cards, badges, layout, states; index barrel)
```

### Functional components only
No class components. Prefer small, reusable components; avoid huge single-file pages.

### Component size and modularization

- **Target size**: Individual component files should generally be **under 300 lines**. If a component exceeds 400 lines, it almost certainly needs to be broken down.
- **Modularize by responsibility**: Split large components into smaller, focused sub-components. Each component should have a single responsibility.
- **Extract reusable patterns**: If a UI pattern appears more than once, extract it into a reusable component in `components/common/` or `components/ui/`.
- **Co-locate related components**: Sub-components used by one parent can live in the same folder (e.g. `ProjectDetailPage/index.tsx`, `AccessTab.tsx`, `LocationPicker.tsx`).
- **Keep state close**: Sub-components should receive data via props. Lift state only when necessary for sharing between siblings.

**Signs a component needs splitting:**

- More than 400 lines
- Multiple large JSX blocks that could be named components
- Many useState hooks managing unrelated state
- Helper functions only used for one section of the UI
- Hard to understand the component's main purpose at a glance

---

## 2b. Routing

Routes are defined in `App.tsx` under the `/app` shell (`AppShell`):

| Path | Component | Description |
|------|-----------|-------------|
| `/login` | LoginPage | Email + password authentication |
| `/request` | PublicRequestPage | Public (unauthenticated) language/project creation requests |
| `/` (index) | → redirects to `/app/dashboard` | Default landing |
| `/app` (shell) | AppShell + Outlet | Protected layout; requires platform admin or manager |
| `/app/dashboard` | DashboardPage | My Apps hub + Platform Overview (admin) |
| `/app/languages` | LanguagesPage | Languages table |
| `/app/projects` | ProjectsPage | Projects list |
| `/app/projects/:projectId` | ProjectDetailPage | Project detail (Info / Phases / Access) |
| `/app/map` | MapPage | Global project map (Leaflet) |
| `/app/users` | UsersPage | Users list (admin only) |
| `/app/users/:userId` | UserDetailPage | User detail + role/status (admin only) |
| `/app/apps` | AppsPage | Manage Apps CRUD (admin only) |
| `/app/apps/:appId` | AppDetailPage | App detail + roles + metadata (admin only) |
| `/app/phases` | PhasesPage | Global phase catalog + dependency graph (admin only) |
| `*` | NotFoundPage | 404 |

**Role-aware views**:
- **Console access gate**: the `/app` shell requires **platform admin or manager**. A signed-in user who is neither gets `AccessDeniedPage` (variant `logout`) — see `AppShell.tsx`. Plain members have no console access.
- **Platform admin + manager** see: My Apps (dashboard), Languages, Projects, Map. (Organizations was removed from the console.)
- **Admin-only routes** (`/app/users`, `/app/apps`, `/app/phases`): wrapped in `AdminRoute`, hidden from the sidebar, and return AccessDeniedPage for non-platform-admins.
- **Managers** are scoped to the projects/orgs they manage (`managedProjectIds` / `managedOrgIds`) and can manage member roles on those projects.
- **App admins** can manage roles for their specific app only. When viewing role assignment, the app dropdown is filtered to apps they admin.
- **Platform admins** see all routes and can manage everything globally.

Use `isPlatformAdmin`, `isManager`, `managedProjectIds` / `managedOrgIds`, and `appRoles` from AuthContext for enforcement.

---

## 3. Styling and Tailwind

- **Use Tailwind only** for layout, spacing, colors, typography, and responsive behavior.
- **Avoid inline styles** for things Tailwind can do. Use inline `style` only when necessary (e.g. dynamic values, third-party integration like Leaflet).
- **Use the semantic design tokens** defined in `src/index.css`:
  - **Backgrounds**: `canvas` (page), `elevated` (cards/inputs/modals), `muted` (subtle fills, chips, search pills, hovers), `quiet` (sand), `inverse` (deep olive), `brand` / `accent` (terracotta CTA), `shell` (dark sidebar)
  - **Text**: `fg` (body), `fg-strong` (headings/emphasis), `fg-muted` (secondary), `fg-subtle` (tertiary/captions), `on-dark` (text on dark backgrounds)
  - **Lines**: `line`, `line-strong` (hairlines/dividers), `input-border` (input underlines)
  - **Accent states**: `accent-hover`, `accent-press`, `accent-soft` + `on-accent-soft` (soft telha for destructive hovers and callouts)
  - **Status**: `st-ok`, `st-warn`, `st-info`, `st-idle`
  - **Shadows** via CSS vars (arbitrary values): `shadow-[var(--shadow-card)]`, `shadow-[var(--shadow-sm)]`, `shadow-[var(--shadow-md)]`, `shadow-[var(--shadow-lg)]`. Other `:root` vars: `--shell-dim`/`--shell-line`/`--shell-active` (sidebar), `--edge`, `--ease-out`, `--focus-ring`.
  - The **legacy Shema tokens** (`branco`, `areia`, `azul`, `telha`, `verde`, `verde-claro`, `preto`, `surface`, `surface-alt`) still exist for compatibility and adapt to dark mode, but prefer the semantic tokens in new code.
  - Do not introduce arbitrary hex values in JSX; extend the theme if new tokens are needed.

### Dark mode

- Dark mode uses `@custom-variant dark (&:where(.dark, .dark *))` in `index.css`.
- All dark color overrides are defined in `@layer base { .dark { ... } }` using the same tokens (semantic + legacy), so token-based styling adapts automatically.
- When adding components with color that won't adapt via tokens alone, add explicit `dark:` variants (e.g. `dark:bg-red-950/30 dark:text-red-400`).

### Global focus-visible

- `index.css` defines `*:focus-visible { outline: 2.5px solid var(--focus-ring); outline-offset: 2px }` (`--focus-ring` is telha; lighter in dark mode).
- Components should **not** add ring utilities (`focus:ring-*` / `focus-visible:ring-*`) — the global outline handles keyboard focus.
- Input-like components (Input, Textarea) are underline-style and use `focus:outline-none focus:border-accent` so the underline shifts to accent on focus.

### `bg-elevated` not `bg-white`

- **Always use `bg-elevated`** for elevated surfaces (cards, modals, select triggers, active tab segments). Never hardcode `bg-white`.
- `bg-canvas` is for the page background; `bg-muted` for subtle fills (chips, search pills, table row hover).
- All of these adapt to dark mode automatically. `bg-surface` is the legacy equivalent of `bg-elevated` — prefer `bg-elevated` in new code.

### Centralized style constants

- **Use `src/styles/`** for reusable style constants. This directory contains TypeScript objects with Tailwind class strings organized by purpose:
  - `cards.ts` — `card.base` (`bg-elevated rounded-[18px] shadow-[var(--shadow-card)]`), `card.hover` (lift + shadow), `card.interactive` (base + hover + cursor), `card.padded` (base + `p-5 sm:p-6`)
  - `badges.ts` — `badge.base` (pill) + status variants (success, pending, error, active, inactive) built on `st-ok` / `muted` / `accent-soft` tokens
  - `layout.ts` — `page` (`min-h-screen bg-canvas`), `container` (`max-w-[1240px] mx-auto px-6 sm:px-10 py-8 sm:py-9`), `grid`, `main`
  - `states.ts` — `empty`, `loading`, `error` (`accent-soft` banner), `warning` (`muted` banner)
- **Import from `@/styles`** when using these constants
- **Prefer centralized styles** over repeating the same class strings across components
- **Extend the central styles** when adding new patterns

**Examples:**

- `<div className={cn(card.base, card.hover)}>` — uses centralized card styles
- `<div className={card.padded}>` — card with base styles + responsive padding (standalone, no need to combine with card.base)
- `<div className={states.empty}>` — consistent empty state styling
- `<span className={cn(badge.base, badge.success)}>Active</span>` — badge with base + variant
- **Class merging**: Always use `cn()` when combining conditional or overridden classes. Use `cva` for variant-based components (see `components/ui/button.tsx`).

---

## 4. State Management

- **Zustand**: Use for **cross-page state** that needs to persist across navigation. Current stores:
  - `onboardingStore` — dismissed feature spotlights (persisted to localStorage `tc_onboarding`)
  - `languagesStore` — languages cache (5-min TTL) with a `getLanguageName` helper
  - `phasesStore` — phases + dependency-graph cache (2-min TTL, via `phasesAPI.listWithDependencies`)
  - Create one store per domain, `create` with optional `persist` middleware. Logout resets the languages/phases caches.
- **React Context**: Use for **auth** (AuthContext: user, isPlatformAdmin, isManager, managedOrgIds/managedProjectIds/managedOrgId, appRoles, isAppAdmin, refreshUser, isLoading, login, logout) and **UI state** (ThemeContext: light/dark/system, persisted to `tc_theme`). Do not put domain data in Context; use Zustand for that.
- **Local state**: Use `useState` / `useReducer` for component-local UI state (form fields, modals, table filters). Do not lift state to a global store unless it is shared across routes.

Most pages in this app are CRUD pages — prefer local state (`useState`) for table data, form inputs, loading/error states. Only use Zustand if the data is needed across multiple pages.

---

## 5. API and Data

- **Single API client**: All backend calls go through `src/services/api.ts`. The file uses one Axios instance with interceptors (JWT auth header, 401 refresh).
- **Namespaced APIs**:

```typescript
authAPI      — login, logout, refresh, me, myRoles
usersAPI     — list, get, update, listRoles
appsAPI      — list, myApps, create, get, update, listRoles
languagesAPI — list, create, get, getByCode
orgsAPI      — list, create, get, update, listMembers, addMember, removeMember
projectsAPI  — list, create, get, update, updateLocation,
               listUserAccess, listOrgAccess, grantUser, grantOrg, revokeUser, revokeOrg
rolesAPI     — assign, revoke, check
```

Key distinction:
- `appsAPI.myApps()` → `GET /api/apps/my-apps` — returns apps the current user has access to, with their roles. Used by DashboardPage (My Apps hub). Available to all authenticated users.
- `appsAPI.list()` → `GET /api/apps` — returns all apps. Admin only. Used by AppsPage (Manage Apps).

- **New endpoints**: Add methods to the appropriate namespace in `api.ts`; do not create a second axios client or duplicate auth handling.
- **Types**: Prefer types from `src/types/`. Keep request/response types aligned with the backend schemas.

### Backend API base

- **Dev**: Vite proxy `/api` → `http://localhost:8000` (in `vite.config.ts`)
- **Prod**: Configured via environment variable or container entrypoint

---

## 6. Components and UI

- **Functional components**: Only function components; no class components.
- **UI primitives**: Use and extend components in `components/ui/`. They use Radix + Tailwind + `cva` + `cn`. Match their API (e.g. `variant`, `size`, `className`).
- **Icons**: Use lucide-react only. Use outline icons exclusively. Do not mix outline and filled icons.
- **Toasts**: Use **sonner** (`toast.success`, `toast.error`, `toast.warning`, etc.).
- **Dialogs**: Use Radix-based Dialog from `components/ui/dialog.tsx` for modals (create/edit forms, confirmations).
- **Tables**: Use a simple HTML table with Tailwind styling. No need for a table library — CRUD pages have simple data grids.

### Button variants

The Button component (`components/ui/button.tsx`) supports `asChild` via Radix Slot. All buttons are pills: base is `rounded-full text-sm font-semibold transition-all duration-200 active:scale-[0.985]`. Variants:

| Variant | Usage | Classes |
|---------|-------|---------|
| `default` | Primary CTAs (telha pill) | `bg-accent text-white hover:bg-accent-hover` |
| `secondary` | Secondary actions (verde ring pill) | `bg-transparent text-fg shadow-[inset_0_0_0_1.5px_var(--color-fg)] hover:bg-inverse hover:text-on-dark` |
| `outline` | Tertiary / cancel | `bg-elevated text-fg-strong shadow-[inset_0_0_0_1px_var(--color-line-strong)] hover:bg-muted` |
| `ghost` | Inline / table actions | `text-fg-muted hover:bg-muted hover:text-fg-strong` |
| `outline-destructive` | Inline text delete | `text-on-accent-soft hover:bg-accent-soft` |
| `destructive` | Delete / danger CTAs | `bg-accent text-white hover:bg-accent-hover` |
| `link` | Inline links | `text-accent underline-offset-4 hover:underline rounded-none` |

Sizes: `default` (h-11 px-5), `sm` (h-9 px-4 text-[13px]), `lg` (h-12 px-6 text-base), `icon` (h-10 w-10).

### Card sub-components

The Card component (`components/ui/card.tsx`) exports: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`. Use `CardTitle` and `CardDescription` inside `CardHeader` for consistent typography.

### Common CRUD page pattern

```
┌───────────────────────────────────────┐
│ Page Header                           │
│ [Title (i)]                   [+ New] │
├───────────────────────────────────────┤
│ Data Table                            │
│ ┌──────┬──────────┬──────┬──────────┐ │
│ │ Col1 │ Col2 (i) │ Col3 │ Actions  │ │
│ ├──────┼──────────┼──────┼──────────┤ │
│ │ ...  │ ...      │ ...  │ Edit     │ │
│ └──────┴──────────┴──────┴──────────┘ │
├───────────────────────────────────────┤
│ Loading / Guided Empty / Error states │
└───────────────────────────────────────┘
```

`(i)` = InfoTooltip next to labels that need explanation.

Each CRUD page follows this structure:
1. Fetch data on mount with `useEffect`
2. Show `LoadingSpinner` while fetching
3. Show guided `EmptyState` if no data (with educational text + action CTA)
4. Show data in a table with action buttons
5. Create/Edit via Dialog modals
6. Delete with ConfirmDialog
7. Toast on success/error
8. InfoTooltip on section header and any non-obvious column headers or form fields

---

## 7. Code Style (Frontend-Specific)

- **No comments for "what"**: Code and names should be self-explanatory. Comments only for non-obvious "why".
- **No module-level comments**: Do not add `/** Module description */` at the top of files. The file name and location convey purpose.
- **TypeScript**: Prefer explicit types for props and API/store types. Avoid `any` where a proper type exists.
- **File names**: PascalCase for components (e.g. `LanguagesPage.tsx`); camelCase for utilities, hooks, stores (e.g. `api.ts`, `cn.ts`).

---

## 8. Auth Pattern

### AuthContext

```typescript
interface AuthContextValue {
  user: User | null
  isPlatformAdmin: boolean
  appRoles: MyRole[]             // { app_key, role_key }[]
  isLoading: boolean
  login(email: string, password: string): Promise<void>
  logout(): Promise<void>
  isAppAdmin(appKey: string): boolean  // helper: checks if user has admin role for a specific app
}
```

- On mount: check localStorage for tokens → call `GET /api/auth/me` + `GET /api/auth/my-roles`
- Store tokens in localStorage (`tc_access_token`, `tc_refresh_token`)
- Derive `isPlatformAdmin` from `user.is_platform_admin`
- `isAppAdmin(appKey)` returns true if `appRoles` contains `{ app_key: appKey, role_key: "admin" }`

### Role visibility rules

- **All users**: See their own roles per app on the My Apps dashboard
- **App admins**: See all roles for the apps they admin. Can assign/revoke within those apps.
- **Platform admins**: See all roles for all apps globally. Can assign/revoke anything.
- When rendering role assignment UI, filter the app dropdown:
  - Platform admin → all apps
  - App admin → only apps where `isAppAdmin(app.app_key)` is true

### Axios interceptors

- **Request**: Attach `Authorization: Bearer <token>` header
- **Response (401)**: Call `POST /api/auth/refresh` with refresh token → update both tokens → retry original request. On refresh failure, clear tokens and redirect to `/login`.

### Route protection

- AppShell checks `user` — redirects to `/login` if null
- Admin routes check `isPlatformAdmin` — show AccessDeniedPage if false

---

## 9. Design System Visual Identity (Shema)

All UI, styling, layout, spacing, colors, typography, and visual decisions MUST strictly follow these rules.
Do not override, reinterpret, or invent visual rules.

### 9.1 Typography
- **Montserrat**: Entire interface (UI, buttons, navigation, labels, headings).
- **Merriweather**: Long-form texts only (if any).
- **Letter Spacing**: Use `tracking-tight` for headings, `tracking-wide` for labels/badges/uppercase.

### 9.2 Color Hierarchy & Palette

| Token | Hex | Usage |
|-------|-----|-------|
| branco | #F6F5EB | Main app background |
| areia | #C5C29F | Borders, muted elements, warnings |
| azul | #89AAA3 | Supporting elements |
| telha | #BE4A01 | Exclusive for CTAs and active states |
| verde-claro | #777D45 | Success states, validation |
| verde | #3F3E20 | Secondary text, subtitles |
| preto | #0A0703 | Primary text |
| surface | #FFFFFF | Cards, inputs, modals (elevated surfaces) |
| surface-alt | #F3F2EB | Alternative surface |

**Semantic layer** (preferred in code; every token adapts to dark mode automatically):

- Backgrounds: `canvas` (= branco, page), `elevated` (= surface, cards/inputs/modals), `muted` (#ECEADF, subtle fills/chips/hovers), `quiet` (= areia), `inverse` (= verde, deep olive blocks), `brand` / `accent` (= telha), `shell` (#33321A, dark sidebar) + `shell-fg`
- Text: `fg` (= verde, body), `fg-strong` (= preto, headings), `fg-muted` (#5A5A3E), `fg-subtle` (#6B6A52), `on-dark` (= branco)
- Lines: `line` / `line-strong` (olive alpha hairlines), `input-border` (#8A8970)
- Accent states: `accent-hover` #A23E00, `accent-press` #872F00, `accent-soft` #F2D8C2 + `on-accent-soft` #A23E00
- Status: `st-ok` #5D6236, `st-warn` #BE4A01, `st-info` #4D7068, `st-idle` #6B6A52

- **Telha** (`accent`) is exclusive to CTAs, primary actions, and active states. Never use as a neutral decorative color.
- **White (#FFFFFF)** is reserved strictly for elevated surfaces — always via `bg-elevated`.
- Do NOT use generic neutral greys. Use the Shema earthy palette.

### 9.3 Spacing & Layout
- **Base unit**: 4px (Tailwind default)
- **Page wrapper**: `max-w-[1240px] mx-auto px-6 sm:px-10 pt-8 pb-14` (or `layout.container` from `@/styles`)
- **Page header row**: left = eyebrow (`text-[13px] font-semibold tracking-[0.14em] uppercase text-fg-muted`) above an `h3` title (`text-[25px] font-bold text-fg-strong tracking-tight`), optional subtitle/count (`text-[12.5px] text-fg-subtle`); right = actions
- **Card padding**: `p-5` (or `p-5 sm:p-6`)
- **Section gaps**: `space-y-6` or `space-y-8` for vertical rhythm
- **Form spacing**: `space-y-4` between form groups, `space-y-2` between label and input

### 9.4 Cards & Surfaces
- **Background**: `bg-elevated`
- **Borders**: NONE — cards have no borders; depth comes from shadow only
- **Shadows**: `shadow-[var(--shadow-card)]` base, `shadow-[var(--shadow-md)]` on hover
- **Radius**: `rounded-[18px]` cards, `rounded-2xl`/`rounded-[16px]` small cards, `rounded-[20px]` dialogs
- **Card Base Classes**: `bg-elevated rounded-[18px] shadow-[var(--shadow-card)]` (= `card.base`)
- **Card Hover Classes**: `transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]` (= `card.hover`, lift effect)

### 9.5 Buttons & Interactive Elements
- **Shape**: all buttons are pills — `rounded-full`, `font-semibold`
- **Primary (Telha/`accent`)**: Only for main CTAs
- **States**: dedicated hover tokens (`hover:bg-accent-hover`), scale for click (`active:scale-[0.985]`)
- **Focus**: rely on the global `*:focus-visible` outline; do not add ring utilities
- **Padding/heights**: `px-5 py-2` default, heights: `h-11` default, `h-9` sm, `h-12` lg, `h-10 w-10` icon
- **Variants**: 7 variants available — default, secondary, outline, ghost, outline-destructive, destructive, link. See Section 6 for details.

### 9.6 Badges & States
- **Shape**: `rounded-full px-2.5 py-0.5 text-xs font-semibold` pills
- **Success / Active**: `bg-st-ok/15 text-st-ok`
- **Pending / Inactive**: `bg-muted text-fg-muted`
- **Error**: `bg-accent-soft text-on-accent-soft`
- **Manager**: `bg-telha text-on-dark` (solid telha pill)
- **Member**: `bg-secondary-strong text-on-dark` (solid #6F7440 pill)
- **Admin**: `bg-inverse text-on-dark`
- **Status dots**: `<span className="w-2 h-2 rounded-full bg-st-...">`

### 9.7 Animations & Transitions
- **Hover**: `transition-all duration-200`
- **Click**: `active:scale-[0.985]`
- **Entrances**: keyframes in `index.css` — `animate-fade-in` (fadeIn 0.16s), `animate-pop-in` (popIn 0.2s, dialogs), `animate-rise-in` (tIn 0.24s, page/section entrances)
- **Easing**: `--ease-out` = `cubic-bezier(0.2, 0.8, 0.25, 1)`

### 9.8 Forms
- **Inputs are underline-style**: transparent background, `border-0 border-b-[1.5px] border-input-border px-0`, no box, no ring
- **Textareas are boxed**: `rounded-[10px] border-[1.5px] border-input-border bg-transparent`
- **Placeholders**: `placeholder:text-fg-subtle`
- **Focus**: `focus:outline-none focus:border-accent` (underline/border shifts to accent)
- **Labels**: `text-[13px] font-semibold text-fg-strong mb-1.5`

### 9.9 Tables
- **Container**: `bg-elevated rounded-[18px] shadow-[var(--shadow-card)] overflow-hidden` (no border)
- **Header cells**: `text-left px-5 py-3 text-[11px] font-semibold tracking-[0.08em] uppercase text-fg-subtle border-b border-line`
- **Body cells**: `px-5 py-3 border-b border-line`; row hover `hover:bg-muted`; first-column names `font-semibold text-fg-strong`
- **Code chips**: `font-mono text-xs bg-muted rounded-md px-2 py-0.5 text-fg-muted`
- **Action buttons**: `w-[30px] h-[30px] rounded-[9px] grid place-items-center text-fg-subtle` icon buttons — `hover:bg-muted hover:text-fg-strong` (edit) or `hover:bg-accent-soft hover:text-on-accent-soft` (delete)

---

## 10. Sidebar

The sidebar is a fixed dark rail — `bg-shell text-shell-fg w-[258px]`, sticky full height — with navigation organized into labeled sections:

```
[logo-branco.svg]        [light/dark pill toggle]
MAIN
  My Apps         (LayoutGrid)            ← default landing, all users
CONTENT                                   [admin + manager]
  Languages       (Languages)
  Projects        (FolderOpen)
  Map             (Globe)
ADMINISTRATION                            [admin only]
  Phases          (GitBranch)
  Users           (Users)
  Manage Apps     (AppWindow)
─────────────
[avatar + name + role → ProfileDialog]  [sign-out icon]
```

- **Top row**: `logo-branco.svg` + theme pill toggle (Sun/Moon segmented pill, sets light/dark via ThemeContext)
- **Section labels**: uppercase micro — `text-[10.5px] font-semibold tracking-[0.14em] uppercase text-[var(--shell-dim)]`
- **Nav items**: `rounded-[10px]` rows; active = `bg-[var(--shell-active)] text-shell-fg`; inactive = `text-[var(--shell-dim)]`, hover gets the active treatment
- **Footer**: `border-t border-[var(--shell-line)]` with profile button (avatar + display name + role label, opens ProfileDialog) and a sign-out icon button
- **RBAC**: "Main" for all console users; "Content" shown to platform admins + managers; "Administration" only when `isPlatformAdmin`
- **No collapsed icon-rail mode.** Mobile (`lg:hidden`): overlay drawer with dark backdrop and close button

---

## 11. Contextual Guidance System

The app uses three complementary patterns to help users understand features without overwhelming them. These are not optional polish — they are core UX patterns to include in every page.

### 11.1 InfoTooltip (`components/common/InfoTooltip.tsx`)

Small `(i)` icon that shows a concise explanation on hover (desktop) or tap (mobile).

```typescript
interface InfoTooltipProps {
  content: string           // Explanation text (1-2 sentences max)
  side?: "top" | "bottom" | "left" | "right"  // Tooltip placement
}
```

- Uses Radix `Tooltip` primitive
- Icon: `Info` from lucide-react, rendered in `text-verde/40` at 14-16px
- Appears to the right of the label it explains, with `ml-1`
- Keep text concise — link to external docs if more detail is needed

**Placement:** Next to section headers, non-obvious table column headers, form fields with specific requirements.

### 11.2 FeatureSpotlight (`components/common/FeatureSpotlight.tsx`)

One-time contextual highlight that draws attention to a feature. Shows once, then never again.

```typescript
interface FeatureSpotlightProps {
  featureKey: string        // Unique ID (e.g. "map-first-visit")
  title: string
  description: string
  side?: "top" | "bottom" | "left" | "right"
  children: React.ReactNode // The element being highlighted
}
```

- Wraps target element; renders a subtle pulsing ring + popover card
- Tracks dismissed keys in `onboardingStore` (Zustand with localStorage persist)
- "Got it" button dismisses; never shows that featureKey again
- Max 1 spotlight visible per page — if multiple, show highest priority only
- Visual: `ring-2 ring-telha/30 animate-pulse` on the wrapper + Radix `Popover` with title, description, dismiss button

### 11.3 Guided Empty States

When a section has no data, the `EmptyState` component serves as education.

```typescript
interface EmptyStateProps {
  icon: LucideIcon
  title: string             // What this section is for
  description: string       // Guidance on how to get started
  actionLabel?: string      // CTA button text
  onAction?: () => void     // CTA click handler
}
```

Every page must define a meaningful empty state that explains the concept, not just "No data found".

### 11.4 onboardingStore (Zustand)

```typescript
interface OnboardingStore {
  dismissedSpotlights: string[]
  dismiss(featureKey: string): void
  isDismissed(featureKey: string): boolean
  resetAll(): void           // Dev/testing helper
}
```

Persisted to localStorage key `tc_onboarding`.

### UX Principles

- **Never block the user**: All guidance is dismissible and non-modal
- **Progressive disclosure**: Minimal info first; dig deeper on demand
- **One-time spotlights**: Show once per feature, persist dismissal
- **Consistent placement**: Info icons always right of the label
- **No tutorial walls**: No multi-step onboarding wizards. Users explore naturally with contextual help available.
- **Lightweight UI**: Keep screens clean and uncluttered. Prefer whitespace and subtle guidance over dense layouts.

---

## 12. Backend Reference

**Backend local path**: `/Users/joao/Desktop/work/shema/shemaobt/tripod-backend/`
**Backend CLAUDE.md**: `/Users/joao/Desktop/work/shema/shemaobt/tripod-backend/CLAUDE.md`
**Live API docs**: https://tripod-backend.shemaywam.com/docs
**HTTP examples**: `/Users/joao/Desktop/work/shema/shemaobt/tripod-backend/http/*.http`

Key backend patterns:
- Service-driven architecture: all business logic in `app/services/`, routers are thin
- Custom exceptions: `NotFoundError` (404), `ConflictError` (409), `AuthorizationError` (403)
- Auth: JWT access + refresh tokens, role-based access control
- All endpoints require `Authorization: Bearer <token>` except login/signup
- App model: `/Users/joao/Desktop/work/shema/shemaobt/tripod-backend/app/db/models/auth.py` (User, App, Role, Permission, UserAppRole, RefreshToken, AccessRequest)

---

## 13. Git Workflow & Pull Requests

When the user says the code is ready, asks to "create a PR", or says "prepare the PR":

1. **Create a new branch** from HEAD with a descriptive name (e.g. `feat/languages-crud`).
2. **Commit in small, scoped commits** — each commit covers a single logical change.
3. **Push the branch** to the remote with `-u` to set upstream tracking.
4. **Create a pull request** using `gh pr create` targeting `main` with:
   - A concise title (under 70 characters)
   - A detailed body with `## Summary` and `## Test plan` sections
5. **Return the PR URL** to the user.

Use `gh` CLI for all GitHub operations. Never force-push or amend published commits.

---

## 14. Summary Checklist

- [ ] Use only the stack above: React 18, TypeScript, Vite, Tailwind v4, Zustand, Context, Axios, Radix/shadcn-style ui, lucide-react, sonner, react-leaflet.
- [ ] **React**: Functional components only; modularize; reuse `components/ui/` primitives.
- [ ] **Component size**: Keep components under 300 lines; split if over 400 lines.
- [ ] **Styling**: Tailwind only; use `cn()` and design tokens; avoid inline styles except when necessary.
- [ ] **Centralized styles**: Use `src/styles/` for reusable patterns (cards, badges, states, layout); avoid repeating className strings.
- [ ] **`bg-elevated` not `bg-white`**: Always use `bg-elevated` for elevated surfaces (cards, modals, selects), `bg-canvas` for page backgrounds, `bg-muted` for subtle fills. Never hardcode `bg-white`.
- [ ] **Dark mode**: Use `dark:` variants where tokens alone don't adapt. Test with `.dark` class.
- [ ] **Focus**: Rely on the global `*:focus-visible` outline in `index.css`; do not add ring utilities. Inputs use `focus:border-accent`.
- [ ] **Placeholders**: Use `placeholder:text-fg-subtle` consistently across inputs.
- [ ] **State**: Zustand for cross-page state (onboardingStore, etc.); Context for auth and UI; local state for component-only state.
- [ ] **API**: Single `api.ts` client; add new methods to existing namespaces.
- [ ] **Auth**: JWT tokens in localStorage; Axios interceptors for auth header and 401 refresh.
- [ ] **RBAC**: Admin sections restricted to `isPlatformAdmin`. App admins manage roles only for their apps. Regular users see their own apps and roles on the dashboard.
- [ ] **My Apps**: Dashboard shows app cards with icon, name, role badges, and launch/download links for all users.
- [ ] **Contextual guidance**: InfoTooltip on section headers and non-obvious fields. FeatureSpotlight on key features (one-time, persisted). Guided empty states with educational text and action CTAs.
- [ ] **Design**: Follow the semantic Shema tokens exactly — canvas/elevated/muted, fg/fg-strong/fg-muted/fg-subtle, accent + accent-soft, st-* status colors. Legacy tokens (branco, areia, telha, verde, ...) remain valid but prefer the semantic layer.
- [ ] **Tables**: Simple HTML tables with Tailwind styling for CRUD pages.
- [ ] **UX**: Lightweight, uncluttered UI. No tutorial walls. Contextual guidance only. Generous whitespace.
- [ ] No raw HTML/CSS for app layout; no new state or styling libraries.
