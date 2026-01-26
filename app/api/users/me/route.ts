/**
 * @file app/api/users/me/route.ts
 * @description API endpoint to get current user information.
 *
 * This endpoint returns the authenticated user's information including ID, email, etc.
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

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('users_profile')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Erreur Supabase lors de la récupération du profil utilisateur:', profileError);
      // Return basic user info even if profile is not found
      return NextResponse.json(
        {
          email: user.email,
          full_name: null,
          ...user
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        email: user.email,
        full_name: profile.full_name,
        ...profile,
        id: user.id
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Erreur serveur lors de la récupération de l\'utilisateur:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la récupération de l\'utilisateur' },
      { status: 500 }
    );
  }
}