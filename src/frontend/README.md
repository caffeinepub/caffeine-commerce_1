# BISAULI Store Frontend

A modern e-commerce web application built with React, TypeScript, and the Internet Computer.

## Features

- 🛍️ Product catalog with filtering and sorting
- 🛒 Shopping cart and wishlist
- 💳 Secure checkout with Stripe and COD
- 📦 Order tracking with live status updates
- 👤 User profiles with order history
- 🎨 Dark mode support
- 🌐 Multi-language support (English & Hindi)
- 🔐 Internet Identity authentication for customers
- 👨‍💼 Admin panel (no authentication required)
- 🏪 Vendor / Shopkeeper Panel for product management

## Application Routes

### Customer Routes
- `/` - Home page
- `/catalog` - Product catalog
- `/product/:id` - Product details
- `/cart` - Shopping cart
- `/wishlist` - Wishlist
- `/checkout` - Checkout
- `/orders` - Order history
- `/profile` - User profile

### Vendor / Shopkeeper Panel
- `/vendor` - Vendor dashboard for managing your own products

### Admin Panel
- `/admin` - Admin dashboard
- `/admin/products` - Product management
- `/admin/categories` - Category management
- `/admin/orders` - Order management
- `/admin/site-settings` - Site settings (logo, shop name)
- `/admin/stripe-setup` - Stripe payment configuration

## Local Development

### Prerequisites

- Node.js 18+
- dfx (Internet Computer SDK)
- pnpm

### Setup

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Start the local Internet Computer replica:
   ```bash
   dfx start --clean --background
   ```

3. Deploy the backend canister:
   ```bash
   dfx deploy backend
   ```

4. Generate TypeScript bindings:
   ```bash
   dfx generate backend
   ```

5. Start the development server:
   ```bash
   pnpm start
   ```

6. Open your browser to `http://localhost:3000`

## Admin Access

The admin panel is accessible at `/admin` without any authentication required. This allows you to:

- Manage products (add, edit, delete)
- Manage categories (add, edit, delete)
- View and manage orders
- Configure site settings (shop name, logo)
- Set up Stripe payment integration

**Important:** The admin panel includes a backend health indicator that shows whether the canister is running. If you see "Backend: Unavailable", ensure the backend canister is deployed and running.

**Note:** In production, you should implement proper admin authentication for security.

## Vendor / Shopkeeper Access

Vendors (dukandaars) can access their own product management panel at `/vendor`. This requires Internet Identity authentication and allows vendors to:

- View their own products
- Add new products
- Edit existing products
- Delete products
- Manage product stock and pricing

Vendors can only manage products they have created. A "Vendor Login" link is available in the footer for easy access.

## Customer Authentication

Customers use Internet Identity for secure authentication. This provides:

- Decentralized identity management
- No passwords to remember
- Secure access to personal data (cart, wishlist, orders)

## Stripe Configuration

To enable Stripe payments:

1. Navigate to `/admin` in your browser
2. Go to "Site Settings" or the Stripe configuration section
3. Enter your Stripe secret key
4. Specify allowed countries (e.g., ["US", "CA", "GB"])
5. Save the configuration

Once configured, customers can choose Stripe as a payment method during checkout.

## Deployment Verification

After deploying a new version, verify the following in a **fresh browser session** (incognito/private mode recommended):

### Quick Backend Health Check

1. Navigate to `/admin` in your browser
2. Check the backend status indicator in the sidebar:
   - **"Backend: Running"** (green) = Backend is healthy and ready
   - **"Backend: Unavailable"** (red) = Backend is stopped or unreachable
3. If unavailable, click the "Retry" button or redeploy the backend canister

### Admin Dashboard Verification

1. **Dashboard Stats** (`/admin`):
   - Open `/admin` in a fresh browser session
   - Verify "Total Orders" displays the correct count from the backend
   - Verify "Total Revenue" displays the sum of all order amounts
   - Verify "Total Products" displays the correct product count
   - Click "Refresh Stats" button - stats should update without page reload
   - Place a test order as a customer - return to dashboard and verify stats auto-update
   - Update an order status in `/admin/orders` - verify dashboard stats auto-update

### Admin Panel Verification (Open Access - No Authentication Required)

**Important:** These tests should be performed in a fresh browser session without any prior login or authentication.

1. **Site Settings** (`/admin/site-settings`):
   - Open `/admin/site-settings` in a fresh browser session
   - Page loads without any authentication prompts
   - Upload a logo image (PNG, JPG, or SVG, max 2MB)
   - Click "Save Changes" - logo is saved successfully
   - **Verify no "Unauthorized" error appears**
   - Refresh the page - logo preview still shows the saved logo
   - Navigate to the home page (`/`) - header displays the saved logo
   - Perform a full page reload (Ctrl+Shift+R / Cmd+Shift+R) - logo persists in header
   - **No login or authentication should be required for any of these actions**

