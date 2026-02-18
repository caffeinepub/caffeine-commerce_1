import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAdminActor } from '../useAdminActor';
import { queryKeys } from './queryClientKeys';
import type { Order__1 as Order, OrderStatus, OrderId } from '../../backend';

export function useGetAllOrders() {
  const { actor, isFetching: actorFetching } = useAdminActor();

  return useQuery<Order[]>({
    queryKey: queryKeys.adminOrders,
    queryFn: async () => {
      if (!actor) throw new Error('Backend service is not available');
      return actor.getAllOrders();
    },
    enabled: !!actor && !actorFetching,
    retry: 2,
  });
}

export function useUpdateOrderStatus() {
  const { actor } = useAdminActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, newStatus }: { orderId: OrderId; newStatus: OrderStatus }) => {
      if (!actor) throw new Error('Backend service is not available');
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
