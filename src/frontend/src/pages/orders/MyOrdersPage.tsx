import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetAllCustomerOrders } from '../../hooks/queries/useOrders';
import { OrderRowSkeleton } from '../../components/LoadingSkeletons';
import { useTranslation } from '../../i18n';
import { ShoppingBag } from 'lucide-react';
import { OrderStatus } from '../../backend';

export default function MyOrdersPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { t } = useTranslation();
  const { data: orders, isLoading } = useGetAllCustomerOrders();

  if (!identity) {
    return (
      <div className="container py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Please login to view your orders</h1>
        <Button onClick={() => navigate({ to: '/' })}>Go to Home</Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container py-8 space-y-4">
        <h1 className="text-3xl font-bold mb-8">{t('orders.title')}</h1>
        {Array.from({ length: 3 }).map((_, i) => (
          <OrderRowSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="container py-16 text-center">
        <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h1 className="text-2xl font-bold mb-4">{t('orders.empty')}</h1>
        <Button onClick={() => navigate({ to: '/catalog' })}>Start Shopping</Button>
      </div>
    );
  }

  const getStatusLabel = (status: OrderStatus): string => {
    if (status === OrderStatus.completed) return 'completed';
    if (status === OrderStatus.pending) return 'pending';
    if (status === OrderStatus.cancelled) return 'cancelled';
    return 'unknown';
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">{t('orders.title')}</h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <Card
            key={Number(order.id)}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate({ to: '/orders/$orderId', params: { orderId: order.id.toString() } })}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">
                    {t('orders.orderNumber')} #{Number(order.id)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(Number(order.timestamp) / 1000000).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">₹{Number(order.totalAmount).toLocaleString()}</p>
                  <Badge variant={order.status === OrderStatus.completed ? 'default' : 'secondary'}>
                    {getStatusLabel(order.status)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
