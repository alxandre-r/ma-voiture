import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Non autorisé - utilisateur non connecté' }, { status: 401 });
  }

  try {
    const body = await request.json();

    if (!body.vehicle_id) {
      return NextResponse.json({ error: 'Le champ vehicle_id est requis' }, { status: 400 });
    }
    if (!body.date) {
      return NextResponse.json({ error: 'Le champ date est requis' }, { status: 400 });
    }
    if (body.amount === undefined || body.amount === null) {
      return NextResponse.json({ error: 'Le champ amount est requis' }, { status: 400 });
    }
    if (!body.label) {
      return NextResponse.json({ error: 'Le champ label est requis' }, { status: 400 });
    }

    const { data: vehicle, error: vehicleError } = await supabase
      .from('vehicles_for_display')
      .select('vehicle_id, owner_id, name, make, model, permission_level')
      .eq('vehicle_id', body.vehicle_id)
      .maybeSingle();

    if (vehicleError || !vehicle) {
      return NextResponse.json({ error: 'Véhicule introuvable' }, { status: 404 });
    }

    const canWrite = vehicle.owner_id === user.id || vehicle.permission_level === 'write';
    if (!canWrite) {
      return NextResponse.json(
        { error: "Vous n'avez pas les droits pour ajouter une dépense à ce véhicule" },
        { status: 403 },
      );
    }

    const { data: expense, error: expenseError } = await supabase
      .from('expenses')
      .insert([
        {
          vehicle_id: body.vehicle_id,
          owner_id: user.id,
          type: 'other',
          amount: Number(body.amount),
          date: body.date,
          notes: body.notes || null,
        },
      ])
      .select()
      .single();

    if (expenseError) {
      console.error('Error creating expense:', expenseError);
      return NextResponse.json(
        { error: 'Erreur lors de la création de la dépense' },
        { status: 500 },
      );
    }

    const { data: otherExpense, error: otherError } = await supabase
      .from('other_expenses')
      .insert([
        {
          expense_id: expense.id,
          label: body.label,
        },
      ])
      .select()
      .single();

    if (otherError) {
      console.error('Error creating other_expense:', otherError);
      await supabase.from('expenses').delete().eq('id', expense.id);
      return NextResponse.json(
        { error: 'Erreur lors de la création de la dépense' },
        { status: 500 },
      );
    }

    const response = {
      ...expense,
      label: otherExpense.label,
      vehicle_name: vehicle.name || `${vehicle.make} ${vehicle.model}`,
    };

    revalidatePath('/', 'layout');
    return NextResponse.json(
      {
        expense: response,
        message: 'Dépense ajoutée avec succès',
      },
      { status: 201 },
    );
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ error: 'Erreur serveur inattendue' }, { status: 500 });
  }
}
