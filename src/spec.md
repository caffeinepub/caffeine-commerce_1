# Specification

## Summary
**Goal:** Disable Internet Identity requirements for the `/admin` area and use a username/password-only admin login with token-based authorization.

**Planned changes:**
- Update `/admin/login` UI to show only an English username + password form and remove all Internet Identity/Principal-related UI and checks.
- Set fixed admin credentials to username `admin` and password `Admin@123`, and show an English “invalid credentials” error for any other combination.
- Change frontend admin route gating for `/admin` and nested routes to rely only on stored/validated admin token state, redirecting to `/admin/login` when missing/invalid (no Principal/Internet Identity dependency).
- Implement backend admin authentication that accepts username/password for anonymous callers, issues an admin token, and provides a token validation method.
- Update admin frontend API/actor usage so admin pages call admin-only backend methods using the stored admin token even without an Internet Identity session.

**User-visible outcome:** Visiting `/admin/login` presents a simple username/password login; logging in with `admin` / `Admin@123` grants access to the admin dashboard and admin features without requiring Internet Identity.
