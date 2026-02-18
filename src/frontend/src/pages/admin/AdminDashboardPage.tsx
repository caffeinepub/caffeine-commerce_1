import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { useDashboardStats } from '../../hooks/queries/useDashboardStats';
import { useAdminGetProducts } from '../../hooks/queries/useAdminCatalog';

export default function AdminDashboardPage() {
  const { t } = useTranslation();
  const { data: stats, isLoading: statsLoading, refetch: refetchStats, isFetching: statsRefetching } = useDashboardStats();
  const { data: products } = useAdminGetProducts([]);

  const totalOrders = stats?.totalOrders ?? 0;
  const totalRevenue = stats?.totalRevenue ?? 0;
  const totalProducts = products?.length ?? 0;

  const handleRefreshStats = () => {
    refetchStats();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('admin.dashboard')}</h1>
        <Button
          onClick={handleRefreshStats}
          disabled={statsRefetching}
          variant="outline"
          size="sm"
        >
          {statsRefetching ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Stats
            </>
          )}
        </Button>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <p className="text-3xl font-bold text-muted-foreground">Loading...</p>
            ) : (
              <p className="text-3xl font-bold">{totalOrders}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <p className="text-3xl font-bold text-muted-foreground">Loading...</p>
            ) : (
              <p className="text-3xl font-bold">₹{totalRevenue.toLocaleString()}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalProducts}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
