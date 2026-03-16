/**
 * @file app/api/expenses/delete/route.tsx
 * @fileoverview API endpoint for deleting expense records.
 *
 * This endpoint handles DELETE requests to remove expense records
 * with proper authentication and ownership verification.
 */

import { NextResponse } from 'next/server';

import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';

/**
 * DELETE /api/expenses/delete
 *
 * Delete an existing expense record.
 * Requires authentication and ownership verification.
 *
 * Request body should contain:
 * - expenseId: number (required)
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
    if (!body.expenseId) {
      return NextResponse.json({ error: 'Le champ expenseId est requis' }, { status: 400 });
    }

    // Verify expense ownership
    const { data: existingExpense, error: expenseError } = await supabase
      .from('expenses')
      .select('id, owner_id, type')
      .eq('id', body.expenseId)
      .single();

    if (expenseError || !existingExpense) {
      return NextResponse.json({ error: 'Dépense non trouvée' }, { status: 404 });
    }

    if (existingExpense.owner_id !== user.id) {
      return NextResponse.json(
        { error: "Vous n'êtes pas autorisé à supprimer cette dépense" },
        { status: 403 },
      );
    }

    // Don't allow deleting insurance expenses
    if (existingExpense.type === 'insurance') {
      return NextResponse.json(
        { error: "Les dépenses d'assurance ne peuvent pas être supprimées" },
        { status: 403 },
      );
    }

    // Delete from specialized tables first to avoid orphaned records

    // 1. Check and delete from fills (for fuel and electric_charge expenses)
    const { data: fillData } = await supabase
      .from('fills')
      .select('id')
      .eq('expense_id', body.expenseId)
      .maybeSingle();

    if (fillData) {
      const { error: fillDeleteError } = await supabase
        .from('fills')
        .delete()
        .eq('id', fillData.id);

      if (fillDeleteError) {
        console.error('Error deleting fill:', fillDeleteError);
        return NextResponse.json(
          { error: 'Erreur lors de la suppression du plein associé' },
          { status: 500 },
        );
      }
    }

    // 2. Check and delete from maintenance_expenses (for maintenance expenses)
    const { data: maintenanceData } = await supabase
      .from('maintenance_expenses')
      .select('expense_id')
      .eq('expense_id', body.expenseId)
      .maybeSingle();

    if (maintenanceData) {
      const { error: maintenanceDeleteError } = await supabase
        .from('maintenance_expenses')
        .delete()
        .eq('expense_id', body.expenseId);

      if (maintenanceDeleteError) {
        console.error('Error deleting maintenance expense:', maintenanceDeleteError);
        return NextResponse.json(
          { error: "Erreur lors de la suppression de l'entretien associé" },
          { status: 500 },
        );
      }
    }

    // 3. Check and delete from other_expenses (for other expenses)
    const { data: otherData } = await supabase
      .from('other_expenses')
      .select('expense_id')
      .eq('expense_id', body.expenseId)
      .maybeSingle();

    if (otherData) {
      const { error: otherDeleteError } = await supabase
        .from('other_expenses')
        .delete()
        .eq('expense_id', body.expenseId);

      if (otherDeleteError) {
        console.error('Error deleting other expense:', otherDeleteError);
        return NextResponse.json(
          { error: 'Erreur lors de la suppression de la dépense associée' },
          { status: 500 },
        );
      }
    }

    // 4. Finally delete the main expense record
    const { error } = await supabase.from('expenses').delete().eq('id', body.expenseId);

    if (error) {
      console.error('Error deleting expense:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la suppression de la dépense' },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        message: 'Dépense supprimée avec succès',
        expenseId: body.expenseId,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ error: 'Erreur serveur inattendue' }, { status: 500 });
  }
}
