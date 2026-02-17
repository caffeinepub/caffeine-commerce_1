# Specification

## Summary
**Goal:** Remove all admin authentication and enforce persistent “BISAULI” shop branding across deployments.

**Planned changes:**
- Remove all frontend admin route protection so `/admin` and all nested admin routes are accessible without any token, session parameter, or redirect to `/admin/login`.
- Remove the `/admin/login` route and all UI entry points/text related to admin username/password login; manual navigation to `/admin/login` should not present a working login flow.
- Disable backend admin authorization checks for admin-only operations so admin UI mutations work without authentication during this phase.
- Permanently set/return site settings so `shopName` is exactly `"BISAULI"` and does not revert after redeploy/upgrade; ensure no “Canfinity Store” text remains in the app.
- Redeploy and provide working URLs for the main site (`/`) and admin dashboard (`/admin`) that loads without login.

**User-visible outcome:** Users can open `/admin` (and all admin sections) directly without logging in, and the storefront consistently displays “BISAULI” (including after redeploys/upgrades).
