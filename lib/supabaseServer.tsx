/**
 * @file lib/supabaseServer.ts
 * @fileoverview Fournit un createSupabaseServerClient() asynchrone qui lit les cookies
 *              via next/headers pour permettre au serveur (middleware, server components)
 *              d'accéder à la session Supabase.
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Retourne un Supabase client côté serveur lié aux cookies de la requête.
 * @returns SupabaseClient
 */
export const createSupabaseServerClient = async () => {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set() {
          /* next gère la réponse côté serveur */
        },
        remove() {
          /* next gère la suppression si besoin */
        },
      },
    }
  );
};