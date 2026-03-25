// lib/data/user/getCurrentUserInfo.tsx
// SSR Fetch des informations de l'utilisateur connecté depuis la vue "users_info" pour les pages nécessitant des données utilisateur.

import { cache } from 'react';

import { createSupabaseServerClient } from '@/lib/supabase/server';

// Using React's cache() for proper intra-request memoization
// Note: React cache() works with dynamic data (cookies) unlike unstable_cache
export const getCurrentUserInfo = cache(async () => {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase.from('users_info').select('*').eq('id', user.id).single();
  if (error) {
    throw new Error(`Failed to fetch user info: ${error.message}`);
  }
  return data;
});
