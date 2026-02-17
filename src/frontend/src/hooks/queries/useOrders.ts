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
  });
}

export function useGetOrder(orderId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Order>({
    queryKey: queryKeys.order(orderId),
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getOrder(BigInt(orderId));
    },
    enabled: !!actor && !actorFetching && !!orderId,
    refetchInterval: 10000, // Poll every 10 seconds
  });
}
