import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { createClient } from '@supabase/supabase-js';

export async function POST() {
  try {
    // Récupération de l'utilisateur connecté depuis les cookies
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (!user || userError) {
      return NextResponse.json({ error: "Utilisateur non authentifié" }, { status: 401 });
    }

    // Client admin avec service_role pour supprimer le compte
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id);

    if (error) {
      return NextResponse.json({ error: "Erreur lors de la suppression du compte. DEBUG: " + error.message }, { status: 500 });
    }

    // Pas besoin de token côté front pour signOut ici, mais tu peux nettoyer côté serveur si tu veux
    await supabase.auth.signOut();

    return NextResponse.json({ message: "Compte supprimé avec succès" }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "Erreur serveur: " + (err as Error).message }, { status: 500 });
  }
}