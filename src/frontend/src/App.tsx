import { RouterProvider, createRouter, createRoute, createRootRoute } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { I18nProvider } from './i18n';
import AppLayout from './components/layout/AppLayout';
import HomePage from './pages/HomePage';
import CatalogPage from './pages/CatalogPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CartPage from './pages/CartPage';
import WishlistPage from './pages/WishlistPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentFailurePage from './pages/PaymentFailurePage';
import MyOrdersPage from './pages/orders/MyOrdersPage';
import OrderDetailsPage from './pages/orders/OrderDetailsPage';
import ProfileLayoutPage from './pages/profile/ProfileLayoutPage';
import AddressesPage from './pages/profile/AddressesPage';
import SettingsPage from './pages/profile/SettingsPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminLayoutPage from './pages/admin/AdminLayoutPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminCouponsPage from './pages/admin/AdminCouponsPage';
import StripePaymentSetup from './components/admin/StripePaymentSetup';

const rootRoute = createRootRoute({
  component: AppLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const catalogRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/catalog',
  component: CatalogPage,
});

const productRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/product/$productId',
  component: ProductDetailsPage,
});

const cartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/cart',
  component: CartPage,
});

const wishlistRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/wishlist',
  component: WishlistPage,
});

const checkoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/checkout',
  component: CheckoutPage,
});

const orderConfirmationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/order-confirmation/$orderId',
  component: OrderConfirmationPage,
});

const paymentSuccessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/payment-success',
  component: PaymentSuccessPage,
});

const paymentFailureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/payment-failure',
  component: PaymentFailurePage,
});

const myOrdersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/orders',
  component: MyOrdersPage,
});

const orderDetailsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/orders/$orderId',
  component: OrderDetailsPage,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: ProfileLayoutPage,
});

const addressesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile/addresses',
  component: AddressesPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile/settings',
  component: SettingsPage,
});

const adminLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/login',
  component: AdminLoginPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminLayoutPage,
});

const adminDashboardRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/',
  component: AdminDashboardPage,
});

const adminProductsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/products',
  component: AdminProductsPage,
});

const adminCategoriesRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/categories',
  component: AdminCategoriesPage,
});

const adminOrdersRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/orders',
  component: AdminOrdersPage,
});

const adminUsersRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/users',
  component: AdminUsersPage,
});

const adminCouponsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/coupons',
  component: AdminCouponsPage,
});

const adminStripeRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/stripe-setup',
  component: StripePaymentSetup,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  catalogRoute,
  productRoute,
  cartRoute,
  wishlistRoute,
  checkoutRoute,
  orderConfirmationRoute,
  paymentSuccessRoute,
  paymentFailureRoute,
  myOrdersRoute,
  orderDetailsRoute,
  profileRoute,
  addressesRoute,
  settingsRoute,
  adminLoginRoute,
  adminRoute.addChildren([
    adminDashboardRoute,
    adminProductsRoute,
    adminCategoriesRoute,
    adminOrdersRoute,
    adminUsersRoute,
    adminCouponsRoute,
    adminStripeRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <I18nProvider>
        <RouterProvider router={router} />
        <Toaster />
      </I18nProvider>
    </ThemeProvider>
  );
}
