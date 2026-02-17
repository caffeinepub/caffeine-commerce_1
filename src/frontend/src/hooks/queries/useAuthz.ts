import { useQuery } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { useAdminActor } from '../useAdminActor';
import { queryKeys } from './queryClientKeys';
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

  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isCallerAdmin();
      } catch (err) {
        console.warn('Admin check failed:', err);
        return false;
      }
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}

export function useVerifyAdminToken(adminToken: string | null) {
  const { actor, isFetching: actorFetching } = useAdminActor();

  return useQuery<boolean>({
    queryKey: ['verifyAdminToken', adminToken],
    queryFn: async () => {
      if (!actor || !adminToken) return false;
      try {
        return await actor.verifyAdminToken(adminToken);
      } catch (err) {
        console.warn('Token verification failed:', err);
        return false;
      }
    },
    enabled: !!actor && !actorFetching && !!adminToken,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
