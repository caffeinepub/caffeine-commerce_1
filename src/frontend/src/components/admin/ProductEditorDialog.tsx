import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { useAdminAddProduct, useAdminUpdateProduct, useAdminGetCategories } from '../../hooks/queries/useAdminCatalog';
import type { Product } from '../../backend';
import { toast } from 'sonner';
import { useNavigate } from '@tanstack/react-router';
import { detectBackendUnavailability } from '../../utils/backendAvailabilityErrors';

interface ProductEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
}

export function ProductEditorDialog({ open, onOpenChange, product }: ProductEditorDialogProps) {
  const isEditing = !!product;
  const addProduct = useAdminAddProduct();
  const updateProduct = useAdminUpdateProduct();
  const { data: categories, isLoading: categoriesLoading, error: categoriesError } = useAdminGetCategories();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    categoryId: '',
    imageUrl: '',
  });
  const [validationError, setValidationError] = useState('');
  const [lastFailedData, setLastFailedData] = useState<Product | null>(null);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        price: Number(product.price).toString(),
        stock: Number(product.stock).toString(),
        categoryId: Number(product.categoryId).toString(),
        imageUrl: product.imageUrl,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        stock: '',
        categoryId: '',
        imageUrl: '',
      });
    }
    setValidationError('');
    setLastFailedData(null);
  }, [product, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    // Validation
    if (!formData.name.trim()) {
      setValidationError('Product name is required');
      return;
    }
    if (!formData.description.trim()) {
      setValidationError('Product description is required');
      return;
    }
    if (!formData.price || Number(formData.price) < 0) {
      setValidationError('Valid price is required');
      return;
    }
    if (!formData.stock || Number(formData.stock) < 0) {
      setValidationError('Valid stock quantity is required');
      return;
    }
    if (!formData.categoryId) {
      setValidationError('Category is required');
      return;
    }

    const productData: Product = {
      id: product?.id || 0n,
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: BigInt(formData.price),
      stock: BigInt(formData.stock),
      categoryId: BigInt(formData.categoryId),
      imageUrl: formData.imageUrl.trim(),
    };

    try {
      if (isEditing && product) {
        await updateProduct.mutateAsync({ productId: product.id, product: productData });
        toast.success('Product updated successfully');
      } else {
        await addProduct.mutateAsync(productData);
        toast.success('Product added successfully');
      }

      setLastFailedData(null);
      onOpenChange(false);
    } catch (error: any) {
      console.error('Failed to save product:', error);
      const errorInfo = detectBackendUnavailability(error);
      setValidationError(errorInfo.userMessage);
      setLastFailedData(productData);
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

  const handleNavigateToCategories = () => {
    onOpenChange(false);
    navigate({ to: '/admin/categories' });
  };

  const isPending = addProduct.isPending || updateProduct.isPending;
  const categoryList = categories || [];
  
  // Detect backend unavailability for categories
  const categoriesErrorInfo = categoriesError ? detectBackendUnavailability(categoriesError) : null;
  const isCategoriesBackendUnavailable = categoriesErrorInfo?.isBackendUnavailable || false;
  const hasCategoriesError = !!categoriesError;
  const hasNoCategories = !categoriesLoading && categoryList.length === 0;
  
  // Detect backend unavailability for product save
  const saveErrorInfo = validationError ? detectBackendUnavailability({ message: validationError }) : null;
  const isSaveBackendUnavailable = saveErrorInfo?.isBackendUnavailable || false;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the product details below.' : 'Fill in the details to add a new product.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {validationError && (
            <Alert variant={isSaveBackendUnavailable ? 'destructive' : 'destructive'}>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>{validationError}</span>
                {isSaveBackendUnavailable && lastFailedData && (
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

          {hasCategoriesError && isCategoriesBackendUnavailable && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {categoriesErrorInfo?.userMessage || 'The backend service is currently unavailable. Please try again in a moment.'}
              </AlertDescription>
            </Alert>
          )}

          {hasCategoriesError && !isCategoriesBackendUnavailable && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load categories. Please refresh the page and try again.
              </AlertDescription>
            </Alert>
          )}

          {hasNoCategories && !hasCategoriesError && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex flex-col gap-3">
                <span>No categories available. You need to create at least one category before adding products.</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleNavigateToCategories}
                  className="w-fit"
                >
                  Go to Categories
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter product name"
              disabled={isPending || hasNoCategories}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter product description"
              rows={4}
              disabled={isPending || hasNoCategories}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0"
                disabled={isPending || hasNoCategories}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Stock *</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                placeholder="0"
                disabled={isPending || hasNoCategories}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            {categoriesLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                Loading categories...
              </div>
            ) : (
              <Select
                value={formData.categoryId}
                onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                disabled={isPending || hasNoCategories || hasCategoriesError}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categoryList.map((category) => (
                    <SelectItem key={Number(category.id)} value={Number(category.id).toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="https://example.com/image.jpg"
              disabled={isPending || hasNoCategories}
            />
            <p className="text-xs text-muted-foreground">
              Optional: Enter a URL for the product image
            </p>
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
            <Button type="submit" disabled={isPending || hasNoCategories || hasCategoriesError}>
              {isPending ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  {isEditing ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                <>{isEditing ? 'Update Product' : 'Add Product'}</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
