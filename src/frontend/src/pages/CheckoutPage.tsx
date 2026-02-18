import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCart } from '../hooks/queries/useCartWishlist';
import { useGetProducts } from '../hooks/queries/useCatalog';
import { usePlaceOrder } from '../hooks/mutations/usePlaceOrder';
import { useTranslation } from '../i18n';
import { toast } from 'sonner';
import { formatBackendError } from '../utils/backendAvailabilityErrors';
import type { ShippingAddress } from '../backend';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { t } = useTranslation();
  const { data: cart } = useGetCart();
  const { data: products } = useGetProducts();
  const placeOrder = usePlaceOrder();

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    name: '',
    phone: '',
    address: '',
    pincode: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ShippingAddress, string>>>({});

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

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ShippingAddress, string>> = {};

    if (!shippingAddress.name.trim()) {
      newErrors.name = 'Customer Name is required';
    }

    if (!shippingAddress.phone.trim()) {
      newErrors.phone = 'Mobile Number is required';
    } else if (!/^\d{10}$/.test(shippingAddress.phone.trim())) {
      newErrors.phone = 'Mobile Number must be exactly 10 digits';
    }

    if (!shippingAddress.address.trim()) {
      newErrors.address = 'Full Address is required';
    }

    if (!shippingAddress.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(shippingAddress.pincode.trim())) {
      newErrors.pincode = 'Pincode must be exactly 6 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      toast.error('Please fill in all required fields correctly');
      return;
    }

    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    try {
      const orderId = await placeOrder.mutateAsync(shippingAddress);
      toast.success('Order placed successfully!');
      navigate({ to: '/order-confirmation/$orderId', params: { orderId: String(orderId) } });
    } catch (error: any) {
      toast.error(formatBackendError(error));
    }
  };

  const handleInputChange = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const isFormValid = 
    shippingAddress.name.trim() !== '' &&
    /^\d{10}$/.test(shippingAddress.phone.trim()) &&
    shippingAddress.address.trim() !== '' &&
    /^\d{6}$/.test(shippingAddress.pincode.trim()) &&
    cartItems.length > 0;

  return (
    <div className="container py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">{t('checkout.title')}</h1>

      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Shipping Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Customer Name *</Label>
              <Input
                id="name"
                placeholder="Enter customer name"
                value={shippingAddress.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Mobile Number *</Label>
              <Input
                id="phone"
                placeholder="10-digit mobile number"
                value={shippingAddress.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={errors.phone ? 'border-destructive' : ''}
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Full Address *</Label>
              <Input
                id="address"
                placeholder="House no., Street, Area, City, State"
                value={shippingAddress.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className={errors.address ? 'border-destructive' : ''}
              />
              {errors.address && (
                <p className="text-sm text-destructive">{errors.address}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="pincode">Pincode *</Label>
              <Input
                id="pincode"
                placeholder="6-digit pincode"
                value={shippingAddress.pincode}
                onChange={(e) => handleInputChange('pincode', e.target.value)}
                className={errors.pincode ? 'border-destructive' : ''}
              />
              {errors.pincode && (
                <p className="text-sm text-destructive">{errors.pincode}</p>
              )}
            </div>
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
              disabled={!isFormValid || placeOrder.isPending}
            >
              {placeOrder.isPending ? 'Processing...' : 'Place Order'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
