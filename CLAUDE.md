# Bangers Admin Portal

Admin panel for managing festivals/events, artists, acts, stages, and media. Built against the bangers-backend Laravel API.

## Tech Stack

- **Framework**: React (JavaScript) with Vite
- **UI**: shadcn/ui + Tailwind CSS
- **Routing**: React Router
- **Data fetching**: TanStack React Query
- **Tables**: TanStack Table (via shadcn DataTable pattern)
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React

## Commands

```bash
npm run dev        # Start dev server
npm run build      # Production build
npm run lint       # Run ESLint
npm run preview    # Preview production build
```

## Project Structure

```
src/
  api/              # API client and endpoint functions
    client.js       # Base fetch wrapper (base URL, headers, error handling)
    artists.js      # Artist CRUD + relationship endpoints
    acts.js         # Act CRUD + attach/detach endpoints
    events.js       # Event CRUD endpoints
    stages.js       # Stage CRUD endpoints
    media.js        # Media upload/delete endpoints
    search.js       # Search endpoint
  components/
    ui/             # shadcn/ui primitives (DO NOT edit manually)
    layout/         # Shell, Sidebar, Header
    shared/         # Reusable: DataTable, DeleteDialog, PageHeader
  pages/
    artists/        # ArtistsPage, ArtistForm
    acts/           # ActsPage, ActForm
    events/         # EventsPage, EventForm
    stages/         # StagesPage, StageForm
    media/          # MediaPage
  hooks/            # Custom hooks (useApi wrappers, etc.)
  lib/
    utils.js        # cn() helper and shared utilities
```

## Backend API Reference

**Base URL**: `http://localhost:8080/api`
**Auth**: None currently (prepare for future Authorization header)
**IDs**: All UUIDs
**Pagination**: 15 items/page default, Laravel-style `{ data: [], meta: { current_page, last_page, per_page, total }, links: {} }`
**Eager loading on list endpoints**: Events include stages + banner, Artists include acts + image, Acts include artists + stages, Stages include event. Relations are available on BOTH list and show endpoints.
**Deletes**: Soft deletes, returns 204 No Content
**Errors**: 422 with `{ field: ["message"] }` format

### Models & Fields

**Event**: `id, name, description?, location?, start_date (YYYY-MM-DD), end_date (YYYY-MM-DD), banner_media_id?, version, created_at, updated_at`
- Relations: has many Stages, belongs to Media (banner)

**Artist**: `id, name, bio?, genre?, image_media_id?, version, created_at, updated_at`
- Relations: many-to-many Acts

**Act**: `id, name, description?, version, created_at, updated_at`
- Relations: many-to-many Artists, many-to-many Stages

**Stage**: `id, event_id, name, description?, version, created_at, updated_at`
- Relations: belongs to Event (included as `event` object on list+show), many-to-many Acts

**Media**: `id, type ("profile_picture"|"artist_image"|"event_banner"), url, mime_type?, size_bytes?, width?, height?, metadata?, is_public, created_at`

### Endpoints

| Resource | GET (list) | POST (create) | GET (show) | PUT (update) | DELETE |
|----------|-----------|---------------|------------|-------------|--------|
| Events   | /events   | /events       | /events/{id} | /events/{id} | /events/{id} |
| Artists  | /artists  | /artists      | /artists/{id} | /artists/{id} | /artists/{id} |
| Acts     | /acts     | /acts         | /acts/{id} | /acts/{id} | /acts/{id} |
| Stages   | /stages   | /stages       | /stages/{id} | /stages/{id} | /stages/{id} |
| Media    | /media    | /media (multipart) | /media/{id} | — | /media/{id} |
| Search   | /search?query=&date=&location=&entities= | — | — | — | — |

**Dashboard endpoint**:
- `GET /dashboard/stats` — returns `{ counts: { events, artists, acts, stages, media }, recent: { events: [...], artists: [...], acts: [...] } }`

**Relationship endpoints (on Acts)**:
- `POST /acts/{id}/artists` body: `{ artist_id }` — attach artist
- `DELETE /acts/{id}/artists` body: `{ artist_id }` — detach artist
- `POST /acts/{id}/stages` body: `{ stage_id }` — attach stage
- `DELETE /acts/{id}/stages` body: `{ stage_id }` — detach stage

### Validation Rules

- Event: name required max 255, start_date required, end_date required >= start_date, banner_media_id nullable uuid exists:media
- Artist: name required max 255, bio nullable, genre nullable max 255, image_media_id nullable uuid exists:media
- Act: name required max 255, description nullable
- Stage: event_id required uuid exists:events, name required max 255, description nullable
- Media: file required image max 5MB, type required in:profile_picture,artist_image,event_banner

## API Client Pattern

The API layer uses a single base client with per-resource modules. The base client:
- Sets `Content-Type: application/json` (except media uploads)
- Reads base URL from env var `VITE_API_BASE_URL` (default: `http://localhost:8080/api`)
- Handles error responses and throws structured errors
- Is prepared for a future `Authorization: Bearer <token>` header

## UI & Design Conventions

- **Layout**: Sidebar navigation with page content area. Use shadcn Sidebar component.
- **Dashboard**: Home page at `/` showing stat cards and recent activity. Uses `GET /dashboard/stats`.
- **Tables**: Every resource page uses shadcn DataTable with column sorting, filtering by name, pagination, bulk selection, and column visibility toggle. Follow the shadcn data-table pattern with TanStack Table.
- **Forms**: Dialog/sheet-based forms for create/edit. Use shadcn Dialog + Form + Input/Select/Textarea. Zod schemas mirror backend validation. Autofocus first field. Warn on unsaved changes.
- **Delete**: Confirmation dialog (shadcn AlertDialog) before any delete operation. Supports bulk delete via row selection.
- **Relationships**: On detail/edit views, show linked items with ability to attach/detach. Use shadcn Combobox or MultiSelect pattern for picking related entities.
- **Media**: Upload via drag-and-drop zone, preview thumbnails. Show image dimensions and size.
- **Dark Mode**: Uses `next-themes` with ThemeProvider. Toggle in sidebar footer. Supports light/dark/system.
- **Global Search**: Command palette (Cmd+K / Ctrl+K) using shadcn Command component and `GET /search` endpoint.
- **Loading states**: Use shadcn Skeleton for table loading, spinner for form submissions.
- **Error handling**: Toast notifications (shadcn Sonner) for success/error feedback. Inline form validation errors from Zod + backend 422 responses. React error boundary wraps the app.
- **Empty states**: Resource-specific empty states with icon, message, and CTA button.
- **Breadcrumbs**: Show current navigation path in the header using shadcn Breadcrumb component.

## Code Style

- JavaScript (not TypeScript) per project requirement
- Functional components only, hooks for all state/effects
- Named exports for components, default exports for pages
- Keep components focused — one component per file
- Use `cn()` from `lib/utils.js` for conditional class merging
- React Query for all server state — no manual fetch/useEffect patterns
- Mutations invalidate relevant query keys on success
