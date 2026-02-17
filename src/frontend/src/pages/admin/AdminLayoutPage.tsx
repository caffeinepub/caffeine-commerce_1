import { Outlet, Link } from '@tanstack/react-router';
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
} from 'lucide-react';

export default function AdminLayoutPage() {
  const { t } = useTranslation();

  const menuItems = [
    { to: '/admin', label: t('admin.dashboard'), icon: LayoutDashboard },
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
      <aside className="w-64 border-r bg-card">
        <div className="flex h-16 items-center justify-between border-b px-6">
          <h2 className="text-lg font-semibold">Admin Panel</h2>
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
