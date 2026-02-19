import { OrderStatus } from '../backend';

/**
 * Shared utility functions for order status presentation across admin and customer views.
 */

/**
 * Maps OrderStatus enum to human-readable English labels.
 */
export function getOrderStatusLabel(status: OrderStatus): string {
  switch (status) {
    case OrderStatus.pending:
      return 'Pending';
    case OrderStatus.processing:
      return 'Processing';
    case OrderStatus.confirmed:
      return 'Confirmed';
    case OrderStatus.shipped:
      return 'Shipped';
    case OrderStatus.delivered:
      return 'Delivered';
    case OrderStatus.completed:
      return 'Completed';
    case OrderStatus.cancelled:
      return 'Cancelled';
    default:
      return 'Unknown';
  }
}

/**
 * Returns Badge variant for status styling.
 */
export function getOrderStatusColor(status: OrderStatus): 'default' | 'destructive' | 'outline' | 'secondary' {
  switch (status) {
    case OrderStatus.pending:
      return 'outline';
    case OrderStatus.processing:
      return 'default';
    case OrderStatus.confirmed:
      return 'default';
    case OrderStatus.shipped:
      return 'secondary';
    case OrderStatus.delivered:
      return 'default';
    case OrderStatus.completed:
      return 'default';
    case OrderStatus.cancelled:
      return 'destructive';
    default:
      return 'outline';
  }
}

/**
 * Status option for admin dropdown with key and label.
 */
export interface OrderStatusOption {
  key: string;
  label: string;
  value: OrderStatus;
}

/**
 * Returns all available order statuses for admin dropdown.
 */
export function getAvailableOrderStatuses(): OrderStatusOption[] {
  return [
    { key: 'pending', label: 'Pending', value: OrderStatus.pending },
    { key: 'processing', label: 'Processing', value: OrderStatus.processing },
    { key: 'confirmed', label: 'Confirmed', value: OrderStatus.confirmed },
    { key: 'shipped', label: 'Shipped', value: OrderStatus.shipped },
    { key: 'delivered', label: 'Delivered', value: OrderStatus.delivered },
    { key: 'completed', label: 'Completed', value: OrderStatus.completed },
    { key: 'cancelled', label: 'Cancelled', value: OrderStatus.cancelled },
  ];
}
