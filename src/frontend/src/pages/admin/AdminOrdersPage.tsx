import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '../../i18n';
import { Package } from 'lucide-react';

export default function AdminOrdersPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t('admin.orders')}</h1>
      <Card>
        <CardHeader>
          <CardTitle>Order Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Package className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground mb-2">
              Order Management Coming Soon
            </p>
            <p className="text-sm text-muted-foreground max-w-md">
              Order management features will be available soon. You'll be able to view, process, and manage customer orders from this page.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
