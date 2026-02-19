import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usePublicActor } from '../usePublicActor';
import { queryKeys } from './queryClientKeys';
import type { Order__1 as Order, OrderStatus, OrderId } from '../../backend';

export function useGetAllOrders() {
  const { actor, isFetching: actorFetching } = usePublicActor();

  return useQuery<Order[]>({
    queryKey: queryKeys.adminOrders,
    queryFn: async () => {
      if (!actor) throw new Error('Backend service is not available');
      // Using public/anonymous actor - no authentication required
      const orders = await actor.getAllOrders();
      return orders;
    },
    enabled: !!actor && !actorFetching,
    retry: 2,
    staleTime: 0, // Always fetch fresh data
    refetchOnMount: 'always', // Always refetch on mount
  });
}

export function useUpdateOrderStatus() {
  const { actor } = usePublicActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, newStatus }: { orderId: OrderId; newStatus: OrderStatus }) => {
      if (!actor) throw new Error('Backend service is not available');
      // Using public/anonymous actor - no authentication required
      await actor.updateOrderStatus(orderId, newStatus);
    },
    onSuccess: (_, variables) => {
      // Invalidate admin orders list
      queryClient.invalidateQueries({ queryKey: queryKeys.adminOrders });
      
      // Invalidate customer orders queries so they pick up the change
      queryClient.invalidateQueries({ queryKey: queryKeys.orders });
      queryClient.invalidateQueries({ queryKey: queryKeys.order(variables.orderId.toString()) });
      
      // Invalidate dashboard stats so admin sees updated numbers
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardStats });
    },
  });
}
