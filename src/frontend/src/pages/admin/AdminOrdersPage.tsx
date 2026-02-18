import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTranslation } from '../../i18n';
import { useGetAllOrders, useUpdateOrderStatus } from '../../hooks/queries/useAdminOrders';
import { Package, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { formatBackendError } from '../../utils/backendAvailabilityErrors';
import { OrderStatus } from '../../backend';
import { getOrderStatusLabel, getOrderStatusColor, getAvailableOrderStatuses } from '../../utils/orderStatus';
import { toast } from 'sonner';

export default function AdminOrdersPage() {
  const { t } = useTranslation();
  const { data: orders, isLoading, error, refetch, isError } = useGetAllOrders();
  const updateOrderStatus = useUpdateOrderStatus();
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);

  const handleStatusChange = async (orderId: bigint, newStatus: OrderStatus) => {
    const orderIdStr = orderId.toString();
    setUpdatingOrderId(orderIdStr);
    setUpdateSuccess(null);

    try {
      await updateOrderStatus.mutateAsync({ orderId, newStatus });
      setUpdateSuccess(orderIdStr);
      toast.success(`Order #${orderIdStr} status updated to ${getOrderStatusLabel(newStatus)}`);
      
      // Clear success indicator after 3 seconds
      setTimeout(() => {
        setUpdateSuccess(null);
      }, 3000);
    } catch (err: any) {
      const errorMessage = formatBackendError(err);
      toast.error(`Failed to update order status: ${errorMessage}`);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">{t('admin.orders')}</h1>
        <Card>
          <CardContent className="py-12">
            <div className="flex items-center justify-center">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-3 text-lg text-muted-foreground">Loading orders...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">{t('admin.orders')}</h1>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{formatBackendError(error)}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="ml-4"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">{t('admin.orders')}</h1>
        <Card>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-muted-foreground mb-2">
                No orders yet
              </p>
              <p className="text-sm text-muted-foreground max-w-md">
                Orders placed by customers will appear here. You'll be able to view shipping details and manage order fulfillment.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('admin.orders')}</h1>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Orders ({orders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Mobile Number</TableHead>
                  <TableHead>Full Address</TableHead>
                  <TableHead>Pincode</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => {
                  const orderIdStr = order.id.toString();
                  const isUpdating = updatingOrderId === orderIdStr;
                  const showSuccess = updateSuccess === orderIdStr;

                  return (
                    <TableRow key={Number(order.id)}>
                      <TableCell className="font-medium">#{Number(order.id)}</TableCell>
                      <TableCell>{order.shippingAddress.name}</TableCell>
                      <TableCell>{order.shippingAddress.phone}</TableCell>
                      <TableCell className="max-w-xs truncate" title={order.shippingAddress.address}>
                        {order.shippingAddress.address}
                      </TableCell>
                      <TableCell>{order.shippingAddress.pincode}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="text-sm">
                              Product #{Number(item.productId)} × {Number(item.quantity)}
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        ₹{Number(order.totalAmount).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Select
                            value={order.status}
                            onValueChange={(value) => handleStatusChange(order.id, value as OrderStatus)}
                            disabled={isUpdating}
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue>
                                <Badge className={getOrderStatusColor(order.status)}>
                                  {getOrderStatusLabel(order.status)}
                                </Badge>
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {getAvailableOrderStatuses().map((status) => (
                                <SelectItem key={status} value={status}>
                                  <Badge className={getOrderStatusColor(status)}>
                                    {getOrderStatusLabel(status)}
                                  </Badge>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {isUpdating && (
                            <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
                          )}
                          {showSuccess && (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                        {updateOrderStatus.isError && updatingOrderId === orderIdStr && (
                          <div className="mt-2 text-xs text-destructive">
                            {formatBackendError(updateOrderStatus.error)}
                            <Button
                              variant="link"
                              size="sm"
                              className="h-auto p-0 ml-2 text-xs"
                              onClick={() => handleStatusChange(order.id, order.status)}
                            >
                              Retry
                            </Button>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(Number(order.timestamp) / 1000000).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
