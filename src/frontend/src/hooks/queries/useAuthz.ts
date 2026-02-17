import { useQuery } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { queryKeys } from './queryClientKeys';
import { getSessionParameter } from '../../utils/urlParams';
import type { UserRole } from '../../backend';

export function useGetCallerUserRole() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserRole>({
    queryKey: queryKeys.userRole,
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();
  const adminToken = getSessionParameter('caffeineAdminToken');

  return useQuery<boolean>({
    queryKey: ['isAdmin', adminToken],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isCallerAdmin();
      } catch (err) {
        console.warn('Admin check failed:', err);
        return false;
      }
    },
    enabled: !!actor && !actorFetching && !!adminToken,
    retry: false,
  });
}
