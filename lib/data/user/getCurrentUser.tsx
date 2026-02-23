// lib/data/user/auth.tsx
// SSR fetch de l'utilisateur connecté et de son ID via les cookies de session Supabase.
// Utilisé dans les pages.tsx pour fetch les données spécifiques à l'utilisateur via SSR.

import { cache } from "react"
import { createSupabaseServerClient } from "@/lib/supabase/supabaseServer"

export const getCurrentUser = cache(async () => {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) return null

  return user
})