/**
 * @file app/api/vehicles/update/route.tsx
 * @fileoverview API route to update an existing vehicle.
 */

import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

import { createSupabaseServerClient } from '@/lib/supabase/server';

import type { Vehicle } from '@/types/vehicle';

const VALID_FIELDS = [
  'name',
  'owner',
  'make',
  'model',
  'year',
  'fuel_type',
  'manufacturer_consumption',
  'odometer',
  'color',
  'plate',
  'last_fill',
  // New fields
  'status',
  'vin',
  'transmission',
  'image',
  'insurance_start_date',
  'insurance_monthly_cost',
  'tech_control_expiry',
  'financing_mode',
  'purchase_date',
  'purchase_price',
  'co2_emission',
];

// Helper to convert empty strings to null for date fields
const toDate = (value: string | undefined | null) => {
  if (!value || value === '') return null;
  return value;
};

// Helper to convert empty strings to null for numeric fields
const toNumber = (value: number | undefined | null) => {
  if (value === undefined || value === null) return null;
  return value;
};

// Helper to convert to uppercase (for plate and VIN)
const toUpperCase = (value: string | undefined | null) => {
  if (!value) return null;
  return value.toUpperCase();
};

export async function PATCH(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();

    // Auth user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse body
    const body = await request.json();
    const { vehicle_id: id, ...inputData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Vehicle ID is required' }, { status: 400 });
    }

    // Filter valid fields and convert empty strings to null for date/numeric fields
    const processedData = Object.fromEntries(
      Object.entries(inputData).filter(([key]) => VALID_FIELDS.includes(key)),
    );

    // Apply type conversions (except insurance fields which are handled separately)
    const updateData: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(processedData)) {
      // Skip insurance fields - they're handled separately
      if (key === 'insurance_start_date' || key === 'insurance_monthly_cost') {
        continue;
      }
      if (key === 'tech_control_expiry' || key === 'purchase_date') {
        updateData[key] = toDate(value as string);
      } else if (key === 'purchase_price' || key === 'co2_emission') {
        updateData[key] = toNumber(value as number);
      } else if (key === 'plate' || key === 'vin') {
        updateData[key] = toUpperCase(value as string);
      } else {
        updateData[key] = value;
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    // Verify ownership or write permission
    const { data: vehicle, error: fetchError } = await supabase
      .from('vehicles')
      .select('id, owner_id')
      .eq('id', id)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching vehicle:', fetchError);
      return NextResponse.json({ error: 'Failed to verify vehicle ownership' }, { status: 500 });
    }

    if (!vehicle) {
      return NextResponse.json({ error: 'Véhicule introuvable' }, { status: 404 });
    }

    if (vehicle.owner_id !== user.id) {
      const { data: perm } = await supabase
        .from('vehicles_for_display')
        .select('permission_level')
        .eq('vehicle_id', id)
        .maybeSingle();
      if (perm?.permission_level !== 'write') {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
      }
    }

    // Update vehicle
    const { data, error: updateError } = await supabase
      .from('vehicles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single<Vehicle>();

    if (updateError) {
      console.error('Error updating vehicle:', updateError);
      // Provide more specific error messages
      let errorMessage = updateError.message;
      if (updateError.message.includes('invalid input syntax for type date')) {
        errorMessage = 'Format de date invalide pour un des champs de date';
      } else if (updateError.message.includes('null value in column "make"')) {
        errorMessage = 'La marque est requise';
      } else if (updateError.message.includes('null value in column "model"')) {
        errorMessage = 'Le modèle est requis';
      }
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }

    // Handle insurance contract update
    const insuranceStartDate = toDate(inputData.insurance_start_date as string);
    const insuranceMonthlyCost = toNumber(inputData.insurance_monthly_cost as number);

    if (insuranceStartDate || insuranceMonthlyCost) {
      // Check if there's an existing insurance contract
      const { data: existingContract } = await supabase
        .from('insurance_contracts')
        .select('id')
        .eq('vehicle_id', id)
        .maybeSingle();

      if (existingContract) {
        // Update existing contract
        const { error: insuranceUpdateError } = await supabase
          .from('insurance_contracts')
          .update({
            monthly_cost: insuranceMonthlyCost,
            start_date: insuranceStartDate,
          })
          .eq('id', existingContract.id);

        if (insuranceUpdateError) {
          console.error('Error updating insurance contract:', insuranceUpdateError);
        }
      } else if (insuranceStartDate && insuranceMonthlyCost) {
        // Create new contract if both values are provided
        const { error: insuranceInsertError } = await supabase.from('insurance_contracts').insert([
          {
            vehicle_id: id,
            owner_id: user.id,
            monthly_cost: insuranceMonthlyCost,
            start_date: insuranceStartDate,
          },
        ]);

        if (insuranceInsertError) {
          console.error('Error creating insurance contract:', insuranceInsertError);
        }
      }
    }

    revalidatePath('/', 'layout');
    return NextResponse.json(
      { message: 'Vehicle updated successfully', vehicle: data },
      { status: 200 },
    );
  } catch (err) {
    console.error('Unexpected error in /vehicles/update:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
