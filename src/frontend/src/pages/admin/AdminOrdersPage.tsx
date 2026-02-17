import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '../../i18n';

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
          <p className="text-muted-foreground">
            Order management features will be available soon
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
