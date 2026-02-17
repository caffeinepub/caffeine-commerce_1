import { useState, useEffect } from 'react';
import { useSearch, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { SlidersHorizontal } from 'lucide-react';
import ProductCard from '../components/product/ProductCard';
import { useGetProducts, useGetCategories } from '../hooks/queries/useCatalog';
import { ProductGridSkeleton } from '../components/LoadingSkeletons';
import { useTranslation } from '../i18n';
import { Order } from '../backend';
import type { Filter } from '../backend';

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

  const { data: products, isLoading } = useGetProducts(filters);

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
        <Label className="mb-2 block">{t('common.price')} Range</Label>
        <Slider
          min={0}
          max={100000}
          step={1000}
          value={priceRange}
          onValueChange={(value) => setPriceRange(value as [number, number])}
          className="mb-2"
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>₹{priceRange[0].toLocaleString()}</span>
          <span>₹{priceRange[1].toLocaleString()}</span>
        </div>
      </div>

      <div>
        <Label className="mb-2 block">{t('common.sort')} by {t('common.price')}</Label>
        <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as 'asc' | 'desc' | '')}>
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

  const productList = products || [];

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">{t('nav.catalog')}</h1>
          {trimmedQuery && (
            <p className="text-sm text-muted-foreground mt-1">
              Search results for "{trimmedQuery}"
            </p>
          )}
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="lg:hidden">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              {t('common.filter')}
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>{t('common.filter')}</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex gap-8">
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-24">
            <h2 className="font-semibold mb-4">{t('common.filter')}</h2>
            <FilterContent />
          </div>
        </aside>

        <div className="flex-1">
          {isLoading ? (
            <ProductGridSkeleton />
          ) : productList.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {productList.map((product) => (
                <ProductCard key={Number(product.id)} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              {trimmedQuery
                ? `No products found matching "${trimmedQuery}"`
                : 'No products found matching your filters'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
