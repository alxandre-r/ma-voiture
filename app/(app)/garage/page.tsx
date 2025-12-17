/**
 * @file src/app/garage/page.tsx
 * @fileoverview Garage page showing the user's vehicles. Ability to add vehicles.
 */

import AddVehicleClient from './AddVehicleClient';
import VehicleList from "@/components/VehicleList";
import { VehicleProvider } from '@/contexts/VehicleContext';

export default function GaragePage() {

  return (
    <main className="px-1 pb-24 space-y-3 sm:px-2 sm:space-y-4 lg:px-4 lg:space-y-6">
      <VehicleProvider>
        {/* Garage Section with integrated add button */}
        <section className="bg-white dark:bg-gray-800 p-2 rounded-lg sm:p-3 lg:p-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Vos véhicules</h1>
            <AddVehicleClient />
          </div>
          
          <VehicleList />
        </section>
      </VehicleProvider>
    </main>
  );
}