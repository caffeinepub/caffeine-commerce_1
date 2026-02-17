# Specification

## Summary
**Goal:** Remove backend admin-only authorization blockers for the /admin dashboard and ensure the backend stays running so admin catalog CRUD works without authentication.

**Planned changes:**
- Disable/remove backend “admin-only” permission checks for Admin Dashboard operations so anonymous callers can add, update, and delete categories and products without “Unauthorized” errors.
- Align other backend APIs used by existing /admin pages to not require admin authorization checks during this phase, while keeping existing user-only authorization for shopper features intact.
- Address the “Canister is stopped” (IC0508) failure mode by ensuring the backend canister remains running and responsive, and confirm availability via the existing `healthCheck()` returning “Running”.
- Redeploy and verify `/admin`, `/admin/categories`, and `/admin/products` allow full CRUD access in a fresh session without any login flow.

**User-visible outcome:** Visiting `/admin/categories` and `/admin/products` in a fresh browser session allows creating, editing, and deleting categories/products without authentication and without “Unauthorized” or “Canister is stopped” errors, and admin pages show a retryable English error state if the backend becomes unavailable.
