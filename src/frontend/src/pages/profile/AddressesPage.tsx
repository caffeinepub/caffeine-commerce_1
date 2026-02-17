import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '../../i18n';

export default function AddressesPage() {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('profile.addresses')}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Address management will be available soon
        </p>
      </CardContent>
    </Card>
  );
}
