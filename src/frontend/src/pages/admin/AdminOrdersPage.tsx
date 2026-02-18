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
import { AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import { useGetAllOrders, useUpdateOrderStatus } from '../../hooks/queries/useAdminOrders';
import { toast } from 'sonner';
import { OrderStatus } from '../../backend';
import type { OrderId } from '../../backend';
import { getOrderStatusLabel, getOrderStatusColor, getAvailableOrderStatuses } from '../../utils/orderStatus';
import { formatBackendError } from '../../utils/backendAvailabilityErrors';

export default function AdminOrdersPage() {
  const { data: orders, isLoading, error, refetch, isFetching } = useGetAllOrders();
  const updateOrderStatus = useUpdateOrderStatus();
  const [updatingOrderId, setUpdatingOrderId] = useState<OrderId | null>(null);

  const handleStatusChange = async (orderId: OrderId, newStatus: OrderStatus) => {
    setUpdatingOrderId(orderId);
    try {
      await updateOrderStatus.mutateAsync({ orderId, newStatus });
      toast.success('Order status updated successfully');
    } catch (error: any) {
      const errorMessage = formatBackendError(error);
      toast.error(errorMessage);
      console.error('Failed to update order status:', error);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleRetry = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Orders</h1>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading orders...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    const errorMessage = formatBackendError(error);
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Orders</h1>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{errorMessage}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
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
    );
  }

  const sortedOrders = [...(orders || [])].sort((a, b) => {
    return Number(b.timestamp) - Number(a.timestamp);
  });

  const availableStatuses = getAvailableOrderStatuses();

  // Helper to get status key from enum value
  const getStatusKey = (status: OrderStatus): string => {
    const entries = Object.entries(OrderStatus);
    for (const [key, value] of entries) {
      if (value === status) {
        return key;
      }
    }
    return 'pending';
  };

  // Helper to get enum value from key
  const getStatusFromKey = (key: string): OrderStatus => {
    return (OrderStatus as any)[key] as OrderStatus;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Orders</h1>
        <Button
          onClick={handleRetry}
          disabled={isFetching}
          variant="outline"
          size="sm"
        >
          {isFetching ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </>
          )}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Orders ({sortedOrders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {sortedOrders.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              No orders found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedOrders.map((order) => {
                    const isUpdating = updatingOrderId === order.id;
                    const statusColor = getOrderStatusColor(order.status);
                    
                    return (
                      <TableRow key={order.id.toString()}>
                        <TableCell className="font-medium">#{order.id.toString()}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{order.shippingAddress.name}</div>
                            <div className="text-sm text-muted-foreground">{order.shippingAddress.phone}</div>
                          </div>
                        </TableCell>
                        <TableCell>{order.items.length} item(s)</TableCell>
                        <TableCell>₹{Number(order.totalAmount).toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={statusColor as any}>
                            {getOrderStatusLabel(order.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(Number(order.timestamp) / 1000000).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={getStatusKey(order.status)}
                            onValueChange={(value) => {
                              const newStatus = getStatusFromKey(value);
                              handleStatusChange(order.id, newStatus);
                            }}
                            disabled={isUpdating}
                          >
                            <SelectTrigger className="w-[140px]">
                              {isUpdating ? (
                                <div className="flex items-center gap-2">
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                  <span>Updating...</span>
                                </div>
                              ) : (
                                <SelectValue />
                              )}
                            </SelectTrigger>
                            <SelectContent>
                              {availableStatuses.map((status) => (
                                <SelectItem key={getStatusKey(status)} value={getStatusKey(status)}>
                                  {getOrderStatusLabel(status)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
