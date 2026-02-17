import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent } from '@/components/ui/card';
import { useGetCategories } from '../../hooks/queries/useCatalog';
import { CategoryCardSkeleton } from '../LoadingSkeletons';
import { useTranslation } from '../../i18n';

export default function CategoriesGrid() {
  const { data: categories, isLoading } = useGetCategories();
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <CategoryCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No categories available
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {categories.map((category) => (
        <Card
          key={Number(category.id)}
          className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1"
          onClick={() => navigate({ to: '/catalog', search: { category: Number(category.id) } })}
        >
          <CardContent className="p-6 flex flex-col items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-2xl">📦</span>
            </div>
            <h3 className="font-semibold text-center text-sm">{category.name}</h3>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
