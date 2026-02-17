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

### Admin Panel Verification (Anonymous Access)

**Important:** These tests should be performed in a fresh browser session without any prior login or authentication.

1. **Categories Page** (`/admin/categories`):
   - Open `/admin/categories` in a fresh browser session
   - Page loads without showing "Something went wrong!" error
   - Categories table displays correctly (or shows empty state message)
   - Click "Add Category" button - dialog opens
   - Enter a category name (e.g., "Electronics")
   - Click "Save" - category is created successfully
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
   - Click edit icon on a product - dialog opens with existing data
   - Modify product details and save - product updates successfully
   - Click delete icon - confirmation dialog appears
   - Confirm deletion - product is removed
   - **No login or authentication should be required for any of these actions**

3. **Site Settings** (`/admin/site-settings`):
   - Shop name displays as "BISAULI" (permanent)
   - Logo upload and preview work correctly
   - Settings save successfully

### Customer Features Verification

1. **Home Page** (`/`):
   - Banner carousel displays
   - Categories grid loads
   - Featured products display

2. **Catalog** (`/catalog`):
   - Products load and display in grid
   - Filters work (category, price range, sort)
   - Search functionality works

3. **Authentication**:
   - Login button triggers Internet Identity
   - User profile setup appears for new users
   - Logout clears cached data

4. **Shopping Flow**:
   - Add to cart works
   - Cart page displays items
   - Checkout process completes
   - Order confirmation displays

## Troubleshooting

### Backend Health Check Shows "Unavailable"

If the admin panel shows "Backend: Unavailable":

1. Check if the backend canister is running:
   ```bash
   dfx canister status backend
   ```

2. If stopped, start it:
   ```bash
   dfx canister start backend
   ```

3. If not deployed, deploy it:
   ```bash
   dfx deploy backend
   ```

4. Click the "Retry" button in the admin panel to recheck

### "Unauthorized: Only admins can add categories" Error

This error should no longer occur as admin authorization checks have been removed. If you still see it:

1. Clear browser cache and cookies
2. Open a fresh incognito/private browser window
3. Navigate directly to `/admin/categories`
4. Try creating a category again
5. If the error persists, check the browser console for details and verify the backend has been redeployed with the latest code

### "Canister is stopped" (IC0508) Error

If you see this error:

1. The backend canister is stopped - check the health indicator in the admin sidebar
2. Start the canister:
   ```bash
   dfx canister start backend
   ```
3. Click "Retry" in the error message or refresh the page
4. The admin panel will show inline error messages with retry buttons instead of crashing

### "Something went wrong!" on Admin Pages

If you see this error on `/admin/products` or `/admin/categories`:

1. Check the backend health indicator in the admin sidebar
2. Check browser console for specific error messages
3. Verify the backend canister is deployed and running
4. Clear browser cache and reload
5. Try the "Retry" button in any error messages
6. Check that the admin actor is initializing correctly
7. Ensure no network issues blocking canister calls

### Products/Categories Not Loading

1. Check the backend health indicator in the admin sidebar
2. Open browser DevTools → Network tab
3. Look for failed canister calls
4. Check if the backend is responding
5. Verify the anonymous actor is being created correctly
6. Try clicking the "Retry" button in error messages
7. Try redeploying the backend canister

### Add Product Dialog Issues

1. If categories don't load in the dialog:
   - Check if categories exist (create one first at `/admin/categories`)
   - Verify the categories query is not failing
   - Look for error messages in the dialog
   - Use the "Go to Categories" button if shown

2. If the dialog won't open:
   - Check browser console for React errors
   - Verify the dialog state management
   - Ensure no conflicting modals are open

### General Debugging Steps

1. Check the backend health indicator in the admin panel sidebar
2. Check browser console for errors
3. Verify dfx is running: `dfx ping`
4. Check canister status: `dfx canister status backend`
5. Start canister if stopped: `dfx canister start backend`
6. View canister logs: `dfx canister logs backend`
7. Redeploy if needed: `dfx deploy backend`
8. Use the "Retry" buttons in error messages instead of refreshing the page

## Build for Production

