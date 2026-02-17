import { useQuery } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { useInternetIdentity } from '../useInternetIdentity';
import { queryKeys } from './queryClientKeys';
import type { UserId } from '../../backend';

export function useGetUserReferrals() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<UserId[]>({
    queryKey: identity ? queryKeys.referrals(identity.getPrincipal().toString()) : ['referrals'],
    queryFn: async () => {
      if (!actor || !identity) return [];
      return actor.getUserReferrals(identity.getPrincipal());
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}
