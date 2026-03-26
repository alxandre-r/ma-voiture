/**
 * @file app/(app)/statistics/loading.tsx
 * @fileoverview Loading skeleton for the statistics page.
 * Mirrors the exact structure of StatisticsClient: titles and labels are visible,
 * only data values (numbers, charts) are pulsed.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/ui/card';

import type React from 'react';

// ---------------------------------------------------------------------------
// 1. StatisticsOverview — grid grid-cols-3 gap-2
// ---------------------------------------------------------------------------

function OverviewSkeleton() {
  const currentYear = new Date().getFullYear();
  const cards = [
    { title: 'Dépenses totales' },
    { title: 'Moyenne / mois' },
    { title: `Projection ${currentYear}` },
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="p-3 flex flex-col h-full">
            <CardTitle className="text-xs text-gray-500">{card.title}</CardTitle>
            <div className="flex flex-col sm:flex-row sm:items-end gap-1 sm:gap-4 mt-1">
              <div className="h-7 w-28 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-3.5 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse min-h-[14px]" />
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 2. Chart card — shared between MonthlyExpenseChart and OdometerEvolutionChart
// ---------------------------------------------------------------------------

function ChartCardSkeleton({ title }: { title: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-56 bg-gray-100 dark:bg-gray-700/50 rounded-lg animate-pulse" />
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// 3a. ExpenseCategoryChart skeleton
// ---------------------------------------------------------------------------

function ExpenseCategorySkeleton() {
  const categories = [
    { name: 'Carburant' },
    { name: 'Assurance' },
    { name: 'Entretien' },
    { name: 'Autre' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Répartition des dépenses</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        {/* Donut circle */}
        <div className="relative w-40 h-40 sm:w-48 sm:h-48">
          <div className="w-full h-full rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-white dark:bg-gray-800" />
          </div>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 w-full">
          {categories.map((cat) => (
            <div key={cat.name} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse shrink-0" />
              <span className="text-xs text-gray-500 dark:text-gray-400">{cat.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// 3b. BottomStats skeleton — icons + labels visible, values pulsed
// ---------------------------------------------------------------------------

type StatColor = 'blue' | 'teal' | 'orange' | 'purple';

const COLOR_CLASSES: Record<StatColor, string> = {
  blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30',
  teal: 'bg-teal-50 text-teal-600 dark:bg-teal-900/30',
  orange: 'bg-orange-50 text-orange-600 dark:bg-orange-900/30',
  purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/30',
};

const STAT_ROWS: { color: StatColor; label: string; icon: React.ReactNode }[] = [
  {
    color: 'blue',
    label: 'Distance Parcourue',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
        />
      </svg>
    ),
  },
  {
    color: 'teal',
    label: 'Consommation moyenne',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
        />
      </svg>
    ),
  },
  {
    color: 'orange',
    label: "Coût moyen d'un plein",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  {
    color: 'purple',
    label: 'Nombre de plein',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
      </svg>
    ),
  },
];

function BottomStatsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Statistiques</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-2">
          {STAT_ROWS.map((stat) => (
            <div
              key={stat.label}
              className="bg-white p-3 rounded-xl border border-gray-100 flex items-center gap-4 dark:bg-gray-800/50 dark:border-gray-700"
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${COLOR_CLASSES[stat.color]}`}
              >
                {stat.icon}
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">
                  {stat.label}
                </p>
                <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-0.5" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Root export
// ---------------------------------------------------------------------------

export default function Loading() {
  return (
    <div className="space-y-4 px-2 sm:px-0">
      <OverviewSkeleton />
      <ChartCardSkeleton title="Dépenses mensuelles" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ExpenseCategorySkeleton />
        <BottomStatsSkeleton />
      </div>
      <ChartCardSkeleton title="Évolution du kilométrage" />
    </div>
  );
}
