import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import BannerCarousel from '../components/home/BannerCarousel';
import CategoriesGrid from '../components/home/CategoriesGrid';
import ProductCard from '../components/product/ProductCard';
import { useGetProducts } from '../hooks/queries/useCatalog';
import { ProductGridSkeleton } from '../components/LoadingSkeletons';
import { useTranslation } from '../i18n';

export default function HomePage() {
  const { data: products, isLoading } = useGetProducts();
  const { t } = useTranslation();

  const featuredProducts = (products || []).slice(0, 8);

  return (
    <div className="container py-8 space-y-12">
      <BannerCarousel />

      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">{t('home.categories')}</h2>
        </div>
        <CategoriesGrid />
      </section>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">{t('home.featured')}</h2>
          <Button variant="outline" asChild>
            <Link to="/catalog">{t('home.viewAll')}</Link>
          </Button>
        </div>
        {isLoading ? (
          <ProductGridSkeleton />
        ) : featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={Number(product.id)} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No products available
          </div>
        )}
      </section>
    </div>
  );
}
