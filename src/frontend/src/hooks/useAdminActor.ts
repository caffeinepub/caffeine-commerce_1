import { useActor } from './useActor';

/**
 * Admin actor hook that uses the authenticated actor from useActor.
 * Requires Internet Identity authentication and admin role.
 */
export function useAdminActor() {
  const { actor, isFetching } = useActor();

  return {
    actor,
    isFetching,
    error: null,
  };
}
