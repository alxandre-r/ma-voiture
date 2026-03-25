import { getReminders } from '@/lib/data/reminders';
import { getAllVehicles } from '@/lib/data/vehicles';
import { createSupabaseServerClient } from '@/lib/supabase/server';

import RemindersClient from './RemindersClient';

import type { Expense } from '@/types/expense';

/**
 * Fetch fuel and electric_charge expenses for smart prediction (km/month).
 * We only need fill data, not all expenses.
 */
async function getFillExpenses(vehicleIds: number[]): Promise<Expense[]> {
  if (vehicleIds.length === 0) return [];

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from('expenses_for_display')
    .select('vehicle_id, type, date, odometer')
    .in('vehicle_id', vehicleIds)
    .in('type', ['fuel', 'electric_charge'])
    .order('date', { ascending: true });

  if (error) {
    console.error('Error fetching fill expenses:', error);
    return [];
  }

  return (data as unknown as Expense[]) ?? [];
}

export default async function RemindersPage() {
  const [reminders, vehicles] = await Promise.all([getReminders(), getAllVehicles()]);

  const vehicleIds = vehicles.map((v) => v.vehicle_id).filter((id) => id > 0);

  const fillExpenses = await getFillExpenses(vehicleIds);

  return (
    <main>
      <RemindersClient reminders={reminders} vehicles={vehicles} fillExpenses={fillExpenses} />
    </main>
  );
}
