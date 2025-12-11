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
    <main className="px-6 pb-24 space-y-6">
      <FillProvider>
        {/* Consumption Section with integrated add button */}
        <section className="bg-gray-800/30 p-6 rounded-lg">
          <div className="flex justify-between items-center mb-6">
            <AddFillClient vehicles={vehicles || []} />
          </div>
          
          <FillList />
        </section>
        
        {/* Vehicle Overview Section - With background */}
        <section className="bg-gray-800/30 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Vos véhicules</h2>
          
          {vehicles && vehicles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vehicles.map((vehicle) => (
                <div key={vehicle.id} className="bg-gray-800 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">{vehicle.name || `${vehicle.make} ${vehicle.model}`}</h3>
                  <p className="text-sm text-gray-400">
                    {vehicle.make} {vehicle.model}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">
              Vous n&#39;avez pas encore ajouté de véhicules. <a href="/garage" className="text-blue-400 hover:underline">Ajoutez un véhicule</a> pour commencer à suivre votre consommation.
            </p>
          )}
        </section>
      </FillProvider>
    </main>
  );
}