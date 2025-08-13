/**
 * supabaseServer.ts
 * -----------------
 * Client Supabase côté serveur.
 * Utilisé pour interagir avec Supabase dans les API routes, middleware et server components.
 * 
 * ----------
 * - Permet de lire les cookies HTTP sécurisés contenant la session utilisateur.
 * - Évite d'exposer la clé `service_role` côté client.
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const createSupabaseServerClient = async () => {
    const cookieStore = await cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
        cookies: {
            get(name: string) {
            return cookieStore.get(name)?.value;
            }
        },
        }
    );
};
