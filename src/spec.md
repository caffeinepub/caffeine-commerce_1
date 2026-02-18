# Specification

## Summary
**Goal:** Fully unblock admin Orders/Categories/Products (and related admin features) by removing remaining permission/role checks that cause authorization errors during the open-admin phase, while keeping shopper/user flows protected.

**Planned changes:**
- Remove backend admin-only permission checks in admin-used methods so anonymous callers can manage Orders, Categories, Products, Coupons, Site Settings, and Stripe setup without authorization failures.
- Remove frontend permission gating and permission-based UI blocks within admin pages/components/hooks so `/admin/orders`, `/admin/categories`, and `/admin/products` never show “Unauthorized/No Permission” messaging or block actions due to permission state.
- Ensure Admin Orders uses the anonymous admin actor path consistently and surfaces failures as neutral operational errors (e.g., backend unavailable, validation, not found) rather than permission-related messages.
- Preserve existing user/shopper permission checks for cart, wishlist, placing orders, and viewing personal orders.

**User-visible outcome:** Admin pages for Orders, Categories, and Products load and allow full CRUD/status updates without any permission popups or access-denied screens, while normal shopper features remain protected behind existing user permissions.
