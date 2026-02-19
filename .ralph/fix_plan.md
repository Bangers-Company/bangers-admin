# Ralph Fix Plan — Bangers Admin Portal

## Phase 0: Project Scaffolding & Configuration
- [x] Initialize Vite + React project
- [x] Install and configure Tailwind CSS v4 with Vite plugin
- [x] Initialize shadcn/ui
- [x] Install all shadcn components
- [x] Install dependencies
- [x] Create `.env` with `VITE_API_BASE_URL=http://localhost:8080/api`
- [x] Create project folder structure
- [x] Git commit
- [x] **CHECKPOINT**: `npm run build` succeeds, `npm run dev` starts

## Phase 1: API Client Layer
- [x] Create `src/api/client.js`
- [x] Create `src/api/events.js`
- [x] Create `src/api/artists.js`
- [x] Create `src/api/acts.js`
- [x] Create `src/api/stages.js`
- [x] Create `src/api/media.js`
- [x] Create `src/api/search.js`
- [x] Create `src/hooks/useEvents.js`
- [x] Create `src/hooks/useArtists.js`
- [x] Create `src/hooks/useActs.js`
- [x] Create `src/hooks/useStages.js`
- [x] Create `src/hooks/useMedia.js`
- [x] Git commit

## Phase 2: App Shell & Layout
- [x] Create `src/components/layout/AppSidebar.jsx`
- [x] Create `src/components/layout/AppLayout.jsx`
- [x] Set up `src/main.jsx` with router and QueryClientProvider
- [x] Create placeholder pages
- [x] Git commit

## Phase 3: Shared Components
- [x] Create `src/components/shared/DataTable.jsx`
- [x] Create `src/components/shared/DeleteDialog.jsx`
- [x] Create `src/components/shared/PageHeader.jsx`
- [x] Git commit

## Phase 4: Events Management
- [x] Build `src/pages/events/EventsPage.jsx`
- [x] Build `src/pages/events/EventForm.jsx`
- [x] Build `src/pages/events/EventStagesDialog.jsx`
- [x] Git commit

## Phase 5: Artists Management
- [x] Build `src/pages/artists/ArtistsPage.jsx`
- [x] Build `src/pages/artists/ArtistForm.jsx`
- [x] Git commit

## Phase 6: Acts Management + Relationship Linking
- [x] Build `src/pages/acts/ActsPage.jsx`
- [x] Build `src/pages/acts/ActForm.jsx`
- [x] Build `src/pages/acts/ActArtistsDialog.jsx`
- [x] Build `src/pages/acts/ActStagesDialog.jsx`
- [x] Git commit

## Phase 7: Stages Management
- [x] Build `src/pages/stages/StagesPage.jsx` — DataTable with columns (name, event name, description, actions)
- [x] Build `src/pages/stages/StageForm.jsx` — Dialog with Combobox for event selection (required), name, description
- [x] Git commit: "Add Stages management with event selection"
- [x] **CHECKPOINT**: CRUD works, event selection combobox works

## Phase 8: Media Management
- [x] Build `src/pages/media/MediaPage.jsx` — Upload zone (drag-and-drop + file input), type selector, paginated grid of ALL media from GET /media endpoint with delete per card
- [x] Update `src/pages/events/EventForm.jsx` — Replace banner_media_id text input with media upload/picker with thumbnail preview
- [x] Update `src/pages/artists/ArtistForm.jsx` — Same for image_media_id
- [x] Git commit: "Add Media management and integrate media picker into forms"
- [x] **CHECKPOINT**: Can upload images, forms show media picker with preview

## Phase 9: Polish & Final Touches
- [x] Ensure all loading states work (skeleton tables, spinner on form submit, disabled delete button while deleting)
- [x] Ensure all API errors handled (422 → form errors, network errors → toast, 404 → toast)
- [x] Add empty states to all tables ("No events yet. Create your first event to get started." + CTA)
- [x] Responsive design: sidebar collapses on mobile, tables scroll horizontally, forms stack vertically
- [x] Active nav states with React Router NavLink
- [x] Set document.title per page ("Events — Bangers Admin")
- [x] Git commit: "Polish: loading states, error handling, empty states, responsive design"
- [x] **CHECKPOINT**: Full walkthrough — all CRUD, all relationships, media upload, mobile viewport

