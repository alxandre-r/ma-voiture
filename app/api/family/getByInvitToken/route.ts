import { NextResponse } from 'next/server';

import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { searchParams } = new URL(request.url);
    const inviteToken = searchParams.get('token');

    if (!inviteToken) {
      return NextResponse.json({ error: "Token d'invitation requis" }, { status: 400 });
    }

    // Get family directly by invite token from family_for_display view
    // where invite_token is token and role is 'owner' (to get owner info in the same query)
    const { data: family, error } = await supabase
      .from('family_for_display')
      .select('family_id, family_name, created_at, user_name, user_id, email')
      .eq('invite_token', inviteToken)
      .eq('role', 'owner')
      .maybeSingle();

    if (error) {
      console.error('Erreur Supabase:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération de la famille' },
        { status: 500 },
      );
    }

    if (!family) {
      return NextResponse.json({ error: 'Token invalide ou famille introuvable' }, { status: 404 });
    }

    return NextResponse.json({
      id: family.family_id,
      name: family.family_name,
      created_at: family.created_at,
      owner_id: family.user_id,
      owner_user: {
        id: family.user_id,
        name: family.user_name || 'Propriétaire',
        email: family.email,
      },
    });
  } catch (err) {
    console.error('Erreur serveur:', err);
    return NextResponse.json({ error: 'Erreur interne serveur' }, { status: 500 });
  }
}
