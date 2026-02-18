import { Link } from '@tanstack/react-router';
import { Info, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Admin Access</CardTitle>
          <CardDescription>
            Information about admin panel access
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              The admin panel is currently open and does not require authentication. 
              You can access all admin features directly.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Navigate to the admin panel to manage:
            </p>
            <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
              <li>Products and categories</li>
              <li>Orders and customers</li>
              <li>Site settings and configuration</li>
              <li>Payment integration</li>
            </ul>
          </div>

          <Link to="/admin">
            <Button className="w-full">
              Go to Admin Panel
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>

          <p className="text-xs text-muted-foreground text-center">
            Note: In production environments, proper authentication should be implemented for security.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
