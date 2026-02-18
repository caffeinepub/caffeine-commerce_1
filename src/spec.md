# Specification

## Summary
**Goal:** Add basic inventory management so stock decrements on successful order placement, shoppers see clear out-of-stock UI, and admins can edit product stock.

**Planned changes:**
- Backend: update `placeOrder(shippingAddress)` to decrement `Product.stock` by ordered quantities on success, prevent underflow/negative stock, and fail the order (without changing stock or clearing cart) when products are missing or have insufficient stock.
- Frontend (shopper): show products even when stock is 0, but replace/disable Add to Cart with an English “Out of Stock” label on `ProductCard` and `ProductDetailsPage`.
- Frontend (admin): add an editable Stock field (English label) to `ProductEditorDialog`, validate non-negative numeric input, and persist the value to the backend on save (with list reflecting updates via existing query invalidation).
- Frontend: after successful order placement, invalidate the products query cache so updated stock (including reaching 0) is reflected without manual reload.

**User-visible outcome:** Customers cannot add out-of-stock products to the cart and will see an “Out of Stock” label, while admins can edit product stock; placing an order correctly reduces stock and updates the UI automatically.
