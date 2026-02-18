import { useNavigate } from '@tanstack/react-router';
import { Card } from '@/components/ui/card';
import { useGetCategories } from '../../hooks/queries/useCatalog';
import { CategoryCardSkeleton } from '../LoadingSkeletons';
import { useTranslation } from '../../i18n';
import CategoryImage from '../category/CategoryImage';

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
          className="group cursor-pointer overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0"
          onClick={() => navigate({ to: '/catalog', search: { category: Number(category.id) } })}
        >
          <div className="relative h-40 overflow-hidden">
            <CategoryImage
              imageUrl={category.image}
              alt={category.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="font-semibold text-white text-center text-sm drop-shadow-lg">
                {category.name}
              </h3>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
