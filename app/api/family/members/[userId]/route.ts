/**
 * @file app/api/family/members/[userId]/route.ts
 * @description API endpoint to remove a member from family.
 *
 * This endpoint allows the family owner to remove a member from the family.
 */

import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { NextResponse } from 'next/server';

export async function DELETE(request: Request, { params }: { params: { userId: string } }) {
  try {
    const supabase = await createSupabaseServerClient();
    const userIdToRemove = params.userId;
    
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

    // Check if user is owner of a family
    const { data: familyMember, error: memberError } = await supabase
      .from('family_members')
      .select('family_id, role')
      .eq('user_id', user.id)
      .single();

    if (memberError || !familyMember || familyMember.role !== 'owner') {
      return NextResponse.json(
        { error: 'Seul le propriétaire de la famille peut supprimer des membres' },
        { status: 403 }
      );
    }

    // Prevent owner from removing themselves
    if (userIdToRemove === user.id) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas vous supprimer vous-même. Utilisez la fonctionnalité de transfert de propriété ou quittez la famille.' },
        { status: 400 }
      );
    }

    // Remove the member from family
    const { error: removeError } = await supabase
      .from('family_members')
      .delete()
      .eq('family_id', familyMember.family_id)
      .eq('user_id', userIdToRemove);

    if (removeError) {
      console.error('Erreur Supabase lors de la suppression du membre:', removeError);
      return NextResponse.json(
        { error: 'Erreur lors de la suppression du membre de la famille' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        success: true,
        message: 'Membre supprimé de la famille avec succès'
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Erreur serveur lors de la suppression du membre:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la suppression du membre' },
      { status: 500 }
    );
  }
}