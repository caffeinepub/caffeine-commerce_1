import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCart, useIncrementCartItem, useDecrementCartItem } from '../hooks/queries/useCartWishlist';
import { useGetProducts } from '../hooks/queries/useCatalog';
import { useTranslation } from '../i18n';
import { ShoppingBag, Plus, Minus } from 'lucide-react';
import { toast } from 'sonner';
import { formatBackendError } from '../utils/backendAvailabilityErrors';

export default function CartPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { t } = useTranslation();
  const { data: cart, isLoading: cartLoading } = useGetCart();
  const { data: products } = useGetProducts();
  const incrementItem = useIncrementCartItem();
  const decrementItem = useDecrementCartItem();

  if (!identity) {
    return (
      <div className="container py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Please login to view your cart</h1>
        <Button onClick={() => navigate({ to: '/' })}>Go to Home</Button>
      </div>
    );
  }

  if (cartLoading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </div>
    );
  }

  const cartItems = cart?.items || [];
  const productList = products || [];
  const cartProducts = cartItems
    .map((item) => ({
      ...item,
      product: productList.find((p) => p.id === item.productId),
    }))
    .filter((item) => item.product);

  const subtotal = cartProducts.reduce(
    (sum, item) => sum + Number(item.product!.price) * Number(item.quantity),
    0
  );

  const handleIncrement = async (productId: bigint) => {
    try {
      await incrementItem.mutateAsync(productId);
    } catch (error: any) {
      toast.error(formatBackendError(error));
    }
  };

  const handleDecrement = async (productId: bigint) => {
    try {
      await decrementItem.mutateAsync(productId);
    } catch (error: any) {
      toast.error(formatBackendError(error));
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="container py-16 text-center">
        <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h1 className="text-2xl font-bold mb-4">{t('cart.empty')}</h1>
        <Button onClick={() => navigate({ to: '/catalog' })}>Continue Shopping</Button>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">{t('cart.title')}</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cartProducts.map((item) => (
            <Card key={Number(item.productId)}>
              <CardContent className="p-4 flex gap-4">
                <img
                  src={item.product!.imageUrl || '/assets/generated/product-placeholder.dim_800x800.png'}
                  alt={item.product!.name}
                  className="h-24 w-24 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="font-semibold">{item.product!.name}</h3>
                  <p className="text-lg font-bold text-primary mt-2">
                    ₹{Number(item.product!.price).toLocaleString()}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDecrement(item.productId)}
                      disabled={decrementItem.isPending}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium min-w-[2rem] text-center">
                      {Number(item.quantity)}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleIncrement(item.productId)}
                      disabled={incrementItem.isPending}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div>
          <Card className="sticky top-24">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-xl font-bold">Order Summary</h2>
              <Separator />
              <div className="flex justify-between">
                <span>{t('cart.subtotal')}</span>
                <span className="font-bold">₹{subtotal.toLocaleString()}</span>
              </div>
              <Button
                size="lg"
                className="w-full"
                onClick={() => navigate({ to: '/checkout' })}
              >
                {t('cart.checkout')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
