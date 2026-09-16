import RestaurantAdminDashboard from '../component/dashoard';
import { Suspense } from 'react';

export default function DriversPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RestaurantAdminDashboard initialTab="drivers" />
    </Suspense>
  );
}
