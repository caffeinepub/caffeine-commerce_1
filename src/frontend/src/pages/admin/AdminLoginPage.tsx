import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { storeSessionParameter } from '../../utils/urlParams';
import { useAdminActor } from '../../hooks/useAdminActor';
import { AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { actor } = useAdminActor();

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
      // Call backend to authenticate with username/password
      const token = await actor.adminAuthenticate(username, password);
      
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
        if (err.message.includes('Invalid admin credentials') || err.message.includes('Unauthorized')) {
          errorMessage = 'Invalid username or password';
        } else if (err.message.includes('adminAuthenticate')) {
          errorMessage = 'Admin login is not configured. Please contact support.';
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
            Enter your admin credentials to access the admin panel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
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
                  'Login to Admin Panel'
                )}
              </Button>

              <div className="rounded-md border bg-muted p-3 text-center text-sm text-muted-foreground">
                <p>Default credentials:</p>
                <p className="mt-1">Username: <span className="font-mono font-semibold text-foreground">admin</span></p>
                <p className="mt-1">Password: <span className="font-mono font-semibold text-foreground">Admin@123</span></p>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
