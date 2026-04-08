'use server';

import { createSupabaseServerClient } from '../../supabase/server';

export async function getUserFamilyIds(): Promise<string[]> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('family_members')
    .select('family_id')
    .eq('user_id', user.id);

  if (error) {
    console.error('Error fetching family IDs:', error);
    return [];
  }

  return data?.map((d) => d.family_id) ?? [];
}
