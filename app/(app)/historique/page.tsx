/**
 * @summary Historique page (Server Component).
 *
 * Fetches vehicles owned by the user and their family,
 * then retrieves associated fills before passing data
 * to the client component.
 *
 * Redirects to home if the user is not authenticated.
 *
 * @remarks
 * All data fetching is performed server-side to reduce
 * client requests and improve initial load performance.
 */

import { redirect } from 'next/navigation';
import React from 'react';

import { getCurrentUser } from '@/lib/data/user/getCurrentUser';
import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';

import HistoriqueClient from './HistoriqueClient';

import type { Fill } from '@/types/fill';

/**
 * Server page responsible for loading vehicles and fill history.
 *
 * @returns JSX page containing the HistoriqueClient component.
 * @throws Redirects to "/" if no authenticated user is found.
 */
export default async function HistoriquePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/');
  }

  const supabase = await createSupabaseServerClient();

  // Récupérer les véhicules de l'utilisateur
  const { data: userVehicles } = await supabase
    .from('vehicles_for_display')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false });

  // Récupérer les véhicules de la famille
  const { data: familyData } = await supabase
    .from('family_members')
    .select('family_id')
    .eq('user_id', user.id)
    .single();

  let familyVehicles = [];
  if (familyData && familyData.family_id) {
    const { data: familyVehData } = await supabase
      .from('vehicles_for_display')
      .select('*')
      .eq('family_id', familyData.family_id)
      .neq('owner_id', user.id)
      .order('created_at', { ascending: false });

    if (familyVehData) {
      familyVehicles = familyVehData;
    }
  }

  const allVehicles = [...(userVehicles || []), ...familyVehicles];
  const vehicleIds = allVehicles.map((v) => v.vehicle_id).filter((id) => id > 0);

  // Récupérer les pleins pour ces véhicules
  let fills: Fill[] = [];
  if (vehicleIds.length > 0) {
    const { data: fillsData } = await supabase
      .from('fills_for_display')
      .select('*')
      .in('vehicle_id', vehicleIds)
      .order('date', { ascending: false });

    if (fillsData) {
      fills = fillsData;
    }
  }

  return (
    <main>
      <HistoriqueClient vehicles={allVehicles} fills={fills} />
    </main>
  );
}
