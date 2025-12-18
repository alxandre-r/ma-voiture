/**
 * @file app/(app)/historique/page.tsx
 * @fileoverview Dedicated history page for all fuel fill-up records.
 * 
 * This page provides a comprehensive view of all fuel fill-ups with
 * detailed information, filtering, and search capabilities.
 */

import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { FillProvider } from '@/contexts/FillContext';
import HistoriqueClient from './HistoriqueClient';

/**
 * HistoriquePage Component
 * 
 * Dedicated page for viewing complete fuel fill-up history.
 */
export default async function HistoriquePage() {
  const supabase = await createSupabaseServerClient();
  
  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  
  if (!user) {
    return (
      <main className="px-4 py-3 sm:p-6">
        <h1 className="text-2xl font-bold mb-4 sm:text-3xl">Historique</h1>
        <p>Veuillez vous connecter pour accéder à votre historique.</p>
      </main>
    );
  }

  // Fetch user's vehicles for display
  const { data: vehicles } = await supabase
    .from('vehicles')
    .select('id, name, make, model, odometer')
    .eq('owner', user.id)
    .order('name', { ascending: true });

  return (
    <main className="px-1 py-2 space-y-3 sm:px-2 sm:py-3 sm:space-y-4 lg:px-4 lg:py-6 lg:space-y-6">
      <h1 className="text-xl font-bold text-gray-800 dark:text-white sm:text-2xl lg:text-3xl">Historique des pleins</h1>
      
      <FillProvider>
        <HistoriqueClient vehicles={vehicles || []} />
      </FillProvider>
    </main>
  );
}