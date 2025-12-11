/**
 * @file app/(app)/historique/page.tsx
 * @fileoverview Dedicated history page for all fuel fill-up records.
 * 
 * This page provides a comprehensive view of all fuel fill-ups with
 * detailed information, filtering, and search capabilities.
 */

import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { FillProvider } from '@/contexts/FillContext';
import FillHistoryList from '@/components/fill/FillHistoryList';

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
      <main className="p-6">
        <h1 className="text-3xl font-bold mb-6">Historique</h1>
        <p>Veuillez vous connecter pour accéder à votre historique.</p>
      </main>
    );
  }

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Historique des pleins</h1>
      
      <FillProvider>
        <FillHistoryList />
      </FillProvider>
    </main>
  );
}