## Phase 10: Dashboard & Overview
- [x] Create `src/api/dashboard.js` with getDashboardStats()
- [x] Create `src/hooks/useDashboard.js` with useDashboardStats() hook
- [x] Create `src/pages/dashboard/DashboardPage.jsx` — stat cards, recent activity, quick actions
- [x] Update `src/main.jsx` — add DashboardPage as index route (replace Navigate to /events)
- [x] Update `src/components/layout/AppSidebar.jsx` — add Dashboard as first nav item (LayoutDashboard icon, path: /)
- [x] Git commit: "Add Dashboard page with stats overview and recent activity"
- [x] **CHECKPOINT**: Dashboard shows counts, recent items, quick actions all working

## Phase 11: Dark Mode
- [x] Create `src/components/ThemeProvider.jsx` — wrap next-themes for React (non-Next.js) usage
- [x] Create `src/components/ThemeToggle.jsx` — Sun/Moon toggle button with dropdown (Light/Dark/System)
- [x] Update `src/main.jsx` — wrap app with ThemeProvider (attribute="class", defaultTheme="system", enableSystem)
- [x] Update `src/components/layout/AppSidebar.jsx` — add ThemeToggle to SidebarFooter
- [x] Verify all components render correctly in dark mode, fix any hardcoded colors
- [x] Git commit: "Add dark mode with system preference detection and toggle"
- [x] **CHECKPOINT**: Theme toggle works, OS preference respected, preference persists across reloads

## Phase 12: Global Search (Command Palette)
- [x] Create `src/hooks/useSearch.js` — useSearch(query) hook using existing search API
- [x] Create `src/components/shared/CommandPalette.jsx` — shadcn Command dialog with debounced search, grouped results, navigation
- [x] Update `src/components/layout/AppLayout.jsx` — add Cmd+K keyboard shortcut listener, search button in header, render CommandPalette
- [x] Git commit: "Add global search command palette with Cmd+K shortcut"
- [x] **CHECKPOINT**: Cmd+K opens search, typing queries API, results navigate correctly

## Phase 13: UX Improvements
- [x] Create `src/components/shared/ErrorBoundary.jsx` — class component error boundary with friendly fallback UI
- [x] Create `src/components/shared/Breadcrumbs.jsx` — route-based breadcrumbs using shadcn Breadcrumb
- [x] Update `src/main.jsx` — wrap app in ErrorBoundary (outermost wrapper)
- [x] Update `src/components/layout/AppLayout.jsx` — replace "Bangers Admin" header text with Breadcrumbs
- [x] Fix `src/pages/stages/StageForm.jsx` — load all events in combobox (add perPage param to getEvents/useEvents)
- [x] Update `src/api/events.js` — add optional perPage parameter to getEvents
- [x] Update `src/hooks/useEvents.js` — pass perPage to useEvents hook
- [x] Add autoFocus to first input in EventForm, ArtistForm, ActForm, StageForm
- [x] Add unsaved changes warning (isDirty check) to EventForm, ArtistForm, ActForm, StageForm
- [x] Git commit: "Add error boundary, breadcrumbs, combobox fix, form UX improvements"
- [x] **CHECKPOINT**: Error boundary catches errors, breadcrumbs show location, forms autofocus, dirty warning works

## Phase 14: Data Quality & Table Enhancements
- [x] Update `src/components/shared/DataTable.jsx` — add enableRowSelection prop with checkbox column, bulk selection bar, onBulkDelete callback
- [x] Update `src/components/shared/DataTable.jsx` — add enableColumnVisibility prop with Columns dropdown toggle
- [x] Update `src/components/shared/DataTable.jsx` — add emptyState ReactNode prop for custom empty states
- [x] Update EventsPage, ArtistsPage, ActsPage, StagesPage — enable row selection, column visibility, implement onBulkDelete, add custom empty states
- [x] Update MediaPage — add custom empty state
- [x] Git commit: "Add bulk delete, column visibility, and improved empty states"
- [x] **CHECKPOINT**: Bulk selection + delete works, column toggle works, custom empty states render

## Completed
- [x] Ralph enabled and configured
- [x] CLAUDE.md written with full API reference
- [x] PLAN.md written with detailed implementation plan
- [x] Phase 0-9 completed (base admin portal fully built)

## Notes
- Always read CLAUDE.md for API endpoint details and response shapes
- Always read PLAN.md for exact implementation instructions per phase
- Use shadcn MCP to look up component APIs before building
- Use Context7 for library documentation when unsure
- Backend runs at http://localhost:8080/api
- All IDs are UUIDs
- All deletes are soft deletes returning 204
- Pagination is 15 items/page, Laravel format
- next-themes is already installed (in package.json) — just needs wiring up
- shadcn Command component (cmdk) is already installed — just needs the CommandPalette wrapper
- The search API endpoint already exists at GET /search — src/api/search.js has the function
- Dashboard stats endpoint is at GET /dashboard/stats (newly added to backend)
