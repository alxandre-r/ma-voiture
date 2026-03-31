/**
 * @file app/api/family/join/route.ts
 * @description API endpoint to join a family using an invitation token.
 */

import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Non autorisé - utilisateur non connecté' },
        { status: 401 },
      );
    }

    // Parse request body
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: "Le token d'invitation est requis" }, { status: 400 });
    }

    // Check if user already has a family
    const { data: existingFamilyMember } = await supabase
      .from('family_members')
      .select('family_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingFamilyMember) {
      return NextResponse.json({ error: "Vous faites déjà partie d'une famille" }, { status: 400 });
    }

    // Find family with matching invite token
    const { data: family, error: familyError } = await supabase
      .from('families')
      .select('*')
      .eq('invite_token', token)
      .maybeSingle();

    if (familyError) {
      console.error('Erreur Supabase:', familyError);
      return NextResponse.json(
        { error: 'Erreur lors de la recherche de la famille' },
        { status: 500 },
      );
    }

    if (!family) {
      return NextResponse.json(
        { error: "Token d'invitation invalide ou famille introuvable" },
        { status: 404 },
      );
    }

    // Add user to family members
    const { error: memberError } = await supabase
      .from('family_members')
      .insert({
        family_id: family.id,
        user_id: user.id,
        role: 'member',
      })
      .select()
      .maybeSingle();

    if (memberError) {
      console.error('Erreur Supabase:', memberError);
      return NextResponse.json({ error: "Erreur lors de l'ajout à la famille" }, { status: 500 });
    }

    revalidatePath('/', 'layout');
    return NextResponse.json(
      {
        message: 'Vous avez rejoint la famille avec succès',
        family: {
          ...family,
          userRole: 'member',
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Erreur serveur:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la jointure de la famille' },
      { status: 500 },
    );
  }
}
