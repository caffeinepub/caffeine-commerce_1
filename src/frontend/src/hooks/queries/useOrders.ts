import { useQuery } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { useInternetIdentity } from '../useInternetIdentity';
import { queryKeys } from './queryClientKeys';
import type { Order__1 as Order } from '../../backend';

export function useGetAllCustomerOrders() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Order[]>({
    queryKey: queryKeys.orders,
    queryFn: async () => {
      if (!actor || !identity) return [];
      const userId = identity.getPrincipal();
      return actor.getAllCustomerOrders(userId);
    },
    enabled: !!actor && !actorFetching && !!identity,
    refetchInterval: 15000, // Poll every 15 seconds to pick up admin status changes
  });
}

export function useGetOrder(orderId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Order>({
    queryKey: queryKeys.order(orderId),
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const id = BigInt(orderId);
      return actor.getOrder(id);
    },
    enabled: !!actor && !actorFetching && !!orderId,
    refetchInterval: 10000, // Poll every 10 seconds
    retry: 1,
  });
}
