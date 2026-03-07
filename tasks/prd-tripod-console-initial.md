# PRD: Tripod Console

**Linear Epic:** OBT-172 — Tripod Console (Frontend)
**Status:** In Progress
**Priority:** Low (Improvement)

---

## 1. Overview

Tripod Console is an **admin UI** for `tripod-backend`. It allows platform administrators and authorized users to manage the core entities of the Shema OBT platform: **users, organizations, projects, languages, apps, and roles**. It also provides a **global map** of project locations.

The frontend consumes the `tripod-backend` REST API (https://tripod-backend.shemaywam.com) and shares the same authentication system, design tokens, and code conventions as `meaning-map-ui`.

**Backend repo:** [github.com/shemaobt/tripod-backend](https://github.com/shemaobt/tripod-backend)
**Backend API docs:** https://tripod-backend.shemaywam.com/docs
**HTTP examples:** `tripod-backend/http/` — `.http` files for all existing endpoints
**Frontend repo:** [github.com/shemaobt/meaning-map-ui](https://github.com/shemaobt/meaning-map-ui)

### Local Paths (for agent reference)

Both repositories are available locally in the workspace. **All backend modifications are made directly on the local filesystem** — do not fetch from or depend on remote repositories. The code is already checked out and ready to edit.

- **Backend codebase:** `/workspace/tripod-backend/`
- **Frontend console (this project):** `/workspace/tripod-console/`
- **Backend CLAUDE.md:** `/workspace/tripod-backend/CLAUDE.md`
- **Backend models:** `/workspace/tripod-backend/app/db/models/`
- **Backend API routes:** `/workspace/tripod-backend/app/api/`
- **Backend services:** `/workspace/tripod-backend/app/services/`
- **Backend schemas (Pydantic):** `/workspace/tripod-backend/app/models/`
- **Backend core (auth, config, exceptions):** `/workspace/tripod-backend/app/core/`
- **Backend tests:** `/workspace/tripod-backend/tests/`
- **Backend test fixtures:** `/workspace/tripod-backend/tests/conftest.py`
- **Backend test data factories:** `/workspace/tripod-backend/tests/baker.py`
- **Backend main (router registration):** `/workspace/tripod-backend/app/main.py`
- **Backend Alembic migrations:** `/workspace/tripod-backend/alembic/versions/`
- **Backend HTTP examples:** `/workspace/tripod-backend/http/`

**Frontend reference (meaning-map-ui)** — if available locally:
- **UI primitives:** `/Users/joao/Desktop/work/shema/shemaobt/meaning-map-ui/src/components/ui/`
- **Styles:** `/Users/joao/Desktop/work/shema/shemaobt/meaning-map-ui/src/styles/`
- **Design tokens:** `/Users/joao/Desktop/work/shema/shemaobt/meaning-map-ui/src/index.css`
- **Auth pattern:** `/Users/joao/Desktop/work/shema/shemaobt/meaning-map-ui/src/contexts/AuthContext.tsx`
- **API client pattern:** `/Users/joao/Desktop/work/shema/shemaobt/meaning-map-ui/src/services/api.ts`
- **Zustand stores:** `/Users/joao/Desktop/work/shema/shemaobt/meaning-map-ui/src/stores/`
- **Common components:** `/Users/joao/Desktop/work/shema/shemaobt/meaning-map-ui/src/components/common/`

### Working with the Backend Repo

The `tripod-backend` codebase lives at `/workspace/tripod-backend/` and is **directly editable**. When building backend features for the console:

1. **Read existing code first** — Before creating new services, routes, or schemas, read the existing patterns in the same domain area. For example, before adding `app/services/user/`, read `app/services/auth/` and `app/services/project/` to match conventions.
2. **Edit in place** — Modify files directly under `/workspace/tripod-backend/`. No git clone or remote fetch is needed.
3. **Follow backend CLAUDE.md** — All backend conventions are in `/workspace/tripod-backend/CLAUDE.md`. Key rules:
   - Routers are thin: parse input, call service, map exceptions to HTTP responses.
   - **Zero database access in routers** — all queries go through `app/services/`.
   - Services raise business exceptions (`NotFoundError`, `ConflictError`, `RoleError`, etc.) from `app/core/exceptions.py`.
   - Never import `HTTPException` in services; never import SQLAlchemy models in routers.
4. **Register new routers** in `app/main.py`.
5. **Add Alembic migrations** for any schema changes (new columns, new tables).
6. **Add `.http` example files** in `http/` for any new endpoints.
7. **Write unit tests** for all new service functions (see Section 10 below).

---

## 2. Goals

1. Provide a web-based admin console for managing platform-wide entities (users, orgs, projects, languages, apps, roles).
2. Enable platform admins to assign/revoke app roles and manage project access (user + organization grants).
3. Give every authenticated user a personal hub showing their apps, roles, and quick-launch links.
4. Visualize project locations on an interactive world map.
5. Follow the same stack, design system, and code conventions as `meaning-map-ui`.
6. Deliver a lightweight, beautiful UI with excellent UX — minimize cognitive load, use contextual guidance (coachmarks, feature spotlights), and avoid cluttered screens.

---

## 3. Users and Roles

| Role | Access |
|------|--------|
| **Platform Admin** (`is_platform_admin=true`) | Full access to all sections. Can manage users, orgs, projects, languages, apps, and roles across ALL apps. Sees all roles from all apps. |
| **App Admin** (role_key=`admin` for an app) | Can manage roles **for that specific app only**. Can manage projects they have access to. |
| **Authenticated User** | Has a personal **My Apps** dashboard showing all apps they have access to (with app icon, name, description, and a launch/download link). Can see their own roles per app. Can view their profile. No access to admin-only sections (Users, Apps management). |
| **Unauthenticated** | Redirected to login. |

### 3.1 Role Visibility Rules

- **Authenticated users** see only their own roles, scoped to the apps they have access to. Each app card on the dashboard shows the user's role(s) for that app.
- **App Admins** see all roles for the specific app they administrate. They can assign/revoke roles within that app only.
- **Platform Admins** see all roles from all apps across the entire platform. They can manage any role assignment globally.

### 3.2 App Access Hub (My Apps)

Every authenticated user — regardless of role — lands on a **dashboard** that prominently shows their apps:

- **App cards**: Each app the user has access to is displayed as a card with:
  - App icon/logo (stored as `icon_url` on the App model, or a default icon)
  - App name and short description
  - The user's role(s) within that app (e.g. "admin", "analyst")
  - **Launch button**: For web apps, a direct link to the app URL (stored as `app_url` on the App model). For mobile apps, links to App Store / Play Store (stored as `ios_url`, `android_url`).
  - Platform badge: "Web", "iOS", "Android", or combination
- **Empty state**: If user has no apps, show a friendly message ("You don't have access to any apps yet") with an optional "Request Access" CTA.
- This hub replaces a generic "Dashboard" — the console's primary value for regular users is quick access to their apps.

---

## 4. Linear Sub-Issues (Requirements)

### 4.1 OBT-173 — Setup Tripod Console Frontend (React/Vite, Tailwind)

**Status:** Todo

Create the Tripod Console web app from scratch using the same stack as `meaning-map-ui`:

- **Stack:** React 18, Vite, TypeScript, Tailwind CSS v4, Zustand, Axios, Radix UI, lucide-react, sonner
- **Project structure:** Mirror `meaning-map-ui/src/` layout:
  ```
  src/
  ├── App.tsx
  ├── main.tsx
  ├── index.css              # Tailwind v4 @theme with Shema tokens
  ├── components/
  │   ├── common/            # LoadingSpinner, EmptyState, ConfirmDialog, ErrorBoundary
  │   ├── layout/            # AppShell, AppHeader, Sidebar
  │   ├── pages/             # Full-page views
  │   └── ui/                # Button, Badge, Card, Dialog, Input, Select, Tabs, etc.
  ├── contexts/              # AuthContext, ThemeContext
  ├── stores/                # Zustand stores
  ├── services/              # api.ts (single Axios client)
  ├── hooks/                 # Custom hooks
  ├── types/                 # TypeScript interfaces
  ├── constants/             # App constants, token keys
  ├── utils/                 # cn.ts, helpers
  └── styles/                # Centralized style constants (cards, badges, layout, states)
  ```
- **Routing:** React Router v7 with `/app` shell (protected) and `/login`
- **Layout:** AppShell with collapsible sidebar, header with theme toggle
- **API base:** Configurable via env/vite proxy, defaulting to `/api`
- **README:** Install, dev, build instructions
- **CLAUDE.md:** Full conventions document (see companion file)

**UI primitives to copy from meaning-map-ui:**
- `src/components/ui/` — Button, Badge, Card, Dialog, Input, Select, Tabs, Textarea, Progress, Sheet
- `src/utils/cn.ts` — Class merging utility
- `src/styles/` — cards.ts, badges.ts, layout.ts, states.ts
- `src/index.css` — Tailwind v4 @theme block with Shema design tokens (light + dark mode)
- `src/contexts/ThemeContext.tsx` — Light/dark/system theme

---

### 4.2 OBT-175 — Auth and RBAC Integration

**Status:** Todo

Wire Tripod Console to tripod-backend auth. Implement:

**Login flow:**
- Login screen: email + password → `POST /api/auth/login` → store `access_token` + `refresh_token` in localStorage
- `Authorization: Bearer <access_token>` on all API requests via Axios request interceptor
- 401 response interceptor: attempt `POST /api/auth/refresh`; on failure redirect to `/login`
- Logout: `POST /api/auth/logout` + clear tokens

**RBAC enforcement:**
- On app mount, call `GET /api/auth/me` → `UserResponse` (id, email, display_name, is_active, is_platform_admin)
- Call `GET /api/auth/my-roles` → `MyRoleResponse[]` (app_key, role_key)
- Store in AuthContext: `user`, `isPlatformAdmin`, `appRoles`
- Restrict admin sections to platform admins or app admins
- Show "Unauthorized" state when user lacks permission

**Existing backend endpoints:**
- `POST /api/auth/login` → `AuthResponse`
- `POST /api/auth/refresh` → `TokenResponse`
- `POST /api/auth/logout` (204)
- `GET /api/auth/me` → `UserResponse`
- `GET /api/auth/my-roles?app_key=<optional>` → `MyRoleResponse[]`
- `GET /api/roles/check?user_id=&app_key=&role_key=` → `RoleCheckResponse`

**Pattern reference:** `meaning-map-ui/src/contexts/AuthContext.tsx` (token storage, refresh interceptor, role derivation)

---

### 4.3 OBT-176 — Languages CRUD UI

**Status:** Todo

Build the Languages management section.

**UI:**
- Table view: columns — Name, Code (3-char), Created
- "Create Language" button → modal/form with: name (required), code (required, 3 chars)
- Edit language inline or via modal: name, code
- Validation: code must be exactly 3 chars, show backend 409 error if code already exists

**Existing backend endpoints:**
- `GET /api/languages` → `LanguageResponse[]`
- `POST /api/languages` (201) → `LanguageResponse` | `LanguageCreate` (name, code)
- `GET /api/languages/{language_id}` → `LanguageResponse`
- `GET /api/languages/code/{code}` → `LanguageResponse`

**Backend gaps:** None — all endpoints exist.

**Access:** Authenticated users with platform admin or relevant app admin role.

---

### 4.4 OBT-177 — Organizations CRUD and Members UI

**Status:** Todo

Build the Organizations section.

**UI:**
- Table view: columns — Name, Slug, Member count (or link to detail), Created
- "Create Organization" button → form: name, slug (unique, URL-friendly)
- Edit organization: name, slug with validation
- Organization detail page: list members (user email, role, joined date)
- "Add Member" flow: search/select user by email or user ID, choose role (e.g. "member"), call add-member API. Show 409 if already a member.
- "Remove Member" with confirmation dialog

**Existing backend endpoints:**
- `GET /api/organizations` → `OrganizationResponse[]`
- `POST /api/organizations` (201) → `OrganizationResponse` | `OrganizationCreate` (name, slug)
- `GET /api/organizations/{organization_id}` → `OrganizationResponse`
- `GET /api/organizations/slug/{slug}` → `OrganizationResponse`
- `POST /api/organizations/{organization_id}/members` (201) → `OrganizationMemberResponse` | `OrganizationMemberAdd` (user_id, role)

**Backend gaps (new endpoints needed):**
- `PATCH /api/organizations/{organization_id}` — Update organization (name, slug). Service: `update_organization(db, organization_id, name?, slug?)`. Schema: `OrganizationUpdate` (name?: str, slug?: str).
- `GET /api/organizations/{organization_id}/members` — List members. Service: `list_members(db, organization_id)`. Response: `OrganizationMemberResponse[]` (include user email/display_name).
- `DELETE /api/organizations/{organization_id}/members/{user_id}` — Remove member. Service: `remove_member(db, organization_id, user_id)`.

---

### 4.5 OBT-178 — Projects CRUD UI

**Status:** Todo

Build the Projects section.

**UI:**
- Table view: columns — Name, Description (truncated), Language (name/code from languages API), Created, Updated
- "Create Project" button → form:
  - Name (required)
  - Description (optional, textarea)
  - Language (dropdown populated from `GET /api/languages`)
  - Location: Google Maps place picker (sets latitude, longitude, location_display_name)
- Edit project: name, description, language
- Project detail page: links to "Project Access" (OBT-180) for user/org grants
- Handle 404 when project or language is missing

**Existing backend endpoints:**
- `GET /api/projects` → `ProjectResponse[]` (query: language_id optional)
- `POST /api/projects` (201) → `ProjectResponse` | `ProjectCreate` (name, language_id, description?, latitude?, longitude?, location_display_name?)
- `GET /api/projects/{project_id}` → `ProjectResponse`
- `PATCH /api/projects/{project_id}/location` → `ProjectResponse` | `ProjectLocationUpdate`

**Backend gaps (new endpoints needed):**
- `PATCH /api/projects/{project_id}` — General update (name, description, language_id). Service: `update_project(db, project_id, name?, description?, language_id?)`. Schema: `ProjectUpdate` (name?: str, description?: str, language_id?: str).

**Location picker:** Use Google Maps JavaScript API or `@react-google-maps/api` for place search + map pin. On place select, extract lat/lng/display_name and send to `PATCH /api/projects/{project_id}/location`.

---

### 4.6 OBT-179 — Users List and App-Role Assignment UI

**Status:** Todo

Build the Users and Roles section.

**UI:**
- Users table: columns — Email, Display Name, Active (yes/no), Platform Admin (yes/no)
- Click user row → user detail view:
  - User info card (email, display_name, is_active, is_platform_admin)
  - App roles table: App Key, Role Key, Granted At
  - "Assign Role" button → form: select App (dropdown), select Role (admin/member), call `POST /api/roles/assign`
  - "Revoke Role" button per row, with confirmation → `POST /api/roles/revoke`
- Restrict entire section to platform admins or app admins

**Existing backend endpoints:**
- `GET /api/auth/me` → current user only
- `GET /api/auth/my-roles?app_key=` → current user's roles only
- `POST /api/roles/assign` → `RoleAssignmentResponse` | `RoleAssignRequest` (user_id, app_key, role_key)
- `POST /api/roles/revoke` → `RoleAssignmentResponse` | `RoleRevokeRequest` (user_id, app_key, role_key)
- `GET /api/roles/check?user_id=&app_key=&role_key=` → `RoleCheckResponse`

**Backend gaps (new endpoints needed):**
- `GET /api/users` — List all users. Service: `list_users(db)`. Response: `UserListResponse[]` (id, email, display_name, is_active, is_platform_admin, created_at). Restrict to platform admin.
- `GET /api/users/{user_id}` — Get user by ID. Service: `get_user_by_id(db, user_id)` (already exists in auth service, needs API route). Response: `UserResponse`.
- `GET /api/users/{user_id}/roles` — List user's roles across all apps. Service: `list_roles(db, user_id)` (already exists in authorization service, needs API route). Response: `RoleAssignmentResponse[]` (include app_key, role_key, granted_at).
- `PATCH /api/users/{user_id}` — Update user (toggle is_active, is_platform_admin). Service: `update_user(db, user_id, is_active?, is_platform_admin?)`. Schema: `UserUpdate`. Restrict to platform admin.

**New DB model:** None needed — User model already has all required fields.

---

### 4.7 OBT-180 — Project Access: Grant User and Grant Organization

**Status:** Todo

From a project detail page, add an "Access" / "Permissions" area.

**UI:**
- Two lists on the project detail page:
  1. **Users with direct access** — user email/display_name, granted date, "Revoke" button
  2. **Organizations with access** — org name/slug, granted date, "Revoke" button
- "Grant to User" form: pick user (by email or ID from user search), call `POST /api/projects/{project_id}/access/users`
- "Grant to Organization" form: pick org (from org list), call `POST /api/projects/{project_id}/access/organizations`
- Show message if already granted (409)
- Restrict to platform admins or project admins

**Existing backend endpoints:**
- `POST /api/projects/{project_id}/access/users` (201) → `ProjectUserAccessResponse` | `ProjectGrantUserAccess` (user_id)
- `POST /api/projects/{project_id}/access/organizations` (201) → `ProjectOrganizationAccessResponse` | `ProjectGrantOrganizationAccess` (organization_id)

**Backend gaps (new endpoints needed):**
- `GET /api/projects/{project_id}/access/users` — List users with access. Service: `list_project_user_access(db, project_id)`. Response: `ProjectUserAccessResponse[]` (include user email/display_name).
- `GET /api/projects/{project_id}/access/organizations` — List orgs with access. Service: `list_project_organization_access(db, project_id)`. Response: `ProjectOrganizationAccessResponse[]` (include org name/slug).
- `DELETE /api/projects/{project_id}/access/users/{user_id}` — Revoke user access. Service: `revoke_user_access(db, project_id, user_id)`.
- `DELETE /api/projects/{project_id}/access/organizations/{organization_id}` — Revoke org access. Service: `revoke_organization_access(db, project_id, organization_id)`.

---

### 4.8 OBT-181 — Apps CRUD UI

**Status:** Todo

Add an "Apps" section in Tripod Console.

**UI:**
- Table view: columns — App Key (e.g. `tripod-studio`), Name, Active (yes/no)
- Each row links to app detail or to the "Users list" flow filtered by that app
- "Create App" form: app_key (unique), name, is_active (default true)
- Edit app: name, is_active
- Optionally show per-app role counts or link to "Manage Roles"
- Restrict to platform admins

**Existing backend endpoints:** None — the `App` model exists but has no CRUD API.

**App model extension (new columns needed):**

The existing `App` model (`app/db/models/auth.py`) has: `id`, `app_key`, `name`, `is_active`, `created_at`. For the App Access Hub, add these nullable columns:

| Column | Type | Purpose |
|--------|------|---------|
| `description` | `Text, nullable` | Short description shown on the app card |
| `icon_url` | `String, nullable` | URL to app icon/logo image |
| `app_url` | `String, nullable` | Web app URL (launch link) |
| `ios_url` | `String, nullable` | iOS App Store URL |
| `android_url` | `String, nullable` | Google Play Store URL |
| `platform` | `String, default="web"` | Platform type: `web`, `mobile`, `both` |

These fields are all nullable so existing seed data doesn't break. An Alembic migration is needed.

**Backend gaps (new endpoints needed):**
- `GET /api/apps` — List all apps. Service: `list_apps(db)`. Response: `AppResponse[]` (id, app_key, name, description, icon_url, app_url, ios_url, android_url, platform, is_active, created_at).
- `GET /api/apps/my-apps` — List apps the current user has access to (based on UserAppRole). Service: `list_user_apps(db, user_id)`. Response: `UserAppResponse[]` (app fields + user's roles for that app). Available to any authenticated user.
- `POST /api/apps` (201) — Create app. Service: `create_app(db, ...)`. Schema: `AppCreate` (app_key, name, description?, icon_url?, app_url?, ios_url?, android_url?, platform?, is_active?). 409 if app_key exists. Admin only.
- `GET /api/apps/{app_id}` — Get app. Service: `get_app_or_404(db, app_id)`. Response: `AppResponse`.
- `PATCH /api/apps/{app_id}` — Update app. Service: `update_app(db, ...)`. Schema: `AppUpdate`. Admin only.
- `GET /api/apps/{app_id}/roles` — List roles for app. Service: `list_app_roles(db, app_id)`. Response: `RoleResponse[]` (role_key, label, description, is_system).

**New Pydantic schemas needed:**
- `AppCreate` (app_key, name, description?, icon_url?, app_url?, ios_url?, android_url?, platform?, is_active?)
- `AppUpdate` (name?, description?, icon_url?, app_url?, ios_url?, android_url?, platform?, is_active?)
- `AppResponse` (id, app_key, name, description, icon_url, app_url, ios_url, android_url, platform, is_active, created_at)
- `UserAppResponse` (extends AppResponse + roles: list[str] — the user's role_keys for that app)

**New service module:** `app/services/app/` with CRUD functions.

**New Alembic migration:** Add `description`, `icon_url`, `app_url`, `ios_url`, `android_url`, `platform` columns to `apps` table.

---

### 4.9 OBT-182 — Global Map of Project Locations (Leaflet)

**Status:** Todo

Implement a world map view showing project locations.

**UI:**
- World map using **Leaflet** (via `react-leaflet`) with OpenStreetMap tiles
- Data: use `GET /api/projects` — filter to projects with both `latitude` and `longitude` set
- Markers: one per project at (latitude, longitude)
  - Tooltip/popup: `location_display_name` or project name if display name is missing
  - Click popup: project name, location label, link to project detail page
- Empty state: "No project locations to show" or "Add locations to projects to see them on the map"
- Consider marker clustering (`react-leaflet-cluster` or `leaflet.markercluster`) for many projects

**Backend gaps:** None — `GET /api/projects` already returns `latitude`, `longitude`, `location_display_name`.

**Dependencies:** `react-leaflet`, `leaflet`, `@types/leaflet`, optionally `react-leaflet-cluster`

---

### 4.10 Contextual Guidance System (Onboarding, Coachmarks, Feature Spotlights)

**Status:** Cross-cutting (applies to all pages)

Implement a lightweight contextual guidance system that helps users understand features without overwhelming them. The system uses **three complementary patterns**:

#### 4.10.1 Info Tooltips (always available)

Small `(i)` icons placed next to section headers, column labels, or complex controls. On hover/click, they show a concise explanation of what that feature does.

**Implementation:**
- Reusable `InfoTooltip` component in `components/common/`
- Props: `content: string` (the explanation text)
- Renders a small `Info` icon (lucide-react) in `text-verde/50` that expands a tooltip/popover on hover (desktop) or tap (mobile)
- Tooltip uses Radix `Tooltip` or `Popover` primitive
- Keep text under 2 sentences — link to docs if more detail is needed

**Where to place:**
- Page headers: "Languages — Manage the translation target languages for your projects"
- Table column headers that aren't obvious: "Slug — A unique URL-friendly identifier"
- Form fields with specific requirements: "Code — Exactly 3 characters (ISO 639-3)"
- Complex features: Project Access section, Role assignment, Map clustering

#### 4.10.2 Feature Spotlights (contextual, dismissible)

One-time highlights that draw attention to a new or important feature. Shown as a subtle pulsing dot or highlighted border on the target element with a small popover card explaining the feature.

**Implementation:**
- `FeatureSpotlight` component wrapping a target element
- Props: `featureKey: string` (unique ID for tracking dismissal), `title: string`, `description: string`, `placement: "top" | "bottom" | "left" | "right"`
- Tracks dismissed spotlights in localStorage (`tc_dismissed_spotlights: string[]`)
- Only shows once per feature per user — once dismissed, never shows again
- Visual: subtle pulsing ring (`animate-pulse`) on the target + popover card with title, description, and "Got it" dismiss button
- Maximum 1 spotlight visible at a time per page to avoid clutter

**Where to place:**
- First visit to Map page: spotlight on the map explaining "See all your projects' locations at a glance"
- First visit to a Project detail: spotlight on the Access tab
- First time on Apps admin: spotlight explaining app management

#### 4.10.3 Empty State Guidance

When a section has no data, the empty state doubles as education — explaining what the section is for and how to get started.

**Implementation:**
- Use the existing `EmptyState` component pattern from meaning-map-ui
- Each empty state has: an illustrative icon, a title explaining the concept, a description with guidance, and an action button
- Examples:
  - Languages empty: "No languages yet — Languages represent the target translation languages for your projects. Add your first language to get started." + "Add Language" button
  - Organizations empty: "No organizations — Organizations group users together. Members of an organization can be granted access to projects collectively." + "Create Organization" button
  - User's My Apps empty: "You don't have access to any apps yet — Ask your administrator to grant you access, or request access below." + "Request Access" button

#### UX Principles for Guidance

- **Never block the user**: All guidance is dismissible and non-modal (except empty states which naturally require action)
- **Progressive disclosure**: Show minimal info first; let users dig deeper if they want
- **One-time only**: Spotlights show once. Info tooltips are always available but unobtrusive
- **Consistent placement**: Info icons always appear to the right of the label they explain
- **No tutorial walls**: Never show a multi-step onboarding wizard that blocks the UI. Let users explore naturally with contextual help available when needed

---

## 5. Backend API Gap Summary

All new backend endpoints follow existing patterns in `tripod-backend`: service-driven, async, Pydantic schemas, proper exceptions.

| Domain | Endpoint | Method | Purpose | Service Function |
|--------|----------|--------|---------|-----------------|
| **Users** | `/api/users` | GET | List all users | `list_users(db)` |
| **Users** | `/api/users/{user_id}` | GET | Get user by ID | `get_user_by_id(db, user_id)` (exists) |
| **Users** | `/api/users/{user_id}` | PATCH | Update user | `update_user(db, user_id, ...)` |
| **Users** | `/api/users/{user_id}/roles` | GET | List user's app roles | `list_user_roles(db, user_id)` |
| **Apps** | `/api/apps` | GET | List all apps (admin) | `list_apps(db)` |
| **Apps** | `/api/apps/my-apps` | GET | List user's apps + roles | `list_user_apps(db, user_id)` |
| **Apps** | `/api/apps` | POST | Create app | `create_app(db, ...)` |
| **Apps** | `/api/apps/{app_id}` | GET | Get app | `get_app_or_404(db, app_id)` |
| **Apps** | `/api/apps/{app_id}` | PATCH | Update app | `update_app(db, ...)` |
| **Apps** | `/api/apps/{app_id}/roles` | GET | List roles for app | `list_app_roles(db, app_id)` |
| **Orgs** | `/api/organizations/{id}` | PATCH | Update org | `update_organization(db, ...)` |
| **Orgs** | `/api/organizations/{id}/members` | GET | List members | `list_members(db, org_id)` |
| **Orgs** | `/api/organizations/{id}/members/{uid}` | DELETE | Remove member | `remove_member(db, org_id, uid)` |
| **Projects** | `/api/projects/{id}` | PATCH | General update | `update_project(db, ...)` |
| **Access** | `/api/projects/{id}/access/users` | GET | List user access | `list_project_user_access(db, ...)` |
| **Access** | `/api/projects/{id}/access/orgs` | GET | List org access | `list_project_org_access(db, ...)` |
| **Access** | `/api/projects/{id}/access/users/{uid}` | DELETE | Revoke user access | `revoke_user_access(db, ...)` |
| **Access** | `/api/projects/{id}/access/orgs/{oid}` | DELETE | Revoke org access | `revoke_org_access(db, ...)` |

**New backend files needed** (all paths relative to `/workspace/tripod-backend/`):
- `app/api/users.py` — Users router
- `app/api/apps.py` — Apps router
- `app/services/user/` — User service (list_users, update_user)
- `app/services/app/` — App service (list_apps, create_app, get_app, update_app, list_app_roles)
- `app/models/user.py` — UserListResponse, UserUpdate schemas
- `app/models/app.py` — AppCreate, AppUpdate, AppResponse schemas
- `alembic/versions/` — Migration to add new columns to `apps` table (description, icon_url, app_url, ios_url, android_url, platform)
- Extend existing services: `org/`, `project/` with update/list/revoke functions
- Extend existing schemas: `org.py` (OrganizationUpdate), `project.py` (ProjectUpdate)
- Register new routers in `app/main.py`
- Add `.http` example files: `http/users.http`, `http/apps.http`

**New backend test files needed** (all paths relative to `/workspace/tripod-backend/`):
- `tests/test_user_service.py` — Tests for all user service functions
- `tests/test_app_service.py` — Tests for all app service functions
- Extend `tests/test_organization_service.py` — Tests for update_org, list_members, remove_member
- Extend `tests/test_project_service.py` — Tests for update_project, list/revoke access
- Extend `tests/baker.py` — Add any new `make_*()` factories needed for test data

---

## 6. Frontend Architecture

### 6.1 Routing

| Path | Component | Description |
|------|-----------|-------------|
| `/login` | LoginPage | Email + password auth |
| `/app` (shell) | AppShell + Outlet | Protected layout with sidebar |
| `/app/dashboard` | DashboardPage | My Apps hub (all users) + admin stats |
| `/app/languages` | LanguagesPage | Languages CRUD table |
| `/app/organizations` | OrganizationsPage | Organizations list |
| `/app/organizations/:orgId` | OrganizationDetailPage | Org detail + members |
| `/app/projects` | ProjectsPage | Projects list |
| `/app/projects/:projectId` | ProjectDetailPage | Project detail + access |
| `/app/users` | UsersPage | Users list + role mgmt [admin only] |
| `/app/users/:userId` | UserDetailPage | User detail + roles [admin only] |
| `/app/apps` | AppsPage | Apps CRUD table [admin only] |
| `/app/apps/:appId` | AppDetailPage | App detail + roles [admin only] |
| `/app/map` | MapPage | Global project map (Leaflet) |
| `*` | NotFoundPage | 404 |

### 6.2 Sidebar Navigation

```
My Apps           (LayoutGrid icon)       ← default landing, all users
─────────────
Languages         (Languages icon)
Organizations     (Building2 icon)
Projects          (FolderOpen icon)
Map               (Globe icon)
─────────────
Users             (Users icon)            [admin only]
Manage Apps       (AppWindow icon)        [admin only]
─────────────
[User profile / Logout at bottom]
```

**Note:** "My Apps" is the personal hub (see Section 3.2). "Manage Apps" is the admin CRUD page for creating/editing apps (OBT-181). Regular users see "My Apps" but not "Manage Apps" or "Users".

### 6.3 State Management

| Store | Purpose |
|-------|---------|
| AuthContext | User, tokens, isPlatformAdmin, appRoles, login, logout |
| ThemeContext | Light/dark/system theme |
| onboardingStore (Zustand) | Tracks dismissed spotlights/coachmarks (persisted to localStorage) |
| Zustand stores | One per domain if needed (e.g. projectStore for map data caching) |

Most pages are simple CRUD with local state (`useState` for form data, loading, errors). Zustand stores are only needed for cross-page state (e.g. caching project locations for the map, tracking onboarding state).

### 6.4 API Client

Single Axios client in `src/services/api.ts` with namespaced APIs:

```typescript
authAPI      — login, logout, refresh, me, myRoles
usersAPI     — list, get, update, listRoles
appsAPI      — list, myApps, create, get, update, listRoles
languagesAPI — list, create, get, getByCode
orgsAPI      — list, create, get, update, listMembers, addMember, removeMember
projectsAPI  — list, create, get, update, updateLocation, listUserAccess, listOrgAccess, grantUser, grantOrg, revokeUser, revokeOrg
rolesAPI     — assign, revoke, check
```

### 6.5 Design System

**Identical to meaning-map-ui** — same Tailwind v4 @theme tokens, same colors, fonts, spacing, card/badge/button/form patterns. Copy the design system verbatim from meaning-map-ui.

---

## 7. Implementation Phases

### Phase 1: Scaffolding (OBT-173)
1. Init Vite + React 18 + TS + Tailwind v4
2. Copy UI primitives from meaning-map-ui (`components/ui/`, `utils/cn.ts`, `styles/`, `index.css`)
3. Set up routing (React Router v7)
4. Set up AppShell layout (header, sidebar, main area)
5. Set up ThemeContext (light/dark)
6. Set up API client skeleton (`services/api.ts`)
7. Build common components: InfoTooltip, FeatureSpotlight, EmptyState (with guidance text)
8. Create onboardingStore (Zustand with localStorage persist for dismissed spotlights)
9. Create CLAUDE.md

### Phase 2: Auth (OBT-175)
10. Create AuthContext with login/logout/refresh
11. Build LoginPage
12. Add Axios interceptors (auth header, 401 refresh)
13. Add route protection in AppShell
14. Add RBAC checks (isPlatformAdmin, appRoles)

### Phase 3: Backend API Extensions
15. Add App model migration (description, icon_url, app_url, ios_url, android_url, platform columns)
16. Add Users API (`app/api/users.py`, `app/services/user/`)
17. Add Apps API (`app/api/apps.py`, `app/services/app/`) — including `GET /api/apps/my-apps`
18. Add Organization update + member list/remove endpoints
19. Add Project general update endpoint
20. Add Project access list/revoke endpoints
21. Add new Pydantic schemas
22. Register routers in `app/main.py`
23. Add `.http` example files
24. **Write unit tests** for all new service functions:
    - `tests/test_user_service.py` (new)
    - `tests/test_app_service.py` (new)
    - Extend `tests/test_organization_service.py`
    - Extend `tests/test_project_service.py`
    - Add any new `make_*()` factories to `tests/baker.py`
    - Run `uv run pytest tests` to verify all pass

### Phase 4: My Apps Dashboard
25. Build DashboardPage with My Apps grid (app cards with icon, name, role badges, launch/download links)
26. Wire to `GET /api/apps/my-apps`
27. Add empty state with "Request Access" guidance
28. Add admin stats section (visible only to platform admins, below the apps grid)

### Phase 5: Languages UI (OBT-176)
29. Build LanguagesPage with data table + InfoTooltips on columns
30. Add Create/Edit language dialogs
31. Wire to backend API

### Phase 6: Organizations UI (OBT-177)
32. Build OrganizationsPage with data table
33. Build OrganizationDetailPage with member list
34. Add Create/Edit org dialogs
35. Add Add/Remove member flow

### Phase 7: Projects UI (OBT-178)
36. Build ProjectsPage with data table
37. Build ProjectDetailPage
38. Add Create/Edit project dialogs with language dropdown
39. Add Google Maps location picker
40. Wire location to `PATCH /projects/{id}/location`

### Phase 8: Project Access UI (OBT-180)
41. Add Access tab/section to ProjectDetailPage + InfoTooltips
42. List users with access + grant/revoke
43. List orgs with access + grant/revoke

### Phase 9: Users & Roles UI (OBT-179)
44. Build UsersPage with data table
45. Build UserDetailPage with per-app role cards
46. Add Assign/Revoke role flow (scoped: app admins see only their app; platform admins see all)

### Phase 10: Apps Management UI (OBT-181) — admin only
47. Build AppsPage (Manage Apps) with data table
48. Build AppDetailPage with roles list + app metadata (icon, URLs, platform)
49. Add Create/Edit app dialogs (with icon_url, app_url, ios_url, android_url, platform fields)

### Phase 11: Map (OBT-182)
50. Install react-leaflet + leaflet
51. Build MapPage with world map
52. Add project markers with popups
53. Add marker clustering
54. Handle empty state + FeatureSpotlight on first visit

### Phase 12: Contextual Guidance Polish
55. Add InfoTooltips to all section headers and non-obvious fields
56. Add FeatureSpotlights to key features (Map, Access tab, Role assignment)
57. Review all empty states for educational guidance text
58. Verify all spotlights dismiss correctly and persist across sessions

---

## 8. Acceptance Criteria

| Feature | Criteria |
|---------|----------|
| Auth | User can log in, tokens refresh automatically, unauthorized users see login |
| RBAC | Admin sections hidden from non-admin users; "Unauthorized" shown when lacking permission. App admins see roles only for their app. Platform admins see all. |
| My Apps | Every user sees their apps as cards with icon, name, roles, and launch/download links. Empty state shows guidance. |
| Languages | CRUD works; 409 on duplicate code; 3-char validation |
| Organizations | CRUD works; members can be added/removed; 409 on duplicate member |
| Projects | CRUD works; language dropdown populated; location picker sets coordinates |
| Project Access | Users/orgs can be granted/revoked; lists show current access |
| Users & Roles | Admin can list users, view roles, assign/revoke roles per app |
| Apps (admin) | Admin can list/create/edit apps with metadata (icon, URLs, platform); per-app role counts shown |
| Map | Markers shown for projects with coordinates; popup with project info; empty state for no locations |
| Info Tooltips | `(i)` icons next to section headers and non-obvious fields; show concise explanation on hover/tap |
| Feature Spotlights | One-time highlights on key features; dismissed state persists in localStorage; max 1 per page |
| Empty States | All empty states include educational guidance text and an action CTA |
| UX | UI feels lightweight and uncluttered; no tutorial walls or modal blockers; guidance is contextual and non-intrusive |
| Backend Tests | Every new service function has corresponding unit tests. All tests pass with `uv run pytest tests`. Test coverage includes happy path, error cases, not-found, conflict, and edge cases. |

---

## 9. Technical Constraints

- **No new state libraries** — Zustand + React Context only
- **No new styling systems** — Tailwind CSS v4 only
- **Same design tokens** as meaning-map-ui (branco, areia, azul, telha, verde-claro, verde, preto)
- **Same fonts** — Montserrat (UI) + Merriweather (content)
- **Backend patterns** — Service-driven architecture, async, Pydantic schemas, custom exceptions
- **Auth** — JWT with access/refresh tokens, same as tripod-backend existing auth system
- **Backend tests required** — Every new service function must have corresponding unit tests (see Section 10)

---

## 10. Backend Unit Testing

Every new backend service function **must** have corresponding unit tests. Tests follow the established patterns in `/workspace/tripod-backend/tests/`.

### 10.1 Test Stack

- **Framework:** pytest + pytest-asyncio
- **Database:** SQLite in-memory via `aiosqlite` (not PostgreSQL — fast, isolated, no external deps)
- **Async mode:** `asyncio_mode = "auto"` in `pyproject.toml`
- **No mocking:** Tests use a real SQLite database; avoid mocks for database operations

### 10.2 Test Organization

```
tripod-backend/tests/
├── conftest.py                  # Shared fixtures (db_session, test_engine, event_loop)
├── baker.py                     # Test data factory functions (make_user, make_app, etc.)
├── test_auth_service.py         # Tests for app/services/auth/
├── test_authorization_service.py
├── test_language_service.py
├── test_organization_service.py
├── test_project_service.py
├── test_<new_domain>_service.py # One test file per service domain
└── ...
```

- **Flat structure** — all test files at the top level of `tests/`
- **Naming**: `test_<domain>_service.py` (e.g. `test_user_service.py`, `test_app_service.py`)
- **One test file per service domain** — maps to service modules in `app/services/`

### 10.3 Fixtures (`conftest.py`)

The existing `conftest.py` provides:

```python
# Session-scoped async event loop
@pytest.fixture(scope="session")
def event_loop() -> AsyncGenerator[asyncio.AbstractEventLoop, None]: ...

# Session-scoped SQLite engine
@pytest.fixture(scope="session")
async def test_engine(): ...

# Function-scoped session: drops and recreates all tables per test (clean slate)
@pytest.fixture()
async def db_session(test_engine) -> AsyncGenerator[AsyncSession, None]:
    # Drops all tables → recreates schema → seeds a default App → yields session → rollback
```

**Key behavior**: Each test function gets a completely fresh database schema. The fixture seeds one default app (`meaning-map-generator`).

### 10.4 Test Data Factories (`baker.py`)

Use the `make_*()` factory functions in `tests/baker.py` to create test data. These functions:

- Accept a `db: AsyncSession` as the first argument
- Use keyword-only arguments with sensible defaults
- Commit and refresh the object before returning
- Return the created SQLAlchemy model instance

**Existing factories:** `make_user`, `make_app`, `make_role`, `make_user_app_role`, `make_language`, `make_organization`, `make_organization_member`, `make_project`, `make_project_user_access`, `make_project_organization_access`, `make_phase`, `make_project_phase`, `make_refresh_token`, `make_bible_book`, `make_pericope`, `make_meaning_map`, `make_access_request`, and more.

**When adding new service functions**, add corresponding `make_*()` factories to `baker.py` if the domain requires new test data builders that don't already exist.

### 10.5 Test Patterns

**Pattern 1: Happy path — test that a service function works correctly**

```python
@pytest.mark.asyncio
async def test_create_language(db_session) -> None:
    language = await language_service.create_language(db_session, name="Kokama", code="kos")
    assert language.name == "Kokama"
    assert language.code == "kos"
```

**Pattern 2: Exception path — test that business exceptions are raised**

```python
@pytest.mark.asyncio
async def test_create_language_raises_conflict_when_code_exists(db_session) -> None:
    await make_language(db_session, code="kos")
    with pytest.raises(ConflictError, match="code already exists"):
        await language_service.create_language(db_session, name="Other", code="kos")
```

**Pattern 3: Not found — test 404 behavior**

```python
@pytest.mark.asyncio
async def test_get_language_or_404_raises_when_missing(db_session) -> None:
    with pytest.raises(NotFoundError, match="Language not found"):
        await language_service.get_language_or_404(db_session, "00000000-0000-0000-0000-000000000000")
```

**Pattern 4: Returns None — test nullable lookups**

```python
@pytest.mark.asyncio
async def test_get_user_by_email_returns_none_when_missing(db_session) -> None:
    user = await auth_service.get_user_by_email(db_session, "nobody@example.com")
    assert user is None
```

**Pattern 5: List operations — test ordering and filtering**

```python
@pytest.mark.asyncio
async def test_list_languages_ordered_by_code(db_session) -> None:
    await make_language(db_session, code="zzz", name="Z")
    await make_language(db_session, code="aaa", name="A")
    languages = await language_service.list_languages(db_session)
    assert len(languages) == 2
    assert languages[0].code == "aaa"
    assert languages[1].code == "zzz"
```

**Pattern 6: Relationship/access checks — test with related data**

```python
@pytest.mark.asyncio
async def test_can_access_project_true_via_organization(db_session) -> None:
    user = await make_user(db_session, email="orguser@example.com")
    org = await make_organization(db_session, slug="org")
    await make_organization_member(db_session, user.id, org.id)
    lang = await make_language(db_session, code="kos")
    project = await make_project(db_session, language_id=lang.id)
    await make_project_organization_access(db_session, project.id, org.id)
    result = await project_service.can_access_project(db_session, user.id, project.id)
    assert result is True
```

**Pattern 7: Idempotency — test that duplicate operations don't fail**

```python
@pytest.mark.asyncio
async def test_grant_user_access_idempotent(db_session) -> None:
    user = await make_user(db_session, email="idem@example.com")
    lang = await make_language(db_session, code="kos")
    project = await make_project(db_session, language_id=lang.id)
    await make_project_user_access(db_session, project.id, user.id)
    access = await project_service.grant_user_access(db_session, project.id, user.id)
    assert access.project_id == project.id
```

**Pattern 8: Pure functions — non-async tests for helpers**

```python
def test_hash_password_and_verify() -> None:
    password = "super-secret-123"
    hashed = auth_service.hash_password(password)
    assert hashed != password
    assert auth_service.verify_password(password, hashed)
```

### 10.6 Test Style Rules

1. **Test service functions, not HTTP endpoints** — Tests call service functions directly from `app.services.*`. The test suite does not use `TestClient` or `AsyncClient`.
2. **Each test is self-contained** — Use `make_*()` factories to set up all required data. Don't depend on state from other tests.
3. **Use unique emails per test** — Since the database is fresh per test, this isn't strictly required, but the convention helps with clarity (e.g. `"grant@example.com"`, `"revoked@example.com"`).
4. **Always use `@pytest.mark.asyncio`** for async tests — The only exception is pure/sync functions (e.g. password hashing).
5. **Return type annotation** — All test functions use `-> None` return annotation.
6. **Import exceptions from `app.core.exceptions`** — Use `NotFoundError`, `ConflictError`, `AuthenticationError`, `AuthorizationError`, `RoleError`.
7. **Import services as modules** — e.g. `from app.services import project_service`, then call `project_service.create_project(...)`.
8. **Import factories from `tests.baker`** — e.g. `from tests.baker import make_user, make_project`.
9. **Use `pytest.raises(ExceptionType, match="...")`** — Always include the `match` parameter to verify the error message.
10. **Use zero-UUID for missing entities** — `"00000000-0000-0000-0000-000000000000"` as a guaranteed-nonexistent ID.

### 10.7 What to Test for New Service Functions

For each new service function, write tests covering:

| Scenario | Example |
|----------|---------|
| **Happy path** | Create/read/update/delete works correctly |
| **Not found** | Raises `NotFoundError` when entity doesn't exist |
| **Conflict** | Raises `ConflictError` on duplicate unique constraints |
| **Authorization** | Raises `RoleError` or `AuthorizationError` when user lacks permission |
| **Edge cases** | Empty lists, partial updates, null/optional fields |
| **Idempotency** | Operations that should be safe to call twice (e.g. grant access) |
| **Filtering/ordering** | List functions return correct order and respect filters |

### 10.8 Required Tests for New Endpoints

For the backend gap endpoints (Section 5), write these test files:

| Test File | Service Module | What to Test |
|-----------|---------------|--------------|
| `test_user_service.py` | `app/services/user/` | `list_users`, `get_user_by_id` (route exists, needs test), `update_user` (toggle active/admin), `list_user_roles` |
| `test_app_service.py` | `app/services/app/` | `list_apps`, `list_user_apps`, `create_app`, `get_app_or_404`, `update_app`, `list_app_roles` |
| Extend `test_organization_service.py` | `app/services/org/` | `update_organization`, `list_members`, `remove_member` |
| Extend `test_project_service.py` | `app/services/project/` | `update_project`, `list_project_user_access`, `list_project_organization_access`, `revoke_user_access`, `revoke_organization_access` |

### 10.9 Running Tests

```bash
# Run all tests (from /workspace/tripod-backend/)
uv run pytest tests

# Run a single test file
uv run pytest tests/test_user_service.py

# Run a single test function
uv run pytest tests/test_user_service.py::test_list_users_returns_all

# Run with verbose output
uv run pytest tests -v

# Run tests matching a keyword
uv run pytest tests -k "user"
```

**Note:** Tests use SQLite in-memory, so no Docker or external database is needed to run the test suite locally.
