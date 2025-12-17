/**
 * @file app/api/users/change-password/route.ts
 * @description API endpoint for changing user password.
 * 
 * This endpoint handles the password change process with proper validation and security.
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

    const { oldPassword, newPassword } = await request.json();

    // Validate passwords
    if (!oldPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Les deux mots de passe sont requis' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Le nouveau mot de passe doit contenir au moins 6 caractères' },
        { status: 400 }
      );
    }

    // First, reauthenticate user with old password
    const { error: reauthError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: oldPassword,
    });

    if (reauthError) {
      console.error('Erreur d\'authentification avec l\'ancien mot de passe:', reauthError);
      return NextResponse.json(
        { error: 'Ancien mot de passe incorrect' },
        { status: 401 }
      );
    }

    // Update password in Supabase
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      console.error('Erreur Supabase lors du changement de mot de passe:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour du mot de passe' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        success: true,
        message: 'Mot de passe mis à jour avec succès',
        user: data.user 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Erreur serveur lors du changement de mot de passe:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la mise à jour du mot de passe' },
      { status: 500 }
    );
  }
}