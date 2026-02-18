# Specification

## Summary
**Goal:** Convert BISAULI Store into an installable PWA with a manifest, service worker, add-to-home-screen prompts, and a usable offline experience.

**Planned changes:**
- Add and wire in a Web App Manifest (name/short_name BISAULI, standalone display, start_url, theme/background colors, and icon set including 192x192 and 512x512).
- Add a service worker for app-shell caching, faster repeat loads, and offline support, and register it at runtime without editing immutable paths.
- Implement an in-app Add-to-Home-Screen (A2HS) prompt: use `beforeinstallprompt` on supported browsers; show iOS Safari install instructions; include dismiss behavior.
- Add an offline fallback page or UI messaging in English for when network requests cannot be completed.
- Generate and reference a PWA icon set based on the existing BISAULI logo (including maskable variants).
- Update frontend documentation with English PWA testing steps (manifest, service worker, offline test, install prompt test).

**User-visible outcome:** Users can install BISAULI Store to their home screen, see a clear install prompt on mobile, and reopen the app with faster loading and a usable offline fallback when the network is unavailable.
