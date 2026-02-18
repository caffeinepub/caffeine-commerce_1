import { useParams, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Heart, ShoppingCart } from 'lucide-react';
import { useGetProducts } from '../hooks/queries/useCatalog';
import { useAddToCart } from '../hooks/queries/useCartWishlist';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { toast } from 'sonner';
import ProductImage from '../components/product/ProductImage';
import { useTranslation } from '../i18n';

export default function ProductDetailsPage() {
  const { productId } = useParams({ from: '/product/$productId' });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { t } = useTranslation();
  const { data: products, isLoading } = useGetProducts();
  const addToCart = useAddToCart();

  const product = (products || []).find((p) => p.id.toString() === productId);

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-96 bg-muted rounded-lg" />
          <div className="h-8 bg-muted rounded w-1/2" />
          <div className="h-4 bg-muted rounded w-1/4" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Product not found</h1>
        <Button onClick={() => navigate({ to: '/catalog' })}>Back to Catalog</Button>
      </div>
    );
  }

  const isOutOfStock = product.stock === 0n;

  const handleAddToCart = () => {
    if (!identity) {
      toast.error('Please login to add items to cart');
      return;
    }

    addToCart.mutate(product.id, {
      onSuccess: () => {
        toast.success('Added to cart');
      },
      onError: (error) => {
        toast.error(error instanceof Error ? error.message : 'Failed to add to cart');
      },
    });
  };

  const handleAddToWishlist = () => {
    if (!identity) {
      toast.error('Please login to add items to wishlist');
      return;
    }
    toast.success('Added to wishlist');
  };

  return (
    <div className="container py-8">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="aspect-square overflow-hidden rounded-lg bg-muted">
          <ProductImage
            imageUrl={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <div className="flex items-center gap-2">
              {isOutOfStock ? (
                <Badge variant="destructive">{t('product.outOfStock')}</Badge>
              ) : (
                <Badge variant="secondary">{t('product.inStock')}</Badge>
              )}
            </div>
          </div>

          <div>
            <p className="text-4xl font-bold text-primary">
              ₹{Number(product.price).toLocaleString()}
            </p>
          </div>

          <Separator />

          <div>
            <h2 className="font-semibold mb-2">{t('product.description')}</h2>
            <p className="text-muted-foreground">{product.description}</p>
          </div>

          <div className="flex gap-4">
            {isOutOfStock ? (
              <div className="flex-1 py-3 px-6 text-center text-base font-medium text-muted-foreground bg-muted rounded-md">
                Out of Stock
              </div>
            ) : (
              <Button
                size="lg"
                className="flex-1"
                disabled={addToCart.isPending}
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {addToCart.isPending ? 'Adding...' : t('product.addToCart')}
              </Button>
            )}
            <Button
              size="lg"
              variant="outline"
              onClick={handleAddToWishlist}
            >
              <Heart className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
