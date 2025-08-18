/**
 * supabaseBrowser.ts
 * -----------------
 * Client Supabase côté navigateur.
 * Utilisé pour toutes les opérations côté client (React, appels depuis des pages).
 * 
 * ----------
 * - Utilise la clé publique `anon` de Supabase pour que le navigateur puisse interagir directement avec la BDD.
 * - Sert pour les opérations qui ne nécessitent pas un contexte serveur sécurisé (par exemple : auth via email/password).
 */

import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);