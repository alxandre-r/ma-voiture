/**
 * @file app/api/fills/update/route.tsx
 * @fileoverview API endpoint for updating fuel fill-up records.
 *
 * This endpoint handles PATCH requests to update existing fill-up records
 * with proper authentication and ownership verification.
 */

import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

import { createSupabaseServerClient } from '@/lib/supabase/server';

/**
 * PATCH /api/fills/update
 *
 * Update an existing fuel fill-up record.
 * Requires authentication and ownership verification.
 *
 * Request body should contain:
 * - id: number (required)
 * - Any other fields to update (date, odometer, liters, amount, etc.)
 */
export async function PATCH(request: Request) {
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
    if (!body.id) {
      return NextResponse.json({ error: 'Le champ id est requis' }, { status: 400 });
    }

    // Verify fill ownership - we need to get the expense_id too
    const { data: existingFill, error: fillError } = await supabase
      .from('fills')
      .select('id, expense_id, vehicle_id')
      .eq('id', body.id)
      .single();

    if (fillError || !existingFill) {
      return NextResponse.json({ error: 'Plein non trouvé' }, { status: 404 });
    }

    // Get the expense to check ownership
    const { data: existingExpense, error: expenseError } = await supabase
      .from('expenses')
      .select('owner_id, type, vehicle_id')
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
          { error: "Vous n'êtes pas autorisé à modifier ce plein" },
          { status: 403 },
        );
      }
    }

    // Handle charge_type to set appropriate values for NOT NULL constraints
    const isCharge = body.charge_type === 'charge';
    const newExpenseType = isCharge ? 'electric_charge' : 'fuel';

    // Prepare final update data with proper handling for NOT NULL constraints
    const finalUpdateData = {
      // For electric charges, ensure liters is 0 (not null due to NOT NULL constraint)
      liters: isCharge ? 0 : (body.liters ?? null),
      // For electric charges, ensure price_per_liter is 0 (not null due to NOT NULL constraint)
      price_per_liter: isCharge ? 0 : (body.price_per_liter ?? null),
      odometer: body.odometer ?? null,
      charge_type: body.charge_type ?? 'fill',
      kwh: isCharge ? (body.kwh ?? null) : null,
      price_per_kwh: isCharge ? (body.price_per_kwh ?? null) : null,
    };

    // Update fill record
    const { data: updatedFill, error } = await supabase
      .from('fills')
      .update(finalUpdateData)
      .eq('id', body.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating fill:', error);
      console.error('Request body:', body);
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour du plein' },
        { status: 500 },
      );
    }

    // Also update the expense record
    const { error: expenseUpdateError } = await supabase
      .from('expenses')
      .update({
        type: newExpenseType,
        amount: body.amount ? Number(body.amount) : 0,
        date: body.date,
        notes: body.notes || null,
      })
      .eq('id', existingFill.expense_id);

    if (expenseUpdateError) {
      console.error('Error updating expense:', expenseUpdateError);
    }

    // Update vehicle odometer if fill has odometer data (RLS enforces write permission)
    if (body.odometer) {
      const { error: updateError } = await supabase
        .from('vehicles')
        .update({ odometer: body.odometer })
        .eq('id', existingFill.vehicle_id);

      if (updateError) {
        console.error('Error updating vehicle odometer:', updateError);
        // Don't fail the entire operation if odometer update fails
      }
    }

    // Get vehicle info for response
    const { data: vehicle } = await supabase
      .from('vehicles')
      .select('name, fuel_type')
      .eq('id', existingFill.vehicle_id)
      .single();

    // Add vehicle info to response
    const responseFill = {
      ...updatedFill,
      vehicle_name: vehicle?.name || null,
      fuel_type: vehicle?.fuel_type || null,
    };

    revalidatePath('/', 'layout');
    return NextResponse.json(
      {
        fill: responseFill,
        message: 'Plein mis à jour avec succès',
      },
      { status: 200 },
    );
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ error: 'Erreur serveur inattendue' }, { status: 500 });
  }
}
