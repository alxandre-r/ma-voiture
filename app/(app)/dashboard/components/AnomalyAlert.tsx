'use client';

import { useState } from 'react';

import { Card, CardContent } from '@/components/common/ui/card';
import Icon from '@/components/common/ui/Icon';
import { formatDate } from '@/lib/utils/format';

import type { ConsumptionAnomaly } from '@/lib/utils/anomalyUtils';

interface AnomalyAlertProps {
  anomalies: ConsumptionAnomaly[];
}

function AnomalyRow({ anomaly }: { anomaly: ConsumptionAnomaly }) {
  const [expanded, setExpanded] = useState(false);
  const isUp = anomaly.direction === 'up';
  const absDeviation = Math.abs(anomaly.deviationPct);

  return (
    <div className="py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <button
        onClick={() => setExpanded((p) => !p)}
        className="w-full text-left flex items-start gap-3"
      >
        {/* Vehicle color dot + name */}
        <span
          className="w-2 h-2 rounded-full shrink-0 mt-1.5"
          style={{ backgroundColor: anomaly.vehicleColor }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
              {anomaly.vehicleName}
            </p>
            {/* Deviation badge */}
            <span
              className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded-full ${
                isUp
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                  : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
              }`}
            >
              {isUp ? '+' : '−'}
              {absDeviation}%
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {anomaly.latestConsumption} L/100 vs {anomaly.baselineConsumption} L/100 habituel
            {' · '}
            {formatDate(anomaly.fillDate)}
          </p>
        </div>
        {/* Expand chevron */}
        <span
          className={`shrink-0 text-gray-400 transition-transform duration-150 ${expanded ? 'rotate-180' : ''}`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>

      {/* Expanded: possible causes */}
      {expanded && (
        <div className="mt-2 ml-5 pl-2 border-l-2 border-gray-200 dark:border-gray-700">
          <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
            Causes possibles
          </p>
          <ul className="space-y-0.5">
            {anomaly.possibleCauses.slice(0, 4).map((cause) => (
              <li
                key={cause}
                className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5"
              >
                <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600 shrink-0" />
                {cause}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function AnomalyAlert({ anomalies }: AnomalyAlertProps) {
  const [dismissed, setDismissed] = useState(false);

  if (anomalies.length === 0 || dismissed) return null;

  const hasIncrease = anomalies.some((a) => a.direction === 'up');

  return (
    <Card className="border-orange-200 dark:border-orange-300/50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-orange-100 dark:border-orange-300/30">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gray-100 dark:bg-gray-900/40 rounded-lg items-center justify-center flex">
            <Icon name="conso" size={20} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Consommation inhabituelle
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {anomalies.length} véhicule{anomalies.length > 1 ? 's' : ''}{' '}
              {hasIncrease ? "consomme plus que d'habitude" : 'consomme différemment'}
            </p>
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Fermer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <CardContent className="p-0 px-4">
        {anomalies.map((anomaly) => (
          <AnomalyRow key={anomaly.vehicleId} anomaly={anomaly} />
        ))}
      </CardContent>
    </Card>
  );
}
