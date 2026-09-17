# Frontend Agent Guidelines (tripod-console)

This file defines **frontend-specific** conventions for LLM agents working in `tripod-console/`. Follow these instructions exactly as written.

---

## 1. Stack and Build

- **Framework**: React 18
- **Language**: TypeScript
- **Build / dev**: Vite (with `@vitejs/plugin-react` and `@tailwindcss/vite`)
- **Styling**: **Tailwind CSS v4** only (no CSS-in-JS, no styled-components, no SASS)
- **UI primitives**: Radix UI (via shadcn-style components in `src/components/ui/`)
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
├── index.css                    # Tailwind v4 @theme with Shema design tokens (light + dark)
├── components/
│   ├── common/                  # Shared UI:
│   │                            #   LoadingSpinner, EmptyState, ConfirmDialog, ErrorBoundary
│   │                            #   InfoTooltip       — (i) icon with hover/tap explanation popover
│   │                            #   FeatureSpotlight   — one-time contextual highlight with dismiss
│   ├── layout/                  # AppShell, AppHeader, Sidebar
│   ├── pages/                   # Full-page views:
│   │                            #   LoginPage
│   │                            #   DashboardPage (My Apps hub + admin stats)
│   │                            #   LanguagesPage
│   │                            #   OrganizationsPage, OrganizationDetailPage
│   │                            #   ProjectsPage, ProjectDetailPage
│   │                            #   UsersPage, UserDetailPage           [admin only]
│   │                            #   AppsPage, AppDetailPage             [admin only]
│   │                            #   MapPage
│   │                            #   NotFoundPage, AccessDeniedPage
│   └── ui/                      # Primitives (Button, Badge, Card, Dialog, Input, Select, Tabs, Textarea, Tooltip, Popover)
├── contexts/                    # AuthContext, ThemeContext
├── stores/                      # Zustand stores:
│                                #   onboardingStore — tracks dismissed spotlights (localStorage persist)
├── services/                    # api.ts — Single Axios client with namespaced APIs
├── hooks/                       # Custom hooks
├── types/                       # TypeScript interfaces (auth, user, app, language, org, project, role)
├── constants/                   # app.ts (API_BASE_URL, token keys)
├── utils/                       # cn.ts (class merging)
└── styles/                      # Centralized style constants (cards.ts, badges.ts, layout.ts, states.ts)
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
| `/app` (shell) | AppShell + Outlet | Protected layout with sidebar |
| `/app/dashboard` | DashboardPage | My Apps hub (all users) + admin stats |
| `/app/languages` | LanguagesPage | Languages CRUD table |
| `/app/organizations` | OrganizationsPage | Organizations list |
| `/app/organizations/:orgId` | OrganizationDetailPage | Org detail + members |
| `/app/projects` | ProjectsPage | Projects list |
| `/app/projects/:projectId` | ProjectDetailPage | Project detail + access |
| `/app/users` | UsersPage | Users list (admin only) |
| `/app/users/:userId` | UserDetailPage | User detail + per-app roles (admin only) |
| `/app/apps` | AppsPage | Manage Apps CRUD (admin only) |
| `/app/apps/:appId` | AppDetailPage | App detail + roles + metadata (admin only) |
| `/app/map` | MapPage | Global project map (Leaflet) |
| `/app` (index) | → redirects to `/app/dashboard` | Default landing page |
| `*` | NotFoundPage | 404 |

**Role-aware views**:
- **All authenticated users** see: My Apps (dashboard), Languages, Organizations, Projects, Map.
- **Admin-only routes** (`/app/users`, `/app/apps`): hidden from sidebar and return AccessDeniedPage for non-admins.
- **App admins** can manage roles for their specific app only. When viewing role assignment, the app dropdown is filtered to apps they admin.
- **Platform admins** see all routes and can manage everything globally.

Use `isPlatformAdmin` and `appRoles` from AuthContext for enforcement.

---

## 3. Styling and Tailwind

- **Use Tailwind only** for layout, spacing, colors, typography, and responsive behavior.
- **Avoid inline styles** for things Tailwind can do. Use inline `style` only when necessary (e.g. dynamic values, third-party integration like Leaflet).
- **Use the design tokens** defined in `src/index.css`: `branco`, `areia`, `azul`, `telha`, `verde`, `verde-claro`, `preto`, `surface`, `surface-alt`. Do not introduce arbitrary hex values in JSX; extend the theme if new tokens are needed.

### Dark mode

- Dark mode uses `@custom-variant dark (&:where(.dark, .dark *))` in `index.css`.
- All dark color overrides are defined in `@layer base { .dark { ... } }` using the same Shema tokens.
- When adding components with color that won't adapt via tokens alone, add explicit `dark:` variants (e.g. `dark:bg-red-950/30 dark:text-red-400`).

