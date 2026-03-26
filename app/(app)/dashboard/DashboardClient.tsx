'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import {
  ExpenseBreakdown,
  RecentExpenses,
  StatsCards,
  VehicleQuickView,
} from '@/app/(app)/dashboard/components';
import AnomalyAlert from '@/app/(app)/dashboard/components/AnomalyAlert';
import RemindersWidget from '@/app/(app)/dashboard/components/RemindersWidget';
import { useMaintenanceActions } from '@/app/(app)/maintenance/hooks/useMaintenanceActions';
import ExpenseButton from '@/components/common/ExpenseButton';
import FillForm from '@/components/common/forms/FillForm';
import MaintenanceForm from '@/components/common/forms/MaintenanceForm';
import ReminderForm from '@/components/common/forms/ReminderForm';
import Drawer from '@/components/common/ui/Drawer';
import { useSelectors } from '@/contexts/SelectorsContext';
import { useUser } from '@/contexts/UserContext';
import { useFillActions } from '@/hooks/fill/useFillActions';
import { useReminderActions } from '@/hooks/reminders/useReminderActions';
import { detectAnomalies } from '@/lib/utils/anomalyUtils';
import { getPeriodCutoff } from '@/lib/utils/filterUtils';
import { enrichReminder } from '@/lib/utils/reminderUtils';

import type { MaintenanceFormData } from '@/app/(app)/maintenance/hooks/useMaintenanceActions';
import type { ExpenseType } from '@/components/common/ExpenseButton';
import type { Expense } from '@/types/expense';
import type { FillFormData } from '@/types/fill';
import type { Reminder, ReminderFormData } from '@/types/reminder';
import type { Vehicle, VehicleMinimal } from '@/types/vehicle';

interface DashboardClientProps {
  vehicles: Vehicle[];
  expenses: Expense[];
  reminders: Reminder[];
  fillExpenses: Expense[];
  activeInsuranceVehicleIds?: number[];
}

