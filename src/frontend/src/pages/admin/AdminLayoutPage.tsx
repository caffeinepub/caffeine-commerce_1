import { Outlet, Link, useMatchRoute } from '@tanstack/react-router';
import { useTranslation } from '../../i18n';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Users,
  Ticket,
  CreditCard,
  Settings,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { useAdminHealthCheck } from '../../hooks/queries/useAdminHealthCheck';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { clearAdminSession } from '../../utils/adminSessionReset';
import { toast } from 'sonner';

export default function AdminLayoutPage() {
  const { t } = useTranslation();
  const matchRoute = useMatchRoute();
  const { isHealthy, isUnavailable, status, refetch, isFetching } = useAdminHealthCheck();

  const handleClearSession = () => {
    try {
      clearAdminSession();
      toast.success('Admin session cleared. Please refresh the page.');
    } catch (error) {
      toast.error('Failed to clear session. Please try again.');
      console.error('Session clear error:', error);
    }
  };

  const menuItems = [
    { to: '/admin', label: t('admin.dashboard'), icon: LayoutDashboard, exact: true },
    { to: '/admin/products', label: t('admin.products'), icon: Package },
    { to: '/admin/categories', label: t('admin.categories'), icon: FolderTree },
    { to: '/admin/orders', label: t('admin.orders'), icon: ShoppingCart },
    { to: '/admin/users', label: t('admin.users'), icon: Users },
    { to: '/admin/coupons', label: t('admin.coupons'), icon: Ticket },
    { to: '/admin/site-settings', label: t('admin.siteSettings'), icon: Settings },
    { to: '/admin/stripe-setup', label: t('admin.stripe'), icon: CreditCard },
  ];

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-card">
        <div className="flex h-16 items-center justify-between border-b px-6">
          <h2 className="text-lg font-semibold">Admin Panel</h2>
        </div>
        
        {/* Backend Status Indicator */}
        <div className="border-b p-4">
          {isHealthy ? (
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
              <CheckCircle className="h-4 w-4" />
              <span>Backend: Running</span>
            </div>
          ) : isUnavailable ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span>Backend: Unavailable</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isFetching}
                className="w-full"
              >
                {isFetching ? (
                  <>
                    <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-3 w-3" />
                    Retry
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Checking backend...</span>
            </div>
          )}
        </div>

        <nav className="space-y-1 p-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact 
              ? matchRoute({ to: item.to, fuzzy: false })
              : matchRoute({ to: item.to });
            
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
                  isActive ? 'bg-accent text-accent-foreground' : ''
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Clear Session Button */}
        <div className="absolute bottom-0 left-0 right-0 border-t p-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearSession}
            className="w-full"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear Admin Session
          </Button>
        </div>
      </aside>

      {/* Main Content - offset by sidebar width */}
      <main className="ml-64 flex-1 overflow-auto">
        {/* Global Backend Unavailable Alert */}
        {isUnavailable && (
          <div className="border-b bg-destructive/10 p-4">
            <Alert variant="destructive" className="border-0">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>
                  The backend service is currently unavailable. Please ensure the canister is running and try again.
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetch()}
                  disabled={isFetching}
                  className="ml-4 shrink-0"
                >
                  {isFetching ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Retrying...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Retry
                    </>
                  )}
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        )}
        
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
