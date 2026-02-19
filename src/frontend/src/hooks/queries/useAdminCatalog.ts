import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAdminActor } from '../useAdminActor';
import { queryKeys } from './queryClientKeys';
import type { Product, Category, Filter, ProductId, CategoryId, ProductInput } from '../../backend';
import { formatBackendError } from '../../utils/backendAvailabilityErrors';

export function useAdminGetProducts(filters: Filter[] = []) {
  const { actor, isFetching: actorFetching } = useAdminActor();

  const query = useQuery<Product[]>({
    queryKey: [...queryKeys.products, filters],
    queryFn: async () => {
      if (!actor) throw new Error('Backend service is not available');
      try {
        return await actor.getProducts(filters);
      } catch (error: any) {
        // Ensure errors propagate with formatted messages
        throw new Error(formatBackendError(error));
      }
    },
    enabled: !!actor && !actorFetching,
    retry: 2,
    staleTime: 0,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useAdminGetCategories() {
  const { actor, isFetching: actorFetching } = useAdminActor();

  const query = useQuery<Category[]>({
    queryKey: queryKeys.categories,
    queryFn: async () => {
      if (!actor) throw new Error('Backend service is not available');
      try {
        return await actor.getCategories();
      } catch (error: any) {
        // Ensure errors propagate with formatted messages
        throw new Error(formatBackendError(error));
      }
    },
    enabled: !!actor && !actorFetching,
    retry: 2,
    staleTime: 0,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useAdminAddProduct() {
  const { actor } = useAdminActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productInput: ProductInput) => {
      if (!actor) throw new Error('Backend service is not available');
      return actor.addProduct(productInput);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products });
      queryClient.invalidateQueries({ queryKey: queryKeys.publicProducts });
    },
  });
}

export function useAdminUpdateProduct() {
  const { actor } = useAdminActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, product }: { productId: ProductId; product: ProductInput }) => {
      if (!actor) throw new Error('Backend service is not available');
      await actor.updateProduct(productId, product);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products });
      queryClient.invalidateQueries({ queryKey: queryKeys.publicProducts });
    },
  });
}

export function useAdminDeleteProduct() {
  const { actor } = useAdminActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: ProductId) => {
      if (!actor) throw new Error('Backend service is not available');
      await actor.deleteProduct(productId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products });
      queryClient.invalidateQueries({ queryKey: queryKeys.publicProducts });
    },
  });
}

export function useAdminAddCategory() {
  const { actor } = useAdminActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (category: Omit<Category, 'id'>) => {
      if (!actor) throw new Error('Backend service is not available');
      const categoryWithId: Category = { ...category, id: 0n };
      return actor.addCategory(categoryWithId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories });
      queryClient.invalidateQueries({ queryKey: queryKeys.publicCategories });
    },
  });
}

export function useAdminUpdateCategory() {
  const { actor } = useAdminActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ categoryId, category }: { categoryId: CategoryId; category: Category }) => {
      if (!actor) throw new Error('Backend service is not available');
      await actor.updateCategory(categoryId, category);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories });
      queryClient.invalidateQueries({ queryKey: queryKeys.publicCategories });
    },
  });
}

export function useAdminDeleteCategory() {
  const { actor } = useAdminActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoryId: CategoryId) => {
      if (!actor) throw new Error('Backend service is not available');
      await actor.deleteCategory(categoryId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories });
      queryClient.invalidateQueries({ queryKey: queryKeys.publicCategories });
    },
  });
}
