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
import { detectBackendUnavailability } from '../../utils/backendAvailabilityErrors';

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
  const [isBackendUnavailable, setIsBackendUnavailable] = useState(false);
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
    setErrorMessage('');
    setImageError('');
    setIsBackendUnavailable(false);
    setLastFailedData(null);
  }, [category, open]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setImageError('Please select a valid image file (JPEG, PNG, GIF, etc.)');
      setImageUrl('');
      setImagePreview('');
      return;
    }

    setImageError('');

    // Convert to Data URL
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      setImageUrl(dataUrl);
      setImagePreview(dataUrl);
    };
    reader.onerror = () => {
      setImageError('Failed to read image file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handleClearImage = () => {
    setImageUrl('');
    setImagePreview('');
    setImageError('');
    // Reset file input
    const fileInput = document.getElementById('categoryImage') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsBackendUnavailable(false);

    // Validation
    if (!name.trim()) {
      setErrorMessage('Category name is required');
      return;
    }

    const categoryData: Category = {
      id: category?.id || 0n,
      name: name.trim(),
      image: imageUrl,
    };

    try {
      if (isEditing && category) {
        await updateCategory.mutateAsync({ categoryId: category.id, category: categoryData });
        toast.success('Category updated successfully');
      } else {
        await addCategory.mutateAsync(categoryData);
        toast.success('Category added successfully');
      }

      setLastFailedData(null);
      onOpenChange(false);
    } catch (error: any) {
      console.error('Failed to save category:', error);
      const errorInfo = detectBackendUnavailability(error);
      setErrorMessage(errorInfo.userMessage);
      setIsBackendUnavailable(errorInfo.isBackendUnavailable);
      setLastFailedData(categoryData);
    }
  };

  const handleRetry = async () => {
    if (!lastFailedData) return;
    
    setErrorMessage('');
    setIsBackendUnavailable(false);
    
    try {
      if (isEditing && category) {
        await updateCategory.mutateAsync({ categoryId: category.id, category: lastFailedData });
        toast.success('Category updated successfully');
      } else {
        await addCategory.mutateAsync(lastFailedData);
        toast.success('Category added successfully');
      }

      setLastFailedData(null);
      onOpenChange(false);
    } catch (error: any) {
      console.error('Retry failed:', error);
      const errorInfo = detectBackendUnavailability(error);
      setErrorMessage(errorInfo.userMessage);
      setIsBackendUnavailable(errorInfo.isBackendUnavailable);
    }
  };

  const isPending = addCategory.isPending || updateCategory.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Category' : 'Add New Category'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the category details below.' : 'Enter details for the new category.'}
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
            <div className="space-y-3">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Category preview"
                    className="w-full h-48 object-cover rounded-lg border"
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
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Click below to upload an image
                  </p>
                </div>
              )}
              <Input
                id="categoryImage"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={isPending}
                className="cursor-pointer"
              />
              {imageError && (
                <p className="text-sm text-destructive">{imageError}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Upload an image that represents this category (e.g., a shirt for Clothing)
              </p>
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
              {isPending ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  Saving...
                </>
              ) : (
                isEditing ? 'Update Category' : 'Add Category'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
