# Specification

## Summary
**Goal:** Restore product and category data display on the home page by fixing backend data fetching and ensuring frontend components properly connect to the backend.

**Planned changes:**
- Verify and fix backend getProducts() and getCategories() methods to return all stored data
- Populate sample products (including mobile phones) and categories (including 'Mobiles') if HashMaps are empty
- Ensure Featured Products section displays up to 8 products on home page
- Ensure Shop by Category section displays all categories on home page

**User-visible outcome:** Users can see featured products and browse categories on the home page, with all data properly loaded from the backend. The 'Mobiles' category and related products are visible.
