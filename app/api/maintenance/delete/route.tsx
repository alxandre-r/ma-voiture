/**
 * @file app/api/maintenance/delete/route.tsx
 * @fileoverview API endpoint for deleting maintenance expense records.
 *
 * This endpoint handles DELETE requests to remove maintenance expenses
 * with proper authentication and ownership verification.
 */

import { NextResponse } from 'next/server';

import { createSupabaseServerClient } from '@/lib/supabase/server';

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
    const { expenseId } = body;

    if (!expenseId) {
      return NextResponse.json({ error: 'Le champ expenseId est requis' }, { status: 400 });
    }

    // Verify expense ownership before deletion
    const { data: expense, error: expenseError } = await supabase
      .from('expenses')
      .select('id, owner_id, type')
      .eq('id', expenseId)
      .eq('type', 'maintenance')
      .single();

    if (expenseError || !expense) {
      return NextResponse.json({ error: 'Entretien non trouvé' }, { status: 404 });
    }

    if (expense.owner_id !== user.id) {
      return NextResponse.json(
        { error: "Vous n'êtes pas autorisé à supprimer cet entretien" },
        { status: 403 },
      );
    }

    // Delete the expense (cascade will handle maintenance_expenses deletion)
    const { error: deleteError } = await supabase
      .from('expenses')
      .delete()
      .eq('id', expenseId)
      .eq('owner_id', user.id);

    if (deleteError) {
      console.error('Error deleting maintenance expense:', deleteError);
      return NextResponse.json(
        { error: "Erreur lors de la suppression de l'entretien" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        message: 'Entretien supprimé avec succès',
      },
      { status: 200 },
    );
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ error: 'Erreur serveur inattendue' }, { status: 500 });
  }
}
