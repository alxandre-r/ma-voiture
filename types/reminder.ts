export type ReminderType = 'maintenance' | 'insurance' | 'inspection' | 'custom';

export type ReminderStatus = 'overdue' | 'due-soon' | 'upcoming' | 'none';

export type RecurrenceType = 'km' | 'time';

export interface Reminder {
  id: number;
  user_id: string;
  vehicle_id: number | null;
  type: ReminderType;
  title: string;
  description: string | null;
  due_date: string | null;
  due_odometer: number | null;
  is_recurring: boolean;
  recurrence_type: RecurrenceType | null;
  recurrence_value: number | null;
  last_triggered_at: string | null;
  is_completed: boolean;
  maintenance_type_id: string | null;
  estimated_due_date: string | null;
  created_at: string;
}

export interface ReminderWithStatus extends Reminder {
  status: ReminderStatus;
  computedEstimatedDate: Date | null;
  remainingKm: number | null;
}

export interface ReminderFormData {
  vehicle_id: number | null;
  type: ReminderType;
  title: string;
  description?: string;
  due_date?: string;
  due_odometer?: number;
  is_recurring: boolean;
  recurrence_type?: RecurrenceType;
  recurrence_value?: number;
}
