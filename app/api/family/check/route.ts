/**
 * @file app/api/family/check/route.ts
 * @description API endpoint to check if user has families (multi-famille).
 */

import { NextResponse } from 'next/server';

import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Non autorisé - utilisateur non connecté' },
        { status: 401 },
      );
    }

    // Récupère toutes les familles de l'utilisateur
    const { data: memberships, error } = await supabase
      .from('family_members')
      .select('family_id, role')
      .eq('user_id', user.id);

    if (error) {
      console.error('Erreur Supabase lors de la vérification de la famille:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la vérification de la famille' },
        { status: 500 },
      );
    }

    if (!memberships || memberships.length === 0) {
      return NextResponse.json({ hasFamily: false, families: [] }, { status: 200 });
    }

    // Récupère les détails de chaque famille
    const familyIds = memberships.map((m) => m.family_id);
    const { data: families, error: familiesError } = await supabase
      .from('families')
      .select('*')
      .in('id', familyIds);

    if (familiesError) {
      console.error('Erreur Supabase lors de la récupération des familles:', familiesError);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des familles' },
        { status: 500 },
      );
    }

    const familiesWithRole = (families ?? []).map((family) => {
      const membership = memberships.find((m) => m.family_id === family.id);
      return {
        ...family,
        userRole: membership?.role ?? 'member',
      };
    });

    return NextResponse.json({ hasFamily: true, families: familiesWithRole }, { status: 200 });
  } catch (error) {
    console.error('Erreur serveur lors de la vérification de la famille:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la vérification de la famille' },
      { status: 500 },
    );
  }
}
