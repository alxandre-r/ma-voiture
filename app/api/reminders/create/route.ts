import { NextResponse } from 'next/server';

import { createSupabaseServerClient } from '@/lib/supabase/server';

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

    if (!body.title?.trim()) {
      return NextResponse.json({ error: 'Le titre est requis' }, { status: 400 });
    }
    if (!body.type) {
      return NextResponse.json({ error: 'Le type est requis' }, { status: 400 });
    }
    const { data, error } = await supabase
      .from('reminders')
      .insert({
        user_id: user.id,
        vehicle_id: body.vehicle_id ?? null,
        type: body.type,
        title: body.title.trim(),
        description: body.description?.trim() ?? null,
        due_date: body.due_date ?? null,
        due_odometer: body.due_odometer ? Number(body.due_odometer) : null,
        is_recurring: body.is_recurring ?? false,
        recurrence_type: body.recurrence_type ?? null,
        recurrence_value: body.recurrence_value ? Number(body.recurrence_value) : null,
        maintenance_type_id: body.maintenance_type_id ?? null,
        is_completed: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating reminder:', error);
      return NextResponse.json({ error: 'Erreur lors de la création du rappel' }, { status: 500 });
    }

    return NextResponse.json({ reminder: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur inattendue' }, { status: 500 });
  }
}
