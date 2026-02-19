# Bangers Admin Portal — Full Implementation Plan

## Project Overview

Build a complete admin portal for managing festivals/events, artists, acts, stages, and media. The portal connects to an existing Laravel backend API running at `http://localhost:8080/api`. All features use shadcn/ui components for a polished, consistent admin UI.

## Available MCP Tools

When building this project, you have access to these MCP tools — use them:

- **shadcn MCP**: Use `search_items_in_registries`, `view_items_in_registries`, and `get_item_examples_from_registries` to look up shadcn component APIs, props, and usage examples BEFORE implementing any UI component. Use `get_add_command_for_items` if you need to install additional shadcn components.
- **Context7**: Use `resolve-library-id` then `query-docs` to look up current documentation for React Router, TanStack Query, TanStack Table, React Hook Form, or Zod when you need API reference or usage patterns.

## Tech Stack

- React (JavaScript, NOT TypeScript) with Vite
- React Router v7 (library mode with createBrowserRouter)
- TanStack React Query v5 for server state
- TanStack Table for data tables
- React Hook Form + Zod for form validation
- shadcn/ui + Tailwind CSS for all UI components
- Lucide React for icons
- Sonner for toast notifications

---

## Phase 0: Project Scaffolding & Configuration

### Task 0.1: Initialize Vite + React project

IMPORTANT: The project directory already has files (CLAUDE.md, PLAN.md, .ralph/, .git/). Vite will refuse to scaffold into a non-empty directory without `--force`. You MUST use the force flag or it will block:

```bash
npm create vite@latest . -- --template react --force
npm install
```

After scaffolding, verify that CLAUDE.md, PLAN.md, .ralph/, and .ralphrc were NOT overwritten. If any were deleted, restore them from git: `git checkout -- CLAUDE.md PLAN.md .ralph/ .ralphrc`

### Task 0.2: Install Tailwind CSS v4

Follow the current Vite + Tailwind setup. Use Context7 to look up the latest Tailwind CSS v4 installation instructions if unsure.

```bash
npm install tailwindcss @tailwindcss/vite
```

Add the Tailwind plugin to `vite.config.js`:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
```

Add to the top of `src/index.css`:

```css
@import "tailwindcss";
```

### Task 0.3: Initialize shadcn/ui

IMPORTANT: The default `npx shadcn@latest init` is interactive and will prompt for options. Ralph runs non-interactively so you MUST use flags to skip prompts:

```bash
npx shadcn@latest init --defaults --force
```

This uses the default style, zinc base color, and CSS variables. The `--force` flag overwrites any existing files if needed.

### Task 0.4: Install all required shadcn components

```bash
npx shadcn@latest add sidebar table dialog alert-dialog form input button select textarea badge card skeleton sonner command popover separator dropdown-menu sheet tooltip label
```

### Task 0.5: Install additional dependencies

```bash
npm install react-router @tanstack/react-query @tanstack/react-table zod @hookform/resolvers lucide-react sonner
```

### Task 0.6: Create environment config

Create `.env` file:

```
VITE_API_BASE_URL=http://localhost:8080/api
```

Create `.env.example` with the same content for reference.

### Task 0.7: Set up project folder structure

Create the following empty directories:

```
src/
  api/
  components/
    ui/          (already created by shadcn init)
    layout/
    shared/
  pages/
    artists/
    acts/
    events/
    stages/
    media/
  hooks/
  lib/
```

### Task 0.8: Git init and initial commit

```bash
git init
echo "node_modules\ndist\n.env" > .gitignore
git add -A
git commit -m "Initial project setup with Vite, React, Tailwind, shadcn/ui"
```

**Checkpoint**: Run `npm run dev` — the app should start with no errors and show the default Vite React page.

---

## Phase 1: API Client Layer

### Task 1.1: Create base API client

Create `src/api/client.js`:

This is the abstraction layer for all API requests. It must:
- Read base URL from `import.meta.env.VITE_API_BASE_URL` with fallback to `http://localhost:8080/api`
- Export a `apiClient` object with methods: `get(path, params)`, `post(path, body)`, `put(path, body)`, `del(path, body)`
- For GET requests, serialize params as URL query parameters
- For POST/PUT, send JSON body with `Content-Type: application/json`
- For DELETE, optionally send a JSON body (needed for detach endpoints)
- Include a placeholder for future `Authorization: Bearer <token>` header (commented out, reading from localStorage)
- On non-OK responses, parse the JSON error body and throw a structured error with `{ status, message, errors }` where `errors` is the validation errors object from Laravel (422 responses)
- Return parsed JSON for successful responses
- For 204 No Content responses, return null

### Task 1.2: Create resource API modules

Each module exports functions that call the base client. All functions return promises.

Create `src/api/events.js`:
```js
// getEvents(page) → GET /events?page={page}
// getEvent(id) → GET /events/{id}
// createEvent(data) → POST /events
// updateEvent(id, data) → PUT /events/{id}
// deleteEvent(id) → DELETE /events/{id}
```

Create `src/api/artists.js`:
```js
// getArtists(page) → GET /artists?page={page}
// getArtist(id) → GET /artists/{id}
// createArtist(data) → POST /artists
// updateArtist(id, data) → PUT /artists/{id}
// deleteArtist(id) → DELETE /artists/{id}
```

Create `src/api/acts.js`:
```js
// getActs(page) → GET /acts?page={page}
// getAct(id) → GET /acts/{id}
// createAct(data) → POST /acts
// updateAct(id, data) → PUT /acts/{id}
// deleteAct(id) → DELETE /acts/{id}
// attachArtistToAct(actId, artistId) → POST /acts/{actId}/artists  body: { artist_id }
// detachArtistFromAct(actId, artistId) → DELETE /acts/{actId}/artists  body: { artist_id }
// attachStageToAct(actId, stageId) → POST /acts/{actId}/stages  body: { stage_id }
// detachStageFromAct(actId, stageId) → DELETE /acts/{actId}/stages  body: { stage_id }
```

