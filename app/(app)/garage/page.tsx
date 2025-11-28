/**
 * @file src/app/garage/page.tsx
 * @fileoverview Garage page showing the user's vehicles. Ability to add vehicles.
 */

import AddVehicleClient from './AddVehicleClient';
import VehicleList from "@/components/VehicleList";

export default async function GaragePage() {

  return (
    <main className="space-y-6">


      <div className="mt-4">
          <VehicleList />
      </div>

            <div className="flex justify-between items-center">
        <AddVehicleClient />
      </div>

    </main>
  );
}