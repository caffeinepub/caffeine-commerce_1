import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetCallerUserRole } from '../../hooks/queries/useAuthz';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, Loader2, AlertCircle } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

export default function AdminLoginPage() {
  const { identity, login, clear, loginStatus } = useInternetIdentity();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: userRole, isLoading: roleLoading, error: roleError } = useGetCallerUserRole();
  const [loginError, setLoginError] = useState<string | null>(null);

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  // Redirect to admin dashboard if already authenticated as admin
  useEffect(() => {
    if (isAuthenticated && !roleLoading && userRole === 'admin') {
      navigate({ to: '/admin' });
    }
  }, [isAuthenticated, roleLoading, userRole, navigate]);

  const handleLogin = async () => {
    setLoginError(null);
    try {
      // Clear any stale authentication state first
      await clear();
      queryClient.clear();
      
      // Small delay to ensure cleanup completes
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Attempt login
      await login();
    } catch (error: any) {
      console.error('Login error:', error);
      setLoginError(error.message || 'Login failed. Please try again.');
      
      // If user is already authenticated error, clear and retry
      if (error.message === 'User is already authenticated') {
        await clear();
        queryClient.clear();
        setTimeout(async () => {
          try {
            await login();
          } catch (err: any) {
            setLoginError(err.message || 'Login failed. Please try again.');
          }
        }, 300);
      }
    }
  };

  if (isAuthenticated && roleLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Admin Login</CardTitle>
          <CardDescription>
            Sign in with Internet Identity to access the admin panel
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Admin access requires authentication with Internet Identity and admin role assignment.
            </AlertDescription>
          </Alert>

          {loginError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{loginError}</AlertDescription>
            </Alert>
          )}

          {roleError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to verify admin role. Please try logging in again.
              </AlertDescription>
            </Alert>
          )}

          <Button 
            onClick={handleLogin} 
            disabled={isLoggingIn}
            className="w-full"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging in...
              </>
            ) : (
              'Login with Internet Identity'
            )}
          </Button>

          {isAuthenticated && userRole !== 'admin' && !roleLoading && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You are logged in but do not have admin privileges. Please contact the system administrator.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
