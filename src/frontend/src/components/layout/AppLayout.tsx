import { Outlet } from '@tanstack/react-router';
import Header from './Header';
import Footer from './Footer';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import OfflineBanner from '../pwa/OfflineBanner';
import A2HSInstallPrompt from '../pwa/A2HSInstallPrompt';

export default function AppLayout() {
  const { isInitializing } = useInternetIdentity();

  // Always use BISAULI as document title
  useDocumentTitle('BISAULI');

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading BISAULI...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <OfflineBanner />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <A2HSInstallPrompt />
    </div>
  );
}
