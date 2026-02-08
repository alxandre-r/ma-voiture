/**
 * @file app/api/users/change-name/route.ts
 * @description API endpoint for changing user name.
 * 
 * This endpoint handles the name change process with proper validation and security.
 */

import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { error } from 'console';
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

    const { newName } = await request.json();

    // Validate name format
    if (!newName || newName.trim().length === 0) {
      return NextResponse.json(
        { error: 'Nom invalide' },
        { status: 400 }
      );
    }

    // Update name in users table
    await supabase
      .from('users')
      .update({ name: newName.trim() })
      .eq('id', user.id);

    return NextResponse.json(
      { 
        success: true,
        message: 'Nom mis à jour avec succès',
        user: user
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Erreur serveur lors du changement de nom:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la mise à jour du nom' },
      { status: 500 }
    );
  }
}