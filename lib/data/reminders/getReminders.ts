import { cache } from 'react';

import { createSupabaseServerClient } from '@/lib/supabase/server';

import type { Reminder } from '@/types/reminder';

/**
 * Fetch all reminders for the authenticated user, across all vehicles.
 * Includes completed reminders so the client can filter as needed.
 * Wrapped in React cache() for request-level deduplication.
 */
export const getReminders = cache(async (): Promise<Reminder[]> => {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from('reminders')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching reminders:', error);
    return [];
  }

  return (data as Reminder[]) ?? [];
});

/**
 * Fetch reminders for a specific vehicle.
 */
export const getVehicleReminders = cache(async (vehicleId: number): Promise<Reminder[]> => {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from('reminders')
    .select('*')
    .eq('user_id', user.id)
    .eq('vehicle_id', vehicleId)
    .eq('is_completed', false)
    .order('due_date', { ascending: true });

  if (error) {
    console.error('Error fetching vehicle reminders:', error);
    return [];
  }

  return (data as Reminder[]) ?? [];
});
