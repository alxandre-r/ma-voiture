import { NextResponse } from 'next/server';

import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();

    // Récupérer l'utilisateur connecté
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non autorisé - utilisateur non connecté' },
        { status: 401 },
      );
    }

    // Récupérer toutes les familles de l'utilisateur (multi-famille)
    const { data: familyMemberships, error: fmError } = await supabase
      .from('family_members')
      .select('family_id')
      .eq('user_id', user.id);

    if (fmError) {
      console.error('Erreur lors de la vérification de la famille:', fmError);
    }

    const hasFamily = !!(familyMemberships && familyMemberships.length > 0);

    // Récupérer les infos de profil utilisateur
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Erreur lors de la récupération du profil utilisateur:', profileError);
      return NextResponse.json(
        {
          id: user.id,
          email: user.email,
          name: null,
          hasFamily,
        },
        { status: 200 },
      );
    }

    return NextResponse.json(
      {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        hasFamily,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("Erreur serveur lors de la récupération de l'utilisateur:", err);
    return NextResponse.json(
      { error: "Erreur serveur lors de la récupération de l'utilisateur" },
      { status: 500 },
    );
  }
}
