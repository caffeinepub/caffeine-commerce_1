import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { useDashboardStats } from '../../hooks/queries/useDashboardStats';
import { useAdminGetProducts } from '../../hooks/queries/useAdminCatalog';

export default function AdminDashboardPage() {
  const { t } = useTranslation();
  const { 
    data: stats, 
    isLoading: statsLoading, 
    error: statsError,
    refetch: refetchStats, 
    isFetching: statsRefetching 
  } = useDashboardStats();
  const { 
    data: products, 
    isLoading: productsLoading, 
    error: productsError,
    refetch: refetchProducts,
    isFetching: productsRefetching
  } = useAdminGetProducts([]);

  const handleRefreshStats = () => {
    refetchStats();
  };

  const handleRefreshProducts = () => {
    refetchProducts();
  };

  const isRefreshing = statsRefetching || productsRefetching;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('admin.dashboard')}</h1>
        <Button
          onClick={() => {
            handleRefreshStats();
            handleRefreshProducts();
          }}
          disabled={isRefreshing}
          variant="outline"
          size="sm"
        >
          {isRefreshing ? (
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

      {statsError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              {statsError.message.includes('Unauthorized') 
                ? 'Please ensure you are logged in with admin privileges to view dashboard statistics.'
                : statsError.message}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshStats}
              disabled={statsRefetching}
              className="ml-4 shrink-0"
            >
              {statsRefetching ? (
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
      )}

      {productsError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              {productsError.message.includes('Unauthorized')
                ? 'Please ensure you are logged in with admin privileges to view products.'
                : productsError.message}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshProducts}
              disabled={productsRefetching}
              className="ml-4 shrink-0"
            >
              {productsRefetching ? (
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
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="text-3xl font-bold text-muted-foreground">Loading...</div>
            ) : statsError ? (
              <div className="text-3xl font-bold text-destructive">—</div>
            ) : (
              <div className="text-3xl font-bold">{stats?.totalOrders ?? 0}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="text-3xl font-bold text-muted-foreground">Loading...</div>
            ) : statsError ? (
              <div className="text-3xl font-bold text-destructive">—</div>
            ) : (
              <div className="text-3xl font-bold">₹{(stats?.totalRevenue ?? 0).toLocaleString()}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            {productsLoading ? (
              <div className="text-3xl font-bold text-muted-foreground">Loading...</div>
            ) : productsError ? (
              <div className="text-3xl font-bold text-destructive">—</div>
            ) : (
              <div className="text-3xl font-bold">{products?.length ?? 0}</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
