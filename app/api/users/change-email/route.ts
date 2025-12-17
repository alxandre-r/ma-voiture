/**
 * @file app/api/users/change-email/route.ts
 * @description API endpoint for changing user email.
 * 
 * This endpoint handles the email change process with proper validation and security.
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

    const { newEmail } = await request.json();

    // Validate email format
    if (!newEmail || !newEmail.includes('@') || !newEmail.includes('.')) {
      return NextResponse.json(
        { error: 'Adresse email invalide' },
        { status: 400 }
      );
    }

    // Update email in Supabase
    const { data, error } = await supabase.auth.updateUser({
      email: newEmail,
    });

    if (error) {
      console.error('Erreur Supabase lors du changement d\'email:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour de l\'email' },
        { status: 500 }
      );
    }

    // Update email in vehicles table if needed
    await supabase
      .from('vehicles')
      .update({ owner: newEmail })
      .eq('owner', user.email);

    return NextResponse.json(
      { 
        success: true,
        message: 'Email mis à jour avec succès',
        user: data.user 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Erreur serveur lors du changement d\'email:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la mise à jour de l\'email' },
      { status: 500 }
    );
  }
}