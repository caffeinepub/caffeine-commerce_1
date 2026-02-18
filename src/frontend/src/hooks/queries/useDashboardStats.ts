import { useQuery } from '@tanstack/react-query';
import { useAdminActor } from '../useAdminActor';
import { queryKeys } from './queryClientKeys';
import type { Order__1 as Order } from '../../backend';

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
}

export function useDashboardStats() {
  const { actor, isFetching: actorFetching } = useAdminActor();

  return useQuery<DashboardStats>({
    queryKey: queryKeys.dashboardStats,
    queryFn: async () => {
      if (!actor) throw new Error('Backend service is not available');
      
      const orders: Order[] = await actor.getAllOrders();
      
      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, order) => {
        return sum + Number(order.totalAmount);
      }, 0);

      return {
        totalOrders,
        totalRevenue,
      };
    },
    enabled: !!actor && !actorFetching,
    retry: 2,
    staleTime: 0, // Always fetch fresh data
  });
}
