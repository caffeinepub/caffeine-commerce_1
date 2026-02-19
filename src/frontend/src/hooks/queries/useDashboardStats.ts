import { useQuery } from '@tanstack/react-query';
import { useAdminActor } from '../useAdminActor';
import { queryKeys } from './queryClientKeys';
import type { Order__1 as Order } from '../../backend';
import { formatBackendError } from '../../utils/backendAvailabilityErrors';

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
}

// Fail-fast timeout wrapper for backend calls
async function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 8000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Request timed out. Backend service may be unavailable.')), timeoutMs)
    ),
  ]);
}

export function useDashboardStats() {
  const { actor, isFetching: actorFetching } = useAdminActor();

  const query = useQuery<DashboardStats>({
    queryKey: queryKeys.dashboardStats,
    queryFn: async () => {
      if (!actor) throw new Error('Backend service is not available');
      
      try {
        // Using authenticated admin actor - requires admin role
        const orders: Order[] = await withTimeout(actor.getAllOrders(), 8000);
        
        const totalOrders = orders.length;
        const totalRevenue = orders.reduce((sum, order) => {
          return sum + Number(order.totalAmount);
        }, 0);

        return {
          totalOrders,
          totalRevenue,
        };
      } catch (error: any) {
        // Format the error for better user messaging
        throw new Error(formatBackendError(error));
      }
    },
    enabled: !!actor && !actorFetching,
    retry: 1, // Reduced from 2 to fail faster
    retryDelay: 1000, // 1 second between retries
    staleTime: 0,
    refetchOnMount: true, // Always refetch on mount to get latest data
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
  };
}
