import { useQuery } from '@tanstack/react-query';
import { useAdminActor } from '../useAdminActor';

/**
 * Admin-scoped health check hook that uses the anonymous admin actor
 * to verify the backend canister is running and responsive.
 */
export function useAdminHealthCheck() {
  const { actor, isFetching: actorFetching } = useAdminActor();

  const query = useQuery<string>({
    queryKey: ['adminHealthCheck'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.healthCheck();
      return result;
    },
    enabled: !!actor && !actorFetching,
    retry: 2,
    retryDelay: 1000,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
  });

  const isHealthy = query.data === 'Running';
  const isUnavailable = query.isError || (query.isFetched && !isHealthy);

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isHealthy,
    isUnavailable,
    status: query.isError ? 'Unavailable' : isHealthy ? 'Running' : 'Unknown',
  };
}