2. **Orders Management** (`/admin/orders`):
   - Open `/admin/orders` in a fresh browser session
   - Page loads without any authentication prompts
   - Orders table displays correctly (or shows empty state message)
   - Click on a status dropdown for any order
   - Select a new status (e.g., "Processing", "Shipped", "Delivered")
   - **Verify no "Unauthorized" error appears**
   - Status updates successfully and persists after page refresh
   - **No login or authentication should be required for any of these actions**

3. **Categories Page** (`/admin/categories`):
   - Open `/admin/categories` in a fresh browser session
   - Page loads without showing "Something went wrong!" error
   - Categories table displays correctly (or shows empty state message)
   - Click "Add Category" button - dialog opens
   - Enter a category name (e.g., "Electronics")
   - Click "Save" - category is created successfully
   - **Verify no "Unauthorized" error appears**
   - Click edit icon on the category - dialog opens with existing data
   - Modify the name and save - category updates successfully
   - Click delete icon - confirmation dialog appears
   - Confirm deletion - category is removed
   - **No login or authentication should be required for any of these actions**

4. **Products Page** (`/admin/products`):
   - Open `/admin/products` in a fresh browser session
   - Page loads without showing "Something went wrong!" error
   - Products table displays correctly (or shows empty state message)
   - Search and sort controls work without crashes
   - Click "Add Product" button - product editor dialog opens
   - Product editor dialog displays all form fields
   - Category dropdown loads and displays available categories
   - If no categories exist, dialog shows "No categories available" message
   - Fill in product details (name, description, price, stock, category)
   - Upload a product image (optional)
   - Click "Save" - product is created successfully
   - **Verify no "Unauthorized" error appears**
   - Click edit icon on a product - dialog opens with existing data
   - Modify product details and save - product updates successfully
   - Click delete icon - confirmation dialog appears
   - Confirm deletion - product is removed
   - **No login or authentication should be required for any of these actions**

### Vendor Panel Verification

1. **Vendor Login** (`/vendor`):
   - Navigate to `/vendor` or click "Vendor Login" in the footer
   - Page prompts for Internet Identity login
   - After login, vendor dashboard displays
   - Vendor can see only their own products
   - Vendor can add, edit, and delete their own products
   - Vendor cannot see or modify products created by other vendors

### Error Handling Verification

1. **Backend Unavailability**:
   - Stop the backend canister: `dfx canister stop backend`
   - Navigate to `/admin/products` or `/admin/categories`
   - Verify error message displays: "Service temporarily unavailable. The backend canister is stopped. Please start it and try again."
   - Verify "Retry" button is visible and functional
   - Start the backend: `dfx canister start backend`
   - Click "Retry" - page should load successfully

2. **Network Errors**:
   - Disconnect from network (or use browser dev tools to simulate offline)
   - Try to save a product or category
   - Verify error message displays: "Service temporarily unavailable. Network connection issue. Please check your connection and try again."
   - Reconnect to network
   - Retry the operation - should succeed

3. **Validation Errors**:
   - Try to create a product with negative stock quantity
   - Verify inline error message: "Stock quantity must be 0 or greater"
   - Try to create a product with empty name
   - Verify appropriate validation error appears
   - **No "Unauthorized" or permission-related errors should appear**

### Clean Build Verification

After making changes to remove admin authentication:

1. **Clear all caches**:
   ```bash
   # Clear browser cache (or use incognito mode)
   # Clear React Query cache by logging out and back in
   # Or use browser dev tools: Application > Clear storage
   ```

2. **Rebuild frontend**:
   ```bash
   pnpm build
   ```

3. **Redeploy backend** (if needed):
   ```bash
   dfx deploy backend --mode reinstall
   ```

4. **Verify in fresh session**:
   - Open a new incognito/private window
   - Navigate to `/admin/site-settings`
   - Upload and save a logo - should succeed without errors
   - Navigate to `/admin/orders`
   - Update an order status - should succeed without errors
   - **No "Unauthorized: Only admins can perform this action" errors should appear**

### Troubleshooting

If you encounter "Unauthorized" errors after deployment:

1. **Clear all caches**:
   - Browser cache (Ctrl+Shift+Delete / Cmd+Shift+Delete)
   - React Query cache (logout and login, or clear site data)
   - Service worker cache (if applicable)

2. **Verify backend deployment**:
   ```bash
   dfx canister status backend
   # Should show "Status: Running"
   ```

3. **Check backend health**:
   - Navigate to `/admin`
   - Check sidebar status indicator
   - Should show "Backend: Running" in green

4. **Verify backend methods are accessible**:
   ```bash
   dfx canister call backend getSiteSettings
   # Should return site settings without errors
   
   dfx canister call backend getAllOrders
   # Should return orders array without errors
   ```

5. **Check browser console**:
   - Open browser dev tools (F12)
   - Check Console tab for errors
   - Check Network tab for failed requests
   - Look for 403/401 errors or "Unauthorized" messages

6. **Fresh session test**:
   - Close all browser windows
   - Open new incognito/private window
   - Navigate directly to `/admin/site-settings`
   - Try to save a logo
   - Should work without any authentication prompts

If issues persist, try a full clean rebuild:
