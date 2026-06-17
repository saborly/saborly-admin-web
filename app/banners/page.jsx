import RestaurantAdminDashboard from '../component/dashoard';
import { Suspense } from 'react';

export default function BannersPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RestaurantAdminDashboard initialTab="banners" />
    </Suspense>
  );
}
