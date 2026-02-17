import { Link } from '@tanstack/react-router';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import ProductImage from './ProductImage';
import { useAddToCart } from '../../hooks/queries/useCartWishlist';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { toast } from 'sonner';
import type { Product } from '../../backend';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const isOutOfStock = product.stock === BigInt(0);
  const { identity } = useInternetIdentity();
  const addToCart = useAddToCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

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

  return (
    <Link to="/product/$productId" params={{ productId: product.id.toString() }}>
      <Card className="h-full cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1">
        <CardHeader className="p-0">
          <div className="relative aspect-square overflow-hidden rounded-t-lg">
            <ProductImage
              imageUrl={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover"
            />
            {isOutOfStock && (
              <Badge variant="destructive" className="absolute top-2 right-2">
                Out of Stock
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold line-clamp-2 mb-2">{product.name}</h3>
          <p className="text-2xl font-bold text-primary">
            ₹{Number(product.price).toLocaleString()}
          </p>
          <Button
            size="sm"
            className="w-full"
            disabled={isOutOfStock || addToCart.isPending}
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {addToCart.isPending ? 'Adding...' : 'Add to Cart'}
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
}
