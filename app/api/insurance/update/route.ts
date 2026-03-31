import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

import { createSupabaseServerClient } from '@/lib/supabase/server';

/**
 * PATCH /api/insurance/update
 * Updates an insurance contract (the DB trigger sync_insurance_expenses_after_update
 * automatically adjusts future monthly expenses when cost/dates change).
 */
export async function PATCH(request: Request) {
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

    // Verify contract ownership before updating
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

    const updates: Record<string, unknown> = {};
    if (body.provider !== undefined) updates.provider = body.provider?.trim() || null;
    if (body.monthly_cost !== undefined) updates.monthly_cost = Number(body.monthly_cost);
    if (body.start_date !== undefined) updates.start_date = body.start_date;
    if (body.end_date !== undefined) updates.end_date = body.end_date || null;

    const { data, error } = await supabase
      .from('insurance_contracts')
      .update(updates)
      .eq('id', body.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating insurance contract:', error);
      return NextResponse.json(
        { error: "Erreur lors de la mise à jour du contrat d'assurance" },
        { status: 500 },
      );
    }

    revalidatePath('/', 'layout');
    return NextResponse.json({ contract: data });
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ error: 'Erreur serveur inattendue' }, { status: 500 });
  }
}
