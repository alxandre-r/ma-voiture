import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { NextResponse } from 'next/server';

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
        { status: 401 }
      );
    }

    // Récupérer si l'utilisateur fait partie d'une famille
    const { data: familyMemberData, error: fmError } = await supabase
      .from('family_members')
      .select('family_id')
      .eq('user_id', user.id)
      .single(); // un user ne peut être que dans une famille

    if (fmError && fmError.code !== 'PGRST116') { // PGRST116 = 0 rows
      console.error('Erreur lors de la vérification de la famille:', fmError);
    }

    const hasFamily = !!familyMemberData?.family_id;

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
          full_name: null,
          hasFamily,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        id: profile.id,
        email: profile.email,
        full_name: profile.name,
        hasFamily,
      },
      { status: 200 }
    );

  } catch (err) {
    console.error('Erreur serveur lors de la récupération de l\'utilisateur:', err);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la récupération de l\'utilisateur' },
      { status: 500 }
    );
  }
}