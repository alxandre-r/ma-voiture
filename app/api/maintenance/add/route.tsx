/**
 * @file app/api/maintenance/add/route.tsx
 * @fileoverview API endpoint for adding new maintenance expense records.
 *
 * This endpoint handles POST requests to create new maintenance expenses
 * with proper authentication and validation.
 */

import { NextResponse } from 'next/server';

import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';

export async function POST(request: Request) {
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

    // Validate required fields
    if (!body.vehicle_id) {
      return NextResponse.json({ error: 'Le champ vehicle_id est requis' }, { status: 400 });
    }
    if (!body.date) {
      return NextResponse.json({ error: 'Le champ date est requis' }, { status: 400 });
    }
    if (body.amount === undefined || body.amount === null) {
      return NextResponse.json({ error: 'Le champ amount est requis' }, { status: 400 });
    }

    // Verify vehicle ownership
    const { data: vehicle, error: vehicleError } = await supabase
      .from('vehicles')
      .select('id, name, make, model')
      .eq('id', body.vehicle_id)
      .eq('owner_id', user.id)
      .single();

    if (vehicleError || !vehicle) {
      return NextResponse.json(
        { error: "Véhicule non trouvé ou vous n'êtes pas le propriétaire" },
        { status: 404 },
      );
    }

    // First, create the expense record
    const { data: expense, error: expenseError } = await supabase
      .from('expenses')
      .insert([
        {
          vehicle_id: body.vehicle_id,
          owner_id: user.id,
          type: 'maintenance',
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

    // Then, create the maintenance_expenses record
    // Note: schema uses maintenance_type_id, not maintenance_type
    const { data: maintenanceExpense, error: maintenanceError } = await supabase
      .from('maintenance_expenses')
      .insert([
        {
          expense_id: expense.id,
          maintenance_type_id: body.maintenance_type || 'other',
          odometer: body.odometer ? Number(body.odometer) : null,
          garage: body.garage || null,
        },
      ])
      .select()
      .single();

    if (maintenanceError) {
      console.error('Error creating maintenance_expense:', maintenanceError);
      // Rollback: delete the expense if maintenance creation fails
      await supabase.from('expenses').delete().eq('id', expense.id);
      return NextResponse.json(
        { error: "Erreur lors de la création de l'entretien" },
        { status: 500 },
      );
    }

    // Update vehicle odometer if provided
    if (body.odometer) {
      const { error: updateError } = await supabase
        .from('vehicles')
        .update({ odometer: body.odometer })
        .eq('id', body.vehicle_id)
        .eq('owner_id', user.id);

      if (updateError) {
        console.error('Error updating vehicle odometer:', updateError);
      }
    }

    // Add vehicle info to response for UI
    const response = {
      ...expense,
      maintenance_type: maintenanceExpense.maintenance_type_id,
      odometer: maintenanceExpense.odometer,
      garage: maintenanceExpense.garage,
      vehicle_name: vehicle.name || `${vehicle.make} ${vehicle.model}`,
    };

    return NextResponse.json(
      {
        expense: response,
        message: 'Entretien ajouté avec succès',
      },
      { status: 201 },
    );
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ error: 'Erreur serveur inattendue' }, { status: 500 });
  }
}