### Global focus-visible

- `index.css` defines `*:focus-visible { ring-2 ring-telha ring-offset-1 ring-offset-branco }`.
- Components should **not** add redundant `focus:outline-none focus:ring-*` classes. Use `focus-visible:` (not `focus:`) for keyboard-only focus rings.
- Input-like components (Input, Textarea, Select) use `focus:ring-2 focus:ring-telha focus:border-telha` for the border+ring combo since they need `focus:border-telha` too.

### `bg-surface` not `bg-white`

- **Always use `bg-surface`** for elevated surfaces (cards, inputs, modals, select triggers). Never hardcode `bg-white`.
- `surface` maps to `#FFFFFF` in light mode and `#1E1D17` in dark mode — this ensures dark mode works correctly.
- `bg-branco` is for page backgrounds only.

### Centralized style constants

- **Use `src/styles/`** for reusable style constants. This directory contains TypeScript objects with Tailwind class strings organized by purpose:
  - `cards.ts` — card.base, card.hover, card.interactive, card.padded (padded includes base styles)
  - `badges.ts` — badge.base + status variants (success, pending, error, active, inactive) with dark mode support
  - `layout.ts` — page, container, grid, sidebar, main layout patterns
  - `states.ts` — empty, loading, error (banner-style with dark mode), warning state styles with responsive padding
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

- **Zustand**: Use for **cross-page state** that needs to persist across navigation. Known stores:
  - `onboardingStore` — tracks dismissed feature spotlights (persisted to localStorage `tc_onboarding`)
  - Additional stores only if needed (e.g. caching project locations for the map)
  - Create one store per domain, `create` with optional `persist` middleware
- **React Context**: Use for **auth** (AuthContext: user, isPlatformAdmin, appRoles, isAppAdmin, login, logout) and **UI state** (ThemeContext: light/dark/system). Do not put domain data in Context; use Zustand for that.
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

The Button component (`components/ui/button.tsx`) supports `asChild` via Radix Slot and these variants:

| Variant | Usage | Classes |
|---------|-------|---------|
| `default` | Primary CTAs | `bg-telha text-white hover:bg-telha/90` |
| `secondary` | Secondary actions | `bg-areia/20 text-verde hover:bg-areia/30` |
| `outline` | Tertiary / cancel | `border border-areia bg-surface text-preto hover:bg-branco` |
| `ghost` | Inline / table actions | `text-verde hover:bg-areia/10` |
| `destructive` | Delete / danger | `bg-red-600 text-white hover:bg-red-700` |
| `link` | Inline links | `text-telha underline-offset-4 hover:underline` |

Sizes: `default` (h-10), `sm` (h-8), `lg` (h-12), `icon` (h-10 w-10).

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

