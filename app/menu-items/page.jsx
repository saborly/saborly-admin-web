import RestaurantAdminDashboard from '../component/dashoard';
import { Suspense } from 'react';

export default function MenuItemsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RestaurantAdminDashboard initialTab="menu-items" />
    </Suspense>
  );
}
