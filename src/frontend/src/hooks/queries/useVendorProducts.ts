import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { queryKeys } from './queryClientKeys';
import type { Product, ProductInput, ProductId } from '../../backend';
import { toast } from 'sonner';

export function useVendorGetProducts() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<Product[]>({
    queryKey: queryKeys.vendorProducts,
    queryFn: async () => {
      if (!actor) return [];
      return await actor.getOwnerProducts();
    },
    enabled: !!actor && !actorFetching,
    retry: 1,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
  };
}

export function useVendorAddProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: ProductInput) => {
      if (!actor) throw new Error('Actor not available');
      return await actor.addProduct(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vendorProducts });
      queryClient.invalidateQueries({ queryKey: queryKeys.products });
    },
  });
}

export function useVendorUpdateProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, input }: { productId: ProductId; input: ProductInput }) => {
      if (!actor) throw new Error('Actor not available');
      return await actor.updateProduct(productId, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vendorProducts });
      queryClient.invalidateQueries({ queryKey: queryKeys.products });
    },
  });
}

export function useVendorDeleteProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: ProductId) => {
      if (!actor) throw new Error('Actor not available');
      return await actor.deleteProduct(productId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vendorProducts });
      queryClient.invalidateQueries({ queryKey: queryKeys.products });
    },
  });
}
