import { useEffect } from 'react';
import { Outlet, Link, useNavigate } from '@tanstack/react-router';
import { useIsCallerAdmin } from '../../hooks/queries/useAuthz';
import { Button } from '@/components/ui/button';
import { useTranslation } from '../../i18n';
import { useQueryClient } from '@tanstack/react-query';
import { getSessionParameter, clearSessionParameter } from '../../utils/urlParams';
import { useActor } from '../../hooks/useActor';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Users,
  Ticket,
  CreditCard,
  LogOut,
} from 'lucide-react';

export default function AdminLayoutPage() {
  const { data: isAdmin, isLoading } = useIsCallerAdmin();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { actor } = useActor();

  // Check for admin token
  const adminToken = getSessionParameter('caffeineAdminToken');

  // Redirect to login if no token
  useEffect(() => {
    if (!isLoading && !adminToken) {
      navigate({ to: '/admin/login' });
    }
  }, [adminToken, isLoading, navigate]);

  const handleLogout = async () => {
    try {
      // Call backend to invalidate token if method exists
      if (actor && adminToken) {
        try {
          // @ts-ignore - Backend method will be added
          await actor.adminLogout(adminToken);
        } catch (err) {
          console.warn('Backend logout failed:', err);
        }
      }
    } finally {
      // Clear token from session
      clearSessionParameter('caffeineAdminToken');
      
      // Clear all cached queries
      queryClient.clear();
      
      // Navigate to login
      navigate({ to: '/admin/login' });
    }
  };

  const handleBackToLogin = () => {
    // Clear the invalid/expired token
    clearSessionParameter('caffeineAdminToken');
    
    // Clear all cached queries
    queryClient.clear();
    
    // Navigate to login
    navigate({ to: '/admin/login' });
  };

  if (!adminToken) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="text-muted-foreground mb-4">
          Your session may have expired or you don't have permission to access this area
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={handleBackToLogin}>
            Back to Login
          </Button>
          <Button variant="outline" onClick={() => navigate({ to: '/' })}>
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  const menuItems = [
    { to: '/admin', label: t('admin.dashboard'), icon: LayoutDashboard },
    { to: '/admin/products', label: t('admin.products'), icon: Package },
    { to: '/admin/categories', label: t('admin.categories'), icon: FolderTree },
    { to: '/admin/orders', label: t('admin.orders'), icon: ShoppingCart },
    { to: '/admin/users', label: t('admin.users'), icon: Users },
    { to: '/admin/coupons', label: t('admin.coupons'), icon: Ticket },
    { to: '/admin/stripe-setup', label: t('admin.stripe'), icon: CreditCard },
  ];

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card">
        <div className="flex h-16 items-center justify-between border-b px-6">
          <h2 className="text-lg font-semibold">Admin Panel</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
        <nav className="space-y-1 p-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                activeProps={{
                  className: 'bg-accent text-accent-foreground',
                }}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
