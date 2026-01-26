/**
 * @file app/api/family/leave/route.ts
 * @description API endpoint for leaving a family.
 *
 * This endpoint handles the process of a user leaving a family.
 */

import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { NextResponse } from 'next/server';

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
        { status: 401 }
      );
    }

    const { familyId } = await request.json();

    // Validate family ID
    if (!familyId) {
      return NextResponse.json(
        { error: 'L\'ID de la famille est requis' },
        { status: 400 }
      );
    }

    // Check if user is member of the family
    const { data: familyMember, error: memberError } = await supabase
      .from('family_members')
      .select('role')
      .eq('family_id', familyId)
      .eq('user_id', user.id)
      .single();

    if (memberError || !familyMember) {
      return NextResponse.json(
        { error: 'Vous ne faites pas partie de cette famille ou elle n\'existe pas' },
        { status: 403 }
      );
    }

    // Prevent owner from leaving (they should delete the family instead)
    if (familyMember.role === 'owner') {
      return NextResponse.json(
        { error: 'Le propriétaire ne peut pas quitter la famille. Supprimez la famille à la place.' },
        { status: 403 }
      );
    }

    // Remove the user from the family
    const { error: leaveError } = await supabase
      .from('family_members')
      .delete()
      .eq('family_id', familyId)
      .eq('user_id', user.id);

    if (leaveError) {
      console.error('Erreur Supabase lors de la sortie de la famille:', leaveError);
      return NextResponse.json(
        { error: 'Erreur lors de la sortie de la famille' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        success: true,
        message: 'Vous avez quitté la famille avec succès' 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Erreur serveur lors de la sortie de la famille:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la sortie de la famille' },
      { status: 500 }
    );
  }
}