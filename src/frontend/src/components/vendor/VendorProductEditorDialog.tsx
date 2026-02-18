import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ArrowRight, Upload, X, RefreshCw } from 'lucide-react';
import { useVendorAddProduct, useVendorUpdateProduct } from '../../hooks/queries/useVendorProducts';
import { useAdminGetCategories } from '../../hooks/queries/useAdminCatalog';
import type { Product, ProductInput } from '../../backend';
import { toast } from 'sonner';
import { useNavigate } from '@tanstack/react-router';
import { detectBackendUnavailability } from '../../utils/backendAvailabilityErrors';

interface VendorProductEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
}

export function VendorProductEditorDialog({ open, onOpenChange, product }: VendorProductEditorDialogProps) {
  const isEditing = !!product;
  const addProduct = useVendorAddProduct();
  const updateProduct = useVendorUpdateProduct();
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
  const [stockError, setStockError] = useState('');
  const [lastFailedData, setLastFailedData] = useState<ProductInput | null>(null);

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
    setStockError('');
    setLastFailedData(null);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [product, open]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setImageError('');

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setImageError('Please select a valid image file (PNG, JPEG, etc.)');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setImageError('Please select a PNG, JPEG, GIF, or WebP image file');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

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

  const handleStockChange = (value: string) => {
    setStockError('');
    setFormData({ ...formData, stock: value });
    
    if (value.trim() === '') {
      setStockError('Stock quantity is required');
      return;
    }
    
    const stockNum = Number(value);
    if (isNaN(stockNum)) {
      setStockError('Stock must be a valid number');
      return;
    }
    
    if (!Number.isInteger(stockNum)) {
      setStockError('Stock must be a whole number');
      return;
    }
    
    if (stockNum < 0) {
      setStockError('Stock cannot be negative');
      return;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setStockError('');

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
    
    if (!formData.stock || formData.stock.trim() === '') {
      setStockError('Stock quantity is required');
      return;
    }
    
    const stockNum = Number(formData.stock);
    if (isNaN(stockNum)) {
      setStockError('Stock must be a valid number');
      return;
    }
    
    if (!Number.isInteger(stockNum)) {
      setStockError('Stock must be a whole number');
      return;
    }
    
    if (stockNum < 0) {
      setStockError('Stock cannot be negative');
      return;
    }
    
    if (!formData.categoryId) {
      setErrorMessage('Category is required');
      return;
    }

    const productInput: ProductInput = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: BigInt(formData.price),
      stock: BigInt(stockNum),
      categoryId: BigInt(formData.categoryId),
      imageUrl: formData.imageUrl.trim(),
    };

    try {
      if (isEditing && product) {
        await updateProduct.mutateAsync({ productId: product.id, input: productInput });
        toast.success('Product updated successfully');
      } else {
        await addProduct.mutateAsync(productInput);
        toast.success('Product added successfully');
      }

      setLastFailedData(null);
      onOpenChange(false);
    } catch (error: any) {
      console.error('Failed to save product:', error);
      const errorInfo = detectBackendUnavailability(error);
      setErrorMessage(errorInfo.userMessage);
      setLastFailedData(productInput);
    }
  };

  const handleRetry = async () => {
    if (!lastFailedData) return;
    
    setErrorMessage('');
    
    try {
      if (isEditing && product) {
        await updateProduct.mutateAsync({ productId: product.id, input: lastFailedData });
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
  
  const categoriesErrorInfo = categoriesError ? detectBackendUnavailability(categoriesError) : null;
  const isCategoriesBackendUnavailable = categoriesErrorInfo?.isBackendUnavailable || false;
  const hasCategoriesError = !!categoriesError;
  const hasNoCategories = !categoriesLoading && categoryList.length === 0;

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
                <span>No categories available. Please ask the admin to create categories first.</span>
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
              rows={4}
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
                step="1"
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
                step="1"
                value={formData.stock}
                onChange={(e) => handleStockChange(e.target.value)}
                placeholder="0"
                disabled={isPending}
                required
                className={stockError ? 'border-destructive' : ''}
              />
              {stockError && (
                <p className="text-sm text-destructive">{stockError}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUpload">Product Image</Label>
            <div className="space-y-2">
              {formData.imageUrl ? (
                <div className="relative w-full h-48 border rounded-lg overflow-hidden bg-muted">
                  <img
                    src={formData.imageUrl}
                    alt="Product preview"
                    className="w-full h-full object-contain"
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
                    id="imageUpload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    disabled={isPending}
                    ref={fileInputRef}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
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
            <Button type="submit" disabled={isPending || hasNoCategories || !!stockError}>
              {isPending ? 'Saving...' : isEditing ? 'Update Product' : 'Add Product'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
