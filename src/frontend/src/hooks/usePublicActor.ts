import { useQuery } from '@tanstack/react-query';
import { type backendInterface } from '../backend';
import { createActorWithConfig } from '../config';

const PUBLIC_ACTOR_QUERY_KEY = 'publicActor';

/**
 * Public/anonymous actor hook for read-only shopper catalog access.
 * This ensures catalog data can be fetched even when the user is not logged in.
 */
export function usePublicActor() {
  const actorQuery = useQuery<backendInterface>({
    queryKey: [PUBLIC_ACTOR_QUERY_KEY],
    queryFn: async () => {
      // Always create an anonymous actor for public access
      return await createActorWithConfig();
    },
    staleTime: Infinity,
    enabled: true,
  });

  return {
    actor: actorQuery.data || null,
    isFetching: actorQuery.isFetching,
  };
}
