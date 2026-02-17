import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search } from 'lucide-react';
import { useGetProducts } from '../../hooks/queries/useCatalog';
import { useTranslation } from '../../i18n';
import { Order } from '../../backend';
import type { Filter } from '../../backend';

export default function AdminProductsPage() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | ''>('');

  const filters: Filter[] = [];
  
  // Add search filter
  const trimmedQuery = searchQuery.trim();
  if (trimmedQuery) {
    filters.push({ __kind__: 'searchText', searchText: trimmedQuery });
  }
  
  // Add sort filter
  if (sortOption) {
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

  const { data: products, isLoading } = useGetProducts(filters);

  const productList = products || [];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t('admin.products')}</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Product Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
                />
              </div>
            </div>
            
            <div className="w-full sm:w-48">
              <Label htmlFor="sort" className="sr-only">Sort products</Label>
              <Select value={sortOption} onValueChange={(value) => setSortOption(value as typeof sortOption)}>
                <SelectTrigger id="sort">
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Default</SelectItem>
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
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productList.map((product) => (
                      <TableRow key={Number(product.id)}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{Number(product.categoryId)}</TableCell>
                        <TableCell>₹{Number(product.price).toLocaleString()}</TableCell>
                        <TableCell>
                          <span className={Number(product.stock) === 0 ? 'text-destructive' : ''}>
                            {Number(product.stock)}
                          </span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell max-w-xs truncate">
                          {product.description}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {trimmedQuery
                ? `No products found matching "${trimmedQuery}"`
                : 'No products available'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