function DashboardContent({
  vehicles,
  expenses,
  reminders,
  fillExpenses,
  activeInsuranceVehicleIds,
}: DashboardClientProps) {
  const router = useRouter();
  const user = useUser();
  const currentUserId = user?.id;
  const { selectedVehicleIds, selectedPeriod } = useSelectors();

  const [selectedExpenseType, setSelectedExpenseType] = useState<ExpenseType | null>(null);
  const [showFillForm, setShowFillForm] = useState(false);
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);
  const [showReminderForm, setShowReminderForm] = useState(false);

  const { addFill } = useFillActions();
  const { addMaintenance } = useMaintenanceActions();
  const { creating, createReminder } = useReminderActions();

  const filteredExpenses = useMemo(() => {
    const byVehicle = expenses.filter((e) => selectedVehicleIds.includes(e.vehicle_id));
    const cutoff = getPeriodCutoff(selectedPeriod);
    return cutoff ? byVehicle.filter((e) => new Date(e.date) >= cutoff) : byVehicle;
  }, [expenses, selectedVehicleIds, selectedPeriod]);

  const sortedExpenses = useMemo(
    () =>
      [...filteredExpenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [filteredExpenses],
  );

  const totalExpenses = useMemo(
    () => filteredExpenses.reduce((sum, e) => sum + (e.amount ?? 0), 0),
    [filteredExpenses],
  );

  const avgConsumption = useMemo(() => {
    const fuelExpenses = filteredExpenses.filter((e) => e.type === 'fuel');
    if (fuelExpenses.length === 0) return 0;

    let totalLiters = 0;
    let totalDistance = 0;
    const odometers: Record<number, number[]> = {};

    fuelExpenses.forEach((expense) => {
      const fillData = expense as unknown as { liters?: number; odometer?: number };
      if (fillData.liters) totalLiters += fillData.liters;
      if (fillData.odometer) {
        if (!odometers[expense.vehicle_id]) odometers[expense.vehicle_id] = [];
        odometers[expense.vehicle_id].push(fillData.odometer);
      }
    });

    Object.values(odometers).forEach((values) => {
      if (values.length >= 2) {
        const sorted = [...values].sort((a, b) => a - b);
        totalDistance += sorted[sorted.length - 1] - sorted[0];
      }
    });

    return totalDistance > 0 ? (totalLiters / totalDistance) * 100 : 0;
  }, [filteredExpenses]);

  const anomalies = useMemo(
    () => detectAnomalies(fillExpenses, vehicles),
    [fillExpenses, vehicles],
  );

  const overdueReminders = useMemo(
    () =>
      reminders
        .filter((r) => !r.is_completed)
        .filter((r) => {
          const vehicle =
            r.vehicle_id != null
              ? (vehicles.find((v) => v.vehicle_id === r.vehicle_id) ?? null)
              : null;
          return enrichReminder(r, vehicle, fillExpenses).status === 'overdue';
        }).length,
    [reminders, vehicles, fillExpenses],
  );

  const ownedActiveVehicles = vehicles.filter((v) => {
    const isActive = v.status === 'active' || v.status === null || v.status === undefined;
    const isOwner = v.owner_id === currentUserId;
    return isActive && isOwner;
  });

  const fillVehicles = ownedActiveVehicles.filter(
    (v) => v.fuel_type !== 'Électrique' && v.fuel_type !== 'Hybride non rechargeable',
  );
  const chargeVehicles = ownedActiveVehicles.filter(
    (v) => v.fuel_type === 'Électrique' || v.fuel_type === 'Hybride rechargeable',
  );
  const formVehicles = selectedExpenseType === 'charge' ? chargeVehicles : fillVehicles;

  const vehiclesMinimal: VehicleMinimal[] = ownedActiveVehicles.map((v) => ({
    vehicle_id: v.vehicle_id,
    name: v.name ?? `${v.make} ${v.model}`,
    make: v.make ?? '',
    model: v.model ?? '',
    fuel_type: v.fuel_type ?? null,
    odometer: v.odometer,
    status: v.status ?? 'active',
    owner_id: v.owner_id,
  }));

  const handleSuccess = () => {
    router.refresh();
    setShowFillForm(false);
    setShowMaintenanceForm(false);
    setShowReminderForm(false);
    setSelectedExpenseType(null);
  };

  const handleSelectType = (type: ExpenseType) => {
    setSelectedExpenseType(type);
    if (type === 'maintenance') {
      setShowMaintenanceForm(true);
    } else {
      setShowFillForm(true);
    }
  };

  const handleFillSave = async (data: FillFormData) => {
    const success = await addFill(data);
    if (success) handleSuccess();
    return success;
  };

  const handleMaintenanceSave = async (data: MaintenanceFormData) => {
    const success = await addMaintenance(data);
    if (success) handleSuccess();
    return success;
  };

  const handleReminderSave = async (data: ReminderFormData): Promise<boolean> => {
    const success = await createReminder(data);
    if (success) handleSuccess();
    return success;
  };

  return (
    <div className="space-y-6 px-2 sm:px-0 pb-8">
      {/* Add expense button — desktop right-aligned + mobile FAB, both handled by ExpenseButton */}
      <ExpenseButton
        vehicles={vehicles as VehicleMinimal[]}
        currentUserId={currentUserId}
        onSelectType={handleSelectType}
        onAddReminder={() => setShowReminderForm(true)}
      />

      {/* Stats Cards */}
      <StatsCards
        avgConsumption={avgConsumption}
        totalExpenses={totalExpenses}
        overdueReminders={overdueReminders}
      />

      {/* Anomaly alert — only renders if anomalies are detected */}
      <AnomalyAlert anomalies={anomalies} />

      {/* Recent Expenses + Reminders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentExpenses expenses={sortedExpenses} vehicles={vehicles} />
        <RemindersWidget reminders={reminders} vehicles={vehicles} fillExpenses={fillExpenses} />
      </div>

      {/* Expense breakdown + Vehicle overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ExpenseBreakdown expenses={filteredExpenses} />
        <VehicleQuickView
          vehicles={vehicles}
          reminders={reminders}
          expenses={expenses}
          activeInsuranceVehicleIds={activeInsuranceVehicleIds}
        />
      </div>

      {/* Drawers */}
      <Drawer
        isOpen={showFillForm && !!selectedExpenseType}
        onClose={() => {
          setShowFillForm(false);
          setSelectedExpenseType(null);
        }}
      >
        <FillForm
          vehicles={formVehicles as VehicleMinimal[]}
          forcedType={selectedExpenseType === 'charge' ? 'charge' : 'fill'}
          onSave={handleFillSave}
          onCancel={() => {
            setShowFillForm(false);
            setSelectedExpenseType(null);
          }}
          saving={false}
        />
      </Drawer>

      <Drawer
        isOpen={showMaintenanceForm}
        onClose={() => {
          setShowMaintenanceForm(false);
          setSelectedExpenseType(null);
        }}
      >
        <MaintenanceForm
          vehicles={vehiclesMinimal}
          onSave={handleMaintenanceSave}
          onCancel={() => {
            setShowMaintenanceForm(false);
            setSelectedExpenseType(null);
          }}
          saving={false}
        />
      </Drawer>

      <Drawer isOpen={showReminderForm} onClose={() => setShowReminderForm(false)}>
        <ReminderForm
          initialReminder={null}
          vehicles={vehiclesMinimal}
          onSave={handleReminderSave}
          onCancel={() => setShowReminderForm(false)}
          saving={creating}
        />
      </Drawer>
    </div>
  );
}

export default function DashboardClient({
  vehicles,
  expenses,
  reminders,
  fillExpenses,
  activeInsuranceVehicleIds,
}: DashboardClientProps) {
  return (
    <DashboardContent
      vehicles={vehicles}
      expenses={expenses}
      reminders={reminders}
      fillExpenses={fillExpenses}
      activeInsuranceVehicleIds={activeInsuranceVehicleIds}
    />
  );
}
