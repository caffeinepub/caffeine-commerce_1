# Specification

## Summary
**Goal:** Let admins upload an image per Category and use it to render modern, professional category cards on the shopper Home page.

**Planned changes:**
- Extend the backend `Category` model to include an `imageUrl : Text` field (Data URL or URL string), persist it in category storage, and return it from `getCategories()`.
- Update backend category create/update methods to accept and persist `imageUrl` while keeping existing admin flows working with updated types.
- Add an image file upload control (image-only) with inline preview to the Admin Category create/edit dialog; store the selected image as a Data URL in form state, allow removing it before save, and show clear English validation for non-image files.
- Update the Home page categories grid to render category cards using `imageUrl` when present, with a modern card design and a clean fallback when missing, while keeping navigation and responsiveness unchanged.
- Add a thumbnail indicator/column in the Admin Categories list to show each category’s image (or an English “No image” fallback), handling image load failures gracefully.

**User-visible outcome:** Admins can upload and manage category images, see thumbnails in the admin category list, and shoppers see modern category cards on the Home page that display the uploaded category images (with a clean fallback when none is set).