Create `src/api/stages.js`:
```js
// getStages(page) → GET /stages?page={page}
// getStage(id) → GET /stages/{id}
// createStage(data) → POST /stages
// updateStage(id, data) → PUT /stages/{id}
// deleteStage(id) → DELETE /stages/{id}
```

Create `src/api/media.js`:
```js
// getMediaList(page) → GET /media?page={page}
// getMedia(id) → GET /media/{id}
// uploadMedia(file, type, isPublic) → POST /media  (multipart/form-data, NOT JSON)
// deleteMedia(id) → DELETE /media/{id}
```
Note: `uploadMedia` must use `FormData` and NOT set Content-Type header (browser sets it with boundary).

Create `src/api/search.js`:
```js
// search({ query, date, location, entities, per_page, events_page, artists_page, acts_page })
// → GET /search?query=...&date=...&location=...&entities=...
```

### Task 1.3: Create React Query hooks

Create `src/hooks/useEvents.js`:
```js
// useEvents(page) — useQuery with queryKey: ['events', page]
// useEvent(id) — useQuery with queryKey: ['events', id], enabled: !!id
// useCreateEvent() — useMutation, onSuccess: invalidate ['events']
// useUpdateEvent() — useMutation, onSuccess: invalidate ['events'] and ['events', id]
// useDeleteEvent() — useMutation, onSuccess: invalidate ['events']
```

Create `src/hooks/useArtists.js` — same pattern with queryKey: `['artists', ...]`

Create `src/hooks/useActs.js` — same pattern with queryKey: `['acts', ...]`, plus:
```js
// useAttachArtist() — useMutation, onSuccess: invalidate ['acts', actId] and ['artists']
// useDetachArtist() — useMutation, onSuccess: invalidate ['acts', actId] and ['artists']
// useAttachStage() — useMutation, onSuccess: invalidate ['acts', actId] and ['stages']
// useDetachStage() — useMutation, onSuccess: invalidate ['acts', actId] and ['stages']
```

Create `src/hooks/useStages.js` — same pattern with queryKey: `['stages', ...]`

Create `src/hooks/useMedia.js`:
```js
// useMediaList(page) — useQuery with queryKey: ['media', page]
// useUploadMedia() — useMutation, onSuccess: invalidate ['media']
// useDeleteMedia() — useMutation, onSuccess: invalidate ['media']
```

All hooks should use `keepPreviousData` / `placeholderData: keepPreviousData` for paginated queries to prevent UI flicker.

### Task 1.4: Git commit

```bash
git add -A
git commit -m "Add API client layer and React Query hooks"
```

**Checkpoint**: No runtime errors. Hooks are importable. API client can be tested manually with the backend running.

---

## Phase 2: App Shell & Layout

### Task 2.1: Create the app layout with sidebar

Create `src/components/layout/AppSidebar.jsx`:

Use the shadcn `Sidebar` component. Before implementing, use the shadcn MCP to look up the Sidebar component API with `view_items_in_registries` for `@shadcn/sidebar`.

The sidebar must contain:
- App logo/title at the top: "Bangers Admin"
- Navigation menu items with icons (use Lucide icons):
  - Events (Calendar icon)
  - Artists (Music icon)
  - Acts (Mic icon)
  - Stages (LayoutGrid icon)
  - Media (Image icon)
