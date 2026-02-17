# Specification

## Summary
**Goal:** Add admin-manageable site branding (Shop Name + Logo) and ensure admin login works with the specified credentials, then reflect branding in the shopper header.

**Planned changes:**
- Backend: add a persisted Site Settings record storing Shop Name (text) and Logo (text as data URL or plain URL), with methods to read settings publicly and update them as admin-only.
- Admin auth: ensure `/admin/login` succeeds with username `admin` and password `Admin@123`, stores the returned token under `caffeineAdminToken`, and existing token verification continues gating `/admin/*` routes; keep current invalid-credentials error behavior.
- Admin UI: add a new “Site Settings” navigation item in the admin sidebar and a protected `/admin/site-settings` page under the admin layout.
- Site Settings page: provide Shop Name input, Logo file upload (common image formats), logo preview-before-save, validation for empty Shop Name, and an English success confirmation after saving.
- Shopper UI: update the main header to use configured Shop Name and Logo when present, falling back to existing generated ShopEase logo assets when not configured.

**User-visible outcome:** Admins can log in using `admin` / `Admin@123`, open a new “Site Settings” page to update the shop name and logo (with preview), and shoppers see the updated branding in the site header after it’s saved.
