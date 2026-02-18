import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { useInternetIdentity } from '../useInternetIdentity';
import { queryKeys } from '../queries/queryClientKeys';
import type { ShippingAddress, OrderId } from '../../backend';
import { detectBackendUnavailability } from '../../utils/backendAvailabilityErrors';

export function usePlaceOrder() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (shippingAddress: ShippingAddress): Promise<OrderId> => {
      if (!actor) throw new Error('Backend service is not available');
      if (!identity) throw new Error('Please login to place an order');
      
      try {
        const orderId = await actor.placeOrder(shippingAddress);
        return orderId;
      } catch (error: any) {
        const errorInfo = detectBackendUnavailability(error);
        if (errorInfo.isBackendUnavailable) {
          throw new Error(errorInfo.userMessage);
        }
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate cart and orders queries after successful order placement
      queryClient.invalidateQueries({ queryKey: queryKeys.cart });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders });
      // Invalidate dashboard stats so admin sees updated numbers
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardStats });
    },
  });
}
