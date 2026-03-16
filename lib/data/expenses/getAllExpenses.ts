// lib/data/expenses/getAllExpenses.ts
// SSR fetch des dépenses de tout type pour des véhicules ids.
// Utilisé dans dashboard/page.tsx pour afficher les dernières dépenses de l'utilisateur et de sa famille.

import { cache } from 'react';

import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';

export const getAllExpenses = cache(async (vehicleIds: number[]) => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('expenses_for_display')
    .select('*')
    .in('vehicle_id', vehicleIds)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching all expenses:', error);
    return null;
  }

  return data;
});
