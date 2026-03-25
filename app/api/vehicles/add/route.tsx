/**
 * @file src/app/api/vehicles/add/route.ts
 * @fileoverview API route to add a new vehicle linked to the authenticated user.
 */

import { NextResponse } from 'next/server';

import { createSupabaseServerClient } from '@/lib/supabase/server';

import type { Vehicle } from '@/types/vehicle';

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();

    // Récupération de l'utilisateur connecté
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      make,
      model,
      year,
      fuel_type,
      odometer,
      plate,
      color,
      status,
      vin,
      transmission,
      image,
      insurance_start_date,
      insurance_monthly_cost,
      tech_control_expiry,
      financing_mode,
      purchase_date,
      purchase_price,
      co2_emission,
    } = body;

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

    // Insertion en base
    const { data, error } = await supabase
      .from('vehicles')
      .insert([
        {
          owner_id: user.id,
          name: name || null,
          make,
          model,
          year: year || null,
          fuel_type: fuel_type || null,
          odometer: odometer || 0,
          color: color || null,
          plate: toUpperCase(plate),
          // New fields
          status: status || 'active',
          vin: toUpperCase(vin),
          transmission: transmission || null,
          image: image || null,
          tech_control_expiry: toDate(tech_control_expiry),
          financing_mode: financing_mode || null,
          purchase_date: toDate(purchase_date),
          purchase_price: toNumber(purchase_price),
          co2_emission: toNumber(co2_emission),
        },
      ])
      .select()
      .single<Vehicle>();

    if (error) {
      console.error('Error inserting vehicle:', error);
      // Provide more specific error messages
      let errorMessage = error.message;
      if (error.message.includes('invalid input syntax for type date')) {
        errorMessage = 'Format de date invalide pour un des champs de date';
      } else if (error.message.includes('null value in column "make"')) {
        errorMessage = 'La marque est requise';
      } else if (error.message.includes('null value in column "model"')) {
        errorMessage = 'Le modèle est requis';
      }
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }

    // Create insurance_contract if insurance data is provided
    if (insurance_start_date && insurance_monthly_cost) {
      const { error: insuranceError } = await supabase.from('insurance_contracts').insert([
        {
          vehicle_id: data.vehicle_id,
          owner_id: user.id,
          monthly_cost: toNumber(insurance_monthly_cost),
          start_date: toDate(insurance_start_date),
        },
      ]);

      if (insuranceError) {
        console.error('Error creating insurance contract:', insuranceError);
        // Don't fail the whole request, just log the error
      }
    }

    return NextResponse.json({ message: 'Vehicle created successfully', vehicle: data });
  } catch (err) {
    console.error('Unexpected error in /vehicles/add:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
