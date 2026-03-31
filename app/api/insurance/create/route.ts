import { addMonths, parseISO } from 'date-fns';
import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

import { createSupabaseServerClient } from '@/lib/supabase/server';

/**
 * POST /api/insurance/create
 * Creates an insurance contract and backfills monthly expenses from start_date to today.
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
    if (!body.start_date) {
      return NextResponse.json({ error: 'La date de début est requise' }, { status: 400 });
    }

    // Verify vehicle ownership
    const { data: vehicle, error: vehicleError } = await supabase
      .from('vehicles')
      .select('id')
      .eq('id', body.vehicle_id)
      .eq('owner_id', user.id)
      .single();

    if (vehicleError || !vehicle) {
      return NextResponse.json(
        { error: "Véhicule non trouvé ou vous n'êtes pas le propriétaire" },
        { status: 404 },
      );
    }

    // Create the insurance contract
    const { data: contract, error: contractError } = await supabase
      .from('insurance_contracts')
      .insert({
        vehicle_id: Number(body.vehicle_id),
        owner_id: user.id,
        monthly_cost: Number(body.monthly_cost),
        start_date: body.start_date,
        end_date: body.end_date || null,
        provider: body.provider?.trim() || null,
      })
      .select()
      .single();

    if (contractError) {
      console.error('Error creating insurance contract:', contractError);
      return NextResponse.json(
        { error: "Erreur lors de la création du contrat d'assurance" },
        { status: 500 },
      );
    }

    // Backfill monthly expenses from start_date to min(end_date, today)
    const today = new Date();
    const periodEnd =
      body.end_date && parseISO(body.end_date) < today ? parseISO(body.end_date) : today;

    let current = parseISO(body.start_date);
    const expensesToInsert = [];

    while (current <= periodEnd) {
      const dateStr = current.toISOString().split('T')[0];
      expensesToInsert.push({
        owner_id: user.id,
        vehicle_id: Number(body.vehicle_id),
        type: 'insurance',
        amount: Number(body.monthly_cost),
        date: dateStr,
        insurance_contract_id: contract.id,
        notes: 'Mensualité',
      });
      current = addMonths(current, 1);
    }

    if (expensesToInsert.length > 0) {
      const { error: expensesError } = await supabase.from('expenses').insert(expensesToInsert);
      if (expensesError) {
        console.error('Error backfilling insurance expenses:', expensesError);
        // Contract created but expenses failed — non-blocking
      }
    }

    revalidatePath('/', 'layout');
    return NextResponse.json({ contract }, { status: 201 });
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ error: 'Erreur serveur inattendue' }, { status: 500 });
  }
}
