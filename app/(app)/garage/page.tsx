/**
 * @file src/app/garage/page.tsx
 * @fileoverview Garage page showing the user's vehicles. Ability to add vehicles.
 */

import AddVehicleClient from './AddVehicleClient';
import VehicleList from "@/components/VehicleList";
import { VehicleProvider } from '@/contexts/VehicleContext';

export default function GaragePage() {

  return (
    <main className="px-6 pb-24 space-y-6">
      <VehicleProvider>
        {/* Garage Section with integrated add button */}
        <section className="bg-gray-800/30 p-6 rounded-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Vos véhicules</h2>
            <AddVehicleClient />
          </div>
          
          <VehicleList />
        </section>
      </VehicleProvider>
    </main>
  );
}