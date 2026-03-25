'use client';

import { useState } from 'react';

import type { ReminderWithStatus } from '@/types/reminder';

export type RemindersFilter = 'active' | 'completed' | 'all';

export function useRemindersPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState<ReminderWithStatus | null>(null);
  const [filter, setFilter] = useState<RemindersFilter>('active');

  const openCreate = () => {
    setEditingReminder(null);
    setShowForm(true);
  };

  const openEdit = (reminder: ReminderWithStatus) => {
    setEditingReminder(reminder);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingReminder(null);
  };

  return {
    showForm,
    editingReminder,
    filter,
    setFilter,
    openCreate,
    openEdit,
    closeForm,
  };
}
