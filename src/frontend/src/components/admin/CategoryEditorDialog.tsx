import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
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
  const [validationError, setValidationError] = useState('');
  const [lastFailedData, setLastFailedData] = useState<Category | null>(null);

  useEffect(() => {
    if (category) {
      setName(category.name);
    } else {
      setName('');
    }
    setValidationError('');
    setLastFailedData(null);
  }, [category, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    // Validation
    if (!name.trim()) {
      setValidationError('Category name is required');
      return;
    }

    const categoryData: Category = {
      id: category?.id || 0n,
      name: name.trim(),
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
      setValidationError(errorInfo.userMessage);
      setLastFailedData(categoryData);
    }
  };

  const handleRetry = () => {
    if (lastFailedData) {
      setValidationError('');
      // Trigger form submission with the last failed data
      const syntheticEvent = { preventDefault: () => {} } as React.FormEvent;
      handleSubmit(syntheticEvent);
    }
  };

  const isPending = addCategory.isPending || updateCategory.isPending;
  const errorInfo = validationError ? detectBackendUnavailability({ message: validationError }) : null;
  const isBackendUnavailable = errorInfo?.isBackendUnavailable || false;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Category' : 'Add New Category'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the category name below.' : 'Enter a name for the new category.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {validationError && (
            <Alert variant={isBackendUnavailable ? 'destructive' : 'destructive'}>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>{validationError}</span>
                {isBackendUnavailable && lastFailedData && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRetry}
                    disabled={isPending}
                    className="ml-4"
                  >
                    {isPending ? 'Retrying...' : 'Retry'}
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
