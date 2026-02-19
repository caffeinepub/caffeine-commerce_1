import { useState, useEffect } from 'react';
import { useSearch, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SlidersHorizontal, AlertCircle, RefreshCw } from 'lucide-react';
import ProductCard from '../components/product/ProductCard';
import { useGetProducts, useGetCategories } from '../hooks/queries/useCatalog';
import { ProductGridSkeleton } from '../components/LoadingSkeletons';
import { useTranslation } from '../i18n';
import { Order } from '../backend';
import type { Filter } from '../backend';
import { formatBackendError } from '../utils/backendAvailabilityErrors';

export default function CatalogPage() {
  const searchParams = useSearch({ from: '/catalog' }) as { category?: number; q?: string };
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data: categories } = useGetCategories();

  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(searchParams.category);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | ''>('');
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.q || '');

  // Sync search query with URL params
  useEffect(() => {
    setSearchQuery(searchParams.q || '');
  }, [searchParams.q]);

  // Sync category with URL params
  useEffect(() => {
    setSelectedCategory(searchParams.category);
  }, [searchParams.category]);

  const filters: Filter[] = [];
  
  // Add search filter
  const trimmedQuery = searchQuery.trim();
  if (trimmedQuery) {
    filters.push({ __kind__: 'searchText', searchText: trimmedQuery });
  }
  
  // Add category filter
  if (selectedCategory !== undefined) {
    filters.push({ __kind__: 'category', category: BigInt(selectedCategory) });
  }
  
  // Add price filters
  if (priceRange[0] > 0) {
    filters.push({ __kind__: 'minPrice', minPrice: BigInt(priceRange[0]) });
  }
  if (priceRange[1] < 100000) {
    filters.push({ __kind__: 'maxPrice', maxPrice: BigInt(priceRange[1]) });
  }
  
  // Add sort filter
  if (sortOrder) {
    filters.push({
      __kind__: 'sortByPrice',
      sortByPrice: sortOrder === 'asc' ? Order.less : Order.greater,
    });
  }

  const { data: products, isLoading, error, refetch, isFetching } = useGetProducts(filters);

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <Label className="mb-2 block">{t('common.category')}</Label>
        <Select
          value={selectedCategory?.toString() || 'all'}
          onValueChange={(value) => {
            const newCategory = value === 'all' ? undefined : Number(value);
            setSelectedCategory(newCategory);
            // Update URL to preserve search query
            navigate({
              to: '/catalog',
              search: {
                ...(trimmedQuery && { q: trimmedQuery }),
                ...(newCategory !== undefined && { category: newCategory }),
              },
            });
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories?.map((cat) => (
              <SelectItem key={Number(cat.id)} value={cat.id.toString()}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="mb-2 block">{t('common.priceRange')}</Label>
        <div className="space-y-4">
          <Slider
            value={priceRange}
            onValueChange={(value) => setPriceRange(value as [number, number])}
            min={0}
            max={100000}
            step={1000}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>₹{priceRange[0].toLocaleString()}</span>
            <span>₹{priceRange[1].toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div>
        <Label className="mb-2 block">{t('common.sortBy')}</Label>
        <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as typeof sortOrder)}>
          <SelectTrigger>
            <SelectValue placeholder="Default" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Default</SelectItem>
            <SelectItem value="asc">Price: Low to High</SelectItem>
            <SelectItem value="desc">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t('catalog.title')}</h1>
          {trimmedQuery && (
            <p className="text-muted-foreground">
              Search results for: <span className="font-medium text-foreground">"{trimmedQuery}"</span>
            </p>
          )}
        </div>

        {/* Mobile Filter Button */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="lg:hidden">
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>{t('catalog.filters')}</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-20">
            <h2 className="text-lg font-semibold mb-4">{t('catalog.filters')}</h2>
            <FilterContent />
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {isLoading ? (
            <ProductGridSkeleton />
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>{error.message || formatBackendError(error)}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetch()}
                  disabled={isFetching}
                  className="ml-4 shrink-0"
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
          ) : products && products.length > 0 ? (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                {products.length} product{products.length !== 1 ? 's' : ''} found
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={Number(product.id)} product={product} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              {trimmedQuery
                ? `No products found matching "${trimmedQuery}"`
                : 'No products available. Check back soon!'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
