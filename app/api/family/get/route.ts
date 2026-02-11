import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { searchParams } = new URL(request.url);
    const inviteToken = searchParams.get('token');

    if (!inviteToken) {
      return NextResponse.json({ error: "Token d'invitation requis" }, { status: 400 });
    }

    // Vérifier utilisateur connecté
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé - utilisateur non connecté' }, { status: 401 });
    }

    // Récupérer la famille via la vue family_for_display
    const { data, error } = await supabase
      .from('family_for_display')
      .select(`
        family_id,
        family_name,
        family_created_at,
        family_owner_id,
        owner_email:email,
        owner_name:user_name
      `)
      .eq('invite_token', inviteToken)
      .eq('role', 'owner')
      .limit(1)
      .single();


    if (error) {
      console.error('Erreur Supabase:', error);
      return NextResponse.json({ error: 'Erreur lors de la récupération de la famille' }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Token invalide ou famille introuvable' }, { status: 404 });
    }

    return NextResponse.json({
      id: data.family_id,
      name: data.family_name,
      created_at: data.family_created_at,
      owner_id: data.family_owner_id,
      owner_user: {
        id: data.family_owner_id,
        name: data.owner_name,
      },
    });

  } catch (err) {
    console.error('Erreur serveur:', err);
    return NextResponse.json({ error: 'Erreur interne serveur' }, { status: 500 });
  }
}