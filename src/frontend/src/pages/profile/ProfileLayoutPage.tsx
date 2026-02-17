import { Link, Outlet } from '@tanstack/react-router';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { useTranslation } from '../../i18n';

export default function ProfileLayoutPage() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (!identity) {
    return (
      <div className="container py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Please login to view your profile</h1>
        <Button onClick={() => navigate({ to: '/' })}>Go to Home</Button>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">{t('nav.profile')}</h1>
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview" asChild>
            <Link to="/profile">Overview</Link>
          </TabsTrigger>
          <TabsTrigger value="addresses" asChild>
            <Link to="/profile/addresses">{t('profile.addresses')}</Link>
          </TabsTrigger>
          <TabsTrigger value="settings" asChild>
            <Link to="/profile/settings">{t('profile.settings')}</Link>
          </TabsTrigger>
        </TabsList>
        <div>
          <Outlet />
        </div>
      </Tabs>
    </div>
  );
}
