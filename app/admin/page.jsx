import RestaurantAdminDashboard from '../component/dashoard';
import { Suspense } from 'react';

export default function Dashoard() {

  return (
      <Suspense fallback={<div>Loading...</div>}>

        <RestaurantAdminDashboard />
        </Suspense>

  )
  
}