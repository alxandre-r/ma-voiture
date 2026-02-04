/**
 * @file app/api/family/members/route.ts
 * @description API endpoint to get family members.
 *
 * This endpoint retrieves all members of a family including their details.
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
    const { data: familyMember, error: memberError } = await supabase
      .from('family_members')
      .select('family_id, role')
      .eq('user_id', user.id)
      .single();

    if (memberError || !familyMember) {
      return NextResponse.json(
        { error: 'Vous ne faites partie d\'aucune famille' },
        { status: 404 }
      );
    }

    // Get all family members with user details using the view
    const { data: members, error: membersError } = await supabase
      .from('family_for_display')
      .select('*')
      .eq('family_id', familyMember.family_id);

    if (membersError) {
      console.error('Erreur Supabase lors de la récupération des membres:', membersError);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des membres de la famille' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        members: members,
        currentUserRole: familyMember.role,
        currentUserId: user.id
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Erreur serveur lors de la récupération des membres:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la récupération des membres' },
      { status: 500 }
    );
  }
}