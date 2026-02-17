import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCart } from '../hooks/queries/useCartWishlist';
import { useGetProducts } from '../hooks/queries/useCatalog';
import { useTranslation } from '../i18n';
import { toast } from 'sonner';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { t } = useTranslation();
  const { data: cart } = useGetCart();
  const { data: products } = useGetProducts();
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'stripe'>('cod');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!identity) {
    return (
      <div className="container py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Please login to checkout</h1>
        <Button onClick={() => navigate({ to: '/' })}>Go to Home</Button>
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

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    try {
      // Simulate order placement
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Order placed successfully!');
      navigate({ to: '/orders' });
    } catch (error) {
      toast.error('Failed to place order');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">{t('checkout.title')}</h1>

      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>{t('checkout.shippingAddress')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Address management will be available soon
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('checkout.paymentMethod')}</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as 'cod' | 'stripe')}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cod" id="cod" />
                <Label htmlFor="cod">{t('checkout.cod')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="stripe" id="stripe" />
                <Label htmlFor="stripe">{t('checkout.stripe')}</Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('checkout.orderSummary')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {cartProducts.map((item) => (
              <div key={Number(item.productId)} className="flex justify-between">
                <span>
                  {item.product!.name} x {Number(item.quantity)}
                </span>
                <span className="font-semibold">
                  ₹{(Number(item.product!.price) * Number(item.quantity)).toLocaleString()}
                </span>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>₹{subtotal.toLocaleString()}</span>
            </div>
            <Button
              size="lg"
              className="w-full"
              onClick={handlePlaceOrder}
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : t('checkout.placeOrder')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
