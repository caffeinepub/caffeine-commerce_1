# Specification

## Summary
**Goal:** Fix the Admin “Access Denied” page’s “Back to Login” navigation and clearly communicate the default admin login route and username.

**Planned changes:**
- Update the Admin “Access Denied” screen’s “Back to Login” button to reliably navigate to `/admin/login` (including from refreshes and deep-linked `/admin/*` routes).
- Ensure the Admin login UI clearly displays the default username `admin` and does not contradict it elsewhere in the UI.
- Update `frontend/README.md` to explicitly state the admin login URL `/admin/login` and default admin username `admin` (English).

**User-visible outcome:** When blocked by “Access Denied,” users can click “Back to Login” and always reach the admin login form at `/admin/login`, and they can see (in the app and README) that the default admin username is `admin`.
