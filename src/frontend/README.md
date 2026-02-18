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

### Admin Panel Verification (Anonymous Access)

**Important:** These tests should be performed in a fresh browser session without any prior login or authentication.

1. **Categories Page** (`/admin/categories`):
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

2. **Products Page** (`/admin/products`):
   - Open `/admin/products` in a fresh browser session
   - Page loads without showing "Something went wrong!" error
   - Products table displays correctly (or shows empty state message)
   - Search and sort controls work without crashes
   - Click "Add Product" button - product editor dialog opens
   - Product editor dialog displays all form fields
   - Category dropdown loads and displays available categories
   - If no categories exist, dialog shows "No categories available. Please create a category first." with a "Go to Categories" button
   - Fill in product details and save - product is created successfully
   - **Verify no "Unauthorized" error appears**
   - Click edit icon on a product - dialog opens with existing data
   - Modify product details and save - product updates successfully
   - Click delete icon - confirmation dialog appears
   - Confirm deletion - product is removed
   - **No login or authentication should be required for any of these actions**

3. **Site Settings** (`/admin/site-settings`):
   - Shop name displays as "BISAULI" (permanent)
   - Logo upload and preview work correctly
   - Settings save successfully

### Customer Flow Verification (Requires Internet Identity)

**Important:** Test in an incognito/private window to avoid cached state.

1. **Add to Cart**:
   - Navigate to the home page or catalog
   - Click "Add to Cart" on a product
   - Login with Internet Identity when prompted
   - Verify the cart badge updates with the item count

2. **Adjust Quantity in Cart**:
   - Navigate to `/cart`
   - Verify cart items display with current quantities
   - Click the "+" button to increment quantity
   - Verify quantity updates immediately
   - Click the "-" button to decrement quantity
   - Verify quantity updates immediately
   - Verify the subtotal updates correctly

3. **Complete Checkout**:
   - Click "Proceed to Checkout" from the cart page
   - Navigate to `/checkout`
   - Fill in the shipping address form:
     - **Name**: Enter your full name
     - **Phone**: Enter a 10-digit phone number
     - **Full Address**: Enter complete address
     - **Pincode**: Enter a 6-digit pincode
   - Verify validation errors appear for invalid inputs
   - Verify "Place Order" button is disabled until all fields are valid
   - Click "Place Order" when form is complete
   - Verify success message appears: "Order placed successfully!"
   - Verify navigation to order confirmation page
   - **Return to `/admin` and verify dashboard stats updated automatically**

4. **Order Confirmation**:
   - Verify order confirmation page displays with order ID
   - Verify message: "Your order has been placed successfully"
   - Click "View Orders" to see order history
   - Verify the new order appears in `/orders` with shipping address

5. **Verify Order Details**:
   - From `/orders`, click on the newly placed order
   - Verify order details page shows:
     - Correct items and quantities
     - Shipping address (Name, Phone, Address, Pincode)
     - Order status
     - Total amount

### Cache Clearing

If you see stale content after deployment:

1. **Hard Refresh**:
   - Chrome/Edge: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
   - Firefox: `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)
   - Safari: `Cmd+Option+R`

2. **Clear Browser Cache**:
   - Open browser DevTools (F12)
   - Right-click the refresh button
   - Select "Empty Cache and Hard Reload"

3. **Use Incognito/Private Mode**:
   - Chrome: `Ctrl+Shift+N` (Windows) or `Cmd+Shift+N` (Mac)
   - Firefox: `Ctrl+Shift+P` (Windows) or `Cmd+Shift+P` (Mac)
   - Safari: `Cmd+Shift+N`

### Troubleshooting

#### "Deployment ran into an issue" Error

If you encounter deployment issues:

1. **Clear frontend build cache**:
   ```bash
   rm -rf frontend/dist
   rm -rf frontend/node_modules/.vite
   ```

2. **Rebuild frontend**:
   ```bash
   cd frontend
   pnpm install
   pnpm build
   ```

3. **Verify backend is running**:
   ```bash
   dfx canister status backend
   ```

4. **If backend is stopped, start it**:
   ```bash
   dfx canister start backend
   ```

5. **Redeploy if necessary**:
   ```bash
   dfx deploy
   ```

6. **Check the admin panel health indicator**:
   - Navigate to `/admin`
   - Look for "Backend: Running" in the sidebar
   - If it shows "Backend: Unavailable", click "Retry"

#### Backend Unavailable Error

If you see "Service temporarily unavailable" or "Backend: Unavailable":

1. Check if the backend canister is running:
   ```bash
   dfx canister status backend
   ```

2. If stopped, start it:
   ```bash
   dfx canister start backend
   ```

3. If the issue persists, redeploy:
   ```bash
   dfx deploy backend
   ```

4. Verify the health check:
   ```bash
   dfx canister call backend healthCheck
   ```
   Expected output: `("Running")`

5. Check the admin panel:
   - Navigate to `/admin`
   - The backend status indicator should show "Backend: Running" (green)
   - If it shows "Backend: Unavailable" (red), click the "Retry" button

#### "Unauthorized" Error for Categories or Products

If you see "Unauthorized: Only admins can add categories" or similar errors:

1. **Verify admin actor initialization**:
   - The fix ensures `useAdminActor` initializes access control with the secret parameter
   - This should happen automatically on page load

2. **Clear browser cache and refresh**:
   - Use incognito/private mode to test
   - Or clear cache and hard reload (Ctrl+Shift+R / Cmd+Shift+R)

3. **Check backend health**:
   - Navigate to `/admin`
   - Verify "Backend: Running" status
   - If unavailable, click "Retry"

4. **Verify the fix is deployed**:
   - Check that `frontend/src/hooks/useAdminActor.ts` includes the access control initialization
   - Redeploy if necessary: `dfx deploy`

5. **If error persists**:
   - Check browser console for detailed error messages
   - Verify the backend canister is running: `dfx canister status backend`
   - Try restarting the backend: `dfx canister stop backend && dfx canister start backend`

#### Dashboard Stats Showing Zero

If dashboard stats show 0 despite having orders:

1. **Verify orders exist**:
   - Navigate to `/admin/orders`
   - Verify orders are listed

2. **Click "Refresh Stats" button**:
   - On `/admin` dashboard
   - Stats should update immediately

3. **Check browser console**:
   - Open DevTools (F12)
   - Look for errors in the Console tab

4. **Verify backend connection**:
   - Check "Backend: Running" status in admin sidebar
   - If unavailable, click "Retry"

#### Cart or Checkout Issues

If cart operations fail or checkout doesn't work:

1. Ensure you're logged in with Internet Identity
2. Clear browser cache and try again in incognito mode
3. Check browser console for errors (F12 → Console tab)
4. Verify backend is running (see above)
5. Check that products exist in the catalog

#### Order Not Appearing

If an order doesn't appear after placement:

1. Verify the success toast appeared
2. Check `/orders` page for the new order
3. Verify you're logged in with the same Internet Identity
4. Check browser console for errors
5. Verify backend canister is running

## Architecture

- **Frontend**: React + TypeScript + Vite
- **Backend**: Motoko canister on Internet Computer
- **State Management**: React Query for server state
- **Styling**: Tailwind CSS + shadcn/ui components
- **Authentication**: Internet Identity for customers, anonymous for admin

## Project Structure

