/**
 * @file src/app/dashboard/page.tsx
 * @fileoverview Dashboard page showing user's vehicles and form to add new ones.
 */

import VehicleForm from '@/components/VehicleForm';
import LogoutButton from '@/components/LogoutButton';

import { createSupabaseServerClient } from '@/lib/supabaseServer';

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();

  // Récupérer l'utilisateur connecté
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // On pourrait ici rediriger vers /sign-in ou afficher un message
    return <p>Vous devez être connecté pour voir vos véhicules.</p>;
  }

  // Récupérer les véhicules
  const { data: vehicles, error } = await supabase
    .from('vehicles')
    .select('*')
    .eq('owner', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return <p className="text-red-500">Erreur : {error.message}</p>;
  }

  return (
    <main className="p-6 space-y-6">
      <LogoutButton />
      <h1 className="text-2xl font-bold">Your Vehicles</h1>

      {vehicles?.length ? (
        <ul className="space-y-2">
          {vehicles.map((vehicle) => (
            <li
              key={vehicle.id}
              className="p-3 border rounded-lg shadow-sm bg-white dark:bg-zinc-800"
            >
              <p className="font-semibold">{vehicle.make} {vehicle.model}</p>
              <p className="text-sm text-gray-500">
                Added on {new Date(vehicle.created_at).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No vehicles yet. Add one below.</p>
      )}

      <VehicleForm />
    </main>
  );
}