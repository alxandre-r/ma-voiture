/**
 * @file app/api/fills/delete/route.tsx
 * @fileoverview API endpoint for deleting fuel fill-up records.
 *
 * This endpoint handles DELETE requests to remove fill-up records
 * with proper authentication and ownership verification.
 */

import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

import { createSupabaseServerClient } from '@/lib/supabase/server';

/**
 * DELETE /api/fills/delete
 *
 * Delete an existing fuel fill-up record.
 * Requires authentication and ownership verification.
 *
 * Request body should contain:
 * - fillId: number (required)
 */
export async function DELETE(request: Request) {
  const supabase = await createSupabaseServerClient();

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Non autorisé - utilisateur non connecté' }, { status: 401 });
  }

  try {
    // Parse request body
    const body = await request.json();

    // Validate required field
    if (!body.fillId) {
      return NextResponse.json({ error: 'Le champ fillId est requis' }, { status: 400 });
    }

    // Verify fill ownership - we need to get the expense_id to check ownership
    const { data: existingFill, error: fillError } = await supabase
      .from('fills')
      .select('id, expense_id, vehicle_id, date')
      .eq('id', body.fillId)
      .single();

    if (fillError || !existingFill) {
      return NextResponse.json({ error: 'Plein non trouvé' }, { status: 404 });
    }

    // Get the expense to check ownership
    const { data: existingExpense, error: expenseError } = await supabase
      .from('expenses')
      .select('owner_id, vehicle_id')
      .eq('id', existingFill.expense_id)
      .single();

    if (expenseError || !existingExpense) {
      return NextResponse.json({ error: 'Dépense associée non trouvée' }, { status: 404 });
    }

    if (existingExpense.owner_id !== user.id) {
      const { data: vehicle } = await supabase
        .from('vehicles_for_display')
        .select('permission_level')
        .eq('vehicle_id', existingExpense.vehicle_id)
        .maybeSingle();
      if (vehicle?.permission_level !== 'write') {
        return NextResponse.json(
          { error: "Vous n'êtes pas autorisé à supprimer ce plein" },
          { status: 403 },
        );
      }
    }

    // Delete fill record (will cascade delete expense due to foreign key)
    const { error } = await supabase.from('fills').delete().eq('id', body.fillId);

    if (error) {
      console.error('Error deleting fill:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la suppression du plein' },
        { status: 500 },
      );
    }

    revalidatePath('/', 'layout');
    return NextResponse.json(
      {
        message: 'Plein supprimé avec succès',
        fillId: body.fillId,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ error: 'Erreur serveur inattendue' }, { status: 500 });
  }
}
