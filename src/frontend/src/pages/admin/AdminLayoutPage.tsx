import { useEffect } from 'react';
import { Outlet, Link, useNavigate } from '@tanstack/react-router';
import { useVerifyAdminToken } from '../../hooks/queries/useAuthz';
import { Button } from '@/components/ui/button';
import { useTranslation } from '../../i18n';
import { useQueryClient } from '@tanstack/react-query';
import { getSessionParameter, clearSessionParameter } from '../../utils/urlParams';
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
  const navigate = useNavigate();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  // Check for admin token
  const adminToken = getSessionParameter('caffeineAdminToken');
  
  // Verify token with backend
  const { data: isValidToken, isLoading, isError } = useVerifyAdminToken(adminToken);

  // Redirect to login if no token or invalid token
  useEffect(() => {
    if (!adminToken || (!isLoading && (isError || !isValidToken))) {
      clearSessionParameter('caffeineAdminToken');
      navigate({ to: '/admin/login' });
    }
  }, [adminToken, isValidToken, isLoading, isError, navigate]);

  const handleLogout = async () => {
    // Clear token from session
    clearSessionParameter('caffeineAdminToken');
    
    // Clear all cached queries
    queryClient.clear();
    
    // Navigate to login
    navigate({ to: '/admin/login' });
  };

  if (!adminToken || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (isError || !isValidToken) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
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
