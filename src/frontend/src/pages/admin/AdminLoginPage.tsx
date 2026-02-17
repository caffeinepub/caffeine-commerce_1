import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getSessionParameter, storeSessionParameter } from '../../utils/urlParams';
import { useActor } from '../../hooks/useActor';
import { AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { actor } = useActor();

  // Only redirect if token exists AND we're not coming from an error state
  // This prevents the redirect loop when access is denied
  useEffect(() => {
    const existingToken = getSessionParameter('caffeineAdminToken');
    // Only auto-redirect if we have a token and no error state
    // If user manually navigates here or comes from access denied, show the form
    if (existingToken && !error) {
      // Small delay to prevent flash
      const timer = setTimeout(() => {
        navigate({ to: '/admin' });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [navigate, error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }

    if (!actor) {
      setError('System not ready. Please try again.');
      return;
    }

    setIsLoading(true);

    try {
      // Call backend to authenticate
      // @ts-ignore - Backend method will be added
      const token = await actor.adminLogin(username, password);
      
      if (!token || typeof token !== 'string') {
        throw new Error('Invalid response from server');
      }

      // Store token in session
      storeSessionParameter('caffeineAdminToken', token);

      // Navigate to admin panel
      navigate({ to: '/admin' });
    } catch (err: any) {
      console.error('Login error:', err);
      
      // Parse error message
      let errorMessage = 'Login failed. Please try again.';
      if (err.message) {
        if (err.message.includes('Invalid username or password')) {
          errorMessage = 'Invalid username or password';
        } else if (err.message.includes('adminLogin')) {
          errorMessage = 'Admin login is not yet configured on the backend. Please contact the system administrator.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
          <CardDescription>
            Enter your credentials to access the admin panel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                autoComplete="username"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                autoComplete="current-password"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              <p>Default admin username: <span className="font-mono font-semibold">admin</span></p>
              <p className="mt-1 text-xs">Default admin password: <span className="font-mono font-semibold">Admin@123</span></p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
