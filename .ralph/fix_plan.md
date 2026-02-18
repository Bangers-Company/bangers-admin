# Ralph Fix Plan — Bangers Admin Portal

## Phase 0: Project Scaffolding & Configuration
- [ ] Initialize Vite + React project (`npm create vite@latest . -- --template react --force`) — MUST use --force since directory has existing files. After scaffolding, verify CLAUDE.md/PLAN.md/.ralph/ still exist, restore from git if overwritten.
- [ ] Install and configure Tailwind CSS v4 with Vite plugin
- [ ] Initialize shadcn/ui (`npx shadcn@latest init --defaults --force`) — MUST use --defaults --force for non-interactive execution
- [ ] Install all shadcn components: sidebar, table, dialog, alert-dialog, form, input, button, select, textarea, badge, card, skeleton, sonner, command, popover, separator, dropdown-menu, sheet, tooltip, label
- [ ] Install dependencies: react-router, @tanstack/react-query, @tanstack/react-table, zod, @hookform/resolvers, lucide-react, sonner
- [ ] Create `.env` with `VITE_API_BASE_URL=http://localhost:8080/api`
- [ ] Create project folder structure (src/api, components/layout, components/shared, pages/*, hooks, lib)
- [ ] Git init and initial commit
- [ ] **CHECKPOINT**: `npm run dev` starts with no errors

## Phase 1: API Client Layer
- [ ] Create `src/api/client.js` — base fetch wrapper with JSON handling, error parsing, auth header placeholder
- [ ] Create `src/api/events.js` — getEvents, getEvent, createEvent, updateEvent, deleteEvent
- [ ] Create `src/api/artists.js` — getArtists, getArtist, createArtist, updateArtist, deleteArtist
- [ ] Create `src/api/acts.js` — getActs, getAct, createAct, updateAct, deleteAct, attachArtist, detachArtist, attachStage, detachStage
- [ ] Create `src/api/stages.js` — getStages, getStage, createStage, updateStage, deleteStage
- [ ] Create `src/api/media.js` — getMediaList (paginated), getMedia, uploadMedia (FormData), deleteMedia
- [ ] Create `src/api/search.js` — search with query params
- [ ] Create `src/hooks/useEvents.js` — useEvents, useEvent, useCreateEvent, useUpdateEvent, useDeleteEvent
- [ ] Create `src/hooks/useArtists.js` — same pattern
- [ ] Create `src/hooks/useActs.js` — same pattern + useAttachArtist, useDetachArtist, useAttachStage, useDetachStage
- [ ] Create `src/hooks/useStages.js` — same pattern
- [ ] Create `src/hooks/useMedia.js` — useMediaList, useUploadMedia, useDeleteMedia
- [ ] Git commit: "Add API client layer and React Query hooks"

## Phase 2: App Shell & Layout
- [ ] Create `src/components/layout/AppSidebar.jsx` — shadcn Sidebar with nav items (Events, Artists, Acts, Stages, Media) using Lucide icons and React Router NavLink
- [ ] Create `src/components/layout/AppLayout.jsx` — SidebarProvider + SidebarInset + Outlet + Toaster
- [ ] Set up `src/main.jsx` — createBrowserRouter with QueryClientProvider, all routes under AppLayout
- [ ] Create placeholder pages for all 5 routes (EventsPage, ArtistsPage, ActsPage, StagesPage, MediaPage)
- [ ] Git commit: "Add app shell with sidebar navigation and routing"
- [ ] **CHECKPOINT**: App shows sidebar, navigation works between all 5 pages

## Phase 3: Shared Components
- [ ] Create `src/components/shared/DataTable.jsx` — reusable table with TanStack Table, server-side pagination, column sorting, text filter, loading skeletons, empty state
- [ ] Create `src/components/shared/DeleteDialog.jsx` — AlertDialog with confirm/cancel, loading state
- [ ] Create `src/components/shared/PageHeader.jsx` — title, description, action button
- [ ] Git commit: "Add shared DataTable, DeleteDialog, and PageHeader components"

## Phase 4: Events Management
- [ ] Build `src/pages/events/EventsPage.jsx` — DataTable with columns (name, location, start_date, end_date, stages count, actions dropdown), pagination, filter by name, create/edit/delete flows
- [ ] Build `src/pages/events/EventForm.jsx` — Dialog with React Hook Form + Zod, fields: name, description, location, start_date, end_date, banner_media_id. Handle create/edit modes, 422 error mapping, toast notifications
- [ ] Build `src/pages/events/EventStagesDialog.jsx` — Dialog showing stages for an event with remove button + inline form to add new stages (auto-sets event_id). Add "Manage Stages" action to Events table dropdown.
- [ ] Git commit: "Add Events management page with CRUD and stage linking"
- [ ] **CHECKPOINT**: Navigate to /events, create/edit/delete events, manage stages per event, pagination and filtering work

## Phase 5: Artists Management
- [ ] Build `src/pages/artists/ArtistsPage.jsx` — DataTable with columns (name, genre badge, bio truncated, acts count, actions)
- [ ] Build `src/pages/artists/ArtistForm.jsx` — Dialog with fields: name, bio, genre, image_media_id
- [ ] Git commit: "Add Artists management page with CRUD operations"
- [ ] **CHECKPOINT**: Full CRUD works on /artists

## Phase 6: Acts Management + Relationship Linking
- [ ] Build `src/pages/acts/ActsPage.jsx` — DataTable with columns (name, description, artists count, stages count, actions with Manage Artists/Stages options)
- [ ] Build `src/pages/acts/ActForm.jsx` — Dialog with fields: name, description
- [ ] Build `src/pages/acts/ActArtistsDialog.jsx` — Dialog showing current artists with remove button + Combobox to search and attach new artists
- [ ] Build `src/pages/acts/ActStagesDialog.jsx` — Dialog showing current stages with remove button + Combobox to search and attach new stages
- [ ] Git commit: "Add Acts management with artist and stage linking"
- [ ] **CHECKPOINT**: CRUD works, can attach/detach artists and stages

## Phase 7: Stages Management
- [ ] Build `src/pages/stages/StagesPage.jsx` — DataTable with columns (name, event name, description, actions)
- [ ] Build `src/pages/stages/StageForm.jsx` — Dialog with Combobox for event selection (required), name, description
- [ ] Git commit: "Add Stages management with event selection"
- [ ] **CHECKPOINT**: CRUD works, event selection combobox works

## Phase 8: Media Management
- [ ] Build `src/pages/media/MediaPage.jsx` — Upload zone (drag-and-drop + file input), type selector, paginated grid of ALL media from GET /media endpoint with delete per card
- [ ] Update `src/pages/events/EventForm.jsx` — Replace banner_media_id text input with media upload/picker with thumbnail preview
- [ ] Update `src/pages/artists/ArtistForm.jsx` — Same for image_media_id
- [ ] Git commit: "Add Media management and integrate media picker into forms"
- [ ] **CHECKPOINT**: Can upload images, forms show media picker with preview

## Phase 9: Polish & Final Touches
- [ ] Ensure all loading states work (skeleton tables, spinner on form submit, disabled delete button while deleting)
- [ ] Ensure all API errors handled (422 → form errors, network errors → toast, 404 → toast)
- [ ] Add empty states to all tables ("No events yet. Create your first event to get started." + CTA)
- [ ] Responsive design: sidebar collapses on mobile, tables scroll horizontally, forms stack vertically
- [ ] Active nav states with React Router NavLink
- [ ] Set document.title per page ("Events — Bangers Admin")
- [ ] Git commit: "Polish: loading states, error handling, empty states, responsive design"
- [ ] **CHECKPOINT**: Full walkthrough — all CRUD, all relationships, media upload, mobile viewport

## Completed
- [x] Ralph enabled and configured
- [x] CLAUDE.md written with full API reference
- [x] PLAN.md written with detailed implementation plan

## Notes
- Always read CLAUDE.md for API endpoint details and response shapes
- Always read PLAN.md for exact implementation instructions per phase
- Use shadcn MCP to look up component APIs before building
- Use Context7 for library documentation when unsure
- Backend runs at http://localhost:8080/api
- All IDs are UUIDs
- All deletes are soft deletes returning 204
- Pagination is 15 items/page, Laravel format
