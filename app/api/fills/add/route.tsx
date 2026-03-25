/**
 * @file app/api/fills/add/route.tsx
 * @fileoverview API endpoint for adding new fuel fill-up records.
 *
 * This endpoint handles POST requests to create new fill-up records
 * with proper authentication and validation.
 */

import { NextResponse } from 'next/server';

import { createSupabaseServerClient } from '@/lib/supabase/server';

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

    // Verify vehicle ownership
    const { data: vehicle, error: vehicleError } = await supabase
      .from('vehicles')
      .select('id, name, fuel_type')
      .eq('id', body.vehicle_id)
      .eq('owner_id', user.id)
      .single();

    if (vehicleError || !vehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found or you are not the owner' },
        { status: 404 },
      );
    }

    // Determine charge type and expense type
    const isCharge = body.charge_type === 'charge';
    const expenseType = isCharge ? 'electric_charge' : 'fuel';

    // First, create the expense record
    const { data: expense, error: expenseError } = await supabase
      .from('expenses')
      .insert([
        {
          vehicle_id: body.vehicle_id,
          owner_id: user.id,
          type: expenseType,
          amount: body.amount ? Number(body.amount) : 0,
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

    // Then, create the fill record with the expense_id
    const { data: fill, error } = await supabase
      .from('fills')
      .insert([
        {
          expense_id: expense.id,
          odometer: body.odometer ?? null,
          // For electric charges, use 0 instead of null (NOT NULL constraint)
          liters: isCharge ? 0 : (body.liters ?? null),
          price_per_liter: isCharge ? 0 : (body.price_per_liter ?? null),
          // Electric vehicle fields
          charge_type: body.charge_type || 'fill',
          kwh: isCharge ? (body.kwh ?? null) : null,
          price_per_kwh: isCharge ? (body.price_per_kwh ?? null) : null,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error adding fill:', error);
      // Rollback: delete the expense if fill creation fails
      await supabase.from('expenses').delete().eq('id', expense.id);
      return NextResponse.json({ error: "Erreur lors de l'ajout du plein" }, { status: 500 });
    }

    // Update vehicle odometer if fill has odometer data
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
    const responseFill = {
      ...fill,
      vehicle_id: body.vehicle_id,
      vehicle_name: vehicle.name,
      fuel_type: vehicle.fuel_type,
      date: body.date,
      amount: body.amount,
      notes: body.notes,
    };

    return NextResponse.json(
      {
        fill: responseFill,
        message: isCharge ? 'Recharge ajoutée avec succès' : 'Plein ajouté avec succès',
      },
      { status: 201 },
    );
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ error: 'Erreur serveur inattendue' }, { status: 500 });
  }
}
