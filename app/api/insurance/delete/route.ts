import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

import { createSupabaseServerClient } from '@/lib/supabase/server';

/**
 * DELETE /api/insurance/delete
 * Deletes an insurance contract and its associated expenses.
 */
export async function DELETE(request: Request) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json({ error: "L'identifiant du contrat est requis" }, { status: 400 });
    }

    // Verify contract ownership
    const { data: existing, error: fetchError } = await supabase
      .from('insurance_contracts')
      .select('id, owner_id')
      .eq('id', body.id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: "Contrat d'assurance introuvable" }, { status: 404 });
    }

    if (existing.owner_id !== user.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    // Delete associated expenses first (no CASCADE on expenses from insurance_contracts)
    await supabase
      .from('expenses')
      .delete()
      .eq('insurance_contract_id', body.id)
      .eq('owner_id', user.id);

    // Delete the contract
    const { error } = await supabase.from('insurance_contracts').delete().eq('id', body.id);

    if (error) {
      console.error('Error deleting insurance contract:', error);
      return NextResponse.json(
        { error: "Erreur lors de la suppression du contrat d'assurance" },
        { status: 500 },
      );
    }

    revalidatePath('/', 'layout');
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ error: 'Erreur serveur inattendue' }, { status: 500 });
  }
}
