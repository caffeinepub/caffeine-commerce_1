import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useGetSiteSettings, useUpdateSiteSettings } from '../../hooks/queries/useSiteSettings';
import { AlertCircle, CheckCircle2, Upload } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSiteSettingsPage() {
  const { data: siteSettings, isLoading: isLoadingSettings } = useGetSiteSettings();
  const updateSettings = useUpdateSiteSettings();

  const [logoPreview, setLogoPreview] = useState('');
  const [logoDataUrl, setLogoDataUrl] = useState('');
  const [validationError, setValidationError] = useState('');

  // Initialize form with current settings
  useEffect(() => {
    if (siteSettings) {
      setLogoPreview(siteSettings.logo || '');
      setLogoDataUrl(siteSettings.logo || '');
    }
  }, [siteSettings]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setValidationError('Please select a valid image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setValidationError('Image size must be less than 2MB');
      return;
    }

    setValidationError('');

    // Convert to data URL for preview and storage
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      setLogoPreview(dataUrl);
      setLogoDataUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setValidationError('');

    try {
      await updateSettings.mutateAsync({
        shopName: 'BISAULI',
        logo: logoDataUrl,
      });

      toast.success('Site settings updated successfully');
    } catch (error: any) {
      console.error('Failed to update site settings:', error);
      toast.error(error.message || 'Failed to update site settings');
    }
  };

  if (isLoadingSettings) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Site Settings</h1>
        <p className="text-muted-foreground">
          Customize your shop logo
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Branding</CardTitle>
          <CardDescription>
            Update your shop's logo. The shop name is permanently set to BISAULI.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {validationError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}

          {updateSettings.isSuccess && !validationError && (
            <Alert className="border-green-500 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>Settings saved successfully!</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="shopName">Shop Name</Label>
            <Input
              id="shopName"
              type="text"
              value="BISAULI"
              disabled
              className="bg-muted"
            />
            <p className="text-sm text-muted-foreground">
              Shop name is permanently set to BISAULI
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo">Logo</Label>
            <div className="space-y-4">
              {logoPreview && (
                <div className="rounded-lg border bg-muted p-4">
                  <p className="mb-2 text-sm font-medium">Preview:</p>
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="h-16 w-auto object-contain"
                  />
                </div>
              )}
              
              <div className="flex items-center gap-4">
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  disabled={updateSettings.isPending}
                  className="cursor-pointer"
                />
                <Upload className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                Upload a logo image (PNG, JPG, or SVG). Maximum size: 2MB. Recommended dimensions: 512x256px
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                if (siteSettings) {
                  setLogoPreview(siteSettings.logo || '');
                  setLogoDataUrl(siteSettings.logo || '');
                  setValidationError('');
                }
              }}
              disabled={updateSettings.isPending}
            >
              Reset
            </Button>
            <Button
              onClick={handleSave}
              disabled={updateSettings.isPending}
            >
              {updateSettings.isPending ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
