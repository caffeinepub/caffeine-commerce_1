import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ArrowRight, Upload, X, RefreshCw } from 'lucide-react';
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    categoryId: '',
    imageUrl: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [imageError, setImageError] = useState('');
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
    setErrorMessage('');
    setImageError('');
    setLastFailedData(null);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [product, open]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setImageError('');

    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setImageError('Please select a valid image file (PNG, JPEG, etc.)');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Additional validation for common image formats
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setImageError('Please select a PNG, JPEG, GIF, or WebP image file');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Convert to Data URL
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setFormData({ ...formData, imageUrl: dataUrl });
    };
    reader.onerror = () => {
      setImageError('Failed to read the image file. Please try again.');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  const handleClearImage = () => {
    setFormData({ ...formData, imageUrl: '' });
    setImageError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Validation
    if (!formData.name.trim()) {
      setErrorMessage('Product name is required');
      return;
    }
    if (!formData.description.trim()) {
      setErrorMessage('Product description is required');
      return;
    }
    if (!formData.price || Number(formData.price) < 0) {
      setErrorMessage('Valid price is required');
      return;
    }
    if (!formData.stock || Number(formData.stock) < 0) {
      setErrorMessage('Valid stock quantity is required');
      return;
    }
    if (!formData.categoryId) {
      setErrorMessage('Category is required');
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
      setErrorMessage(errorInfo.userMessage);
      setLastFailedData(productData);
    }
  };

  const handleRetry = async () => {
    if (!lastFailedData) return;
    
    setErrorMessage('');
    
    try {
      if (isEditing && product) {
        await updateProduct.mutateAsync({ productId: product.id, product: lastFailedData });
        toast.success('Product updated successfully');
      } else {
        await addProduct.mutateAsync(lastFailedData);
        toast.success('Product added successfully');
      }

      setLastFailedData(null);
      onOpenChange(false);
    } catch (error: any) {
      console.error('Retry failed:', error);
      const errorInfo = detectBackendUnavailability(error);
      setErrorMessage(errorInfo.userMessage);
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
  const saveErrorInfo = errorMessage ? detectBackendUnavailability({ message: errorMessage }) : null;
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

          {hasCategoriesError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {isCategoriesBackendUnavailable 
                  ? 'Unable to load categories. Please ensure the backend is running.'
                  : 'Failed to load categories. Please try again.'}
              </AlertDescription>
            </Alert>
          )}

          {hasNoCategories && !hasCategoriesError && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>No categories available. Please create a category first.</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleNavigateToCategories}
                >
                  Go to Categories
                  <ArrowRight className="ml-2 h-3 w-3" />
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="productName">Product Name *</Label>
              <Input
                id="productName"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter product name"
                disabled={isPending}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryId">Category *</Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                disabled={isPending || categoriesLoading || hasNoCategories}
              >
                <SelectTrigger id="categoryId">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categoryList.map((cat) => (
                    <SelectItem key={Number(cat.id)} value={Number(cat.id).toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter product description"
              disabled={isPending}
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (₹) *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0"
                disabled={isPending}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Stock Quantity *</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                placeholder="0"
                disabled={isPending}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUpload">Product Image</Label>
            <div className="space-y-2">
              {formData.imageUrl ? (
                <div className="relative border rounded-lg p-4 bg-muted/50">
                  <img
                    src={formData.imageUrl}
                    alt="Product preview"
                    className="w-full h-48 object-contain rounded"
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
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPEG, GIF, or WebP (recommended: 800x800px)
                  </p>
                </div>
              )}
              <Input
                ref={fileInputRef}
                id="imageUpload"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={isPending}
                className="cursor-pointer"
              />
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
            <Button type="submit" disabled={isPending || hasNoCategories}>
              {isPending ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  Saving...
                </>
              ) : (
                isEditing ? 'Update Product' : 'Add Product'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
