import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetWishlist } from '../hooks/queries/useCartWishlist';
import { useGetProducts } from '../hooks/queries/useCatalog';
import ProductCard from '../components/product/ProductCard';
import { useTranslation } from '../i18n';

export default function WishlistPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { t } = useTranslation();
  const { data: wishlist, isLoading } = useGetWishlist();
  const { data: products } = useGetProducts();

  if (!identity) {
    return (
      <div className="container py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Please login to view your wishlist</h1>
        <Button onClick={() => navigate({ to: '/' })}>Go to Home</Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4" />
          <div className="grid grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-64 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const productList = products || [];
  const wishlistProducts = productList.filter((p) =>
    wishlist?.productIds.some((id) => id === p.id)
  );

  if (wishlistProducts.length === 0) {
    return (
      <div className="container py-16 text-center">
        <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h1 className="text-2xl font-bold mb-4">Your wishlist is empty</h1>
        <Button onClick={() => navigate({ to: '/catalog' })}>Continue Shopping</Button>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">{t('nav.wishlist')}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {wishlistProducts.map((product) => (
          <ProductCard key={Number(product.id)} product={product} />
        ))}
      </div>
    </div>
  );
}
