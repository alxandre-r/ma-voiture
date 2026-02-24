// lib/data/user/getCurrentUserInfo.tsx
// SSR Fetch des informations de l'utilisateur connecté depuis la vue "users_info" pour les pages nécessitant des données utilisateur.

import { cache } from 'react';

import { createSupabaseServerClient } from '../../supabase/supabaseServer';

import { getCurrentUser } from './getCurrentUser';

export const getCurrentUserInfo = cache(async () => {
  const supabase = await createSupabaseServerClient();
  const user = await getCurrentUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('users_info') // On récupère les données depuis la vue
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    throw new Error(`Failed to fetch user info: ${error.message}`);
  }

  return data;
});
