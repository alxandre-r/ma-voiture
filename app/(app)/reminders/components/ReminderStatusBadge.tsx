'use client';

import type { ReminderStatus } from '@/types/reminder';

interface ReminderStatusBadgeProps {
  status: ReminderStatus;
  className?: string;
}

const STATUS_CONFIG: Record<ReminderStatus, { label: string; className: string; dot: string }> = {
  overdue: {
    label: 'En retard',
    className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    dot: 'bg-red-500',
  },
  'due-soon': {
    label: 'Bientôt',
    className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    dot: 'bg-yellow-500',
  },
  upcoming: {
    label: 'À venir',
    className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    dot: 'bg-green-500',
  },
  none: {
    label: 'Sans échéance',
    className: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
    dot: 'bg-gray-400',
  },
};

export default function ReminderStatusBadge({ status, className = '' }: ReminderStatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium leading-none ${config.className} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
