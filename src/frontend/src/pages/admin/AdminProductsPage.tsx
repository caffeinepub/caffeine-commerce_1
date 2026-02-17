import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search, Plus, Pencil, Trash2, AlertCircle, RefreshCw } from 'lucide-react';
import { useAdminGetProducts, useAdminDeleteProduct } from '../../hooks/queries/useAdminCatalog';
import { useTranslation } from '../../i18n';
import { Order } from '../../backend';
import type { Filter, Product } from '../../backend';
import { ProductEditorDialog } from '../../components/admin/ProductEditorDialog';
import { toast } from 'sonner';
import { detectBackendUnavailability } from '../../utils/backendAvailabilityErrors';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function AdminProductsPage() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'default'>('default');
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const filters: Filter[] = [];
  
  // Add search filter
  const trimmedQuery = searchQuery.trim();
  if (trimmedQuery) {
    filters.push({ __kind__: 'searchText', searchText: trimmedQuery });
  }
  
  // Add sort filter - only add valid sort options
  if (sortOption && sortOption !== 'default') {
    if (sortOption === 'name-asc') {
      filters.push({ __kind__: 'sortByName', sortByName: Order.less });
    } else if (sortOption === 'name-desc') {
      filters.push({ __kind__: 'sortByName', sortByName: Order.greater });
    } else if (sortOption === 'price-asc') {
      filters.push({ __kind__: 'sortByPrice', sortByPrice: Order.less });
    } else if (sortOption === 'price-desc') {
      filters.push({ __kind__: 'sortByPrice', sortByPrice: Order.greater });
    }
  }

  const { data: products, isLoading, error, refetch, isFetching } = useAdminGetProducts(filters);
  const deleteProduct = useAdminDeleteProduct();

  const productList = products || [];
  
  // Detect backend unavailability
  const errorInfo = error ? detectBackendUnavailability(error) : null;
  const isBackendUnavailable = errorInfo?.isBackendUnavailable || false;

  const handleAddProduct = () => {
    setEditingProduct(null);
    setEditorOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setEditorOpen(true);
  };

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    try {
      await deleteProduct.mutateAsync(productToDelete.id);
      toast.success('Product deleted successfully');
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    } catch (error: any) {
      console.error('Failed to delete product:', error);
      const deleteErrorInfo = detectBackendUnavailability(error);
      toast.error(deleteErrorInfo.userMessage);
    }
  };

  const handleRetry = () => {
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('admin.products')}</h1>
        <Button onClick={handleAddProduct} disabled={isBackendUnavailable}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Product Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && isBackendUnavailable && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>{errorInfo?.userMessage}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRetry}
                  disabled={isFetching}
                  className="ml-4"
                >
                  {isFetching ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Retrying...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Retry
                    </>
                  )}
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {error && !isBackendUnavailable && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>{errorInfo?.userMessage || 'Failed to load products. Please refresh and try again.'}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRetry}
                  disabled={isFetching}
                  className="ml-4"
                >
                  {isFetching ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Retrying...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Retry
                    </>
                  )}
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search" className="sr-only">Search products</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  type="search"
                  placeholder="Search products by name or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                  disabled={isBackendUnavailable}
                />
              </div>
            </div>
            
            <div className="w-full sm:w-48">
              <Label htmlFor="sort" className="sr-only">Sort products</Label>
              <Select value={sortOption} onValueChange={(value) => setSortOption(value as typeof sortOption)} disabled={isBackendUnavailable}>
                <SelectTrigger id="sort">
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="name-asc">Name: A to Z</SelectItem>
                  <SelectItem value="name-desc">Name: Z to A</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading products...</div>
          ) : productList.length > 0 ? (
            <>
              <p className="text-sm text-muted-foreground">
                {productList.length} product{productList.length !== 1 ? 's' : ''} found
              </p>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category ID</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead className="hidden md:table-cell">Description</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productList.map((product) => (
                      <TableRow key={Number(product.id)}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{Number(product.categoryId)}</TableCell>
                        <TableCell>₹{Number(product.price).toLocaleString()}</TableCell>
                        <TableCell>{Number(product.stock)}</TableCell>
                        <TableCell className="hidden md:table-cell max-w-xs truncate">
                          {product.description}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditProduct(product)}
                              title="Edit product"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick(product)}
                              title="Delete product"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          ) : !error ? (
            <div className="text-center py-8 text-muted-foreground">
              {trimmedQuery
                ? `No products found matching "${trimmedQuery}"`
                : 'No products available. Click "Add Product" to create your first product.'}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <ProductEditorDialog
        open={editorOpen}
        onOpenChange={setEditorOpen}
        product={editingProduct}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{productToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteProduct.isPending}
            >
              {deleteProduct.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
