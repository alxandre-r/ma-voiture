import { cache } from 'react';

import { createSupabaseServerClient } from '@/lib/supabase/server';

import type { UserPreferences } from '@/types/userPreferences';

export const getUserPreferences = cache(async (): Promise<UserPreferences | null> => {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error) return null;
  return data as UserPreferences;
});
