import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { queryKeys } from './queryClientKeys';
import type { Product, Category, Filter } from '../../backend';
import { useEffect, useRef } from 'react';

export function useGetProducts(filters: Filter[] = []) {
  const { actor, isFetching: actorFetching } = useActor();
  const queryClient = useQueryClient();
  const migrationAttempted = useRef(false);

  const query = useQuery<Product[]>({
    queryKey: [...queryKeys.products, filters],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getProducts(filters);
    },
    enabled: !!actor && !actorFetching,
    placeholderData: (previousData) => previousData,
  });

  // Trigger sample product migration if products are empty
  useEffect(() => {
    if (
      actor &&
      !actorFetching &&
      query.data !== undefined &&
      query.data.length === 0 &&
      !migrationAttempted.current
    ) {
      migrationAttempted.current = true;
      actor
        .migrateSampleProducts()
        .then(() => {
          queryClient.invalidateQueries({ queryKey: queryKeys.products });
        })
        .catch((error) => {
          console.error('Failed to migrate sample products:', error);
        });
    }
  }, [actor, actorFetching, query.data, queryClient]);

  return query;
}

export function useGetCategories() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Category[]>({
    queryKey: queryKeys.categories,
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCategories();
    },
    enabled: !!actor && !actorFetching,
  });
}
