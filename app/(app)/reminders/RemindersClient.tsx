'use client';

import { useMemo } from 'react';

import EmptyReminders from '@/app/(app)/reminders/components/EmptyReminders';
import OverdueReminders from '@/app/(app)/reminders/components/OverdueReminders';
import UpcomingReminders from '@/app/(app)/reminders/components/UpcomingReminders';
import { useRemindersPage } from '@/app/(app)/reminders/hooks/useRemindersPage';
import ReminderForm from '@/components/common/forms/ReminderForm';
import Drawer from '@/components/common/ui/Drawer';
import Icon from '@/components/common/ui/Icon';
import { useSelectors } from '@/contexts/SelectorsContext';
import { useUser } from '@/contexts/UserContext';
import { useReminderActions } from '@/hooks/reminders/useReminderActions';
import { getPeriodCutoff } from '@/lib/utils/filterUtils';
import { enrichReminder, sortReminders } from '@/lib/utils/reminderUtils';

import type { Expense } from '@/types/expense';
import type { Reminder, ReminderFormData, ReminderWithStatus } from '@/types/reminder';
import type { Vehicle, VehicleMinimal } from '@/types/vehicle';

interface RemindersClientProps {
  reminders: Reminder[];
  vehicles: Vehicle[];
  fillExpenses: Expense[];
}

function RemindersContent({ reminders, vehicles, fillExpenses }: RemindersClientProps) {
  const { showForm, editingReminder, filter, setFilter, openCreate, openEdit, closeForm } =
    useRemindersPage();

  const user = useUser();
  const { selectedVehicleIds, selectedPeriod } = useSelectors();

  const {
    creating,
    saving,
    deletingId,
    completingId,
    createReminder,
    updateReminder,
    deleteReminder,
    completeReminder,
  } = useReminderActions();

  const enrichedReminders = useMemo<ReminderWithStatus[]>(() => {
    return reminders.map((r) => {
      const vehicle =
        r.vehicle_id != null ? (vehicles.find((v) => v.vehicle_id === r.vehicle_id) ?? null) : null;
      return enrichReminder(r, vehicle as Vehicle | null, fillExpenses);
    });
  }, [reminders, vehicles, fillExpenses]);

  const filteredReminders = useMemo(() => {
    let result =
      selectedVehicleIds.length > 0
        ? enrichedReminders.filter(
            (r) => r.vehicle_id != null && selectedVehicleIds.includes(r.vehicle_id),
          )
        : enrichedReminders;

    const cutoff = getPeriodCutoff(selectedPeriod);
    if (cutoff) {
      result = result.filter((r) => !r.due_date || new Date(r.due_date) >= cutoff);
    }

    return result;
  }, [enrichedReminders, selectedVehicleIds, selectedPeriod]);

  const sorted = useMemo(() => sortReminders(filteredReminders), [filteredReminders]);

  const activeReminders = useMemo(() => sorted.filter((r) => !r.is_completed), [sorted]);
  const completedReminders = useMemo(() => sorted.filter((r) => r.is_completed), [sorted]);

  const overdueReminders = useMemo(
    () => activeReminders.filter((r) => r.status === 'overdue'),
    [activeReminders],
  );

  const nonOverdueActive = useMemo(
    () => activeReminders.filter((r) => r.status !== 'overdue'),
    [activeReminders],
  );

  const vehiclesMinimal: VehicleMinimal[] = vehicles
    .filter((v) => v.owner_id === user?.id && (v.status === 'active' || v.status == null))
    .map((v) => ({
      vehicle_id: v.vehicle_id,
      name: v.name ?? `${v.make} ${v.model}`,
      make: v.make ?? '',
      model: v.model ?? '',
      fuel_type: v.fuel_type ?? null,
      status: v.status ?? 'active',
      owner_id: v.owner_id,
    }));

  const handleSave = async (data: ReminderFormData, id?: number): Promise<boolean> => {
    const success = id ? await updateReminder(id, data) : await createReminder(data);
    if (success) closeForm();
    return success;
  };

  const hasCompleted = completedReminders.length > 0;
  const isEmpty = filteredReminders.length === 0;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Filter tabs + Add button */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-1">
          {(
            [
              { key: 'active', label: `Actifs (${activeReminders.length})` },
              { key: 'completed', label: `Terminés (${completedReminders.length})` },
              { key: 'all', label: 'Tous' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors cursor-pointer ${
                filter === tab.key
                  ? 'border-custom-2 text-custom-2'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button
          onClick={openCreate}
          className="hidden sm:flex items-center gap-2 px-4 py-2 mb-px bg-custom-2 hover:bg-custom-2-hover text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
        >
          <Icon name="add" size={16} className="invert dark:invert-0" />
          Nouveau rappel
        </button>
      </div>

      {/* Content */}
      {isEmpty ? (
        <EmptyReminders onAdd={openCreate} />
      ) : filter === 'completed' ? (
        <UpcomingReminders
          reminders={completedReminders}
          vehicles={vehicles}
          onComplete={completeReminder}
          onEdit={openEdit}
          onDelete={deleteReminder}
          completingId={completingId}
          deletingId={deletingId}
          showCompleted
        />
      ) : filter === 'all' ? (
        <div className="space-y-6">
          <OverdueReminders
            reminders={overdueReminders}
            vehicles={vehicles}
            onComplete={completeReminder}
            onEdit={openEdit}
            onDelete={deleteReminder}
            completingId={completingId}
            deletingId={deletingId}
          />
          <UpcomingReminders
            reminders={nonOverdueActive}
            vehicles={vehicles}
            onComplete={completeReminder}
            onEdit={openEdit}
            onDelete={deleteReminder}
            completingId={completingId}
            deletingId={deletingId}
          />
          {hasCompleted && (
            <UpcomingReminders
              reminders={completedReminders}
              vehicles={vehicles}
              onComplete={completeReminder}
              onEdit={openEdit}
              onDelete={deleteReminder}
              completingId={completingId}
              deletingId={deletingId}
              showCompleted
            />
          )}
        </div>
      ) : (
        /* filter === 'active' */
        <div className="space-y-6">
          <OverdueReminders
            reminders={overdueReminders}
            vehicles={vehicles}
            onComplete={completeReminder}
            onEdit={openEdit}
            onDelete={deleteReminder}
            completingId={completingId}
            deletingId={deletingId}
          />
          <UpcomingReminders
            reminders={nonOverdueActive}
            vehicles={vehicles}
            onComplete={completeReminder}
            onEdit={openEdit}
            onDelete={deleteReminder}
            completingId={completingId}
            deletingId={deletingId}
          />
          {activeReminders.length === 0 && <EmptyReminders onAdd={openCreate} />}
        </div>
      )}

      {/* Mobile FAB */}
      <button
        onClick={openCreate}
        className="sm:hidden fixed bottom-20 right-4 z-40 w-14 h-14 bg-custom-2 hover:bg-custom-2-hover text-white rounded-full shadow-lg flex items-center justify-center cursor-pointer"
        aria-label="Nouveau rappel"
      >
        <Icon name="add" size={24} className="invert dark:invert-0" />
      </button>

      {/* Drawer */}
      <Drawer isOpen={showForm} onClose={closeForm}>
        <ReminderForm
          initialReminder={editingReminder}
          vehicles={vehiclesMinimal}
          onSave={handleSave}
          onCancel={closeForm}
          saving={editingReminder ? saving : creating}
        />
      </Drawer>
    </div>
  );
}

export default function RemindersClient(props: RemindersClientProps) {
  return <RemindersContent {...props} />;
}
