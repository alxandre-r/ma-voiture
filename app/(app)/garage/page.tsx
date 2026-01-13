/**
 * @file src/app/garage/page.tsx
 * @fileoverview Garage page showing the user's vehicles and family vehicles. Ability to add vehicles.
 */

import AddVehicleButton from './AddVehicleButton';
import VehicleListPersonal from "@/components/vehicle/VehicleListPersonal";
import VehicleListFamily from "@/components/vehicle/VehicleListFamily";
import { VehicleProvider } from '@/contexts/VehicleContext';

// Main server component
export default function GaragePage() {
  return (
    <main className="px-1 pt-4 pb-24 space-y-3 sm:px-2 sm:space-y-4 lg:px-4 lg:space-y-6">

      <VehicleProvider>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Vos véhicules</h1>

          
          {/* Personal Vehicles Section */}
          <VehicleListPersonal />
          
          {/* Family Vehicles Section - conditionally rendered by the component itself */}
          <VehicleListFamily />

          <AddVehicleButton />

      </VehicleProvider>
    </main>
  );
}