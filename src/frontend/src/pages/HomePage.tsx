import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';
import BannerCarousel from '../components/home/BannerCarousel';
import CategoriesGrid from '../components/home/CategoriesGrid';
import ProductCard from '../components/product/ProductCard';
import { useGetProducts } from '../hooks/queries/useCatalog';
import { ProductGridSkeleton } from '../components/LoadingSkeletons';
import { useTranslation } from '../i18n';

export default function HomePage() {
  const { data: products, isLoading, error, refetch, isFetching } = useGetProducts();
  const { t } = useTranslation();

  const featuredProducts = (products || []).slice(0, 8);

  return (
    <div className="container py-8 space-y-12">
      <BannerCarousel />

      {/* Featured Products section - prioritized to load first with immediate skeleton */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">{t('home.featured')}</h2>
          <Button variant="outline" asChild>
            <Link to="/catalog">{t('home.viewAll')}</Link>
          </Button>
        </div>
        {isLoading ? (
          <ProductGridSkeleton />
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error.message}</span>
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
        ) : featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={Number(product.id)} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No products available yet. Check back soon!
          </div>
        )}
      </section>

      {/* Categories section - rendered after Featured Products */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">{t('home.categories')}</h2>
        </div>
        <CategoriesGrid />
      </section>
    </div>
  );
}
