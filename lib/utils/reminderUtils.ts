import type { Expense } from '@/types/expense';
import type { Reminder, ReminderStatus, ReminderWithStatus } from '@/types/reminder';
import type { Vehicle } from '@/types/vehicle';

/** Days threshold below which a reminder is "due soon" */
const DUE_SOON_DAYS = 14;

/** Km threshold below which a km-based reminder is "due soon" */
const DUE_SOON_KM = 500;

/**
 * Compute the status of a reminder based on due date, due odometer, and vehicle odometer.
 */
export function getReminderStatus(
  reminder: Reminder,
  vehicleOdometer: number | null,
): ReminderStatus {
  if (reminder.due_date === null && reminder.due_odometer === null) return 'none';

  const now = new Date();

  // Check odometer-based trigger
  if (reminder.due_odometer !== null && vehicleOdometer !== null) {
    if (vehicleOdometer >= reminder.due_odometer) {
      return 'overdue';
    }
    if (reminder.due_odometer - vehicleOdometer <= DUE_SOON_KM) {
      return 'due-soon';
    }
  }

  // Check date-based trigger
  if (reminder.due_date !== null) {
    const due = new Date(reminder.due_date);
    if (due <= now) {
      return 'overdue';
    }
    const msUntilDue = due.getTime() - now.getTime();
    const daysUntilDue = msUntilDue / (1000 * 60 * 60 * 24);
    if (daysUntilDue <= DUE_SOON_DAYS) {
      return 'due-soon';
    }
  }

  return 'upcoming';
}

/**
 * Estimate a due date for a km-based reminder using fill history (km/month average).
 * Returns null if not enough data.
 */
export function estimateDueDate(
  reminder: Reminder,
  vehicleOdometer: number | null,
  fillExpenses: Expense[],
): Date | null {
  if (reminder.due_odometer === null || vehicleOdometer === null) return null;

  const remainingKm = reminder.due_odometer - vehicleOdometer;

  // Already overdue by odometer — return now
  if (remainingKm <= 0) return new Date();

  // Get fills for this vehicle, sorted by date
  const vehicleFills = fillExpenses
    .filter(
      (e) =>
        e.vehicle_id === reminder.vehicle_id &&
        (e.type === 'fuel' || e.type === 'electric_charge') &&
        e.odometer != null,
    )
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (vehicleFills.length < 2) return null;

  const first = vehicleFills[0];
  const last = vehicleFills[vehicleFills.length - 1];

  const kmDriven = (last.odometer as number) - (first.odometer as number);
  const msElapsed = new Date(last.date).getTime() - new Date(first.date).getTime();
  const monthsElapsed = msElapsed / (1000 * 60 * 60 * 24 * 30.44);

  if (kmDriven <= 0 || monthsElapsed <= 0) return null;

  const kmPerMonth = kmDriven / monthsElapsed;
  const monthsUntilDue = remainingKm / kmPerMonth;

  const estimatedDate = new Date();
  estimatedDate.setTime(estimatedDate.getTime() + monthsUntilDue * 30.44 * 24 * 60 * 60 * 1000);

  return estimatedDate;
}

/**
 * Compute remaining km until a reminder triggers.
 */
export function getRemainingKm(reminder: Reminder, vehicleOdometer: number | null): number | null {
  if (reminder.due_odometer === null || vehicleOdometer === null) return null;
  return reminder.due_odometer - vehicleOdometer;
}

/**
 * Enrich a reminder with its computed status and estimated due date.
 */
export function enrichReminder(
  reminder: Reminder,
  vehicle: Vehicle | null,
  fillExpenses: Expense[],
): ReminderWithStatus {
  const odometer = vehicle?.odometer ?? null;
  const status = getReminderStatus(reminder, odometer);

  let computedEstimatedDate: Date | null = null;

  // If only km-based and no due_date, compute estimate from usage
  if (reminder.due_odometer !== null && reminder.due_date === null) {
    computedEstimatedDate = estimateDueDate(reminder, odometer, fillExpenses);
  }

  const remainingKm = getRemainingKm(reminder, odometer);

  return {
    ...reminder,
    status,
    computedEstimatedDate,
    remainingKm,
  };
}

/**
 * Format a reminder's due information for display.
 * Returns a human-readable string like "dans 1200 km (~mars 2026)" or "le 15 avril 2026".
 */
export function formatReminderDue(reminder: ReminderWithStatus): string {
  const parts: string[] = [];

  // Date part
  const displayDate = reminder.due_date
    ? new Date(reminder.due_date)
    : reminder.computedEstimatedDate;

  if (displayDate) {
    const dateStr = displayDate.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    if (reminder.due_date) {
      parts.push(`le ${dateStr}`);
    } else {
      parts.push(`~${dateStr}`);
    }
  }

  // Odometer part
  if (reminder.remainingKm !== null) {
    if (reminder.remainingKm <= 0) {
      parts.push('dépassé');
    } else {
      const kmStr = `dans ${reminder.remainingKm.toLocaleString('fr-FR')} km`;
      parts.push(kmStr);
    }
  }

  return parts.join(' · ') || '—';
}

/**
 * Sort reminders: overdue first, then due-soon, then upcoming.
 * Within each group, sort by due_date asc (nulls last).
 */
export function sortReminders(reminders: ReminderWithStatus[]): ReminderWithStatus[] {
  const order: Record<ReminderStatus, number> = { overdue: 0, 'due-soon': 1, upcoming: 2, none: 3 };
  return [...reminders].sort((a, b) => {
    const orderDiff = order[a.status] - order[b.status];
    if (orderDiff !== 0) return orderDiff;

    const dateA = a.due_date ? new Date(a.due_date).getTime() : Infinity;
    const dateB = b.due_date ? new Date(b.due_date).getTime() : Infinity;
    return dateA - dateB;
  });
}

/**
 * Filter reminders to only the active (non-completed) ones.
 */
export function getActiveReminders(reminders: ReminderWithStatus[]): ReminderWithStatus[] {
  return reminders.filter((r) => !r.is_completed);
}
