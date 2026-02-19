import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, RefreshCw, X, Upload } from 'lucide-react';
import { useAdminAddCategory, useAdminUpdateCategory } from '../../hooks/queries/useAdminCatalog';
import type { Category } from '../../backend';
import { toast } from 'sonner';
import { formatBackendError } from '../../utils/backendAvailabilityErrors';

interface CategoryEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null;
}

export function CategoryEditorDialog({ open, onOpenChange, category }: CategoryEditorDialogProps) {
  const isEditing = !!category;
  const addCategory = useAdminAddCategory();
  const updateCategory = useAdminUpdateCategory();

  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [imageError, setImageError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [lastFailedData, setLastFailedData] = useState<Category | null>(null);

  useEffect(() => {
    if (category) {
      setName(category.name);
      setImageUrl(category.image || '');
      setImagePreview(category.image || '');
    } else {
      setName('');
      setImageUrl('');
      setImagePreview('');
    }
    setImageError('');
    setErrorMessage('');
    setLastFailedData(null);
  }, [category, open]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setImageError('');

    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setImageError('Please select a valid image file (PNG, JPEG, etc.)');
      return;
    }

    // Additional validation for common image formats
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setImageError('Please select a PNG, JPEG, GIF, or WebP image file');
      return;
    }

    // Convert to Data URL
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setImageUrl(dataUrl);
      setImagePreview(dataUrl);
    };
    reader.onerror = () => {
      setImageError('Failed to read the image file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handleClearImage = () => {
    setImageUrl('');
    setImagePreview('');
    setImageError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Category name is required');
      return;
    }

    const categoryData: Category = {
      id: category?.id || 0n,
      name: name.trim(),
      image: imageUrl.trim(),
    };

    try {
      if (isEditing && category) {
        await updateCategory.mutateAsync({ categoryId: category.id, category: categoryData });
        toast.success('Category updated successfully');
      } else {
        await addCategory.mutateAsync({ name: categoryData.name, image: categoryData.image });
        toast.success('Category added successfully');
      }

      setLastFailedData(null);
      onOpenChange(false);
    } catch (error: any) {
      console.error('Failed to save category:', error);
      setErrorMessage(formatBackendError(error));
      setLastFailedData(categoryData);
    }
  };

  const handleRetry = async () => {
    if (!lastFailedData) return;
    
    setErrorMessage('');
    
    try {
      if (isEditing && category) {
        await updateCategory.mutateAsync({ categoryId: category.id, category: lastFailedData });
        toast.success('Category updated successfully');
      } else {
        await addCategory.mutateAsync({ name: lastFailedData.name, image: lastFailedData.image });
        toast.success('Category added successfully');
      }

      setLastFailedData(null);
      onOpenChange(false);
    } catch (error: any) {
      console.error('Retry failed:', error);
      setErrorMessage(formatBackendError(error));
    }
  };

  const isPending = addCategory.isPending || updateCategory.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Category' : 'Add New Category'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the category details below.' : 'Fill in the details to add a new category.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between gap-4">
                <span className="flex-1">{errorMessage}</span>
                {lastFailedData && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRetry}
                    disabled={isPending}
                    className="shrink-0"
                  >
                    {isPending ? (
                      <>
                        <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                        Retrying...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-3 w-3" />
                        Retry
                      </>
                    )}
                  </Button>
                )}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="categoryName">Category Name *</Label>
            <Input
              id="categoryName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter category name"
              disabled={isPending}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoryImage">Category Image</Label>
            <div className="space-y-2">
              {imagePreview ? (
                <div className="relative w-full h-48 border rounded-lg overflow-hidden bg-muted">
                  <img
                    src={imagePreview}
                    alt="Category preview"
                    className="w-full h-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={handleClearImage}
                    disabled={isPending}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Input
                    id="categoryImage"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    disabled={isPending}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('categoryImage')?.click()}
                    disabled={isPending}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                </div>
              )}
              {imageError && (
                <p className="text-sm text-destructive">{imageError}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : isEditing ? 'Update Category' : 'Add Category'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