- Each nav item links to its respective route using React Router `NavLink`
- Active item should be visually highlighted (use the sidebar's active state)
- The sidebar should be collapsible on smaller screens

Create `src/components/layout/AppLayout.jsx`:

Use shadcn's `SidebarProvider` + `SidebarInset` pattern:
- Wraps `AppSidebar` + main content area
- Main content area includes a header with `SidebarTrigger` (hamburger menu) and a breadcrumb or page title
- Content renders the React Router `<Outlet />`
- Includes the `<Toaster />` from sonner for toast notifications

### Task 2.2: Set up React Router

Create `src/main.jsx`:

```jsx
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createRoot } from 'react-dom/client'
import AppLayout from './components/layout/AppLayout'
import EventsPage from './pages/events/EventsPage'
import ArtistsPage from './pages/artists/ArtistsPage'
import ActsPage from './pages/acts/ActsPage'
import StagesPage from './pages/stages/StagesPage'
import MediaPage from './pages/media/MediaPage'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 seconds
      retry: 1,
    },
  },
})

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/events" replace /> },
      { path: 'events', element: <EventsPage /> },
      { path: 'artists', element: <ArtistsPage /> },
      { path: 'acts', element: <ActsPage /> },
      { path: 'stages', element: <StagesPage /> },
      { path: 'media', element: <MediaPage /> },
    ],
  },
])

createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={queryClient}>
    <RouterProvider router={router} />
  </QueryClientProvider>
)
```

### Task 2.3: Create placeholder pages

Create stub components for each page that just render a heading:
- `src/pages/events/EventsPage.jsx` → `<h1>Events</h1>`
- `src/pages/artists/ArtistsPage.jsx` → `<h1>Artists</h1>`
- `src/pages/acts/ActsPage.jsx` → `<h1>Acts</h1>`
- `src/pages/stages/StagesPage.jsx` → `<h1>Stages</h1>`
- `src/pages/media/MediaPage.jsx` → `<h1>Media</h1>`

### Task 2.4: Git commit

```bash
git add -A
git commit -m "Add app shell with sidebar navigation and routing"
```

**Checkpoint**: Run `npm run dev`. The app should show the sidebar with all 5 nav items. Clicking each item navigates to its page and shows the heading. The sidebar should be collapsible.

---

## Phase 3: Shared Components

### Task 3.1: Create reusable DataTable component

Create `src/components/shared/DataTable.jsx`:

This is the core reusable table used by ALL resource pages. Before building, use the shadcn MCP to look up the `@shadcn/table` component for the HTML table primitives.

Props:
- `columns` — TanStack Table column definitions array
- `data` — array of row data
- `pageCount` — total pages from API
- `pageIndex` — current page (0-indexed)
- `onPageChange(pageIndex)` — callback when page changes
- `filterColumn` — string, which column to show a text filter for (e.g., "name")
- `filterPlaceholder` — placeholder text for the filter input
- `isLoading` — boolean, show skeleton rows when true

Features:
- Uses `useReactTable` with `manualPagination: true` (server-side pagination)
- Column sorting (client-side within the page is fine)
- Text filter input above the table for the specified filterColumn
- Pagination controls below: Previous / Next buttons, "Page X of Y" display
- When `isLoading` is true, render 5 skeleton rows using shadcn `Skeleton`
- When data is empty and not loading, show an empty state: "No results found." centered in the table
- Use shadcn's `Table`, `TableHeader`, `TableRow`, `TableHead`, `TableBody`, `TableCell` components
- Use shadcn `Button` for pagination controls
- Use shadcn `Input` for the filter

### Task 3.2: Create reusable DeleteDialog component

Create `src/components/shared/DeleteDialog.jsx`:

Props:
- `open` — boolean
- `onOpenChange(open)` — callback
- `onConfirm()` — async callback called when user confirms deletion
- `title` — string (e.g., "Delete Artist")
- `description` — string (e.g., "Are you sure you want to delete this artist? This action cannot be undone.")
- `isDeleting` — boolean, disables the confirm button and shows loading state

Uses shadcn `AlertDialog` with:
- AlertDialogHeader with title and description
- Cancel button (closes dialog)
- Destructive confirm button (red, calls onConfirm)

### Task 3.3: Create PageHeader component

Create `src/components/shared/PageHeader.jsx`:

Props:
- `title` — string
- `description` — string (optional)
- `action` — ReactNode (optional, typically a "Create New" button)

Renders:
- Title as h1
- Description as muted text below
- Action button aligned to the right
- Horizontal separator below

### Task 3.4: Git commit

```bash
git add -A
git commit -m "Add shared DataTable, DeleteDialog, and PageHeader components"
```

**Checkpoint**: Components are importable with no errors.

---

## Phase 4: Events Management (Core Feature 4)

Events is the top-level entity. Build this first since stages belong to events.

### Task 4.1: Create Events table page

Edit `src/pages/events/EventsPage.jsx`:

- Use `PageHeader` with title "Events", description "Manage festivals and events", and a "Create Event" button
- Use `useEvents(page)` hook to fetch paginated events
- Define columns for the DataTable:
  - **Name** — `event.name`, sortable
  - **Location** — `event.location`, show "—" if null
  - **Start Date** — `event.start_date`, formatted nicely (e.g., "Jan 15, 2025")
  - **End Date** — `event.end_date`, formatted nicely
  - **Stages** — count of `event.stages` array length, show as Badge
  - **Actions** — dropdown menu (shadcn `DropdownMenu`) with: Edit, Delete
- Use the `DataTable` component with server-side pagination
- Filter by name
- "Create Event" button opens the EventForm dialog
- Edit action opens EventForm dialog pre-filled with event data
- Delete action opens DeleteDialog, calls `useDeleteEvent` on confirm
- Show success/error toasts via sonner after create/edit/delete

### Task 4.2: Create Event form dialog

Create `src/pages/events/EventForm.jsx`:

Props:
- `open` — boolean
- `onOpenChange(open)` — callback
- `event` — existing event object or null (null = create mode)

Uses shadcn `Dialog` with:
- DialogHeader: "Create Event" or "Edit Event"
- React Hook Form + Zod schema:
  ```
  name: z.string().min(1, "Name is required").max(255)
  description: z.string().nullable().optional()
  location: z.string().max(255).nullable().optional()
  start_date: z.string().min(1, "Start date is required")  // YYYY-MM-DD format
  end_date: z.string().min(1, "End date is required")
  banner_media_id: z.string().uuid().nullable().optional()
  ```
- Custom validation: end_date must be >= start_date (use Zod `.refine()`)
- Form fields:
  - Name — `Input`
  - Description — `Textarea`
  - Location — `Input`
  - Start Date — `Input` with `type="date"`
  - End Date — `Input` with `type="date"`
  - Banner — for now, a text input for media UUID (media upload integration comes in Phase 8)
- Submit calls `useCreateEvent` or `useUpdateEvent` depending on mode
- On success: close dialog, show toast "Event created" / "Event updated"
- On 422 error: map backend validation errors to form field errors
- Cancel button closes the dialog
- Submit button shows loading spinner when submitting

### Task 4.3: Create Event Stages management dialog (Core Feature 8)

Create `src/pages/events/EventStagesDialog.jsx`:

This dialog manages the one-to-many relationship between an Event and its Stages. The event show endpoint (`GET /events/{id}`) returns `stages` in the response.

Props:
- `open`, `onOpenChange`
- `event` — the event object (fetch with `useEvent(id)` to get stages included)

UI:
- Dialog title: "Manage Stages for {event.name}"
- Two sections:
  1. **Current Stages** — list of stages belonging to this event, each with an "Edit" and "Remove" button. Remove calls `useDeleteStage(stageId)` (since stages belong to an event via FK, removing means deleting the stage).
  2. **Add Stage** — an inline form (or sub-dialog) with fields: name (required), description (optional). The `event_id` is automatically set to the current event. On submit, calls `useCreateStage({ event_id: event.id, name, description })`.
- Both lists update reactively via React Query invalidation of `['events', event.id]` and `['stages']`
- Show toast on create/delete success

Add a "Manage Stages" option to the Events table actions dropdown, alongside Edit and Delete.

### Task 4.4: Git commit

```bash
git add -A
git commit -m "Add Events management page with CRUD and stage linking"
```

**Checkpoint**: Navigate to /events. The table should load events from the backend (may be empty). Create, edit, and delete should work. Pagination and filtering should work. "Manage Stages" opens a dialog to view/add/remove stages for that event. Test with the backend running.

---

## Phase 5: Artists Management (Core Feature 2)

### Task 5.1: Create Artists table page

Edit `src/pages/artists/ArtistsPage.jsx`:

Same pattern as EventsPage. Columns:
- **Name** — `artist.name`, sortable
- **Genre** — `artist.genre`, show "—" if null, use Badge component
- **Bio** — `artist.bio`, truncated to 50 chars with ellipsis
- **Acts** — count of `artist.acts` array length
- **Actions** — Edit, Delete dropdown

### Task 5.2: Create Artist form dialog

Create `src/pages/artists/ArtistForm.jsx`:

Zod schema:
```
name: z.string().min(1, "Name is required").max(255)
bio: z.string().nullable().optional()
genre: z.string().max(255).nullable().optional()
image_media_id: z.string().uuid().nullable().optional()
```

Form fields:
- Name — `Input`
- Bio — `Textarea`
- Genre — `Input`
- Image — text input for media UUID (media integration later in Phase 8)

### Task 5.3: Git commit

```bash
git add -A
git commit -m "Add Artists management page with CRUD operations"
```

**Checkpoint**: Navigate to /artists. Full CRUD works. Filter by name works. Pagination works.

---

## Phase 6: Acts Management (Core Feature 3)

### Task 6.1: Create Acts table page

Edit `src/pages/acts/ActsPage.jsx`:

Columns:
- **Name** — `act.name`, sortable
- **Description** — `act.description`, truncated to 50 chars
- **Artists** — count of `act.artists` array length, clickable to see list
- **Stages** — count of `act.stages` array length
- **Actions** — Edit, Manage Artists, Manage Stages, Delete dropdown

### Task 6.2: Create Act form dialog

Create `src/pages/acts/ActForm.jsx`:

Zod schema:
```
name: z.string().min(1, "Name is required").max(255)
description: z.string().nullable().optional()
```

Form fields:
- Name — `Input`
- Description — `Textarea`

### Task 6.3: Create Artist attachment dialog for Acts (Core Feature 6)

Create `src/pages/acts/ActArtistsDialog.jsx`:

This dialog manages the many-to-many relationship between an Act and its Artists.

Props:
- `open`, `onOpenChange`
- `act` — the act object (includes `act.artists` array of currently linked artists)

UI:
- Dialog title: "Manage Artists for {act.name}"
- Two sections:
  1. **Current Artists** — list of currently attached artists, each with a "Remove" button (calls `useDetachArtist`)
  2. **Add Artist** — a Combobox/Command search component that:
     - Fetches all artists using `useArtists()` (or a search query)
     - Filters out already-attached artists
     - On select, calls `useAttachArtist(actId, artistId)`
- Use shadcn `Command` + `Popover` for the searchable artist picker (Combobox pattern)
- Show toast on attach/detach success
- Both lists update reactively via React Query invalidation

### Task 6.4: Create Stage attachment dialog for Acts (Core Feature 7)

Create `src/pages/acts/ActStagesDialog.jsx`:

Same pattern as ActArtistsDialog but for Stages:
- Shows currently attached stages with "Remove" button
- Combobox to search and attach new stages
- Calls `useAttachStage` / `useDetachStage`

### Task 6.5: Git commit

```bash
git add -A
git commit -m "Add Acts management with artist and stage linking"
```

**Checkpoint**: Navigate to /acts. CRUD works. Can attach/detach artists and stages via the management dialogs. Relationship counts update in the table.

---

## Phase 7: Stages Management (Core Feature 5 + Core Feature 8)

### Task 7.1: Create Stages table page

Edit `src/pages/stages/StagesPage.jsx`:

Columns:
- **Name** — `stage.name`, sortable
- **Event** — show the parent event name. NOTE: The stage show endpoint returns the event relation. For the list endpoint, `event_id` is available but the event name may not be. If not included in the list response, show the event_id or fetch event details. Preferably, show the event name if available.
- **Description** — `stage.description`, truncated to 50 chars
- **Acts** — This is accessible from the Acts side (stage_acts). For display, it may require an additional fetch or be included in the stage show endpoint. Show count if available.
- **Actions** — Edit, Delete dropdown

### Task 7.2: Create Stage form dialog

Create `src/pages/stages/StageForm.jsx`:

Zod schema:
```
event_id: z.string().uuid("Must select an event")
name: z.string().min(1, "Name is required").max(255)
description: z.string().nullable().optional()
```

Form fields:
- Event — `Select` or `Combobox` populated with events from `useEvents()`. This is REQUIRED. Use shadcn Command + Popover pattern to search events by name.
- Name — `Input`
- Description — `Textarea`

When creating a stage, the user MUST select which event it belongs to. When editing, the event should be pre-selected (and potentially locked/read-only to prevent orphaning).

### Task 7.3: Git commit

```bash
git add -A
git commit -m "Add Stages management with event selection"
```

**Checkpoint**: Navigate to /stages. CRUD works. Event selection combobox works. Stages are correctly linked to events.

---

## Phase 8: Media Management

### Task 8.1: Create Media page

Edit `src/pages/media/MediaPage.jsx`:

This page handles media uploads and browsing. It's simpler than the CRUD pages.

UI:
- PageHeader with title "Media", description "Upload and manage images"
- Upload zone at the top:
  - Drag-and-drop area OR click to browse
  - Use a hidden `<input type="file" accept="image/*">` triggered by the drop zone
  - Select media type from a dropdown: "Profile Picture", "Artist Image", "Event Banner"
  - Upload button, calls `useUploadMedia()`
  - Show upload progress or spinner during upload
  - On success, show toast and refresh the media list
- Below the upload zone, show a grid of uploaded media:
  - Card layout (shadcn `Card`) with image thumbnail, type badge, size, dimensions
  - Each card has a delete button (trash icon) that opens DeleteDialog
  - Use a simple fetch to list media (note: the backend doesn't have a list media endpoint — if this is the case, track uploaded media client-side or skip the grid for now and only show upload + individual lookup by ID)

The backend now has `GET /media` (paginated list), `POST /media` (upload), `GET /media/{id}` (show single), and `DELETE /media/{id}`. Use the list endpoint to display all media in a paginated grid below the upload zone.

### Task 8.2: Integrate media picker into Event and Artist forms

Go back and update:

**`src/pages/events/EventForm.jsx`**:
- Replace the banner_media_id text input with a "Upload Banner" button
- Clicking it opens a small dialog/popover where the user can upload a new image (type: "event_banner") or paste an existing media UUID
- After upload, the media UUID is set as the form field value
- Show a thumbnail preview if a banner is set

**`src/pages/artists/ArtistForm.jsx`**:
- Same pattern for image_media_id with type "artist_image"
- Show thumbnail preview

### Task 8.3: Git commit

```bash
git add -A
git commit -m "Add Media management and integrate media picker into forms"
```

**Checkpoint**: Can upload images. Event and Artist forms can attach images. Delete media works.

---

## Phase 9: Polish & Final Touches

### Task 9.1: Loading states

Ensure every page shows proper loading states:
- Tables show Skeleton rows while loading (already handled by DataTable component)
- Forms show spinner on submit button while saving
- Delete dialogs disable the confirm button while deleting

### Task 9.2: Error handling

Ensure all API errors are handled:
- 422 validation errors are mapped to form fields
- Network errors show a toast "Failed to connect to server"
- 404 errors show "Resource not found" toast
- Generic errors show the error message in a toast

### Task 9.3: Empty states

Every table should show a friendly empty state when no data exists:
- "No events yet. Create your first event to get started." with a CTA button
- Same pattern for artists, acts, stages

### Task 9.4: Responsive design

- Sidebar collapses to icon-only mode on medium screens
- Sidebar becomes a sheet/drawer on mobile
- Tables are scrollable horizontally on small screens
- Forms stack vertically on mobile
- Dialog widths are responsive

### Task 9.5: Navigation active states

Ensure the sidebar highlights the current page's nav item correctly using React Router's `NavLink` with an active class/state.

### Task 9.6: Page titles

Set `document.title` on each page:
- "Events — Bangers Admin"
- "Artists — Bangers Admin"
- etc.

### Task 9.7: Final Git commit

```bash
git add -A
git commit -m "Polish: loading states, error handling, empty states, responsive design"
```

**Checkpoint**: Full walkthrough — navigate every page, create/edit/delete every resource type, attach/detach relationships, upload media, test on narrow viewport. Everything should work smoothly.

---

## Backend API Quick Reference

Base URL: `http://localhost:8080/api`

### Pagination Response Shape (all list endpoints)
```json
{
  "data": [ ...items ],
  "links": { "first": "...", "last": "...", "prev": null, "next": "..." },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 5,
    "per_page": 15,
    "to": 15,
    "total": 73
  }
}
```

### Resource Response Shapes

**Event:**
```json
{
  "id": "uuid",
  "name": "string",
  "description": "string|null",
  "location": "string|null",
  "start_date": "YYYY-MM-DD",
  "end_date": "YYYY-MM-DD",
  "version": 1,
  "banner": { "id": "uuid", "url": "string", "type": "event_banner", ... } | null,
  "stages": [{ "id": "uuid", "name": "string", ... }],
  "created_at": "ISO 8601",
  "updated_at": "ISO 8601"
}
```

**Artist:**
```json
{
  "id": "uuid",
  "name": "string",
  "bio": "string|null",
  "genre": "string|null",
  "version": 1,
  "image": { "id": "uuid", "url": "string", "type": "artist_image", ... } | null,
  "acts": [{ "id": "uuid", "name": "string", ... }],
  "created_at": "ISO 8601",
  "updated_at": "ISO 8601"
}
```

**Act:**
```json
{
  "id": "uuid",
  "name": "string",
  "description": "string|null",
  "version": 1,
  "artists": [{ "id": "uuid", "name": "string", ... }],
  "stages": [{ "id": "uuid", "name": "string", ... }],
  "created_at": "ISO 8601",
  "updated_at": "ISO 8601"
}
```

**Stage:**
```json
{
  "id": "uuid",
  "event_id": "uuid",
  "name": "string",
  "description": "string|null",
  "version": 1,
  "created_at": "ISO 8601",
  "updated_at": "ISO 8601"
}
```

**Media:**
```json
{
  "id": "uuid",
  "type": "profile_picture|artist_image|event_banner",
  "url": "string",
  "mime_type": "string|null",
  "size_bytes": 12345,
  "width": 800,
  "height": 600,
  "metadata": {},
  "is_public": true,
  "created_at": "ISO 8601"
}
```

### Validation Error Response (422)
```json
{
  "message": "The name field is required.",
  "errors": {
    "name": ["The name field is required."],
    "end_date": ["The end date field must be a date after or equal to start date."]
  }
}
```

### All Endpoints Summary

| Method | Path | Request Body | Notes |
|--------|------|-------------|-------|
| GET | /events | — | Paginated list |
| POST | /events | `{ name, description?, location?, start_date, end_date, banner_media_id? }` | Returns 201 |
| GET | /events/{id} | — | Includes stages, banner |
| PUT | /events/{id} | same as POST | Returns 200 |
| DELETE | /events/{id} | — | Returns 204 |
| GET | /artists | — | Paginated list |
| POST | /artists | `{ name, bio?, genre?, image_media_id? }` | Returns 201 |
| GET | /artists/{id} | — | Includes acts, image |
| PUT | /artists/{id} | same as POST | Returns 200 |
| DELETE | /artists/{id} | — | Returns 204 |
| GET | /acts | — | Paginated list |
| POST | /acts | `{ name, description? }` | Returns 201 |
| GET | /acts/{id} | — | Includes artists, stages |
| PUT | /acts/{id} | same as POST | Returns 200 |
| DELETE | /acts/{id} | — | Returns 204 |
| POST | /acts/{id}/artists | `{ artist_id }` | Attach artist |
| DELETE | /acts/{id}/artists | `{ artist_id }` | Detach artist |
| POST | /acts/{id}/stages | `{ stage_id }` | Attach stage |
| DELETE | /acts/{id}/stages | `{ stage_id }` | Detach stage |
| GET | /stages | — | Paginated list |
| POST | /stages | `{ event_id, name, description? }` | Returns 201 |
| GET | /stages/{id} | — | Includes event |
| PUT | /stages/{id} | same as POST | Returns 200 |
| DELETE | /stages/{id} | — | Returns 204 |
| GET | /media | — | Paginated list |
| POST | /media | FormData: `file`, `type`, `is_public?` | Multipart upload, max 5MB image |
| GET | /media/{id} | — | Single media item |
| DELETE | /media/{id} | — | Returns 204 |
| GET | /search | Query params: `query`, `date`, `location`, `entities`, `per_page` | Multi-entity search |
| GET | /dashboard/stats | — | Returns counts + recent items for all resources |

---

## Phase 10: Dashboard & Overview

### Task 10.1: Create Dashboard API module and hook

Create `src/api/dashboard.js`:
```js
// getDashboardStats() → GET /dashboard/stats
// Returns: { counts: { events, artists, acts, stages, media }, recent: { events: [...], artists: [...], acts: [...] } }
```

Create `src/hooks/useDashboard.js`:
```js
// useDashboardStats() — useQuery with queryKey: ['dashboard', 'stats']
// Set staleTime to 60 seconds (data doesn't need to be super fresh)
```

### Task 10.2: Create Dashboard page

Create `src/pages/dashboard/DashboardPage.jsx`:

UI Layout:
- PageHeader with title "Dashboard", description "Overview of your festival management"
- **Stats Cards Row** — 5 cards in a responsive grid (1 col mobile, 2 col tablet, 5 col desktop):
  - Events count (Calendar icon, link to /events)
  - Artists count (Music icon, link to /artists)
  - Acts count (Mic icon, link to /acts)
  - Stages count (LayoutGrid icon, link to /stages)
  - Media count (Image icon, link to /media)
  - Each card uses shadcn `Card` with CardHeader (icon + title), CardContent (large count number)
  - Cards should be clickable — navigate to the respective page on click
  - While loading, show Skeleton in place of the count number
- **Recent Activity Section** — below the stats cards:
  - 3 side-by-side panels (stack on mobile): "Recent Events", "Recent Artists", "Recent Acts"
  - Each panel is a shadcn `Card` with a list of up to 5 recent items
  - Each item shows: name (as a text), created_at formatted as relative time (e.g., "2 hours ago" or "Jan 15")
  - If the list is empty, show "No items yet"
  - Each panel has a "View All →" link at the bottom that navigates to the resource page
- **Quick Actions Section** — row of buttons:
  - "Create Event", "Add Artist", "Create Act" — each opens the respective creation form
  - Use shadcn `Button` with variant "outline" and appropriate icon

Implementation pattern:
```jsx
import { useDashboardStats } from '@/hooks/useDashboard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useNavigate } from 'react-router'
```

For relative time formatting, use a simple helper function — do NOT add date-fns or any new dependency. Just calculate the difference and return "X minutes ago", "X hours ago", "X days ago", or format as "Jan 15" if older than 7 days. Use `Intl.RelativeTimeFormat` if you want.

### Task 10.3: Update routing and navigation

Update `src/main.jsx`:
- Import DashboardPage
- Change the index route from `<Navigate to="/events" replace />` to `<DashboardPage />`
- Keep all existing routes

Update `src/components/layout/AppSidebar.jsx`:
- Add "Dashboard" as the FIRST nav item with `LayoutDashboard` icon from lucide-react, path: `/`
- Keep all existing nav items below it
- The Dashboard nav item should use exact path matching (`location.pathname === '/'`) instead of `startsWith`

### Task 10.4: Git commit

```bash
git add -A
git commit -m "Add Dashboard page with stats overview and recent activity"
```

**Checkpoint**: Navigate to `/`. Dashboard shows stat cards with counts from the API. Recent items display correctly. Clicking a stat card navigates to its page. "View All" links work.

---

## Phase 11: Dark Mode

### Task 11.1: Set up ThemeProvider

The project already has `next-themes` installed. Create `src/components/ThemeProvider.jsx`:

```jsx
import { ThemeProvider as NextThemesProvider } from 'next-themes'

export function ThemeProvider({ children, ...props }) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
```

Before implementing, use Context7 to look up the `next-themes` API to verify the correct usage pattern for React (non-Next.js) apps. The key props are:
- `attribute="class"` — applies theme via CSS class on `<html>`
- `defaultTheme="system"` — respects OS preference by default
- `enableSystem` — enables system theme detection
- `disableTransitionOnChange` — prevents flash during theme switch

### Task 11.2: Create ThemeToggle component

Create `src/components/ThemeToggle.jsx`:

Uses shadcn `Button` + `DropdownMenu` pattern:
- A button in the sidebar footer with Sun/Moon icon
- Clicking opens a dropdown with 3 options: Light, Dark, System
- Uses `useTheme()` hook from next-themes to get/set theme
- The button icon should reflect the current theme (Sun for light, Moon for dark, Monitor for system)

Use the shadcn MCP to look up `@shadcn/dropdown-menu` for the component API.

Icon pattern:
```jsx
import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from 'next-themes'
```

### Task 11.3: Integrate ThemeProvider and ThemeToggle

Update `src/main.jsx`:
- Wrap the `RouterProvider` with `<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>`
- The ThemeProvider must be OUTSIDE the RouterProvider but INSIDE QueryClientProvider

Update `src/components/layout/AppSidebar.jsx`:
- Import and add the ThemeToggle component to the sidebar footer area
- Use shadcn's `SidebarFooter` component to place it at the bottom of the sidebar

### Task 11.4: Verify dark mode CSS

The `src/index.css` already has CSS variables for both light and dark themes via the `.dark` class selector. Verify that:
- All shadcn components respect the dark theme (they should, since they use CSS variables)
- The sidebar, header, and content area backgrounds change correctly
- Cards, tables, and dialogs all have appropriate dark mode styling

If any component has hardcoded colors (white, black, gray-*) instead of CSS variable colors, fix them to use the theme variables.

### Task 11.5: Git commit

```bash
git add -A
git commit -m "Add dark mode with system preference detection and toggle"
```

**Checkpoint**: Click the theme toggle in the sidebar. Light/Dark/System all work. OS preference is respected on first load. The preference persists across page reloads.

---

## Phase 12: Global Search (Command Palette)

### Task 12.1: Create search hook

Create `src/hooks/useSearch.js`:
```js
// useSearch(query, options) — useQuery with queryKey: ['search', query]
// Only enabled when query.length >= 2 (avoid searching on empty/single char)
// Uses the existing search API: GET /search?query={query}&entities=events,artists,acts
// Returns: { events: { data: [...] }, artists: { data: [...] }, acts: { data: [...] } }
```

The `src/api/search.js` file already exists with the search function — use it.

### Task 12.2: Create CommandPalette component

Create `src/components/shared/CommandPalette.jsx`:

This is a global search dialog that opens with Cmd+K (Mac) / Ctrl+K (Windows/Linux).

Use shadcn `Command` component (which is built on cmdk). Before implementing, use the shadcn MCP to look up `@shadcn/command` for the component API and examples.

Structure:
```jsx
import { CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandSeparator } from '@/components/ui/command'
```

Features:
- Opens as a dialog overlay (CommandDialog)
- Text input at the top for search query
- Debounce the search query by 300ms before calling the API (use a simple useState + useEffect pattern with setTimeout/clearTimeout — no new dependencies)
- Results grouped by entity type:
  - "Events" group — show event name + location
  - "Artists" group — show artist name + genre
  - "Acts" group — show act name
- Each result item has an icon matching its type (Calendar, Music, Mic)
- Clicking a result navigates to the respective resource page (e.g., /events for events)
- Show "No results found" when search returns empty
- Show "Type to search..." when input is empty
- Loading state: show "Searching..." text while the API call is in flight

### Task 12.3: Register keyboard shortcut and integrate

Update `src/components/layout/AppLayout.jsx`:
- Import CommandPalette
- Add state: `const [searchOpen, setSearchOpen] = useState(false)`
- Add a keyboard listener in useEffect for Cmd+K / Ctrl+K that sets `searchOpen` to true
- Render `<CommandPalette open={searchOpen} onOpenChange={setSearchOpen} />`
- Add a search button in the header bar (Search icon from lucide-react + "Search..." text + keyboard shortcut hint "⌘K") that also opens the palette

Update `src/components/layout/AppSidebar.jsx`:
- No changes needed here (search lives in the header, not sidebar)

### Task 12.4: Git commit

```bash
git add -A
git commit -m "Add global search command palette with Cmd+K shortcut"
```

**Checkpoint**: Press Cmd+K (or Ctrl+K). Search dialog opens. Type a search query. Results appear grouped by type. Click a result to navigate. Press Escape to close.

---

## Phase 13: UX Improvements

### Task 13.1: Add Error Boundary

Create `src/components/shared/ErrorBoundary.jsx`:

A React class component (error boundaries must be class components) that:
- Catches JavaScript errors anywhere in the child component tree
- Renders a friendly fallback UI with:
  - An error icon (AlertTriangle from lucide-react)
  - "Something went wrong" heading
  - The error message in muted text
  - A "Try Again" button that resets the error boundary state and reloads the page
- Uses shadcn `Card` for the fallback layout
- Logs the error to console.error

Update `src/main.jsx`:
- Wrap the router/app in the ErrorBoundary component
- Place it as the outermost wrapper (outside QueryClientProvider)

### Task 13.2: Add breadcrumb navigation

Create `src/components/shared/Breadcrumbs.jsx`:

A component that reads the current route from React Router and renders breadcrumb navigation.

Use shadcn `Breadcrumb` component. Before implementing, use the shadcn MCP to look up `@shadcn/breadcrumb` for the component API.

```jsx
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { useLocation } from 'react-router'
```

Logic:
- Split `location.pathname` into segments
- Map each segment to a breadcrumb item with a label (capitalize the segment name, e.g., "events" → "Events")
- The last segment is the current page (not a link)
- Home/Dashboard is always the first breadcrumb (links to `/`)

Update `src/components/layout/AppLayout.jsx`:
- Add the Breadcrumbs component in the header, after the SidebarTrigger and separator
- Replace the static "Bangers Admin" text with the Breadcrumbs component

### Task 13.3: Fix combobox pagination in Stage form

Update `src/pages/stages/StageForm.jsx`:

The event selection combobox currently only loads page 1 of events. Fix it by:
- Loading ALL events for the combobox by fetching with a large page size, OR
- Better approach: add a search parameter to the combobox that filters events client-side from the first page, and show a note if there are more events than shown
- Simplest fix: fetch events with page size of 100 by modifying the API call: `getEvents(1, 100)` — or just fetch multiple pages

The cleanest approach: update the `getEvents` function to accept an optional `perPage` parameter, then call it with a high number for the combobox. Update `src/api/events.js`:
```js
export function getEvents(page = 1, perPage = 15) {
  return apiClient.get('/events', { page, per_page: perPage })
}
```

Then in StageForm, call `useEvents(1, 100)` or similar. Update the `useEvents` hook to accept the perPage param too.

### Task 13.4: Form autofocus

Update ALL form dialogs to autofocus the first input field when the dialog opens:
- `src/pages/events/EventForm.jsx` — autofocus the "name" input
- `src/pages/artists/ArtistForm.jsx` — autofocus the "name" input
- `src/pages/acts/ActForm.jsx` — autofocus the "name" input
- `src/pages/stages/StageForm.jsx` — autofocus the "name" input (not the event combobox)

Use the `autoFocus` prop on the first `Input` component in each form.

### Task 13.5: Unsaved changes warning

Update ALL form dialogs to warn before closing if the form has unsaved changes:

Pattern:
```jsx
const { formState: { isDirty } } = form
// In the Dialog's onOpenChange handler:
const handleOpenChange = (open) => {
  if (!open && isDirty) {
    if (!window.confirm('You have unsaved changes. Are you sure you want to close?')) {
      return
    }
  }
  onOpenChange(open)
}
```

Apply to: EventForm, ArtistForm, ActForm, StageForm.

### Task 13.6: Git commit

```bash
git add -A
git commit -m "Add error boundary, breadcrumbs, combobox fix, form UX improvements"
```

**Checkpoint**: Error boundary catches errors gracefully. Breadcrumbs show current location. Stage form loads all events. Forms autofocus first field. Closing a dirty form shows confirmation.

---

## Phase 14: Data Quality & Table Enhancements

### Task 14.1: Add bulk delete to DataTable

Update `src/components/shared/DataTable.jsx`:

Add an optional bulk selection feature:
- New prop: `enableRowSelection` (boolean, default false)
- When enabled, add a checkbox column as the first column
- Header checkbox selects/deselects all visible rows
- Track selected row IDs via TanStack Table's row selection feature
- New prop: `onBulkDelete(selectedIds)` — callback when the "Delete Selected" button is clicked
- Show a floating action bar at the top when rows are selected: "{N} selected" + "Delete Selected" button (destructive variant)
- The delete button opens a DeleteDialog with message "Are you sure you want to delete {N} items?"

Use shadcn `Checkbox` component for the selection checkboxes.

Update ALL resource pages (EventsPage, ArtistsPage, ActsPage, StagesPage) to:
- Pass `enableRowSelection={true}` to DataTable
- Implement `onBulkDelete` that calls the individual delete mutation for each selected ID
- After all deletes complete, invalidate the query and show a toast

### Task 14.2: Add column visibility toggle

Update `src/components/shared/DataTable.jsx`:

Add column visibility controls:
- New prop: `enableColumnVisibility` (boolean, default false)
- When enabled, show a "Columns" dropdown button next to the filter input
- Uses shadcn `DropdownMenu` with `DropdownMenuCheckboxItem` for each column
- Users can toggle columns on/off
- Use TanStack Table's `columnVisibility` state

Use the shadcn MCP to look up `@shadcn/dropdown-menu` for the checkbox item pattern.

Enable column visibility on all resource pages.

### Task 14.3: Improve table empty states

Update each resource page's empty state to be more engaging:

Pattern for each page — when the table is empty AND not loading:
- Show a centered card with:
  - A large muted icon matching the resource type (Calendar for events, Music for artists, etc.)
  - Heading: "No {resources} yet"
  - Description: "Create your first {resource} to get started."
  - A primary CTA button: "Create {Resource}" that opens the create form
- Use shadcn `Card` with centered content

Update DataTable to accept a custom `emptyState` ReactNode prop (instead of the default "No results found" text).

Apply to: EventsPage, ArtistsPage, ActsPage, StagesPage, MediaPage.

### Task 14.4: Git commit

```bash
git add -A
git commit -m "Add bulk delete, column visibility, and improved empty states"
```

**Checkpoint**: Tables show checkboxes. Can select multiple rows and delete them. Column visibility dropdown works. Empty states show the resource-specific design with CTA.

---

## Expanded Acceptance Criteria

In addition to the original checklist:

- [ ] Dashboard shows accurate counts for all resources
- [ ] Dashboard shows recent items with relative timestamps
- [ ] Dark mode toggle works (light/dark/system)
- [ ] Dark mode preference persists across page reloads
- [ ] Global search opens with Cmd+K / Ctrl+K
- [ ] Search results grouped by entity type with navigation
- [ ] Error boundary catches and displays errors gracefully
- [ ] Breadcrumb navigation shows current location
- [ ] Stage form event combobox loads all events (not just page 1)
- [ ] Forms autofocus first field when opened
- [ ] Unsaved changes warning on form close
- [ ] Bulk row selection and delete works on all tables
- [ ] Column visibility toggle works on all tables
- [ ] Custom empty states on all resource pages
