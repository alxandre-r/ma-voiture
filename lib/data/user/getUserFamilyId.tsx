// SSR utilities for authentication and user profile retrieval

'use server';

import { createSupabaseServerClient } from '../../supabase/supabaseServer';

export async function getUserFamilyId(userId: string): Promise<string | null> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from('family_members')
    .select('family_id')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error getting family ID:', error);
    return null;
  }

  return data.family_id;
}
