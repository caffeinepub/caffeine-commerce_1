import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { useInternetIdentity } from '../useInternetIdentity';
import { queryKeys } from './queryClientKeys';
import type { Cart, Wishlist, ProductId } from '../../backend';

export function useGetCart() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Cart>({
    queryKey: queryKeys.cart,
    queryFn: async () => {
      if (!actor || !identity) return { items: [] };
      return actor.getCart();
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

export function useGetWishlist() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Wishlist>({
    queryKey: queryKeys.wishlist,
    queryFn: async () => {
      if (!actor || !identity) return { productIds: [] };
      return actor.getWishlist();
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

export function useAddToCart() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: ProductId) => {
      if (!actor) throw new Error('Actor not available');
      if (!identity) throw new Error('Please login to add items to cart');
      await actor.addToCart(productId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart });
    },
  });
}
