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
 * Returns Tailwind CSS classes for status badge styling.
 */
export function getOrderStatusColor(status: OrderStatus): string {
  switch (status) {
    case OrderStatus.pending:
      return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400';
    case OrderStatus.processing:
      return 'bg-blue-500/10 text-blue-700 dark:text-blue-400';
    case OrderStatus.confirmed:
      return 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400';
    case OrderStatus.shipped:
      return 'bg-purple-500/10 text-purple-700 dark:text-purple-400';
    case OrderStatus.delivered:
      return 'bg-green-500/10 text-green-700 dark:text-green-400';
    case OrderStatus.completed:
      return 'bg-green-500/10 text-green-700 dark:text-green-400';
    case OrderStatus.cancelled:
      return 'bg-red-500/10 text-red-700 dark:text-red-400';
    default:
      return 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
  }
}

/**
 * Returns all available order statuses for admin dropdown.
 */
export function getAvailableOrderStatuses(): OrderStatus[] {
  return [
    OrderStatus.pending,
    OrderStatus.processing,
    OrderStatus.confirmed,
    OrderStatus.shipped,
    OrderStatus.delivered,
    OrderStatus.completed,
    OrderStatus.cancelled,
  ];
}
