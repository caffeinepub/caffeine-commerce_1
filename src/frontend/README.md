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
- 📱 Progressive Web App (PWA) with offline support

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

## Progressive Web App (PWA)

BISAULI is a Progressive Web App that can be installed on mobile and desktop devices for a native app-like experience.

### PWA Features

- **Installable**: Add BISAULI to your home screen on mobile or desktop
- **Offline Support**: Browse previously viewed products and pages while offline
- **Fast Loading**: Cached assets load instantly on repeat visits
- **App-like Experience**: Full-screen mode without browser UI when installed

### Testing PWA Functionality

#### 1. Verify Web App Manifest

1. Open Chrome DevTools (F12)
2. Go to **Application** tab → **Manifest**
3. Verify the manifest loads without errors
4. Check that:
   - Name: "BISAULI"
   - Start URL: "/"
   - Display: "standalone"
   - Icons: 192x192 and 512x512 (including maskable variants)
   - Theme color: "#d97706"

#### 2. Verify Service Worker

1. Open Chrome DevTools (F12)
2. Go to **Application** tab → **Service Workers**
3. Verify service worker is registered at `/sw.js`
4. Check status shows "activated and is running"
5. After first page load, verify service worker "controls" the page
6. Check **Cache Storage** to see cached assets under `bisauli-v1`

#### 3. Test Offline Mode

1. Load the app while online (visit multiple pages)
2. Open Chrome DevTools (F12)
3. Go to **Network** tab
4. Check "Offline" checkbox to simulate offline mode
5. Reload the page (Ctrl+R / Cmd+R)
6. Verify:
   - App shell loads from cache
   - Offline banner appears at top: "You are offline. Some features may be unavailable..."
   - Previously viewed pages load from cache
   - Navigation still works for cached pages
7. Uncheck "Offline" to go back online
8. Verify offline banner disappears

#### 4. Test Installation / Add to Home Screen

**On Android Chrome:**

1. Open the app on your Android device
2. After a few seconds, an install prompt should appear at the bottom
3. Tap "Install" to add BISAULI to your home screen
4. Alternatively, tap the three-dot menu → "Install app" or "Add to Home screen"
5. Once installed, open from home screen
6. Verify app opens in standalone mode (no browser UI)

**On iOS Safari:**

1. Open the app in Safari on your iPhone/iPad
2. An informational prompt should appear with instructions
3. Tap the Share button (square with arrow pointing up)
4. Scroll down and tap "Add to Home Screen"
5. Tap "Add" to confirm
6. Open from home screen
7. Verify app opens in standalone mode

**On Desktop Chrome:**

1. Open the app in Chrome on desktop
2. Look for the install icon in the address bar (⊕ or computer icon)
3. Click the icon and select "Install"
4. App opens in a standalone window
5. Verify it appears in your applications/start menu

**Dismiss Behavior:**

- Tap "Not now" or X to dismiss the prompt
- Prompt will not reappear in the same browser session
- Prompt will reappear in a new session if app is still not installed

#### 5. Test Update Handling

1. Make a change to the service worker version (e.g., change `CACHE_VERSION` to `'v2'`)
2. Rebuild and redeploy the app
3. Reload the page in the browser
4. Open DevTools → Application → Service Workers
5. Verify new service worker is "waiting to activate"
6. Close all tabs and reopen
7. Verify new service worker is now "activated"
8. Check Cache Storage shows new cache version (`bisauli-v2`)
9. Old cache should be deleted

#### 6. Test Fast Loading

1. Visit the app for the first time (clear cache if needed)
2. Note the initial load time
3. Navigate to several pages (home, catalog, product details)
4. Close the browser completely
5. Reopen and visit the app again
6. Verify:
   - App loads noticeably faster (from cache)
   - No white screen or long loading time
   - Core UI appears almost instantly

### PWA Troubleshooting

**Install prompt not showing:**
- Ensure you're using HTTPS (or localhost for development)
- Check that manifest is valid in DevTools
- Verify service worker is registered and active
- Try clearing site data and reloading

**Offline mode not working:**
- Check service worker is active and controlling the page
- Verify assets are cached in DevTools → Application → Cache Storage
- Ensure you visited pages while online first (they need to be cached)

**Service worker not updating:**
- Close all tabs with the app open
- Clear cache and reload
- Check for errors in DevTools console
- Verify new service worker version is different from old

**Icons not showing:**
- Verify icon files exist at `/assets/generated/pwa-icon*.png`
- Check manifest references correct icon paths
- Clear cache and reinstall the app

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

