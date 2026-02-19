import { useQuery } from '@tanstack/react-query';
import { usePublicActor } from '../usePublicActor';
import { queryKeys } from './queryClientKeys';
import type { Product, Category, Filter } from '../../backend';
import { formatBackendError } from '../../utils/backendAvailabilityErrors';

// Fail-fast timeout wrapper for backend calls
async function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 8000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Request timed out. Backend service may be unavailable.')), timeoutMs)
    ),
  ]);
}

export function useGetProducts(filters: Filter[] = []) {
  const { actor, isFetching: actorFetching } = usePublicActor();

  const query = useQuery<Product[]>({
    queryKey: [...queryKeys.publicProducts, filters],
    queryFn: async () => {
      if (!actor) throw new Error('Backend service is not available');
      try {
        // Wrap the backend call with a timeout to fail fast
        return await withTimeout(actor.getProducts(filters), 8000);
      } catch (error: any) {
        // Ensure errors propagate with formatted messages
        throw new Error(formatBackendError(error));
      }
    },
    enabled: !!actor && !actorFetching,
    retry: 1, // Reduced from 2 to fail faster
    retryDelay: 1000, // 1 second between retries
    staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh, no refetch on revisit
    gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache for this duration
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
  };
}

export function useGetCategories() {
  const { actor, isFetching: actorFetching } = usePublicActor();

  const query = useQuery<Category[]>({
    queryKey: queryKeys.publicCategories,
    queryFn: async () => {
      if (!actor) throw new Error('Backend service is not available');
      try {
        // Wrap the backend call with a timeout to fail fast
        return await withTimeout(actor.getCategories(), 8000);
      } catch (error: any) {
        // Ensure errors propagate with formatted messages
        throw new Error(formatBackendError(error));
      }
    },
    enabled: !!actor && !actorFetching,
    retry: 1, // Reduced from 2 to fail faster
    retryDelay: 1000, // 1 second between retries
    staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh, no refetch on revisit
    gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache for this duration
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
  };
}
