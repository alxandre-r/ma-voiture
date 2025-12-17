/**
 * @file src/app/dashboard/page.tsx
 * @fileoverview Dashboard page showing vehicles, fuel fill-ups, and statistics.
 * 
 * This page provides an overview of the user's vehicles and fuel consumption data,
 * with the ability to add and manage fuel fill-up records.
 */

import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { FillProvider } from '@/contexts/FillContext';
import AddFillClient from './AddFillClient';
import FillList from '@/components/fill/FillList';
import VehicleSwitcher from '@/components/vehicle/VehicleSwitcher';
import DashboardClient from './DashboardClient';

/**
 * DashboardPage Component
 * 
 * Main dashboard page with vehicle and fuel fill-up management.
 */
export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  
  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  
  if (!user) {
    return (
      <main className="px-6">
        <p>Veuillez vous connecter pour accéder à votre tableau de bord.</p>
      </main>
    );
  }
  
  // Fetch user's vehicles for the fill form
  const { data: vehicles } = await supabase
    .from('vehicles')
    .select('id, name, make, model, odometer')
    .eq('owner', user.id)
    .order('name', { ascending: true });

  return (
    <main className="px-1 pb-24 space-y-3 sm:px-2 sm:space-y-4 lg:px-4 lg:space-y-6">
      <FillProvider>
        {/* Consumption Section with integrated add button */}
        <section className="bg-white dark:bg-gray-800 p-2 rounded-lg sm:p-3 lg:p-4">
          <DashboardClient vehicles={vehicles || []} />
        </section>
        
        {/* Vehicle Overview Section - With background */}
        <section className="bg-white dark:bg-gray-800 p-2 rounded-lg sm:p-3 lg:p-4 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Vos véhicules</h2>
          
          {vehicles && vehicles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {vehicles.map((vehicle) => (
                <div key={vehicle.id} className="bg-white dark:bg-gray-800 p-2 rounded-lg sm:p-3 border border-gray-200 dark:border-gray-700">
                  <h3 className="font-medium mb-1 text-base sm:text-lg text-gray-800 dark:text-white">{vehicle.name || `${vehicle.make} ${vehicle.model}`}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 sm:text-base">
                    {vehicle.make} {vehicle.model}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              Vous n&#39;avez pas encore ajouté de véhicules. <a href="/garage" className="text-blue-600 hover:underline">Ajoutez un véhicule</a> pour commencer à suivre votre consommation.
            </p>
          )}
        </section>
      </FillProvider>
    </main>
  );
}