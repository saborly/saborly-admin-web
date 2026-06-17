import RestaurantAdminDashboard from '../component/dashoard';
import { Suspense } from 'react';

export default function SettingsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RestaurantAdminDashboard initialTab="settings" />
    </Suspense>
  );
}
