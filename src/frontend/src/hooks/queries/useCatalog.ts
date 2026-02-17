import { useQuery } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { queryKeys } from './queryClientKeys';
import type { Product, Category, Filter } from '../../backend';

export function useGetProducts(filters: Filter[] = []) {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<Product[]>({
    queryKey: [...queryKeys.products, filters],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getProducts(filters);
    },
    enabled: !!actor && !actorFetching,
    placeholderData: (previousData) => previousData,
  });

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
