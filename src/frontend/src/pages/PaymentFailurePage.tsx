import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { XCircle } from 'lucide-react';

export default function PaymentFailurePage() {
  const navigate = useNavigate();

  return (
    <div className="container py-16 max-w-2xl">
      <Card>
        <CardContent className="p-12 text-center space-y-6">
          <XCircle className="h-16 w-16 text-destructive mx-auto" />
          <h1 className="text-3xl font-bold">Payment Failed</h1>
          <p className="text-muted-foreground">
            Your payment could not be processed. Please try again.
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => navigate({ to: '/checkout' })}>
              Try Again
            </Button>
            <Button variant="outline" onClick={() => navigate({ to: '/' })}>
              Go Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
