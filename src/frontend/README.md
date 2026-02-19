# BISAULI Store - Frontend

A modern e-commerce platform built with React, TypeScript, and Tailwind CSS on the Internet Computer.

## Features

- 🛍️ Product catalog with categories and search
- 🛒 Shopping cart and wishlist
- 📦 Order management with real-time status updates
- 👤 User profiles with Internet Identity authentication
- 💳 Stripe payment integration
- 🎨 Light/dark mode support
- 🌐 Multi-language support (English/Hindi)
- 📱 Responsive design
- 🔐 Role-based access control (Admin/User/Guest)

## Application Routes

### Public Routes
- `/` - Home page with featured products and categories
- `/catalog` - Product catalog with filters and search
- `/product/:id` - Product details page

### User Routes (Requires Login)
- `/cart` - Shopping cart
- `/wishlist` - Saved products
- `/checkout` - Checkout with shipping address
- `/order-confirmation/:orderId` - Order confirmation
- `/orders` - Order history
- `/orders/:orderId` - Order details
- `/profile` - User profile management
- `/profile/addresses` - Address management
- `/profile/settings` - User settings

### Admin Routes (Requires Admin Role)
- `/admin` - Admin dashboard with statistics
- `/admin/products` - Product management
- `/admin/categories` - Category management
- `/admin/orders` - Order management
- `/admin/users` - User management
- `/admin/coupons` - Coupon management
- `/admin/site-settings` - Site settings (logo, shop name)
- `/admin/stripe-setup` - Stripe payment configuration

### Payment Routes
- `/payment-success` - Stripe payment success
- `/payment-failure` - Stripe payment failure

## Local Development

### Prerequisites
- Node.js 18+
- pnpm
- DFX (Internet Computer SDK)

### Setup

1. Install dependencies:
