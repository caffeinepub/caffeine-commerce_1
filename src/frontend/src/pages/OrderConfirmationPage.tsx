import { useParams, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

export default function OrderConfirmationPage() {
  const { orderId } = useParams({ from: '/order-confirmation/$orderId' });
  const navigate = useNavigate();

  return (
    <div className="container py-16 max-w-2xl">
      <Card>
        <CardContent className="p-12 text-center space-y-6">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
          <h1 className="text-3xl font-bold">Order Confirmed!</h1>
          <p className="text-muted-foreground">
            Your order #{orderId} has been placed successfully. We will process your order and deliver it to your shipping address.
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => navigate({ to: '/orders' })}>
              View Orders
            </Button>
            <Button variant="outline" onClick={() => navigate({ to: '/' })}>
              Continue Shopping
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
