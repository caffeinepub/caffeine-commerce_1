import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetAllCoupons } from '../../hooks/queries/useCoupons';
import { useTranslation } from '../../i18n';

export default function AdminCouponsPage() {
  const { t } = useTranslation();
  const { data: coupons, isLoading } = useGetAllCoupons();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t('admin.coupons')}</h1>
      <Card>
        <CardHeader>
          <CardTitle>Coupon Management</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading...</p>
          ) : (
            <p className="text-muted-foreground">
              {coupons?.length || 0} coupons available
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
