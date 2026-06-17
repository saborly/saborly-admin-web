import RestaurantAdminDashboard from '../component/dashoard';
import { Suspense } from 'react';

export default function OrdersPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RestaurantAdminDashboard initialTab="orders" />
    </Suspense>
  );
}
