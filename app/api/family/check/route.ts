/**
 * @file app/api/family/check/route.ts
 * @description API endpoint to check if user has a family.
 *
 * This endpoint checks if the authenticated user is already part of a family.
 */

import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    
    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Non autorisé - utilisateur non connecté' },
        { status: 401 }
      );
    }

    // Check if user is part of a family
    const { data: familyMember, error } = await supabase
      .from('family_members')
      .select('family_id, role')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Erreur Supabase lors de la vérification de la famille:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la vérification de la famille' },
        { status: 500 }
      );
    }

    if (familyMember) {
      // Get family details
      const { data: family, error: familyError } = await supabase
        .from('families')
        .select('*')
        .eq('id', familyMember.family_id)
        .single();

      if (familyError) {
        console.error('Erreur Supabase lors de la récupération de la famille:', familyError);
        return NextResponse.json(
          { error: 'Erreur lors de la récupération de la famille' },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { 
          hasFamily: true,
          family: {
            ...family,
            userRole: familyMember.role
          } 
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { 
        hasFamily: false 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Erreur serveur lors de la vérification de la famille:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la vérification de la famille' },
      { status: 500 }
    );
  }
}