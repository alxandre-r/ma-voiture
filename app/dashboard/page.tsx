/**
 * @file src/app/dashboard/page.tsx
 * @fileoverview Dashboard page with logout + Add Vehicle button + modal
 */

import { createSupabaseServerClient } from '@/lib/supabaseServer';
import LogoutButton from '@/components/LogoutButton';
import AddVehicleClient from './AddVehicleClient';

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();

  // Récupérer l'utilisateur connecté
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <p>Vous devez être connecté pour voir vos véhicules.</p>;
  }

  return (
    <main className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <LogoutButton />
        {/* Composant client qui gère le modal */}
        <AddVehicleClient />
      </div>

      <h1 className="text-2xl font-bold">Your Dashboard</h1>

      <p className="text-gray-500">
        Click the button to add a new vehicle.
      </p>
    </main>
  );
}