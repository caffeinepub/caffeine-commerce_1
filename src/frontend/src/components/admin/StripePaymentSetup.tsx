import { useState } from 'react';
import { useAdminStripeConfigured, useSetStripeConfiguration } from '../../hooks/queries/useStripe';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function StripePaymentSetup() {
  const { data: isConfigured, isLoading } = useAdminStripeConfigured();
  const setConfiguration = useSetStripeConfiguration();
  const [secretKey, setSecretKey] = useState('');
  const [countries, setCountries] = useState('US,CA,GB');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!secretKey.trim()) {
      toast.error('Please enter a Stripe secret key');
      return;
    }

    const allowedCountries = countries
      .split(',')
      .map((c) => c.trim().toUpperCase())
      .filter((c) => c.length === 2);

    if (allowedCountries.length === 0) {
      toast.error('Please enter at least one valid country code');
      return;
    }

    try {
      await setConfiguration.mutateAsync({
        secretKey: secretKey.trim(),
        allowedCountries,
      });
      toast.success('Stripe configuration saved successfully');
      setSecretKey('');
    } catch (error: any) {
      console.error('Failed to save Stripe configuration:', error);
      toast.error(error.message || 'Failed to save Stripe configuration');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Stripe Payment Setup</h1>
        <p className="text-muted-foreground mt-2">
          Configure Stripe to accept payments from customers
        </p>
      </div>

      {isConfigured ? (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            Stripe is configured and ready to accept payments
          </AlertDescription>
        </Alert>
      ) : (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Stripe is not configured. Please set up your Stripe credentials below.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Stripe Configuration</CardTitle>
          <CardDescription>
            Enter your Stripe secret key and allowed countries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="secretKey">Stripe Secret Key</Label>
              <Input
                id="secretKey"
                type="password"
                placeholder="sk_test_..."
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                disabled={setConfiguration.isPending}
              />
              <p className="text-sm text-muted-foreground">
                Your Stripe secret key (starts with sk_test_ or sk_live_)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="countries">Allowed Countries</Label>
              <Input
                id="countries"
                type="text"
                placeholder="US,CA,GB"
                value={countries}
                onChange={(e) => setCountries(e.target.value)}
                disabled={setConfiguration.isPending}
              />
              <p className="text-sm text-muted-foreground">
                Comma-separated list of 2-letter country codes (e.g., US,CA,GB)
              </p>
            </div>

            <Button
              type="submit"
              disabled={setConfiguration.isPending}
            >
              {setConfiguration.isPending ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  Saving...
                </>
              ) : (
                'Save Configuration'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
