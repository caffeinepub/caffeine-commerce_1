import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetCategories } from '../../hooks/queries/useCatalog';
import { useTranslation } from '../../i18n';

export default function AdminCategoriesPage() {
  const { t } = useTranslation();
  const { data: categories, isLoading } = useGetCategories();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t('admin.categories')}</h1>
      <Card>
        <CardHeader>
          <CardTitle>Category Management</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading...</p>
          ) : (
            <p className="text-muted-foreground">
              {categories?.length || 0} categories available
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
