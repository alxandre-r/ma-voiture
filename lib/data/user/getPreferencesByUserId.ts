import { cache } from 'react';

import { createSupabaseServerClient } from '@/lib/supabase/server';

import type { UserPreferences } from '@/types/userPreferences';

export const getPreferencesByUserId = cache(
  async (userId: string): Promise<UserPreferences | null> => {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) return null;
    return data as UserPreferences;
  },
);
