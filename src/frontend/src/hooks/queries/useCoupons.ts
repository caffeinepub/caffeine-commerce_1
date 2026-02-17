import { useQuery } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { queryKeys } from './queryClientKeys';
import type { Coupon } from '../../backend';

export function useGetAllCoupons() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Coupon[]>({
    queryKey: queryKeys.coupons,
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCoupons();
    },
    enabled: !!actor && !actorFetching,
  });
}
