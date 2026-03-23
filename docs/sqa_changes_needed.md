# 🛡️ SQA Changes Needed — Admin

The following changes are required in the `bangers-admin` project to align with security improvements in the backend.

## Phase 1 — Critical Security & Stability

### 1.1 Strengthen Password Validation
The backend now requires stricter password validation for registration. 
**Changes needed:**
- Update user creation/registration forms to require:
    - Minimum 8 characters
    - At least one uppercase and one lowercase letter
    - At least one number
- Update UI error messaging to reflect these requirements.

### 1.2 Rate Limiting Handling
The backend now implements rate limiting (5 attempts per minute) on login and registration endpoints.
**Changes needed:**
- Ensure the admin portal gracefully handles `429 Too Many Requests` responses.
- Display a user-friendly message when the rate limit is exceeded.

### 1.3 Pagination Caps
The backend now enforces a maximum of 100 items per page for all paginated endpoints.
**Changes needed:**
- Ensure any requests using `per_page` do not exceed 100.
- Handle pagination or "Load More" logic for lists that might exceed 100 items.

## Phase 2 — Architecture & Maintainability

### 2.1 User PII Protection
The backend `UserResource` now hides `email`, `dob`, `first_name`, and `last_name` fields unless the authenticated user is the owner or an administrator.
**Changes needed:**
- Ensure the admin panel uses an account with the `admin` role to maintain visibility of these fields in user management lists.
- Check if any local state logic for non-admin views incorrectly expects these fields to always be present.

### 2.2 Group Management Policies
Authorization is now strictly enforced for group operations.
**Changes needed:**
- **Group Deletion**: Ensure the "Delete Group" action is only visible/accessible to the group owner.
- **Member Management**: Ensure "Remove Member" is restricted to the owner.

### 2.3 Form Request Validation & Resource Changes
Unified validation is now enforced through Form Requests, and resources have been cleaned up.
**Changes needed:**
- **Reusability**: `Stage` resource no longer contains `event_id` (stages are now reusable across events via the `event_stages` pivot). Update any stage forms to stop sending/expecting `event_id` on the base stage object.
- **PII Access**: Verified that an account with `admin` role is required to bypass PII protection in `UserResource`. Ensure the admin portal uses tokens from such accounts when managing users.
- **Validation**: Ensure all forms (Event, Act, Timetable) handle validation errors from the backend consistently.
- Error responses will now follow the standard Laravel validation format (`422 Unprocessable Entity` with an `errors` object).

## Phase 3 — 🟢 Technical Refinements & Testing alignment

### 3.1 Stage Management
- **Linkage on Creation**: Creating a `Stage` now requires an `event_id` to facilitate immediate linking in the `event_stages` pivot table.
- **Reusable Acts**: When attaching an `Act` to a `Stage`, the admin must now provide the `event_id` and optionally the `date`. This ensures acts are correctly scoped within larger festivals.

### 3.2 Registration & User Management
- **DOB Requirement**: Registration now requires a `dob` field.
- **REST Consistency**: Registration success status is now `201 Created`.

## Phase 4 — 🔵 Extensibility & Performance Optimization

### 4.1 API Versioning (`/v1`)
All API endpoints have been refactored to use the `/v1/` prefix.
**Changes needed:**
- Update the API base URL in the admin portal configuration to include `/v1/` (e.g., `https://api.bangers.com/api/v1`).
- Ensure all named route references or manual fetch calls are updated.

### 4.2 Dashboard Caching & Events
The Admin dashboard is now cached, with automatic invalidation on relevant events.
**Changes needed:**
- Dashboard data (stats, recent activity) is cached. If manual refresh is needed, ensure the refresh action in the UI is connected to an endpoint or header that bypasses the cache.
- Backend listeners now handle automatic invalidation when events, acts, or groups are modified.

### 4.3 CORS Middleware Refinement
CORS settings have been tightened to only allow trusted origins.
**Changes needed:**
- Ensure the admin portal's production domain is whitelisted in the backend's `config/cors.php`.
