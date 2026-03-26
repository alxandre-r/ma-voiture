import { addMonths, parseISO, subDays } from 'date-fns';
import { NextResponse } from 'next/server';

import { createSupabaseServerClient } from '@/lib/supabase/server';

/**
 * POST /api/insurance/change
 * Handles a price change or insurer change on the active contract.
 *
 * - Closes the current active contract (end_date = effective_date - 1 day)
 * - Creates a new contract starting on effective_date
 * - Backfills monthly expenses for the new contract
 *
 * Body:
 *   vehicle_id     number   (required)
 *   monthly_cost   number   (required)
 *   effective_date string   (required, YYYY-MM-DD)
 *   provider       string?  (optional — if omitted, copies from current contract)
 */
export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const body = await request.json();

    if (!body.vehicle_id) {
      return NextResponse.json({ error: 'Le champ vehicle_id est requis' }, { status: 400 });
    }
    if (!body.monthly_cost) {
      return NextResponse.json({ error: 'Le coût mensuel est requis' }, { status: 400 });
    }
    if (!body.effective_date) {
      return NextResponse.json({ error: "La date d'effet est requise" }, { status: 400 });
    }

    // Fetch the current active contract (no end_date or future end_date)
    const today = new Date().toISOString().split('T')[0];
    const { data: allContracts } = await supabase
      .from('insurance_contracts')
      .select('*')
      .eq('vehicle_id', Number(body.vehicle_id))
      .eq('owner_id', user.id)
      .order('start_date', { ascending: false });

    const activeContract = allContracts?.find((c) => !c.end_date || c.end_date >= today) ?? null;

    // Close the active contract at effective_date - 1 day
    if (activeContract && !activeContract.end_date) {
      const endDate = subDays(parseISO(body.effective_date), 1).toISOString().split('T')[0];
      await supabase
        .from('insurance_contracts')
        .update({ end_date: endDate })
        .eq('id', activeContract.id);
    }

    // Determine provider: use provided value or copy from current contract
    const provider = body.provider?.trim() || activeContract?.provider || null;

    // Create the new contract
    const { data: newContract, error: createError } = await supabase
      .from('insurance_contracts')
      .insert({
        vehicle_id: Number(body.vehicle_id),
        owner_id: user.id,
        monthly_cost: Number(body.monthly_cost),
        start_date: body.effective_date,
        end_date: null,
        provider,
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating new insurance contract:', createError);
      return NextResponse.json(
        { error: 'Erreur lors de la création du nouveau contrat' },
        { status: 500 },
      );
    }

    // Backfill monthly expenses from effective_date to today
    const effectiveDate = parseISO(body.effective_date);
    const periodEnd = new Date();
    let current = effectiveDate;
    const expensesToInsert = [];

    while (current <= periodEnd) {
      expensesToInsert.push({
        owner_id: user.id,
        vehicle_id: Number(body.vehicle_id),
        type: 'insurance',
        amount: Number(body.monthly_cost),
        date: current.toISOString().split('T')[0],
        insurance_contract_id: newContract.id,
        notes: 'Mensualité',
      });
      current = addMonths(current, 1);
    }

    if (expensesToInsert.length > 0) {
      await supabase.from('expenses').insert(expensesToInsert);
    }

    return NextResponse.json({ contract: newContract }, { status: 201 });
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ error: 'Erreur serveur inattendue' }, { status: 500 });
  }
}
