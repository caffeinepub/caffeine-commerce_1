import { useNavigate } from '@tanstack/react-router';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { useGetCategories } from '../../hooks/queries/useCatalog';
import { CategoryCardSkeleton } from '../LoadingSkeletons';
import { useTranslation } from '../../i18n';
import CategoryImage from '../category/CategoryImage';
import { formatBackendError } from '../../utils/backendAvailabilityErrors';

export default function CategoriesGrid() {
  const { data: categories, isLoading, error, refetch, isFetching } = useGetCategories();
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <CategoryCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>{formatBackendError(error)}</span>
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
    );
  }

  const categoryList = categories || [];

  if (categoryList.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No categories available yet. Check back soon!
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
      {categoryList.map((category) => (
        <Card
          key={Number(category.id)}
          className="group relative overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:scale-105"
          onClick={() => navigate({ to: '/catalog', search: { category: Number(category.id) } })}
        >
          <div className="aspect-square relative">
            <CategoryImage
              imageUrl={category.image}
              alt={category.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="text-white text-lg font-semibold drop-shadow-lg">
                {category.name}
              </h3>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
