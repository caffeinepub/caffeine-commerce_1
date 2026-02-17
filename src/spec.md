# Specification

## Summary
**Goal:** Reset the default admin password to `Admin@123`, update admin login UI copy, and update frontend documentation so admin login works immediately after deployment.

**Planned changes:**
- Update backend default admin credentials so `admin` / `Admin@123` can successfully log in immediately after deployment, while incorrect passwords return an "Invalid username or password" error.
- Update `/admin/login` helper text to state the current default password is `Admin@123` (English), without changing the username text and without affecting existing validations/errors.
- Update `frontend/README.md` to document the admin login URL (`/admin/login`) and default admin credentials (`admin` / `Admin@123`) in English.

**User-visible outcome:** An admin can log in at `/admin/login` using username `admin` and password `Admin@123` right after redeployment, and the UI + README reflect these credentials.
