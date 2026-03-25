import { NextResponse } from 'next/server';

import { createSupabaseServerClient } from '@/lib/supabase/server';

/**
 * PATCH /api/reminders/complete
 * Toggle is_completed on a reminder.
 */
export async function PATCH(request: Request) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json({ error: "L'identifiant est requis" }, { status: 400 });
    }

    const is_completed = body.is_completed ?? true;

    const { data, error } = await supabase
      .from('reminders')
      .update({
        is_completed,
        last_triggered_at: is_completed ? new Date().toISOString() : null,
      })
      .eq('id', body.id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error completing reminder:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour du rappel' },
        { status: 500 },
      );
    }

    return NextResponse.json({ reminder: data });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur inattendue' }, { status: 500 });
  }
}
