import RestaurantAdminDashboard from '../component/dashoard';
import { Suspense } from 'react';

export default function CategoriesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RestaurantAdminDashboard initialTab="categories" />
    </Suspense>
  );
}
