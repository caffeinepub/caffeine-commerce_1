import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useIsStripeConfigured } from '../../hooks/queries/useStripe';
import { useTranslation } from '../../i18n';

export default function StripePaymentSetup() {
  const { t } = useTranslation();
  const { data: isConfigured, isLoading } = useIsStripeConfigured();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t('admin.stripe')}</h1>
      <Card>
        <CardHeader>
          <CardTitle>Stripe Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading...</p>
          ) : isConfigured ? (
            <p className="text-green-600">Stripe is configured</p>
          ) : (
            <p className="text-muted-foreground">
              Stripe configuration is required for payment processing
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
