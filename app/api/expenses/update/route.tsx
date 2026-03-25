/**
 * @file app/api/expenses/update/route.tsx
 * @fileoverview API endpoint for updating expense records.
 *
 * This endpoint handles PATCH requests to update existing expense records
 * with proper authentication and ownership verification.
 */

import { NextResponse } from 'next/server';

import { createSupabaseServerClient } from '@/lib/supabase/server';

/**
 * PATCH /api/expenses/update
 *
 * Update an existing expense record.
 * Requires authentication and ownership verification.
 *
 * Request body should contain:
 * - id: number (required)
 * - Any other fields to update (date, amount, type, notes, etc.)
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

    // Verify expense ownership
    const { data: existingExpense, error: expenseError } = await supabase
      .from('expenses')
      .select('id, owner_id, vehicle_id, type')
      .eq('id', body.id)
      .single();

    if (expenseError || !existingExpense) {
      return NextResponse.json({ error: 'Dépense non trouvée' }, { status: 404 });
    }

    if (existingExpense.owner_id !== user.id) {
      return NextResponse.json(
        { error: "Vous n'êtes pas autorisé à modifier cette dépense" },
        { status: 403 },
      );
    }

    // Prepare update data — only keep columns that belong to the expenses table.
    // Fill-specific fields (liters, price_per_liter, kwh, price_per_kwh, odometer) go to the
    // fills table below. Maintenance/other fields are also excluded.
    const {
      id: _,
      owner_id: __,
      type: ___,
      maintenance_type: _maintenance_type,
      odometer: _odometer,
      garage: _garage,
      label: _label,
      liters: _liters,
      price_per_liter: _price_per_liter,
      kwh: _kwh,
      price_per_kwh: _price_per_kwh,
      ...updateData
    } = body;

    // Update expense record
    const { data: updatedExpense, error } = await supabase
      .from('expenses')
      .update(updateData)
      .eq('id', body.id)
      .eq('owner_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating expense:', error);
      console.error('Request body:', body);
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour de la dépense' },
        { status: 500 },
      );
    }

    // Handle category-specific updates (maintenance_expenses, other_expenses, fills)
    const expenseType = body.type || existingExpense.type;

    // For fuel and electric_charge, also update the fills table
    if (expenseType === 'fuel' || expenseType === 'electric_charge') {
      // Find the fill associated with this expense
      const { data: existingFill } = await supabase
        .from('fills')
        .select('id')
        .eq('expense_id', body.id)
        .single();

      if (existingFill) {
        // Update the fill with new values if provided
        const fillUpdateData: Record<string, unknown> = {};

        // Always update odometer if provided
        if (body.odometer !== undefined) fillUpdateData.odometer = body.odometer;

        // For fuel expenses - update liters and price_per_liter
        if (expenseType === 'fuel') {
          if (body.liters !== undefined) fillUpdateData.liters = body.liters;
          if (body.price_per_liter !== undefined)
            fillUpdateData.price_per_liter = body.price_per_liter;
        }

        // For electric_charge expenses - update kwh and price_per_kwh
        if (expenseType === 'electric_charge') {
          if (body.kwh !== undefined) fillUpdateData.kwh = body.kwh;
          if (body.price_per_kwh !== undefined) fillUpdateData.price_per_kwh = body.price_per_kwh;
        }

        if (Object.keys(fillUpdateData).length > 0) {
          const { error: fillError } = await supabase
            .from('fills')
            .update(fillUpdateData)
            .eq('id', existingFill.id);

          if (fillError) {
            console.error('Error updating fill:', fillError);
          }
        }
      }
    }

    if (expenseType === 'maintenance') {
      // Check if maintenance_expenses record exists
      const { data: existingMaintenance } = await supabase
        .from('maintenance_expenses')
        .select('expense_id')
        .eq('expense_id', body.id)
        .single();

      if (existingMaintenance) {
        // Update maintenance_expenses
        // Note: schema uses maintenance_type_id, not maintenance_type
        const { error: maintenanceError } = await supabase
          .from('maintenance_expenses')
          .update({
            maintenance_type_id: body.maintenance_type || null,
            odometer: body.odometer || null,
            garage: body.garage || null,
          })
          .eq('expense_id', body.id);

        if (maintenanceError) {
          console.error('Error updating maintenance_expenses:', maintenanceError);
        }

        // Recompute auto-reminder after edit (trigger only fires on INSERT)
        if (body.maintenance_type && existingExpense.vehicle_id) {
          await supabase.rpc('update_maintenance_reminder', {
            p_vehicle_id: existingExpense.vehicle_id,
            p_maintenance_type_id: body.maintenance_type,
          });
        }
      } else {
        // Insert new maintenance_expenses
        // Note: schema uses maintenance_type_id, not maintenance_type
        const { error: maintenanceError } = await supabase.from('maintenance_expenses').insert({
          expense_id: body.id,
          maintenance_type_id: body.maintenance_type || null,
          odometer: body.odometer || null,
          garage: body.garage || null,
        });

        if (maintenanceError) {
          console.error('Error inserting maintenance_expenses:', maintenanceError);
        }
      }
    } else if (expenseType === 'other') {
      // Check if other_expenses record exists
      const { data: existingOther } = await supabase
        .from('other_expenses')
        .select('expense_id')
        .eq('expense_id', body.id)
        .single();

      if (existingOther) {
        // Update other_expenses
        const { error: otherError } = await supabase
          .from('other_expenses')
          .update({
            label: body.label || null,
          })
          .eq('expense_id', body.id);

        if (otherError) {
          console.error('Error updating other_expenses:', otherError);
        }
      } else {
        // Insert new other_expenses
        const { error: otherError } = await supabase.from('other_expenses').insert({
          expense_id: body.id,
          label: body.label || null,
        });

        if (otherError) {
          console.error('Error inserting other_expenses:', otherError);
        }
      }
    }

    return NextResponse.json(
      {
        expense: updatedExpense,
        message: 'Dépense mise à jour avec succès',
      },
      { status: 200 },
    );
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ error: 'Erreur serveur inattendue' }, { status: 500 });
  }
}