- **Telha** is exclusive to CTAs, primary actions, and active states. Never use as a neutral decorative color.
- **White (#FFFFFF)** is reserved strictly for elevated surfaces (Cards, Inputs, Modals).
- Do NOT use generic neutral greys. Use the Shema earthy palette.

### 9.3 Spacing & Layout
- **Base unit**: 4px (Tailwind default)
- **Card padding**: `p-6` desktop, `p-4` mobile
- **Section gaps**: `space-y-6` or `space-y-8` for vertical rhythm
- **Form spacing**: `space-y-4` between form groups, `space-y-2` between label and input
- **Label spacing**: `mb-2` (8px) default

### 9.4 Cards & Surfaces
- **Background**: `bg-surface` (white)
- **Borders**: `border border-areia/30`
- **Shadows**: `shadow-sm` base, `shadow-md` on hover
- **Radius**: `rounded-lg` (8-12px) on web
- **Card Base Classes**: `bg-surface rounded-lg border border-areia/30 shadow-sm`
- **Card Hover Classes**: `transition-all duration-200 hover:shadow-md hover:border-telha/30`

### 9.5 Buttons & Interactive Elements
- **Primary (Telha)**: Only for main CTAs
- **States**: Use opacity for hover (`hover:bg-telha/90`), scale for click (`active:scale-[0.98]`). Never introduce new colors on hover.
- **Focus**: Use `focus-visible:ring-telha` (not `focus:`) — keyboard-only focus rings.
- **Padding**: `px-4 py-2` default, heights: `h-10` default, `h-8` sm, `h-12` lg.
- **Variants**: 6 variants available — default, secondary, outline, ghost, destructive, link. See Section 6 for details.

### 9.6 Badges & States
- **Shape**: `rounded-full` for pill-shaped badges
- **Success**: `bg-verde-claro/20 text-verde-claro border-verde-claro/30`
- **Pending**: `bg-areia/30 text-verde border-areia`
- **Error**: `bg-red-100 text-red-800 border-red-200`
- **Active**: `bg-verde-claro/20 text-verde-claro` (for is_active=true)
- **Inactive**: `bg-areia/30 text-verde` (for is_active=false)

### 9.7 Animations & Transitions
- **Hover**: `transition-all duration-200`
- **Click**: `active:scale-[0.98]`

### 9.8 Forms
- **Inputs**: `bg-surface` (not `bg-white`) with `border-areia`. This ensures dark mode compatibility.
- **Placeholders**: `placeholder:text-areia` (muted sand color, not verde).
- **Focus**: `focus:ring-2 focus:ring-telha focus:border-telha`
- **Labels**: Montserrat medium, `text-sm`, `text-preto`, `mb-2`

### 9.9 Tables
- **Container**: `bg-surface rounded-lg border border-areia/30 shadow-sm overflow-hidden`
- **Header row**: `bg-surface-alt` with `text-verde text-sm font-medium`
- **Body rows**: `border-t border-areia/20` with `hover:bg-surface-alt/50`
- **Cell padding**: `px-4 py-3`
- **Action buttons**: Ghost variant, small size

---

## 10. Sidebar

The sidebar is collapsible and contains navigation organized by section:

```
My Apps           (LayoutGrid)            ← default landing, all users
─────────────
Languages         (Languages)
Organizations     (Building2)
Projects          (FolderOpen)
Map               (Globe)
─────────────
Users             (Users)                 [admin only]
Manage Apps       (AppWindow)             [admin only]
─────────────
[User profile / Logout at bottom]
```

- Expanded width: `w-64`; collapsed: `w-16`
- "My Apps" visible to all users — it's the personal apps hub
- "Manage Apps" and "Users" hidden when `!isPlatformAdmin`
- Active route highlighted with telha accent
- Mobile: overlay with dark backdrop

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
- [ ] **`bg-surface` not `bg-white`**: Always use `bg-surface` for elevated surfaces (cards, inputs, modals, selects). Never hardcode `bg-white`.
- [ ] **Dark mode**: Use `dark:` variants where tokens alone don't adapt. Test with `.dark` class.
- [ ] **Focus**: Use `focus-visible:` (not `focus:`) for keyboard-only focus rings. Global focus-visible is defined in `index.css`.
- [ ] **Placeholders**: Use `placeholder:text-areia` consistently across inputs.
- [ ] **State**: Zustand for cross-page state (onboardingStore, etc.); Context for auth and UI; local state for component-only state.
- [ ] **API**: Single `api.ts` client; add new methods to existing namespaces.
- [ ] **Auth**: JWT tokens in localStorage; Axios interceptors for auth header and 401 refresh.
- [ ] **RBAC**: Admin sections restricted to `isPlatformAdmin`. App admins manage roles only for their apps. Regular users see their own apps and roles on the dashboard.
- [ ] **My Apps**: Dashboard shows app cards with icon, name, role badges, and launch/download links for all users.
- [ ] **Contextual guidance**: InfoTooltip on section headers and non-obvious fields. FeatureSpotlight on key features (one-time, persisted). Guided empty states with educational text and action CTAs.
- [ ] **Design**: Follow Shema design tokens exactly — branco, areia, azul, telha, verde-claro, verde, preto.
- [ ] **Tables**: Simple HTML tables with Tailwind styling for CRUD pages.
- [ ] **UX**: Lightweight, uncluttered UI. No tutorial walls. Contextual guidance only. Generous whitespace.
- [ ] No raw HTML/CSS for app layout; no new state or styling libraries.

---

## 15. Quality Gates

Static quality gates run in CI (on every PR) and locally via `make quality` (or `npm run quality`).
Run it before opening a PR and treat any violation as blocking.

- **Architecture / dependencies** (`dependency-cruiser`, config in `.dependency-cruiser.cjs`): no
  circular dependencies; the layering discovered from the code is enforced — `components/ui`
  (primitives), `services`/`stores`, and the leaf folders (`utils/types/constants/styles`) must not
  import higher layers. Any new violation fails the PR (`npm run deps`).
- **Complexity / size** (core ESLint rules in `eslint.config.js`): `complexity`, `max-depth`,
  `max-params`, `max-lines-per-function`, `max-lines`. Phase 0 is calibrated to the current worst
  value (green now) and ratchets down over time.

There are no unit tests yet, so coverage and mutation gates are intentionally not configured here —
that is documented debt. The ratchet schedule is in `obt/.claude/quality-gates-plan.md`.
