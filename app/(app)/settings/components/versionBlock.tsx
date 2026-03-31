'use client';

import { useState } from 'react';

import Icon from '@/components/common/ui/Icon';

// --- Composant réutilisable pour chaque version ---
export interface VersionBlockProps {
  version: string;
  date: string;
  summary: string;
  details?: React.ReactNode;
  type?: 'minor' | 'major' | 'todo';
}

export function VersionBlock({
  version,
  date,
  summary,
  details,
  type = 'minor',
}: VersionBlockProps) {
  const [showDetails, setShowDetails] = useState(false);

  const bgClass =
    type === 'major'
      ? 'bg-custom-2/10 dark:bg-custom-2/10 border-l-4 border-custom-2'
      : type === 'todo'
        ? 'bg-custom-1/10 border-l-4 border-custom-1'
        : 'bg-gray-100 dark:bg-gray-700';

  const textColor =
    type === 'major'
      ? 'text-custom-2'
      : type === 'todo'
        ? 'text-custom-1'
        : 'text-gray-900 dark:text-gray-100';

  return (
    <div className={`${bgClass} p-4 rounded-lg shadow-sm space-y-2`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className={`text-xl font-semibold ${textColor}`}>
            Version {version} - {date}
          </h3>
          <p className="text-gray-700 dark:text-gray-300">{summary}</p>
        </div>

        {details && (
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="mt-1 flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 hover:bg-gray-200 dark:text-white dark:hover:bg-gray-700/50 rounded-lg dark:hover:bg-custom-2/80 font-medium transition-colors cursor-pointer whitespace-nowrap"
          >
            {showDetails ? 'Masquer le détail' : ''}
            <Icon name={showDetails ? 'arrow-up' : 'arrow-down'} size={18} />
          </button>
        )}
      </div>

      {showDetails && (
        <div className="mt-4 text-gray-700 dark:text-gray-300 border-t border-gray-300 dark:border-gray-600">
          {details}
        </div>
      )}
    </div>
  );
}
